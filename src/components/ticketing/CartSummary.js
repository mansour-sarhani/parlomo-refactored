'use client';

/**
 * Cart Summary Component
 * Displays cart contents, promo code input, and checkout button
 */

import { useState, useMemo } from 'react';
import { useCart, usePromoCode, useSeating } from '@/hooks/useTicketing';
import { Button } from '@/components/common/Button';
import { ShoppingCart, Trash2, Tag, X, Loader2, CheckCircle, Armchair } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Calculate fees based on service charges and tax rate
 * @param {Array} serviceCharges - Array of service charge objects
 * @param {number|string} taxRate - Tax rate percentage
 * @param {number} subtotal - Cart subtotal in cents
 * @param {number} ticketCount - Total number of tickets in cart
 * @returns {Object} { fees: Array, totalFees: number, tax: number }
 */
function calculateFees(serviceCharges = [], taxRate = 0, subtotal, ticketCount) {
    const fees = [];
    let totalFees = 0;

    // Calculate service charges
    serviceCharges.forEach((charge) => {
        let feeAmount = 0;

        if (charge.type === 'per_ticket') {
            if (charge.amountType === 'fixed_price') {
                // Fixed amount per ticket (amount is in pounds, convert to cents)
                feeAmount = Math.round(charge.amount * 100 * ticketCount);
            } else if (charge.amountType === 'percentage') {
                // Percentage of subtotal per ticket
                feeAmount = Math.round((charge.amount / 100) * subtotal);
            }
        } else if (charge.type === 'per_cart') {
            if (charge.amountType === 'fixed_price') {
                // Fixed amount per cart (amount is in pounds, convert to cents)
                feeAmount = Math.round(charge.amount * 100);
            } else if (charge.amountType === 'percentage') {
                // Percentage of subtotal per cart
                feeAmount = Math.round((charge.amount / 100) * subtotal);
            }
        }

        if (feeAmount > 0) {
            fees.push({
                id: charge._id || charge.id,
                title: charge.title,
                amount: feeAmount,
            });
            totalFees += feeAmount;
        }
    });

    // Calculate tax
    const taxRateNum = parseFloat(taxRate) || 0;
    const tax = taxRateNum > 0 ? Math.round((taxRateNum / 100) * subtotal) : 0;

    return { fees, totalFees, tax };
}

export default function CartSummary({ onCheckout, serviceCharges = [], taxRate = 0, checkoutLoading = false }) {
    const { cart, cartTotal, cartCount, removeFromCart, clearCart } = useCart();
    const {
        promoCode,
        promoDiscount,
        promoError,
        hasPromo,
        setPromoCode,
        clearPromoCode,
        validatePromoCode
    } = usePromoCode();
    const {
        selectedSeats,
        isSeatedEvent,
        selectedSeatsCount,
        selectedSeatsTotal,
        removeSelectedSeat,
        clearSelectedSeats,
    } = useSeating();

    const [promoInput, setPromoInput] = useState('');
    const [validating, setValidating] = useState(false);
    const [promoMessage, setPromoMessage] = useState('');

    // Determine if we're showing seats or regular cart
    const isShowingSeats = isSeatedEvent && selectedSeats.length > 0;
    const displayCount = isShowingSeats ? selectedSeatsCount : cartCount;
    const isEmpty = isShowingSeats ? selectedSeats.length === 0 : cart.length === 0;

    const handleApplyPromo = async () => {
        if (!promoInput.trim()) return;

        setValidating(true);
        const ticketTypeIds = cart.map(item => item.ticketTypeId);

        setPromoCode(promoInput.toUpperCase());
        const result = await validatePromoCode(promoInput.toUpperCase(), ticketTypeIds);
        setValidating(false);

        // Show success notification if promo was applied
        if (result.payload && result.payload.valid) {
            const discount = result.payload.promo.discount || 0;
            if (discount > 0) {
                toast.success(`Promo code applied! You saved £${(discount / 100).toFixed(2)}`);
            } else {
                toast.success('Promo code applied successfully!');
            }
            setPromoMessage(result.payload.message || 'Promo code applied');
        }
    };

    const handleRemovePromo = () => {
        clearPromoCode();
        setPromoInput('');
        setPromoMessage('');
        toast.info('Promo code removed');
    };

    const handleClear = () => {
        if (isShowingSeats) {
            clearSelectedSeats();
        } else {
            clearCart();
        }
    };

    // Calculate subtotal based on whether showing seats or cart
    // Note: selectedSeatsTotal is in currency units (e.g., pounds), cartTotal is in cents
    const subtotal = isShowingSeats ? (selectedSeatsTotal * 100) : cartTotal;
    const discount = promoDiscount;

    // Calculate the discounted subtotal (subtotal after promo discount)
    const discountedSubtotal = Math.max(0, subtotal - discount);

    // Calculate fees based on service charges and tax rate using DISCOUNTED subtotal
    const { fees, totalFees, tax } = useMemo(
        () => calculateFees(serviceCharges, taxRate, discountedSubtotal, displayCount),
        [serviceCharges, taxRate, discountedSubtotal, displayCount]
    );

    const total = discountedSubtotal + totalFees + tax;

    if (isEmpty) {
        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Your cart is empty
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Add tickets to get started
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isShowingSeats ? (
                            <Armchair className="w-5 h-5" />
                        ) : (
                            <ShoppingCart className="w-5 h-5" />
                        )}
                        <h3 className="font-bold text-lg">
                            {isShowingSeats ? 'Your Seats' : 'Your Cart'}
                        </h3>
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                        {displayCount} {displayCount === 1 ? (isShowingSeats ? 'seat' : 'ticket') : (isShowingSeats ? 'seats' : 'tickets')}
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Cart/Seats Items */}
                <div className="space-y-3">
                    {isShowingSeats ? (
                        // Render selected seats grouped by ticket type
                        Object.entries(
                            selectedSeats.reduce((groups, seat) => {
                                const key = seat.ticketTypeName || seat.category;
                                if (!groups[key]) {
                                    groups[key] = { seats: [], price: seat.price };
                                }
                                groups[key].seats.push(seat);
                                return groups;
                            }, {})
                        ).map(([typeName, group]) => (
                            <div
                                key={typeName}
                                className="p-3 bg-gray-50 rounded-lg"
                            >
                                <h4 className="font-semibold text-gray-900 text-sm mb-2">
                                    {typeName} ({group.seats.length})
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                    {group.seats.map(seat => (
                                        <div key={seat.label} className="flex justify-between items-center">
                                            <span>{seat.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span>£{seat.price?.toFixed(2)}</span>
                                                <button
                                                    onClick={() => removeSelectedSeat(seat.label)}
                                                    className="p-0.5 text-gray-400 hover:text-red-500 rounded"
                                                    aria-label={`Remove seat ${seat.label}`}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Render regular cart items
                        cart.map((item) => (
                            <div
                                key={item.ticketTypeId}
                                className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                        {item.ticketTypeName}
                                    </h4>
                                    <div className="text-xs text-gray-600">
                                        {item.quantity} × £{(item.unitPrice / 100).toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">
                                        £{(item.subtotal / 100).toFixed(2)}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromCart(item.ticketTypeId)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-auto px-2 py-1 text-xs mt-1 gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Promo Code */}
                <div className="border-t border-gray-200 pt-4">
                    {!hasPromo ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Promo Code
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoInput}
                                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                                    placeholder="Enter code"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                                    disabled={validating}
                                />
                                <Button
                                    onClick={handleApplyPromo}
                                    disabled={!promoInput.trim() || validating}
                                    loading={validating}
                                    className="bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    Apply
                                </Button>
                            </div>
                            {promoError && (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                    <X className="w-3 h-3" />
                                    {promoError}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="font-semibold text-sm">{promoCode}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemovePromo}
                                    className="text-green-600 hover:text-green-800 hover:bg-green-100 p-1 h-auto"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            {promoMessage && (
                                <p className="text-xs text-green-600 ml-6">{promoMessage}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-gray-900">
                            £{(subtotal / 100).toFixed(2)}
                        </span>
                    </div>

                    {hasPromo && discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600">Discount</span>
                            <span className="font-semibold text-green-600">
                                -£{(discount / 100).toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Service Charges */}
                    {fees.map((fee) => (
                        <div key={fee.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{fee.title}</span>
                            <span className="font-semibold text-gray-900">
                                £{(fee.amount / 100).toFixed(2)}
                            </span>
                        </div>
                    ))}

                    {/* Tax */}
                    {tax > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax ({taxRate}%)</span>
                            <span className="font-semibold text-gray-900">
                                £{(tax / 100).toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-2xl text-primary">
                            £{(total / 100).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                    <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={onCheckout}
                        disabled={checkoutLoading}
                        loading={checkoutLoading}
                        className="font-bold shadow-md hover:shadow-lg"
                    >
                        {checkoutLoading ? 'Starting Checkout...' : 'Proceed to Checkout'}
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        size="sm"
                        onClick={handleClear}
                        className="text-gray-600 hover:text-gray-800"
                    >
                        {isShowingSeats ? 'Clear Selection' : 'Clear Cart'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
