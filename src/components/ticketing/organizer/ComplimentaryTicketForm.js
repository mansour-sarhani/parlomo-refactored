'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/components/common/Button';
import { toast } from 'sonner';
import SeatingChart from '@/components/ticketing/SeatingChart';
import SelectedSeatsSummary from '@/components/ticketing/SelectedSeatsSummary';
import {
    issueComplimentaryTickets,
    selectSelectedSeats,
    clearSelectedSeats,
    selectTicketingLoading,
    removeSelectedSeat,
} from '@/features/ticketing/ticketingSlice';

const REASON_OPTIONS = [
    { value: 'VIP Guest', label: 'VIP Guest' },
    { value: 'Sponsor', label: 'Sponsor' },
    { value: 'Media Pass', label: 'Media/Press' },
    { value: 'Staff', label: 'Staff/Volunteer' },
    { value: 'Promotional', label: 'Promotional' },
    { value: 'Other', label: 'Other' },
];

export default function ComplimentaryTicketForm({ eventId, ticketTypes, isSeatedEvent, onSuccess }) {
    const dispatch = useDispatch();
    const selectedSeats = useSelector(selectSelectedSeats);
    const loading = useSelector(selectTicketingLoading);

    // For seated events: one recipient per seat
    // For general admission: single recipient with ticket selection
    const [recipients, setRecipients] = useState([
        { name: '', email: '', phone: '' }
    ]);

    const [formData, setFormData] = useState({
        ticketItems: [{ ticketTypeId: '', quantity: 1 }],
        reason: '',
        notes: '',
    });

    const [errors, setErrors] = useState({});

    // No need to update recipients based on seats - always single recipient

    const handleRecipientChange = (index, field, value) => {
        const newRecipients = [...recipients];
        newRecipients[index] = {
            ...newRecipients[index],
            [field]: value,
        };
        setRecipients(newRecipients);

        // Clear error for this field
        if (errors[`recipients.${index}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`recipients.${index}.${field}`]: '' }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleTicketItemChange = (index, field, value) => {
        const newItems = [...formData.ticketItems];
        newItems[index] = {
            ...newItems[index],
            [field]: field === 'quantity' ? parseInt(value) || 0 : value,
        };
        setFormData((prev) => ({
            ...prev,
            ticketItems: newItems,
        }));
        if (errors[`ticketItems.${index}.${field}`]) {
            setErrors((prev) => ({ ...prev, [`ticketItems.${index}.${field}`]: '' }));
        }
    };

    const addTicketItem = () => {
        setFormData((prev) => ({
            ...prev,
            ticketItems: [...prev.ticketItems, { ticketTypeId: '', quantity: 1 }],
        }));
    };

    const removeTicketItem = (index) => {
        if (formData.ticketItems.length > 1) {
            const newItems = formData.ticketItems.filter((_, i) => i !== index);
            setFormData((prev) => ({
                ...prev,
                ticketItems: newItems,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const recipient = recipients[0];

        // Validate recipient (same for both seated and general admission)
        if (!recipient.name.trim()) {
            newErrors.recipientName = 'Recipient name is required';
        } else if (recipient.name.length > 255) {
            newErrors.recipientName = 'Name is too long (max 255 characters)';
        }

        if (!recipient.email.trim()) {
            newErrors.recipientEmail = 'Recipient email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
            newErrors.recipientEmail = 'Invalid email address';
        }

        if (recipient.phone && recipient.phone.length > 30) {
            newErrors.recipientPhone = 'Phone number is too long (max 30 characters)';
        }

        if (isSeatedEvent) {
            // For seated events: validate seats
            if (selectedSeats.length === 0) {
                newErrors.seats = 'Please select at least one seat';
            }
        } else {
            // For general admission: validate ticket items
            formData.ticketItems.forEach((item, index) => {
                if (!item.ticketTypeId) {
                    newErrors[`ticketItems.${index}.ticketTypeId`] = 'Please select a ticket type';
                }
                if (!item.quantity || item.quantity < 1) {
                    newErrors[`ticketItems.${index}.quantity`] = 'Quantity must be at least 1';
                }
                if (item.quantity > 50) {
                    newErrors[`ticketItems.${index}.quantity`] = 'Maximum 50 tickets per issuance';
                }
            });
        }

        // Reason validation
        if (!formData.reason) {
            newErrors.reason = 'Please select a reason';
        } else if (formData.reason.length > 200) {
            newErrors.reason = 'Reason is too long (max 200 characters)';
        }

        // Notes validation
        if (formData.notes && formData.notes.length > 1000) {
            newErrors.notes = 'Notes are too long (max 1000 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        try {
            const recipient = recipients[0];

            if (isSeatedEvent) {
                // For seated events: group seats by ticket type and make single API call
                // Build ticket_items array by counting seats per ticket type
                const ticketTypeCounts = {};
                selectedSeats.forEach(seat => {
                    if (ticketTypeCounts[seat.ticketTypeId]) {
                        ticketTypeCounts[seat.ticketTypeId]++;
                    } else {
                        ticketTypeCounts[seat.ticketTypeId] = 1;
                    }
                });

                const ticket_items = Object.entries(ticketTypeCounts).map(([ticketTypeId, quantity]) => ({
                    ticket_type_id: ticketTypeId,
                    quantity: quantity,
                }));

                const payload = {
                    ticket_items,
                    recipient: {
                        name: recipient.name,
                        email: recipient.email,
                        ...(recipient.phone && { phone: recipient.phone }),
                    },
                    selected_seats: selectedSeats.map(seat => seat.label),
                    reason: formData.reason,
                    ...(formData.notes && { notes: formData.notes }),
                };

                const result = await dispatch(
                    issueComplimentaryTickets({
                        eventId,
                        data: payload,
                    })
                ).unwrap();

                const ticketCount = result.data?.ticket_count || result.ticket_count || selectedSeats.length;
                toast.success(
                    `${ticketCount} complimentary ticket(s) issued successfully to ${recipient.name}`
                );

                // Reset form
                setRecipients([{ name: '', email: '', phone: '' }]);
                setFormData({
                    ticketItems: [{ ticketTypeId: '', quantity: 1 }],
                    reason: '',
                    notes: '',
                });
                setErrors({});
                dispatch(clearSelectedSeats());

                // Call success callback
                if (onSuccess) {
                    onSuccess(result);
                }
            } else {
                // For general admission: single recipient with ticket items
                const recipient = recipients[0];
                const payload = {
                    ticket_items: formData.ticketItems.map((item) => ({
                        ticket_type_id: item.ticketTypeId,
                        quantity: item.quantity,
                    })),
                    recipient: {
                        name: recipient.name,
                        email: recipient.email,
                        ...(recipient.phone && { phone: recipient.phone }),
                    },
                    reason: formData.reason,
                    ...(formData.notes && { notes: formData.notes }),
                };

                const result = await dispatch(
                    issueComplimentaryTickets({
                        eventId,
                        data: payload,
                    })
                ).unwrap();

                const ticketCount = result.data?.ticket_count || result.ticket_count;
                toast.success(
                    `${ticketCount} complimentary ticket(s) issued successfully`
                );

                // Reset form
                setRecipients([{ name: '', email: '', phone: '' }]);
                setFormData({
                    ticketItems: [{ ticketTypeId: '', quantity: 1 }],
                    reason: '',
                    notes: '',
                });
                setErrors({});

                // Call success callback
                if (onSuccess) {
                    onSuccess(result);
                }
            }
        } catch (error) {
            console.error('Failed to issue complimentary tickets:', error);

            // Handle specific error scenarios
            if (error?.message) {
                if (error.message.includes('permission')) {
                    toast.error('You do not have permission to issue complimentary tickets');
                } else if (error.message.includes('already booked')) {
                    toast.error('Some seats are already booked. Please select different seats.');
                    dispatch(clearSelectedSeats());
                } else if (error.message.includes('Not enough tickets')) {
                    toast.error('Not enough tickets available for the selected type');
                } else {
                    toast.error(error.message);
                }
            } else if (error?.errors) {
                const errorMessages = Object.values(error.errors).flat();
                errorMessages.forEach((msg) => toast.error(msg));
            } else {
                toast.error('Failed to issue complimentary tickets. Please try again.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seat Selection for Seated Events - Show FIRST */}
            {isSeatedEvent && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Select Seats <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Select the seats you want to issue complimentary tickets for. Each seat will require recipient information.
                    </p>
                    {errors.seats && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.seats}</p>
                        </div>
                    )}

                    {/* Selected Seats Summary */}
                    {selectedSeats.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Selected: {selectedSeats.length} seat(s)
                            </p>
                            <SelectedSeatsSummary
                                seats={selectedSeats}
                                onRemoveSeat={(seatLabel) => dispatch(removeSelectedSeat(seatLabel))}
                            />
                        </div>
                    )}

                    {/* Seating Chart */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <SeatingChart eventId={eventId} />
                    </div>
                </div>
            )}

            {/* Recipient Information - Single recipient for all tickets */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recipient Information
                </h3>
                {isSeatedEvent && selectedSeats.length > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                        All {selectedSeats.length} selected seat(s) will be issued to this recipient.
                    </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={recipients[0]?.name || ''}
                            onChange={(e) => handleRecipientChange(0, 'name', e.target.value)}
                            placeholder="John Doe"
                            className={`w-full rounded-lg border ${
                                errors.recipientName ? 'border-red-500' : 'border-gray-300'
                            } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                        />
                        {errors.recipientName && (
                            <p className="mt-1 text-sm text-red-500">{errors.recipientName}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={recipients[0]?.email || ''}
                            onChange={(e) => handleRecipientChange(0, 'email', e.target.value)}
                            placeholder="john@example.com"
                            className={`w-full rounded-lg border ${
                                errors.recipientEmail ? 'border-red-500' : 'border-gray-300'
                            } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                        />
                        {errors.recipientEmail && (
                            <p className="mt-1 text-sm text-red-500">{errors.recipientEmail}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            value={recipients[0]?.phone || ''}
                            onChange={(e) => handleRecipientChange(0, 'phone', e.target.value)}
                            placeholder="+44 1234 567890"
                            className={`w-full rounded-lg border ${
                                errors.recipientPhone ? 'border-red-500' : 'border-gray-300'
                            } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                        />
                        {errors.recipientPhone && (
                            <p className="mt-1 text-sm text-red-500">{errors.recipientPhone}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Ticket Selection - Only for General Admission */}
            {!isSeatedEvent && (
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Ticket Selection
                    </h3>
                    {formData.ticketItems.map((item, index) => (
                        <div key={index} className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ticket Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={item.ticketTypeId}
                                    onChange={(e) => handleTicketItemChange(index, 'ticketTypeId', e.target.value)}
                                    className={`w-full rounded-lg border ${
                                        errors[`ticketItems.${index}.ticketTypeId`]
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                                >
                                    <option value="">Select ticket type</option>
                                    {ticketTypes.map((tt) => (
                                        <option key={tt.id} value={tt.id}>
                                            {tt.name} - {tt.price === 0 ? 'Free' : `£${(tt.price / 100).toFixed(2)}`}
                                        </option>
                                    ))}
                                </select>
                                {errors[`ticketItems.${index}.ticketTypeId`] && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors[`ticketItems.${index}.ticketTypeId`]}
                                    </p>
                                )}
                            </div>
                            <div className="w-32">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={item.quantity}
                                    onChange={(e) => handleTicketItemChange(index, 'quantity', e.target.value)}
                                    className={`w-full rounded-lg border ${
                                        errors[`ticketItems.${index}.quantity`]
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                    } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                                />
                                {errors[`ticketItems.${index}.quantity`] && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors[`ticketItems.${index}.quantity`]}
                                    </p>
                                )}
                            </div>
                            {formData.ticketItems.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTicketItem(index)}
                                    className="mt-7"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addTicketItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Another Ticket Type
                    </Button>
                </div>
            )}

            {/* Reason and Notes */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Issuance Details
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Issuance <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="reason"
                            value={formData.reason}
                            onChange={handleInputChange}
                            className={`w-full rounded-lg border ${
                                errors.reason ? 'border-red-500' : 'border-gray-300'
                            } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                        >
                            <option value="">Select a reason</option>
                            {REASON_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.reason && <p className="mt-1 text-sm text-red-500">{errors.reason}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="e.g., Platinum sponsor package, special guest invitation..."
                            rows={3}
                            className={`w-full rounded-lg border ${
                                errors.notes ? 'border-red-500' : 'border-gray-300'
                            } bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200`}
                        />
                        {errors.notes && <p className="mt-1 text-sm text-red-500">{errors.notes}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                            {formData.notes.length}/1000 characters
                        </p>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
                <Button type="submit" loading={loading} disabled={loading}>
                    Issue Complimentary Tickets
                </Button>
            </div>
        </form>
    );
}
