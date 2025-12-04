"use client";

import { useState, useEffect } from "react";
import { Search, X, SlidersHorizontal, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCategories, selectCategories } from "@/features/public-events/publicEventsSlice";

/**
 * EventArchiveFilters - Public-facing filters for the events archive page
 * Includes search, category, date range, and sort options
 */
export function EventArchiveFilters({
    filters,
    onFilterChange,
    onClearFilters,
    showMobileFilters = false,
    onToggleMobileFilters
}) {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);

    const [localFilters, setLocalFilters] = useState({
        category: filters.category || "",
        search: filters.search || "",
        dateRange: filters.dateRange || "upcoming", // upcoming, this-week, this-month, all
        sortBy: filters.sortBy || "startDate",
    });

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
    }, [dispatch, categories.length]);

    useEffect(() => {
        setLocalFilters({
            category: filters.category || "",
            search: filters.search || "",
            dateRange: filters.dateRange || "upcoming",
            sortBy: filters.sortBy || "startDate",
        });
    }, [filters]);

    const handleInputChange = (field, value) => {
        const newFilters = {
            ...localFilters,
            [field]: value,
        };
        setLocalFilters(newFilters);

        // Apply filters immediately for better UX
        onFilterChange({
            category: newFilters.category || null,
            search: newFilters.search || null,
            dateRange: newFilters.dateRange || null,
            sortBy: newFilters.sortBy || null,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onFilterChange({
            category: localFilters.category || null,
            search: localFilters.search || null,
            dateRange: localFilters.dateRange || null,
            sortBy: localFilters.sortBy || null,
        });
    };

    const handleClear = () => {
        setLocalFilters({
            category: "",
            search: "",
            dateRange: "upcoming",
            sortBy: "startDate",
        });
        onClearFilters();
    };

    const dateRangeOptions = [
        { value: "upcoming", label: "Upcoming Events" },
        { value: "this-week", label: "This Week" },
        { value: "this-month", label: "This Month" },
        { value: "all", label: "All Events" },
    ];

    const sortOptions = [
        { value: "startDate", label: "Date" },
        { value: "title", label: "Name" },
        { value: "createdAt", label: "Recently Added" },
    ];

    const hasActiveFilters = localFilters.category || localFilters.search || localFilters.dateRange !== "upcoming";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Search Bar - Always visible */}
            <div className="p-4 border-b border-gray-100">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search events by name, venue, or location..."
                        value={localFilters.search}
                        onChange={(e) => handleInputChange("search", e.target.value)}
                        className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 placeholder-gray-400"
                    />
                    {localFilters.search && (
                        <button
                            type="button"
                            onClick={() => handleInputChange("search", "")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </form>
            </div>

            {/* Filter Controls */}
            <div className="p-4">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden mb-4">
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        onClick={onToggleMobileFilters}
                    >
                        <span className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters {hasActiveFilters && <span className="text-primary-600">({Object.values(localFilters).filter(Boolean).length - 1})</span>}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                    </Button>
                </div>

                {/* Filter Options - Visible on desktop, toggleable on mobile */}
                <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                value={localFilters.category}
                                onChange={(e) => handleInputChange("category", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 bg-white"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat.id || cat._id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                When
                            </label>
                            <select
                                value={localFilters.dateRange}
                                onChange={(e) => handleInputChange("dateRange", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 bg-white"
                            >
                                {dateRangeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={localFilters.sortBy}
                                onChange={(e) => handleInputChange("sortBy", e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-gray-900 bg-white"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-end">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    onClick={handleClear}
                                    className="w-full text-gray-600 hover:text-gray-900"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventArchiveFilters;
