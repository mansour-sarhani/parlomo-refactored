'use client';

/**
 * ChartFilters Component
 * Search and filter controls for venue charts list
 */

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

/**
 * ChartFilters component
 * @param {Object} props
 * @param {string} props.search - Current search value
 * @param {function(string): void} props.onSearchChange - Search change callback
 * @param {string} props.activeFilter - Current active filter ('all' | 'true' | 'false')
 * @param {function(string): void} props.onActiveFilterChange - Active filter change callback
 * @param {string} props.typeFilter - Current type filter ('all' | 'admin' | 'organizer')
 * @param {function(string): void} props.onTypeFilterChange - Type filter change callback
 * @param {string} [props.className] - Additional CSS classes
 */
export default function ChartFilters({
    search,
    onSearchChange,
    activeFilter,
    onActiveFilterChange,
    typeFilter,
    onTypeFilterChange,
    className = '',
}) {
    const [searchInput, setSearchInput] = useState(search);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(searchInput);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, onSearchChange]);

    return (
        <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${className}`}>
            {/* Search Input */}
            <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by name, venue, or city..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
            </div>

            {/* Chart Type Filter */}
            <div className="relative sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => onTypeFilterChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                    <option value="all">All Types</option>
                    <option value="admin">Admin Charts</option>
                    <option value="organizer">Organizer Charts</option>
                </select>
            </div>

            {/* Active Status Filter */}
            <div className="relative sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                    value={activeFilter}
                    onChange={(e) => onActiveFilterChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>
        </div>
    );
}
