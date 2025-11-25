"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { adCategoriesService } from "@/services/marketplace/adCategories.service";
import {
    nextStep,
    prevStep,
    setWizardDraft,
} from "@/features/marketplace/adWizardSlice";

const normalizeCategory = (category) => ({
    id: category.id,
    title: category.title,
    image: category.image,
    path: category.path,
    showPrice: category.showPrice ?? category.show_price ?? false,
    parentId: category.parent_id ?? category.parentId ?? null,
});

const extractCategoryList = (payload) => {
    if (!payload) return [];
    const collection = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
          ? payload.data
          : Array.isArray(payload.results)
            ? payload.results
            : Array.isArray(payload.categories)
              ? payload.categories
              : [];
    return collection;
};

export default function CategoryStep() {
    const dispatch = useDispatch();
    const { draft } = useSelector((state) => state.marketplaceAdWizard);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentCategories, setCurrentCategories] = useState([]);
    const [trail, setTrail] = useState([]);
    const typeId = draft.typeId;
    const navigatingToCategory = useRef(false);
    const hasNavigatedToCategory = useRef(false);

    const fetchRootCategories = async () => {
        if (!typeId) return;
        setLoading(true);
        setError(null);
        try {
            const response = await adCategoriesService.fetchCategoriesByType(typeId);
            const categories = extractCategoryList(response.data);
            setCurrentCategories(categories.map(normalizeCategory));
            setTrail([]);
        } catch (err) {
            setError(err?.message || "Unable to load categories");
        } finally {
            setLoading(false);
        }
    };

    // Find category by slug or name if ID is not available (recursive search)
    const findCategoryBySlugOrName = async (slug, name) => {
        if (!typeId || (!slug && !name)) return null;

        try {
            console.log("[CategoryStep] Searching for category by slug/name:", { slug, name });
            
            // Fetch root categories
            const rootResponse = await adCategoriesService.fetchCategoriesByType(typeId);
            const rootCategories = extractCategoryList(rootResponse.data).map(normalizeCategory);

            // Recursive search function
            const searchRecursively = async (categories) => {
                for (const cat of categories) {
                    // Check if this category matches
                    if ((slug && cat.slug === slug) || (name && cat.title === name)) {
                        console.log("[CategoryStep] Found category:", cat);
                        return cat;
                    }
                    
                    // Search in children
                    try {
                        const childrenResponse = await adCategoriesService.fetchCategoryChildren(cat.id);
                        const children = extractCategoryList(childrenResponse.data).map(normalizeCategory);
                        if (children.length > 0) {
                            const found = await searchRecursively(children);
                            if (found) return found;
                        }
                    } catch (err) {
                        // Continue searching other categories
                        console.warn("[CategoryStep] Error fetching children for category:", cat.id, err);
                    }
                }
                return null;
            };

            const found = await searchRecursively(rootCategories);
            if (found) {
                console.log("[CategoryStep] Category found by slug/name:", found);
            } else {
                console.log("[CategoryStep] Category not found by slug/name");
            }
            return found;
        } catch (err) {
            console.error("[CategoryStep] Error finding category by slug/name:", err);
            return null;
        }
    };

    // Navigate to selected category by building parent chain
    const navigateToSelectedCategory = async (categoryId) => {
        console.log("[CategoryStep] navigateToSelectedCategory called with:", {
            categoryId,
            typeId,
            navigatingToCategory: navigatingToCategory.current,
            hasNavigatedToCategory: hasNavigatedToCategory.current,
        });

        if (!categoryId || !typeId || navigatingToCategory.current || hasNavigatedToCategory.current) {
            console.log("[CategoryStep] Skipping navigation - conditions not met");
            return;
        }

        navigatingToCategory.current = true;
        console.log("[CategoryStep] Starting navigation to category:", categoryId);

        try {
            // Fetch the category to get its parent_id
            const categoryResponse = await adCategoriesService.fetchCategoryById(categoryId);
            const category = categoryResponse.data;
            
            if (!category) {
                console.warn("[CategoryStep] Category not found:", categoryId);
                navigatingToCategory.current = false;
                return;
            }

            console.log("[CategoryStep] Fetched category:", category);

            // Build parent chain by recursively fetching parents
            const parentChain = [];
            let currentParentId = category.parent_id || category.parentId;

            while (currentParentId) {
                try {
                    const parentResponse = await adCategoriesService.fetchCategoryById(currentParentId);
                    const parent = parentResponse.data;
                    if (parent) {
                        parentChain.unshift({
                            id: parent.id,
                            title: parent.title || parent.name,
                            parentId: parent.parent_id || parent.parentId,
                        });
                        currentParentId = parent.parent_id || parent.parentId;
                    } else {
                        break;
                    }
                } catch (err) {
                    console.warn("[CategoryStep] Failed to fetch parent:", currentParentId, err);
                    break;
                }
            }

            console.log("[CategoryStep] Parent chain:", parentChain);

            // Start from root categories
            const rootResponse = await adCategoriesService.fetchCategoriesByType(typeId);
            const rootCategories = extractCategoryList(rootResponse.data).map(normalizeCategory);
            setCurrentCategories(rootCategories);
            setTrail([]);

            // Navigate through each level of the parent chain
            let currentCategories = rootCategories;
            let currentTrail = [];

            for (const parent of parentChain) {
                // Find the parent in current categories
                const parentCategory = currentCategories.find(
                    (cat) => String(cat.id) === String(parent.id)
                );

                if (!parentCategory) {
                    console.warn("[CategoryStep] Parent not found in current categories:", parent.id);
                    break;
                }

                // Load children of this parent
                const childrenResponse = await adCategoriesService.fetchCategoryChildren(parent.id);
                const children = extractCategoryList(childrenResponse.data).map(normalizeCategory);
                
                currentTrail.push(parentCategory);
                currentCategories = children;
            }

            // Check if the selected category is in the current level
            const selectedCategory = currentCategories.find(
                (cat) => String(cat.id) === String(categoryId)
            );

            if (selectedCategory) {
                // Category is a leaf node (no children), it should be selected
                console.log("[CategoryStep] Selected category found at current level:", selectedCategory);
            } else {
                // Category might have children, try to load them
                try {
                    const finalChildrenResponse = await adCategoriesService.fetchCategoryChildren(categoryId);
                    const finalChildren = extractCategoryList(finalChildrenResponse.data).map(normalizeCategory);
                    
                    if (finalChildren.length === 0) {
                        // It's a leaf, but not in current list - might be a sibling
                        console.log("[CategoryStep] Category is a leaf but not in current list");
                    } else {
                        // It has children, navigate one more level
                        const finalParent = {
                            id: category.id,
                            title: category.title || category.name,
                            parentId: category.parent_id || category.parentId,
                        };
                        currentTrail.push(finalParent);
                        currentCategories = finalChildren;
                        console.log("[CategoryStep] Category has children, navigating deeper");
                    }
                } catch (err) {
                    console.warn("[CategoryStep] Failed to check category children:", err);
                }
            }

            // Set the final state
            setCurrentCategories(currentCategories);
            setTrail(currentTrail);
            hasNavigatedToCategory.current = true;

            console.log("[CategoryStep] Navigation complete. Current categories:", currentCategories.length);
            console.log("[CategoryStep] Trail length:", currentTrail.length);
        } catch (err) {
            console.error("[CategoryStep] Failed to navigate to category:", err);
            // Fallback to root categories
            fetchRootCategories();
        } finally {
            navigatingToCategory.current = false;
        }
    };

    useEffect(() => {
        console.log("[CategoryStep] useEffect triggered:", {
            typeId,
            categoryId: draft.categoryId,
            categoryTitle: draft.categoryTitle,
            categorySlug: draft.categorySlug,
            categoryName: draft.categoryName,
            hasNavigatedToCategory: hasNavigatedToCategory.current,
        });

        if (typeId) {
            // If we have a categoryId in draft, navigate to it
            if (draft.categoryId && !hasNavigatedToCategory.current) {
                console.log("[CategoryStep] Calling navigateToSelectedCategory with categoryId");
                navigateToSelectedCategory(draft.categoryId);
            } else if (!draft.categoryId && (draft.categorySlug || draft.categoryName) && !hasNavigatedToCategory.current) {
                // Fallback: try to find category by slug or name
                console.log("[CategoryStep] No categoryId, trying to find by slug/name");
                findCategoryBySlugOrName(draft.categorySlug, draft.categoryName)
                    .then((foundCategory) => {
                        if (foundCategory) {
                            console.log("[CategoryStep] Found category by slug/name:", foundCategory);
                            navigateToSelectedCategory(String(foundCategory.id));
                        } else {
                            console.log("[CategoryStep] Category not found by slug/name, fetching root categories");
                            fetchRootCategories();
                        }
                    })
                    .catch((err) => {
                        console.error("[CategoryStep] Error finding category:", err);
                        fetchRootCategories();
                    });
            } else {
                console.log("[CategoryStep] Fetching root categories (no categoryId or already navigated)");
                fetchRootCategories();
            }
        } else {
            // Clear categories if no type is selected
            console.log("[CategoryStep] Clearing categories (no typeId)");
            setCurrentCategories([]);
            setTrail([]);
            hasNavigatedToCategory.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeId, draft.categoryId, draft.categorySlug, draft.categoryName]);

    const loadChildren = async (parentCategory) => {
        setLoading(true);
        setError(null);
        try {
            const response = await adCategoriesService.fetchCategoryChildren(parentCategory.id);
            const rawChildren = extractCategoryList(response.data);
            const children = rawChildren.map(normalizeCategory);
            if (children.length === 0) {
                dispatch(
                    setWizardDraft({
                        categoryId: String(parentCategory.id),
                        categoryTitle: parentCategory.title,
                        catParentId: parentCategory.parentId ?? null,
                        showPrice: parentCategory.showPrice ? 1 : 0,
                    })
                );
            } else {
                setCurrentCategories(children);
                setTrail((prev) => [...prev, parentCategory]);
            }
        } catch (err) {
            setError(err?.message || "Unable to load subcategories");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCategory = (category) => {
        loadChildren(category);
    };

    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            fetchRootCategories();
            return;
        }

        const parent = trail[index];
        const newTrail = trail.slice(0, index);
        setTrail(newTrail);
        loadChildren(parent);
    };

    const handleBack = () => {
        dispatch(prevStep());
    };

    const handleContinue = () => {
        if (!draft.categoryId) return;
        dispatch(nextStep());
    };

    const breadcrumb = useMemo(
        () => [
            { label: draft.typeTitle || "Root", onClick: () => handleBreadcrumbClick(-1) },
            ...trail.map((item, index) => ({
                label: item.title,
                onClick: () => handleBreadcrumbClick(index),
            })),
        ],
        [trail, draft.typeTitle]
    );

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Choose Category
                    </h2>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Drill into the category tree until you reach the most applicable category.
                        {draft.categoryId && (
                            <span className="ml-2 text-blue-600">
                                Selected: {draft.categoryTitle}
                            </span>
                        )}
                    </p>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {breadcrumb.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={item.onClick}
                                className="text-blue-600 hover:underline"
                            >
                                {item.label}
                            </button>
                            {index !== breadcrumb.length - 1 && <span>/</span>}
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div
                        className="rounded-lg border border-dashed p-6 text-center text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        Loading categories...
                    </div>
                ) : currentCategories.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {currentCategories.map((category) => {
                            const isSelected = Number(draft.categoryId) === Number(category.id);
                            return (
                                <Card
                                    key={category.id}
                                    className={`cursor-pointer p-4 transition-shadow ${
                                        isSelected
                                            ? "border-blue-500 shadow-md ring-2 ring-blue-500 ring-offset-2"
                                            : "hover:shadow-md"
                                    }`}
                                    onClick={() => handleSelectCategory(category)}
                                >
                                    <h3
                                        className="text-base font-semibold"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {category.title}
                                    </h3>
                                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        {category.showPrice ? "Price shown to users" : "Price hidden"}
                                    </p>
                                </Card>
                            );
                        })}
                    </div>
                ) : !typeId ? (
                    <div
                        className="rounded-lg border border-dashed p-6 text-center text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        Please select a type first.
                    </div>
                ) : (
                    <div
                        className="rounded-lg border border-dashed p-6 text-center text-sm"
                        style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-secondary)",
                        }}
                    >
                        No categories available for this type.
                    </div>
                )}

                {error && (
                    <div
                        className="mt-4 rounded-md border px-4 py-2 text-sm"
                        style={{
                            borderColor: "var(--color-error)",
                            backgroundColor: "var(--color-error-bg, rgba(239, 68, 68, 0.1))",
                            color: "var(--color-error)",
                        }}
                    >
                        {error}
                    </div>
                )}

                <div className="mt-6 flex justify-between">
                    <Button variant="outline" onClick={handleBack}>
                        Back
                    </Button>
                    <Button onClick={handleContinue} disabled={!draft.categoryId}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}

