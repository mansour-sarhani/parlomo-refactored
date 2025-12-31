'use client';

/**
 * VenueChartForm Component
 * Form for creating or editing venue charts
 */

import { useState, useEffect } from 'react';
import { Plus, X, Palette } from 'lucide-react';
import { Button } from '@/components/common/Button';

const DEFAULT_COLORS = [
    '#FFD700', // Gold
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#FF5722', // Orange
    '#607D8B', // Grey
    '#E91E63', // Pink
    '#00BCD4', // Cyan
];

/**
 * VenueChartForm component
 * @param {Object} props
 * @param {Object} [props.initialData] - Initial form data for editing
 * @param {function(Object): void} props.onSubmit - Submit callback
 * @param {function(): void} props.onCancel - Cancel callback
 * @param {boolean} [props.loading] - Loading state
 * @param {Object} [props.serverErrors] - Server validation errors
 */
export default function VenueChartForm({
    initialData,
    onSubmit,
    onCancel,
    loading = false,
    serverErrors = {},
}) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        venue_name: '',
        venue_address: '',
        city: '',
        country: '',
    });

    const [categories, setCategories] = useState([
        { key: 'vip', label: 'VIP', color: DEFAULT_COLORS[0] },
        { key: 'standard', label: 'Standard', color: DEFAULT_COLORS[1] },
    ]);

    const [errors, setErrors] = useState({});
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    // Initialize form with initial data
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                venue_name: initialData.venue_name || '',
                venue_address: initialData.venue_address || '',
                city: initialData.city || '',
                country: initialData.country || '',
            });

            if (initialData.categories && initialData.categories.length > 0) {
                setCategories(initialData.categories);
            }
        }
    }, [initialData]);

    // Update errors when server errors change
    useEffect(() => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            setErrors(serverErrors);
        }
    }, [serverErrors]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const addCategory = () => {
        const colorIndex = categories.length % DEFAULT_COLORS.length;
        setCategories([
            ...categories,
            {
                key: `category-${Date.now()}`,
                label: '',
                color: DEFAULT_COLORS[colorIndex],
            },
        ]);
        setShowCategoryForm(true);
    };

    const updateCategory = (index, field, value) => {
        const updated = [...categories];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-generate key from label
        if (field === 'label') {
            updated[index].key = value
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
        }

        setCategories(updated);
    };

    const removeCategory = (index) => {
        if (categories.length <= 1) return;
        setCategories(categories.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) {
            newErrors.name = 'Chart name is required';
        } else if (formData.name.length > 200) {
            newErrors.name = 'Chart name must be 200 characters or less';
        }

        if (!formData.venue_name.trim()) {
            newErrors.venue_name = 'Venue name is required';
        } else if (formData.venue_name.length > 200) {
            newErrors.venue_name = 'Venue name must be 200 characters or less';
        }

        // Optional field length validation
        if (formData.city && formData.city.length > 100) {
            newErrors.city = 'City must be 100 characters or less';
        }

        if (formData.country && formData.country.length > 100) {
            newErrors.country = 'Country must be 100 characters or less';
        }

        // Category validation
        const validCategories = categories.filter((c) => c.label.trim());
        if (validCategories.length === 0) {
            newErrors.categories = 'At least one category is required';
        }

        // Validate each category
        categories.forEach((cat, index) => {
            if (cat.label.trim()) {
                if (cat.key.length > 50) {
                    newErrors[`category_${index}_key`] =
                        'Category key must be 50 characters or less';
                }
                if (cat.label.length > 100) {
                    newErrors[`category_${index}_label`] =
                        'Category label must be 100 characters or less';
                }
                if (cat.color && !/^#[0-9A-Fa-f]{6}$/.test(cat.color)) {
                    newErrors[`category_${index}_color`] =
                        'Invalid hex color code';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const validCategories = categories.filter((c) => c.label.trim());

        const submitData = {
            ...formData,
            categories: validCategories,
        };

        onSubmit(submitData);
    };

    const isEditing = !!initialData;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chart Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Details</h3>

                <div className="space-y-4">
                    {/* Chart Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Chart Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            maxLength={200}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., Main Arena Layout"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            placeholder="Optional description of this seating chart"
                        />
                    </div>
                </div>
            </div>

            {/* Venue Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Venue Name */}
                    <div className="md:col-span-2">
                        <label
                            htmlFor="venue_name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Venue Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="venue_name"
                            value={formData.venue_name}
                            onChange={(e) => handleInputChange('venue_name', e.target.value)}
                            maxLength={200}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.venue_name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., The O2 Arena"
                        />
                        {errors.venue_name && (
                            <p className="text-sm text-red-600 mt-1">{errors.venue_name}</p>
                        )}
                    </div>

                    {/* Venue Address */}
                    <div className="md:col-span-2">
                        <label
                            htmlFor="venue_address"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Venue Address
                        </label>
                        <input
                            type="text"
                            id="venue_address"
                            value={formData.venue_address}
                            onChange={(e) => handleInputChange('venue_address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                            placeholder="e.g., Peninsula Square, London SE10 0DX"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label
                            htmlFor="city"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            maxLength={100}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., London"
                        />
                        {errors.city && (
                            <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                        )}
                    </div>

                    {/* Country */}
                    <div>
                        <label
                            htmlFor="country"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Country
                        </label>
                        <input
                            type="text"
                            id="country"
                            value={formData.country}
                            onChange={(e) => handleInputChange('country', e.target.value)}
                            maxLength={100}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.country ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="e.g., United Kingdom"
                        />
                        {errors.country && (
                            <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories */}
            {!isEditing && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Seating Categories <span className="text-red-500">*</span>
                        </h3>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addCategory}
                            icon={<Plus className="w-4 h-4" />}
                        >
                            Add Category
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                                {/* Color Picker */}
                                <div className="flex-shrink-0">
                                    <label className="block text-xs text-gray-600 mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={category.color || '#CCCCCC'}
                                        onChange={(e) => updateCategory(index, 'color', e.target.value)}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                </div>

                                {/* Category Fields */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Label <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={category.label}
                                            onChange={(e) => updateCategory(index, 'label', e.target.value)}
                                            maxLength={100}
                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                            placeholder="e.g., VIP"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">Key</label>
                                        <input
                                            type="text"
                                            value={category.key}
                                            readOnly
                                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-gray-100 text-gray-600 font-mono"
                                            placeholder="auto-generated"
                                        />
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeCategory(index)}
                                    disabled={categories.length <= 1}
                                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Remove category"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {errors.categories && (
                        <p className="text-sm text-red-600 mt-2">{errors.categories}</p>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                        Note: Categories cannot be modified after creation. You can design the seating
                        layout in the next step.
                    </p>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" loading={loading}>
                    {isEditing ? 'Update Chart' : 'Create Chart'}
                </Button>
            </div>
        </form>
    );
}
