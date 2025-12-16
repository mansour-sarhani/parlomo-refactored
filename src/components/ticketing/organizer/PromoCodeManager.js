'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';
import ticketingService from '@/services/ticketing.service';

export default function PromoCodeManager({ eventId }) {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage', // 'percentage' or 'fixed'
        discountAmount: '',
        maxUses: '',
        minOrderAmount: '',
        startDate: '',
        endDate: '',
        active: true,
    });

    useEffect(() => {
        loadPromoCodes();
    }, [eventId]);

    const loadPromoCodes = async () => {
        try {
            const response = await ticketingService.getEventPromoCodes(eventId);
            // API returns { success: true, data: [...] }
            setPromoCodes(response.data || []);
        } catch (error) {
            console.error('Failed to load promo codes:', error);
            toast.error('Failed to load promo codes');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (promo) => {
        // API returns snake_case, map to camelCase for form
        setFormData({
            code: promo.code,
            discountType: promo.discount_type,
            discountAmount: promo.discount_amount,
            maxUses: promo.max_uses || '',
            minOrderAmount: promo.min_purchase_amount || '',
            startDate: promo.valid_from ? promo.valid_from.slice(0, 16) : '',
            endDate: promo.valid_until ? promo.valid_until.slice(0, 16) : '',
            active: promo.active,
        });
        setEditingId(promo.id);
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setFormData({
            code: '',
            discountType: 'percentage',
            discountAmount: '',
            maxUses: '',
            minOrderAmount: '',
            startDate: new Date().toISOString().slice(0, 16),
            endDate: '',
            active: true,
        });
        setEditingId(null);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.discountAmount) {
            toast.error('Please fill in required fields');
            return;
        }

        setSaving(true);
        try {
            // API expects snake_case field names
            const payload = {
                code: formData.code,
                discount_type: formData.discountType,
                discount_amount: parseFloat(formData.discountAmount),
                max_uses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
                min_order_amount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
                start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                active: formData.active,
            };

            if (editingId) {
                await ticketingService.updatePromoCode(eventId, editingId, payload);
                toast.success('Promo code updated');
            } else {
                await ticketingService.createPromoCode(eventId, payload);
                toast.success('Promo code created');
            }

            setIsEditing(false);
            loadPromoCodes();
        } catch (error) {
            console.error('Failed to save promo code:', error);
            toast.error(error.response?.data?.error || 'Failed to save promo code');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promo code?')) return;

        try {
            await ticketingService.deletePromoCode(eventId, id);
            toast.success('Promo code deleted');
            loadPromoCodes();
        } catch (error) {
            console.error('Failed to delete promo code:', error);
            toast.error('Failed to delete promo code');
        }
    };

    const toggleActive = async (promo) => {
        try {
            await ticketingService.updatePromoCode(eventId, promo.id, { active: !promo.active });
            loadPromoCodes();
            toast.success(`Promo code ${!promo.active ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading promo codes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Promo Codes</h2>
                {!isEditing && (
                    <Button onClick={handleAddNew} icon={<Plus className="w-4 h-4" />}>
                        Add Promo Code
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">
                        {editingId ? 'Edit Promo Code' : 'New Promo Code'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Code *
                                </label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 border rounded-md uppercase"
                                    placeholder="SUMMER2024"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Type *
                                    </label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (£)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.discountAmount}
                                        onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Uses (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.maxUses}
                                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="Unlimited"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Min Order Amount (Optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.minOrderAmount}
                                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <input
                                type="checkbox"
                                id="active"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="active" className="text-sm font-medium text-gray-700">
                                Active
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={saving}>
                                {editingId ? 'Update Promo Code' : 'Create Promo Code'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Code</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Discount</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Usage</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {promoCodes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No promo codes found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                promoCodes.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-gray-400" />
                                                {promo.code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {promo.discount_type === 'percentage'
                                                ? `${promo.discount_amount}%`
                                                : `£${(promo.discount_amount || 0).toFixed(2)}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            {promo.current_uses} / {promo.max_uses || '∞'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(promo)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${promo.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {promo.active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(promo)}
                                                    icon={<Edit className="w-4 h-4" />}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    icon={<Trash2 className="w-4 h-4" />}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
