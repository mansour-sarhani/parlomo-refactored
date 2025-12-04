"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCategories, selectCategories } from "@/features/public-events/publicEventsSlice";

export function EventFilters({ filters, onFilterChange, onClearFilters }) {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "",
        category: filters.category || "",
        search: filters.search || "",
    });

    useEffect(() => {
        // Fetch categories on mount
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
    }, [dispatch, categories.length]);

    useEffect(() => {
        // Update local filters when prop filters change
        setLocalFilters({
            status: filters.status || "",
            category: filters.category || "",
            search: filters.search || "",
        });
    }, [filters]);

    const handleInputChange = (field, value) => {
        setLocalFilters((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleApplyFilters = () => {
        onFilterChange({
            status: localFilters.status || null,
            category: localFilters.category || null,
            search: localFilters.search || null,
        });
    };

    const handleClear = () => {
        setLocalFilters({
            status: "",
            category: "",
            search: "",
        });
        onClearFilters();
    };

    const hasChanges =
        localFilters.status !== (filters.status || "") ||
        localFilters.category !== (filters.category || "") ||
        localFilters.search !== (filters.search || "");

    const statusOptions = [
        { value: "", label: "All Statuses" },
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
        { value: "cancelled", label: "Cancelled" },
        { value: "completed", label: "Completed" },
    ];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                    <label
                        htmlFor="search"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Search
                    </label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <input
                            id="search"
                            type="text"
                            placeholder="Search events..."
                            value={localFilters.search}
                            onChange={(e) => handleInputChange("search", e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleApplyFilters();
                                }
                            }}
                            className="w-full pl-10 pr-3 py-2 rounded border"
                            style={{
                                backgroundColor: "var(--color-surface-primary)",
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                        {localFilters.search && (
                            <button
                                onClick={() => handleInputChange("search", "")}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                                <X
                                    className="w-4 h-4"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                />
                            </button>
                        )}
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        value={localFilters.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="w-full px-3 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Filter */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium mb-2"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Category
                    </label>
                    <select
                        id="category"
                        value={localFilters.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        className="w-full px-3 py-2 rounded border"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
                <Button onClick={handleApplyFilters} disabled={!hasChanges}>
                    Apply Filters
                </Button>
                <Button variant="secondary" onClick={handleClear}>
                    Clear All
                </Button>
                {hasChanges && (
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        You have unsaved filter changes
                    </span>
                )}
            </div>
        </div>
    );
}
