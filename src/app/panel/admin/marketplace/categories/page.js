"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import CategorySummary from "@/components/marketplace/CategorySummary";
import CategoryTree from "@/components/marketplace/CategoryTree";
import CategoryFormModal from "@/components/marketplace/CategoryFormModal";
import CategoryAttributeModal from "@/components/marketplace/CategoryAttributeModal";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableBody,
    TableActions,
} from "@/components/tables";
import {
    fetchAdCategories,
    fetchAllAdCategories,
    fetchAdCategoryById,
    createAdCategory,
    updateAdCategory,
    setAdCategoryPage,
    attachAttributeToCategory,
    detachAttributeFromCategory,
} from "@/features/marketplace/adCategoriesSlice";
import { fetchAllAdTypes } from "@/features/marketplace/adTypesSlice";
import { fetchAllAdAttributes } from "@/features/marketplace/adAttributesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

const defaultCategoryValues = {
    title: "",
    price: "",
    type: "",
    parent: "",
    quoteText: "",
    showPrice: true,
    status: true,
    image: null,
};

const buildCategoryValues = (category) => ({
    title: category?.title ?? "",
    price: category?.price ?? "",
    type: category?.classified_ad_type_id
        ? String(category.classified_ad_type_id)
        : category?.type
          ? String(category.type)
          : "",
    parent: category?.parent_id ? String(category.parent_id) : "",
    quoteText: category?.quoteText ?? category?.quote_text ?? "",
    showPrice: Boolean(category?.showPrice ?? category?.show_price ?? false),
    status: category?.status !== undefined ? Boolean(category.status) : true,
    image: null,
});

const buildTypeOptions = (types) =>
    (types || []).map((type) => ({
        value: String(type.id),
        label: type.title,
    }));

const buildParentOptions = (categories, typeId, excludeId) =>
    (categories || [])
        .filter((category) => {
            const categoryTypeId = category.classified_ad_type_id ?? category.type;
            if (typeId && String(categoryTypeId) !== String(typeId)) {
                return false;
            }
            if (excludeId && Number(category.id) === Number(excludeId)) {
                return false;
            }
            return true;
        })
        .map((category) => ({
            value: String(category.id),
            label: category.title,
        }));

const buildAttributeOptions = (attributes) =>
    (attributes || []).map((attribute) => ({
        value: String(attribute.id),
        label: attribute.title,
    }));

const buildTree = (categories = []) => {
    const map = new Map();
    const nodes = [];

    categories.forEach((category) => {
        map.set(category.id, {
            ...category,
            children: [],
        });
    });

    map.forEach((category) => {
        const parentId = category.parent_id ?? category.parentId ?? null;
        if (parentId && map.has(parentId)) {
            map.get(parentId).children.push(category);
        } else {
            nodes.push(category);
        }
    });

    return nodes;
};

export default function MarketplaceCategoriesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        list,
        loading,
        creating,
        updating,
        attaching,
        detaching,
        pagination,
        current,
        allOptions,
        error,
    } = useAppSelector((state) => state.marketplaceAdCategories);
    const { allOptions: adTypeOptions } = useAppSelector((state) => state.marketplaceAdTypes);
    const { allOptions: attributeList } = useAppSelector((state) => state.marketplaceAdAttributes);

    const [selectedId, setSelectedId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [formValues, setFormValues] = useState(defaultCategoryValues);
    const [formTypeFilter, setFormTypeFilter] = useState("");
    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const tableRef = useRef(null);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }

            router.push(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router]
    );

    const handleSelectCategory = useCallback((category) => {
        if (!category) return;
        setSelectedId(category.id);
    }, []);

    useEffect(() => {
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        dispatch(setAdCategoryPage(page));

        dispatch(
            fetchAdCategories({
                page,
                limit: 10,
            })
        );
    }, [searchParams, dispatch]);

    useEffect(() => {
        dispatch(fetchAllAdCategories());
        dispatch(fetchAllAdTypes());
        dispatch(fetchAllAdAttributes());
    }, [dispatch]);

    const typeOptions = useMemo(() => buildTypeOptions(adTypeOptions), [adTypeOptions]);
    const activeCategoryId = selectedId ?? (list.length > 0 ? list[0].id : null);

    useEffect(() => {
        if (activeCategoryId) {
            dispatch(fetchAdCategoryById(activeCategoryId));
        }
    }, [dispatch, activeCategoryId]);

    const parentOptions = useMemo(
        () =>
            buildParentOptions(
                allOptions,
                formTypeFilter,
                formMode === "edit" ? activeCategoryId : null
            ),
        [allOptions, formMode, formTypeFilter, activeCategoryId]
    );
    const attributeOptions = useMemo(() => buildAttributeOptions(attributeList), [attributeList]);
    const categoryTree = useMemo(() => buildTree(allOptions), [allOptions]);

    const stats = useMemo(() => {
        const rootCategories = (allOptions || []).filter(
            (category) => !(category.parent_id ?? category.parentId)
        ).length;
        const attributesLinked = (allOptions || []).reduce(
            (acc, category) => acc + (category.classified_ad_attributes?.length || 0),
            0
        );
        return {
            total: pagination.total,
            root: rootCategories,
            attributes: attributesLinked,
        };
    }, [allOptions, pagination.total]);

    const detail = current;

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchAdCategories({
                    page: pagination.page,
                    limit: memoisedLimit,
                })
            ).unwrap();

            dispatch(fetchAllAdCategories());
            if (activeCategoryId) {
                dispatch(fetchAdCategoryById(activeCategoryId));
            }

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, pagination.page, activeCategoryId]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
            });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [updateUrl]
    );

    const handleOpenCreate = () => {
        setFormMode("create");
        setFormValues(defaultCategoryValues);
        setFormTypeFilter("");
        setIsFormOpen(true);
    };

    const handleOpenEdit = () => {
        if (!detail) return;
        setFormMode("edit");
        setFormValues(buildCategoryValues(detail));
        const typeId =
            (detail.classified_ad_type_id ?? detail.type)
                ? String(detail.classified_ad_type_id ?? detail.type)
                : "";
        setFormTypeFilter(typeId);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setFormValues(defaultCategoryValues);
    };

    const handleSubmitCategory = async (values, { resetForm }) => {
        const payload = {
            title: values.title,
            price: values.price || null,
            type: values.type,
            parent: values.parent || null,
            quoteText: values.quoteText || null,
            showPrice: Boolean(values.showPrice),
            status: Boolean(values.status),
            image: values.image,
        };

        try {
            if (formMode === "edit" && detail) {
                await dispatch(updateAdCategory({ id: detail.id, changes: payload })).unwrap();
                toast.success("Category updated successfully");
            } else {
                await dispatch(createAdCategory(payload)).unwrap();
                toast.success("Category created successfully");
            }

            handleCloseForm();
            resetForm();
            handleRefresh();
        } catch (err) {
            toast.error(err?.message || "Unable to save category");
        }
    };

    const handleAttachAttribute = async (values, formikHelpers) => {
        if (!activeCategoryId) return;
        try {
            await dispatch(
                attachAttributeToCategory({
                    attribute: values.attribute,
                    category: activeCategoryId,
                })
            ).unwrap();
            toast.success("Attribute attached");
            formikHelpers.resetForm();
            setIsAttributeModalOpen(false);
            dispatch(fetchAdCategoryById(activeCategoryId));
        } catch (err) {
            toast.error(err?.message || "Unable to attach attribute");
        }
    };

    const handleDetachAttribute = async (attributeId) => {
        if (!activeCategoryId) return;
        try {
            await dispatch(
                detachAttributeFromCategory({ attribute: attributeId, category: activeCategoryId })
            ).unwrap();
            toast.success("Attribute removed");
            dispatch(fetchAdCategoryById(activeCategoryId));
        } catch (err) {
            toast.error(err?.message || "Unable to remove attribute");
        }
    };

    const totalCategories = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Ad Categories ({totalCategories})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Organise marketplace types into nested categories and assign attributes.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <CategorySummary stats={stats} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Select a category on the left to manage its details and attributes.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {showReloadNotice && (
                            <span className="text-sm" style={{ color: "var(--color-success)" }}>
                                List reloaded!
                            </span>
                        )}
                        <Button
                            variant="secondary"
                            icon={<RefreshCcw size={16} />}
                            onClick={handleRefresh}
                            loading={isRefreshing}
                        >
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={handleOpenEdit} disabled={!detail}>
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsAttributeModalOpen(true)}
                            disabled={!detail}
                        >
                            Attach Attribute
                        </Button>
                        <Button onClick={handleOpenCreate}>New Category</Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <Card className="p-0">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <h3 className="text-sm font-semibold text-neutral-700">
                                Category Tree
                            </h3>
                        </div>
                        <div className="max-h-[420px] space-y-1 overflow-y-auto px-2 py-3">
                            {categoryTree.length ? (
                                <CategoryTree
                                    nodes={categoryTree}
                                    activeId={activeCategoryId}
                                    onSelect={handleSelectCategory}
                                />
                            ) : (
                                <p className="px-3 py-2 text-sm text-neutral-500">
                                    No categories yet.
                                </p>
                            )}
                        </div>
                    </Card>

                    <Card className="p-0">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <h3 className="text-sm font-semibold text-neutral-700">
                                Category Details
                            </h3>
                        </div>
                        <div className="space-y-5 p-5">
                            {detail ? (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs uppercase text-neutral-400">
                                                Title
                                            </p>
                                            <p className="text-sm font-medium text-neutral-800">
                                                {detail.title}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-neutral-400">
                                                Type
                                            </p>
                                            <p className="text-sm font-medium text-neutral-800">
                                                {detail.classifiedAdType || detail.typeLabel || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-neutral-400">
                                                Price
                                            </p>
                                            <p className="text-sm font-medium text-neutral-800">
                                                {detail.price || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase text-neutral-400">
                                                Parent
                                            </p>
                                            <p className="text-sm font-medium text-neutral-800">
                                                {detail.parent ?? "—"}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs uppercase text-neutral-400">
                                            Attributes
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {detail.classifiedAdAttributes?.length ? (
                                                detail.classifiedAdAttributes.map((attribute) => (
                                                    <div
                                                        key={attribute.id}
                                                        className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                                                        style={{
                                                            borderColor: "var(--color-border)",
                                                        }}
                                                    >
                                                        <span>{attribute.title}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDetachAttribute(attribute.id)
                                                            }
                                                            loading={detaching}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-neutral-500">
                                                    No attributes linked.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Select a category from the tree to view details.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                <div ref={tableRef}>
                    {loading ? (
                        <SkeletonTable rows={8} />
                    ) : error ? (
                        <div className="py-12 text-center space-y-4">
                            <p style={{ color: "var(--color-error)" }}>{error}</p>
                            <Button onClick={handleRefresh}>Try Again</Button>
                        </div>
                    ) : list.length === 0 ? (
                        <EmptyState
                            title="No categories found"
                            description="Create your first category to get started."
                        />
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHeaderCell>ID</TableHeaderCell>
                                        <TableHeaderCell>Title</TableHeaderCell>
                                        <TableHeaderCell>Type</TableHeaderCell>
                                        <TableHeaderCell>Parent</TableHeaderCell>
                                        <TableHeaderCell>Price</TableHeaderCell>
                                        <TableHeaderCell>Status</TableHeaderCell>
                                        <TableHeaderCell className="w-[150px]">
                                            Actions
                                        </TableHeaderCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {list.map((category) => (
                                        <TableRow
                                            key={category.id}
                                            className={
                                                Number(activeCategoryId) === Number(category.id)
                                                    ? "bg-blue-50"
                                                    : undefined
                                            }
                                        >
                                            <TableCell>{category.id}</TableCell>
                                            <TableCell>{category.title}</TableCell>
                                            <TableCell>
                                                {category.classifiedAdType || category.typeLabel}
                                            </TableCell>
                                            <TableCell>{category.parent || "—"}</TableCell>
                                            <TableCell>{category.price || "—"}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        category.status
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-neutral-200 text-neutral-600"
                                                    }`}
                                                >
                                                    {category.status ? "Active" : "Inactive"}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <TableActions
                                                    actions={["view", "edit"]}
                                                    onView={() => handleSelectCategory(category)}
                                                    onEdit={() => {
                                                        handleSelectCategory(category);
                                                        handleOpenEdit();
                                                    }}
                                                    loading={loading}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page || 1}
                                    totalPages={pagination.pages || 1}
                                    totalItems={pagination.total || 0}
                                    itemsPerPage={memoisedLimit}
                                    onPageChange={handlePageChange}
                                    showItemsPerPage={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CategoryFormModal
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                mode={formMode}
                initialValues={formValues}
                onSubmit={handleSubmitCategory}
                loading={creating || updating}
                typeOptions={typeOptions}
                parentOptions={parentOptions}
                onTypeChange={(value) => setFormTypeFilter(value)}
            />

            <CategoryAttributeModal
                isOpen={isAttributeModalOpen}
                onClose={() => setIsAttributeModalOpen(false)}
                onSubmit={handleAttachAttribute}
                attributeOptions={attributeOptions}
                loading={attaching}
            />
        </ContentWrapper>
    );
}
