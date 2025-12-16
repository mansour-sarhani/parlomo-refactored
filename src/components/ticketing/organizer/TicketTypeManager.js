'use client';

/**
 * Ticket Type Manager Component
 * Create, edit, and manage ticket types for an event
 */

import { useEffect, useState } from 'react';
import ticketingService from '@/services/ticketing.service';
import { Button } from '@/components/common/Button';
import { Plus, Edit, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

export default function TicketTypeManager({ eventId }) {
    const [ticketTypes, setTicketTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        capacity: '',
        minPerOrder: 1,
        maxPerOrder: 10,
        visible: true,
        refundable: true,
        transferAllowed: true,
    });

    useEffect(() => {
        fetchTicketTypes();
    }, [eventId]);

    const fetchTicketTypes = async () => {
        try {
            setLoading(true);
            const response = await ticketingService.getEventTicketing(eventId);
            // API returns { success: true, data: { ticket_types: [...] } }
            setTicketTypes(response.data?.ticket_types || []);
        } catch (error) {
            console.error('Error fetching ticket types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                price: parseInt(formData.price * 100), // Convert to cents
                capacity: parseInt(formData.capacity),
                minPerOrder: parseInt(formData.minPerOrder),
                maxPerOrder: parseInt(formData.maxPerOrder),
            };

            if (editingId) {
                // Update existing
                await ticketingService.updateTicketType(eventId, editingId, payload);
            } else {
                // Create new
                await ticketingService.createTicketType(eventId, payload);
            }

            // Reset form and refresh
            resetForm();
            fetchTicketTypes();
        } catch (error) {
            console.error('Error saving ticket type:', error);
            alert('Failed to save ticket type');
        }
    };

    const handleEdit = (ticketType) => {
        // API returns snake_case, map to camelCase for form
        setFormData({
            name: ticketType.name,
            description: ticketType.description || '',
            price: (ticketType.price / 100).toString(),
            capacity: (ticketType.available || 0).toString(),
            minPerOrder: ticketType.min_per_order || 1,
            maxPerOrder: ticketType.max_per_order || 10,
            visible: ticketType.is_on_sale ?? true,
            refundable: ticketType.refundable ?? true,
            transferAllowed: ticketType.transfer_allowed ?? true,
        });
        setEditingId(ticketType.id);
        setShowCreateForm(true);
    };

    const handleToggleVisibility = async (ticketType) => {
        try {
            await ticketingService.updateTicketType(eventId, ticketType.id, {
                is_on_sale: !ticketType.is_on_sale,
            });
            fetchTicketTypes();
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            capacity: '',
            minPerOrder: 1,
            maxPerOrder: 10,
            visible: true,
            refundable: true,
            transferAllowed: true,
        });
        setEditingId(null);
        setShowCreateForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Ticket Types</h2>
                {!showCreateForm && (
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        icon={<Plus className="w-5 h-5" />}
                    >
                        Create Ticket Type
                    </Button>
                )}
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {editingId ? 'Edit Ticket Type' : 'Create New Ticket Type'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="e.g., General Admission"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (GBP) *
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="49.99"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Capacity *
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Per Order
                                </label>
                                <input
                                    type="number"
                                    name="maxPerOrder"
                                    value={formData.maxPerOrder}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Describe what's included..."
                            />
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="visible"
                                    checked={formData.visible}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">Visible to public</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="refundable"
                                    checked={formData.refundable}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">Refundable</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="transferAllowed"
                                    checked={formData.transferAllowed}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">Transferable</span>
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                className="px-6"
                            >
                                {editingId ? 'Update' : 'Create'} Ticket Type
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={resetForm}
                                className="px-6"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Ticket Types List */}
            <div className="space-y-3">
                {ticketTypes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No ticket types created yet</p>
                    </div>
                ) : (
                    ticketTypes.map((ticketType) => (
                        <div
                            key={ticketType.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {ticketType.name}
                                        </h3>
                                        {!ticketType.is_on_sale && (
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                                                Hidden
                                            </span>
                                        )}
                                        {ticketType.is_sold_out && (
                                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                                                Sold Out
                                            </span>
                                        )}
                                    </div>
                                    {ticketType.description && (
                                        <p className="text-sm text-gray-600 mb-3">
                                            {ticketType.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Price:</span>
                                            <span className="font-semibold text-gray-900 ml-1">
                                                £{(ticketType.price / 100).toFixed(2)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Available:</span>
                                            <span className="font-semibold text-green-600 ml-1">
                                                {ticketType.available}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Per Order:</span>
                                            <span className="font-semibold text-gray-900 ml-1">
                                                {ticketType.min_per_order} - {ticketType.max_per_order}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleEdit(ticketType)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:bg-blue-50"
                                        title="Edit"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        onClick={() => handleToggleVisibility(ticketType)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-600 hover:bg-gray-100"
                                        title={ticketType.is_on_sale ? 'Hide' : 'Show'}
                                    >
                                        {ticketType.is_on_sale ? (
                                            <Eye className="w-5 h-5" />
                                        ) : (
                                            <EyeOff className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
