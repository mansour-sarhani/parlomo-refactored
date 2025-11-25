"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { nextStep, prevStep, setWizardDraft } from "@/features/marketplace/adWizardSlice";
import { fetchAllAdTypes } from "@/features/marketplace/adTypesSlice";

const buildTypeImageUrl = (type) => {
    if (!type?.image) {
        return null;
    }

    if (typeof type.image === "string" && type.image.startsWith("http")) {
        return type.image;
    }

    const base = (process.env.NEXT_PUBLIC_URL_KEY || process.env.NEXT_PUBLIC_ASSET_BASE_URL || "").replace(/\/+$/, "");
    const path = type.path ? `/${String(type.path).replace(/^\/+/, "").replace(/\/+$/, "")}` : "";

    return `${base}${path}${path ? "/" : ""}${type.image}`;
};

export default function TypeStep() {
    const dispatch = useDispatch();
    const { draft } = useSelector((state) => state.marketplaceAdWizard);
    const { allOptions, error, loading } = useSelector((state) => state.marketplaceAdTypes);
    const [selectedType, setSelectedType] = useState(draft.typeId ? String(draft.typeId) : "");

    // Debug: Log initial state
    useEffect(() => {
        console.log("[TypeStep] Component mounted/updated");
        console.log("[TypeStep] draft.typeId:", draft.typeId);
        console.log("[TypeStep] selectedType state:", selectedType);
        console.log("[TypeStep] allOptions.length:", allOptions.length);
        console.log("[TypeStep] allOptions IDs:", allOptions.map((t) => ({ id: t.id, title: t.title })));
    }, []);

    useEffect(() => {
        if (!allOptions.length) {
            console.log("[TypeStep] Fetching all ad types...");
            dispatch(fetchAllAdTypes());
        }
    }, [dispatch, allOptions.length]);

    // Debug: Log when types are loaded
    useEffect(() => {
        if (allOptions.length > 0) {
            console.log("[TypeStep] Types loaded:", allOptions.length);
            console.log("[TypeStep] Available type IDs:", allOptions.map((t) => t.id));
        }
    }, [allOptions.length]);

    // Debug: Log when draft.typeId changes
    useEffect(() => {
        console.log("[TypeStep] draft.typeId changed:", draft.typeId);
    }, [draft.typeId]);

    // Sync selectedType when draft.typeId changes (e.g., when editing)
    // Also ensure types are loaded first
    useEffect(() => {
        console.log("[TypeStep] Sync useEffect triggered");
        console.log("[TypeStep] draft.typeId:", draft.typeId, "type:", typeof draft.typeId);
        console.log("[TypeStep] allOptions.length:", allOptions.length);
        console.log("[TypeStep] current selectedType:", selectedType);

        if (draft.typeId && allOptions.length > 0) {
            const draftTypeIdStr = String(draft.typeId);
            console.log("[TypeStep] Looking for typeId:", draftTypeIdStr);
            
            const typeExists = allOptions.some((type) => {
                const typeIdStr = String(type.id);
                const matches = typeIdStr === draftTypeIdStr;
                console.log(`[TypeStep] Comparing: "${typeIdStr}" === "${draftTypeIdStr}" = ${matches}`);
                return matches;
            });
            
            console.log("[TypeStep] Type exists:", typeExists);
            
            if (typeExists) {
                const newSelectedType = draftTypeIdStr;
                console.log("[TypeStep] Setting selectedType to:", newSelectedType);
                // Only update if different to avoid unnecessary re-renders
                if (selectedType !== newSelectedType) {
                    setSelectedType(newSelectedType);
                } else {
                    console.log("[TypeStep] selectedType already matches, skipping update");
                }
            } else {
                console.warn("[TypeStep] Type not found in allOptions!");
                console.warn("[TypeStep] Available IDs:", allOptions.map((t) => String(t.id)));
            }
        } else if (!draft.typeId) {
            // Clear selection if typeId is cleared
            console.log("[TypeStep] Clearing selection (no draft.typeId)");
            if (selectedType !== "") {
                setSelectedType("");
            }
        } else {
            console.log("[TypeStep] Waiting for conditions:", {
                hasTypeId: !!draft.typeId,
                hasOptions: allOptions.length > 0,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.typeId, allOptions.length]);

    const handleContinue = () => {
        if (!selectedType) return;
        const type = allOptions.find((item) => String(item.id) === String(selectedType));
        dispatch(
            setWizardDraft({
                typeId: String(type.id),
                typeTitle: type.title,
            })
        );
        dispatch(nextStep());
    };

    const handleBack = () => {
        dispatch(prevStep());
    };

    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Choose Listing Type
                    </h2>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Select the marketplace vertical that best matches the listing you're creating.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {allOptions.map((type) => {
                        const isSelected = String(type.id) === String(selectedType);
                        const imageUrl = buildTypeImageUrl(type);
                        return (
                            <Card
                                key={type.id}
                                className={`cursor-pointer overflow-hidden transition-shadow ${
                                    isSelected
                                        ? "border-blue-500 shadow-md ring-2 ring-blue-500 ring-offset-2"
                                        : "hover:shadow-md"
                                }`}
                                onClick={() => setSelectedType(String(type.id))}
                                noPadding
                            >
                                {/* Image Section */}
                                <div
                                    className="relative h-40 w-full overflow-hidden"
                                    style={{ backgroundColor: "var(--color-secondary)" }}
                                >
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt={type.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <svg
                                                className="h-16 w-16 opacity-30"
                                                style={{ color: "var(--color-text-secondary)" }}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-4">
                                    <h3
                                        className="text-base font-semibold"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        {type.title}
                                    </h3>
                                    <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                        {type.summary || `Includes ${type.totalCategory || 0} categories.`}
                                    </p>
                                    {type.price && (
                                        <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                            Base price: £{type.price}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>

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
                    <Button onClick={handleContinue} disabled={!selectedType || loading}>
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}

