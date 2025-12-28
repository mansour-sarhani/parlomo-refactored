'use client';

/**
 * CreateChartForm Component
 * Form for creating a new custom seating chart
 */

import { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatingService from '@/services/seating.service';
import { toast } from 'sonner';

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
 * CreateChartForm component
 * @param {Object} props
 * @param {function(string): void} props.onCreated - Callback with new chart ID
 * @param {function(): void} props.onCancel - Callback to cancel creation
 */
export default function CreateChartForm({ onCreated, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        venue_name: '',
        venue_address: '',
        city: '',
        country: 'UK',
    });

    const [categories, setCategories] = useState([
        { key: 'vip', label: 'VIP', color: DEFAULT_COLORS[0] },
        { key: 'standard', label: 'Standard', color: DEFAULT_COLORS[1] },
    ]);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
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
            { key: `category-${Date.now()}`, label: '', color: DEFAULT_COLORS[colorIndex] },
        ]);
    };

    const updateCategory = (index, field, value) => {
        const updated = [...categories];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-generate key from label
        if (field === 'label') {
            updated[index].key = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        setCategories(updated);
    };

    const removeCategory = (index) => {
        if (categories.length <= 1) return;
        setCategories(categories.filter((_, i) => i !== index));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Chart name is required';
        }

        if (!formData.venue_name.trim()) {
            newErrors.venue_name = 'Venue name is required';
        }

        const validCategories = categories.filter(c => c.label.trim());
        if (validCategories.length === 0) {
            newErrors.categories = 'At least one category is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            toast.error('Please fix the errors before continuing');
            return;
        }

        setLoading(true);

        try {
            const validCategories = categories.filter(c => c.label.trim());
            const response = await seatingService.createChart({
                ...formData,
                categories: validCategories,
            });

            if (response.success) {
                toast.success('Chart created successfully');
                onCreated(response.data.id);
            } else {
                toast.error(response.message || 'Failed to create chart');
            }
        } catch (err) {
            toast.error('Failed to create chart. Please try again.');
            console.error('Error creating chart:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Create Custom Venue Chart</h3>
                <p className="text-sm text-gray-600">
                    Define your venue details and seating categories, then design the layout
                </p>
            </div>

            {/* Chart Details */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Chart Details</h4>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Chart Name *
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Summer Concert Layout"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="venue_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Venue Name *
                    </label>
                    <input
                        id="venue_name"
                        type="text"
                        value={formData.venue_name}
                        onChange={e => handleInputChange('venue_name', e.target.value)}
                        placeholder="e.g., City Convention Center"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                            errors.venue_name ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.venue_name && <p className="text-sm text-red-600 mt-1">{errors.venue_name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input
                            id="city"
                            type="text"
                            value={formData.city}
                            onChange={e => handleInputChange('city', e.target.value)}
                            placeholder="e.g., London"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                        </label>
                        <input
                            id="country"
                            type="text"
                            value={formData.country}
                            onChange={e => handleInputChange('country', e.target.value)}
                            placeholder="e.g., UK"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="venue_address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <input
                        id="venue_address"
                        type="text"
                        value={formData.venue_address}
                        onChange={e => handleInputChange('venue_address', e.target.value)}
                        placeholder="Full venue address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
            </div>

            {/* Seating Categories */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h4 className="font-medium text-gray-900">Seating Categories</h4>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={addCategory}
                        className="gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Button>
                </div>

                <p className="text-sm text-gray-600">
                    Define pricing zones (e.g., VIP, Standard, Economy). You'll map these to ticket prices later.
                </p>

                {errors.categories && (
                    <p className="text-sm text-red-600">{errors.categories}</p>
                )}

                <div className="space-y-3">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                            <input
                                type="color"
                                value={category.color}
                                onChange={e => updateCategory(index, 'color', e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer border-0"
                                title="Category color"
                            />
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={category.label}
                                    onChange={e => updateCategory(index, 'label', e.target.value)}
                                    placeholder="Category name (e.g., VIP)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                {category.key && category.label && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Key: {category.key}
                                    </p>
                                )}
                            </div>
                            {categories.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeCategory(index)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Remove category"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create & Open Designer'}
                </Button>
            </div>
        </form>
    );
}
