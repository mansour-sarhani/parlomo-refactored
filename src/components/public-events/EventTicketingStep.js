"use client";

import { useState } from "react";
import { Info, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ServiceChargeModal } from "./ServiceChargeModal";
import { CURRENCIES } from "@/types/public-events-types";

export function EventTicketingStep({ formData, errors, onChange }) {
    const [isServiceChargeModalOpen, setIsServiceChargeModalOpen] = useState(false);
    const [editingChargeIndex, setEditingChargeIndex] = useState(null);

    // Get currency symbol
    const currencyData = CURRENCIES.find(c => c.code === formData.currency) || CURRENCIES[0];
    const currencySymbol = currencyData.symbol;

    const handleAddServiceCharge = () => {
        setEditingChargeIndex(null);
        setIsServiceChargeModalOpen(true);
    };

    const handleEditServiceCharge = (index) => {
        setEditingChargeIndex(index);
        setIsServiceChargeModalOpen(true);
    };

    const handleDeleteServiceCharge = (index) => {
        const updatedCharges = (formData.serviceCharges || []).filter((_, i) => i !== index);
        onChange("serviceCharges", updatedCharges);
    };

    const handleSaveServiceCharge = (chargeData) => {
        if (editingChargeIndex !== null) {
            // Edit existing
            const updatedCharges = [...(formData.serviceCharges || [])];
            updatedCharges[editingChargeIndex] = chargeData;
            onChange("serviceCharges", updatedCharges);
        } else {
            // Add new
            const updatedCharges = [...(formData.serviceCharges || []), chargeData];
            onChange("serviceCharges", updatedCharges);
        }
        setIsServiceChargeModalOpen(false);
        setEditingChargeIndex(null);
    };

    const handleCloseModal = () => {
        setIsServiceChargeModalOpen(false);
        setEditingChargeIndex(null);
    };
    return (
        <div className="space-y-6">
            {/* Event Type */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Event Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => onChange("eventType", "general_admission")}
                        className={`p-4 rounded border text-left transition-colors ${formData.eventType === "general_admission"
                            ? "border-primary ring-1 ring-primary"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                        style={{
                            borderColor: formData.eventType === "general_admission" ? "var(--color-primary)" : "var(--color-border)",
                            backgroundColor: formData.eventType === "general_admission" ? "var(--color-surface-secondary)" : "var(--color-surface-primary)",
                        }}
                    >
                        <div className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>General Admission</div>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Attendees don't have assigned seats. First come, first served or standing room only.
                        </p>
                    </button>

                    <button
                        type="button"
                        disabled
                        className="p-4 rounded border text-left opacity-50 cursor-not-allowed"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                            Assigned Seating
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-warning-light)", color: "var(--color-warning)" }}>
                                Coming Soon
                            </span>
                        </div>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Attendees choose specific seats from a seating chart. Available in Phase 3.
                        </p>
                    </button>
                </div>
                {errors.eventType && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.eventType}</p>}
            </div>

            {/* Currency Info */}
            <div
                className="flex items-start gap-3 p-4 rounded-lg"
                style={{ backgroundColor: "var(--color-surface-secondary)" }}
            >
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
                <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        Currency: GBP (£)
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        All prices and transactions are in British Pounds. This is the default currency for events in the UK.
                    </p>
                </div>
            </div>

            {/* Global Capacity */}
            <div>
                <label htmlFor="globalCapacity" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Total Capacity (Optional)
                </label>
                <input
                    id="globalCapacity"
                    type="number"
                    min="0"
                    value={formData.globalCapacity || ""}
                    onChange={(e) => onChange("globalCapacity", e.target.value ? parseInt(e.target.value, 10) : null)}
                    placeholder="Leave empty for unlimited"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.globalCapacity ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Maximum number of tickets that can be sold across all ticket types.
                </p>
                {errors.globalCapacity && <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>{errors.globalCapacity}</p>}
            </div>

            {/* Service Charges */}
            <div
                className="p-4 rounded-lg border"
                style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-surface-primary)"
                }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        Service Charges
                    </h4>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddServiceCharge}
                        icon={<Plus className="w-4 h-4" />}
                    >
                        Add Service Charge
                    </Button>
                </div>

                {/* Service Charges List */}
                {formData.serviceCharges && formData.serviceCharges.length > 0 ? (
                    <div className="space-y-2">
                        {formData.serviceCharges.map((charge, index) => {
                            const amountDisplay = charge.amountType === 'percentage'
                                ? `${charge.amount}%`
                                : `${currencySymbol}${charge.amount.toFixed(2)}`;
                            const amountTypeLabel = charge.amountType === 'percentage' ? 'Percentage' : 'Fixed Price';
                            const chargeTypeLabel = charge.type === 'per_ticket' ? 'Per Ticket' : 'Per Cart';

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded border"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-surface-secondary)",
                                    }}
                                >
                                    <div>
                                        <p className="font-medium text-sm" style={{ color: "var(--color-text-primary)" }}>
                                            {charge.title}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                            {amountDisplay} ({amountTypeLabel}) - {chargeTypeLabel}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEditServiceCharge(index)}
                                            className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                                            style={{ color: "var(--color-text-secondary)" }}
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteServiceCharge(index)}
                                            className="p-1.5 rounded hover:bg-opacity-80 transition-colors"
                                            style={{ color: "var(--color-error)" }}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p
                        className="text-sm text-center py-4"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        No service charges added. Click "Add Service Charge" to create one.
                    </p>
                )}

                <p className="text-xs mt-3" style={{ color: "var(--color-text-tertiary)" }}>
                    Service charges are additional fees added to ticket purchases. Per Ticket charges apply to each ticket, Per Cart charges apply once per order.
                </p>
            </div>

            {/* Service Charge Modal */}
            <ServiceChargeModal
                isOpen={isServiceChargeModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveServiceCharge}
                initialValues={editingChargeIndex !== null ? formData.serviceCharges[editingChargeIndex] : null}
                currency={formData.currency}
            />

            {/* Waitlist Option */}
            <div className="flex items-start gap-3">
                <input
                    id="enableWaitlist"
                    type="checkbox"
                    checked={formData.enableWaitlist || false}
                    onChange={(e) => onChange("enableWaitlist", e.target.checked)}
                    className="mt-1"
                />
                <div>
                    <label htmlFor="enableWaitlist" className="text-sm font-medium cursor-pointer" style={{ color: "var(--color-text-primary)" }}>
                        Enable Waitlist
                    </label>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                        Allow people to join a waitlist when tickets are sold out
                    </p>
                </div>
            </div>
        </div>
    );
}
