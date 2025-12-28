'use client';

/**
 * CategoryMapping Component
 * Maps seats.io chart categories to ticket types for pricing
 */

import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Loader2, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import seatingService from '@/services/seating.service';
import ticketingService from '@/services/ticketing.service';
import { toast } from 'sonner';

/**
 * CategoryMapping component
 * @param {Object} props
 * @param {string} props.eventId - Event ID
 * @param {import('@/types/seating-types').ChartCategory[]} props.categories - Chart categories
 * @param {function(): void} props.onComplete - Callback when mapping is complete
 * @param {function(): void} [props.onBack] - Optional callback to go back
 */
export default function CategoryMapping({ eventId, categories, onComplete, onBack }) {
    const [ticketTypes, setTicketTypes] = useState([]);
    const [mappings, setMappings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Fetch ticket types on mount
    useEffect(() => {
        if (eventId) {
            fetchTicketTypes();
        }
    }, [eventId]);

    const fetchTicketTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ticketingService.getEventTicketing(eventId);
            if (response.success) {
                const types = response.data?.ticket_types || [];
                setTicketTypes(types);

                // Initialize mappings with empty values
                const initialMappings = {};
                categories.forEach(cat => {
                    initialMappings[cat.key] = '';
                });
                setMappings(initialMappings);
            } else {
                setError(response.message || 'Failed to load ticket types');
            }
        } catch (err) {
            setError('Failed to load ticket types');
            console.error('Error fetching ticket types:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateMapping = (categoryKey, ticketTypeId) => {
        setMappings(prev => ({
            ...prev,
            [categoryKey]: ticketTypeId,
        }));
    };

    const formatPrice = (cents) => {
        return `£${(cents / 100).toFixed(2)}`;
    };

    // Calculate validation state
    const validation = useMemo(() => {
        const unmapped = categories.filter(cat => !mappings[cat.key]);
        const isValid = unmapped.length === 0;
        return { isValid, unmapped };
    }, [categories, mappings]);

    const handleSave = async () => {
        if (!validation.isValid) {
            toast.error(`Please map all categories. Missing: ${validation.unmapped.map(c => c.label).join(', ')}`);
            return;
        }

        setSaving(true);

        const mappingData = categories.map(cat => ({
            category_key: cat.key,
            category_label: cat.label,
            ticket_type_id: mappings[cat.key],
        }));

        try {
            const response = await seatingService.mapCategoriesToTicketTypes(eventId, mappingData);
            if (response.success) {
                toast.success('Categories mapped successfully');
                onComplete();
            } else {
                toast.error(response.message || 'Failed to save mappings');
            }
        } catch (err) {
            toast.error('Failed to save mappings. Please try again.');
            console.error('Error saving mappings:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-gray-600">Loading ticket types...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-700 font-medium mb-2">Unable to load ticket types</p>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button onClick={fetchTicketTypes} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    if (ticketTypes.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-amber-900 font-semibold mb-2">No Ticket Types Found</h3>
                <p className="text-amber-700 text-sm mb-4">
                    Please create ticket types before mapping categories. Each category needs a corresponding ticket type with pricing.
                </p>
                <div className="flex items-center justify-center gap-3">
                    {onBack && (
                        <Button onClick={onBack} variant="secondary">
                            Go Back
                        </Button>
                    )}
                    <Button
                        onClick={() => window.location.href = `/panel/my-events/${eventId}/ticketing`}
                        variant="primary"
                    >
                        Create Ticket Types
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Map Categories to Ticket Types</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Connect each seating zone to a ticket type. This determines pricing for seats in each category.
                </p>
            </div>

            {/* Mapping Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 p-4 bg-gray-50 border-b border-gray-200">
                    <span className="font-medium text-gray-700 text-sm">Chart Category</span>
                    <span></span>
                    <span className="font-medium text-gray-700 text-sm">Ticket Type (Price)</span>
                </div>

                {/* Mapping Rows */}
                {categories.map(category => {
                    const selectedTicketType = ticketTypes.find(tt => tt.id === mappings[category.key]);
                    const isMapped = !!mappings[category.key];

                    return (
                        <div
                            key={category.key}
                            className={`grid grid-cols-[1fr,auto,1fr] gap-4 p-4 items-center border-b border-gray-100 last:border-b-0 ${
                                isMapped ? 'bg-green-50/30' : ''
                            }`}
                        >
                            {/* Category Info */}
                            <div className="flex items-center gap-3">
                                <span
                                    className="w-4 h-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: category.color }}
                                />
                                <div>
                                    <span className="font-medium text-gray-900">{category.label}</span>
                                    <p className="text-xs text-gray-500">Key: {category.key}</p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <ArrowRight className={`w-5 h-5 ${isMapped ? 'text-green-500' : 'text-gray-300'}`} />

                            {/* Ticket Type Selector */}
                            <div className="relative">
                                <select
                                    value={mappings[category.key] || ''}
                                    onChange={e => updateMapping(category.key, e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                                        isMapped
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    <option value="">Select ticket type...</option>
                                    {ticketTypes.map(tt => (
                                        <option key={tt.id} value={tt.id}>
                                            {tt.name} - {formatPrice(tt.price)}
                                        </option>
                                    ))}
                                </select>
                                {isMapped && (
                                    <Check className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Mapping Summary</h4>
                <div className="space-y-2">
                    {categories.map(cat => {
                        const ticketType = ticketTypes.find(tt => tt.id === mappings[cat.key]);
                        return (
                            <div key={cat.key} className="flex items-center gap-2 text-sm">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                />
                                <span className="text-gray-700">{cat.label}:</span>
                                {ticketType ? (
                                    <span className="font-medium text-gray-900">
                                        {ticketType.name} ({formatPrice(ticketType.price)})
                                    </span>
                                ) : (
                                    <span className="text-amber-600 italic">Not mapped</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {!validation.isValid && (
                    <p className="text-amber-600 text-sm mt-3">
                        {validation.unmapped.length} category(ies) still need to be mapped
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                {onBack && (
                    <Button onClick={onBack} variant="secondary" disabled={saving}>
                        Back
                    </Button>
                )}
                <div className="flex-1" />
                <Button
                    onClick={handleSave}
                    variant="primary"
                    loading={saving}
                    disabled={saving || !validation.isValid}
                >
                    {saving ? 'Saving...' : 'Save Mappings'}
                </Button>
            </div>
        </div>
    );
}
