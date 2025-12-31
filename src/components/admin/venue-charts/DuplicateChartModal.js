'use client';

/**
 * DuplicateChartModal Component
 * Modal for duplicating a venue chart with options
 */

import { useState } from 'react';
import { X, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';
import adminVenueChartsService from '@/services/admin/adminVenueCharts.service';
import { toast } from 'sonner';

/**
 * DuplicateChartModal component
 * @param {Object} props
 * @param {string} props.chartId - Chart ID to duplicate
 * @param {string} props.chartName - Original chart name
 * @param {function(): void} props.onClose - Close modal callback
 * @param {function(Object): void} props.onSuccess - Success callback with duplicated chart data
 */
export default function DuplicateChartModal({ chartId, chartName, onClose, onSuccess }) {
    const [name, setName] = useState(`${chartName} - Copy`);
    const [isAdminChart, setIsAdminChart] = useState(true);
    const [duplicating, setDuplicating] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!name || name.trim().length === 0) {
            newErrors.name = 'Chart name is required';
        } else if (name.trim().length > 200) {
            newErrors.name = 'Chart name must be 200 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setDuplicating(true);

        try {
            const response = await adminVenueChartsService.duplicateChart(chartId, {
                name: name.trim(),
                is_admin_chart: isAdminChart,
            });

            if (response.success) {
                toast.success('Chart duplicated successfully');
                onSuccess(response.data);
                onClose();
            } else {
                toast.error(response.message || 'Failed to duplicate chart');
            }
        } catch (err) {
            console.error('Error duplicating chart:', err);
            toast.error(err.message || 'Failed to duplicate chart');
        } finally {
            setDuplicating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Copy className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Duplicate Chart</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={duplicating}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Original Chart Info */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Duplicating from:</p>
                        <p className="font-medium text-gray-900">{chartName}</p>
                    </div>

                    {/* New Chart Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            New Chart Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent ${
                                errors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter chart name"
                            disabled={duplicating}
                            maxLength={200}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {name.length}/200 characters
                        </p>
                    </div>

                    {/* Chart Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chart Type
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="chartType"
                                    checked={isAdminChart}
                                    onChange={() => setIsAdminChart(true)}
                                    disabled={duplicating}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Admin Chart</p>
                                    <p className="text-sm text-gray-600">
                                        Available for all organizers to use when creating events
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                <input
                                    type="radio"
                                    name="chartType"
                                    checked={!isAdminChart}
                                    onChange={() => setIsAdminChart(false)}
                                    disabled={duplicating}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Organizer Chart</p>
                                    <p className="text-sm text-gray-600">
                                        Owned by you, only visible to you
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> This will create a complete copy of the chart including all seats, categories, and layout in Seats.io.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="secondary"
                            fullWidth
                            disabled={duplicating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={duplicating}
                            className="gap-2"
                        >
                            {duplicating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Duplicating...
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Duplicate Chart
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
