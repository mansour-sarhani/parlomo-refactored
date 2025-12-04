'use client';

/**
 * Checkout Page
 * Handles payment and order completion
 * (Simplified version - full Stripe integration in next iteration)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, useTicketing, usePromoCode } from '@/hooks/useTicketing';
import { FrontLayout } from '@/components/layout/FrontLayout';
import { Button } from '@/components/common/Button';
import { CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartTotal, cartCount, clearCart } = useCart();
    const { promoCode, promoDiscount } = usePromoCode();
    const { startCheckout, completeCheckout, checkoutSession, loading, currentEventId } = useTicketing();

    const [buyerInfo, setBuyerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const [processing, setProcessing] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);

    useEffect(() => {
        // Redirect if cart is empty (but not after successful checkout)
        if (cartCount === 0 && !checkoutComplete) {
            router.push('/');
        }
    }, [cartCount, checkoutComplete]);

    const handleInputChange = (e) => {
        setBuyerInfo({
            ...buyerInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            // Start checkout to get session
            const cartItems = cart.map(item => ({
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
            }));

            const checkoutResult = await startCheckout(currentEventId, cartItems, promoCode);

            if (checkoutResult.payload?.session) {
                const session = checkoutResult.payload.session;

                // Complete checkout (mock payment for now)
                const completeResult = await completeCheckout({
                    sessionId: session.sessionId,
                    eventId: session.eventId,
                    userId: 1, // Mock user ID
                    cartItems: session.cartItems,
                    buyerInfo,
                    subtotal: session.subtotal,
                    discount: session.discount,
                    fees: session.fees,
                    total: session.total,
                    promoCode: session.promoCode,
                    promoCodeId: session.promoCodeId,
                    paymentIntentId: `pi_mock_${Date.now()}`,
                    paymentMethod: 'card',
                });

                if (completeResult.payload?.order) {
                    // Mark checkout as complete to prevent empty cart redirect
                    setCheckoutComplete(true);
                    // Clear cart and redirect to confirmation
                    clearCart();
                    router.push(`/order-confirmation/${completeResult.payload.order.id}`);
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const subtotal = cartTotal;
    const discount = promoDiscount;
    const estimatedFees = Math.round(subtotal * 0.05) + 200; // 5% + $2
    const total = subtotal - discount + estimatedFees;

    if (cartCount === 0) {
        return null; // Will redirect
    }

    return (
        <FrontLayout>
            <div className="bg-gray-50 min-h-screen py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header */}
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 mb-6 pl-0 hover:bg-transparent"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to tickets
                    </Button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Buyer Information */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                                        Contact Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={buyerInfo.firstName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={buyerInfo.lastName}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={buyerInfo.email}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={buyerInfo.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment (Mock) */}
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Payment
                                    </h2>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                                        <p className="font-medium mb-1">Demo Mode</p>
                                        <p>This is a demo checkout. No actual payment will be processed.</p>
                                    </div>
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    disabled={processing || loading}
                                    loading={processing || loading}
                                    className="font-bold text-lg py-4"
                                    icon={!processing && !loading ? <Lock className="w-5 h-5" /> : null}
                                >
                                    Complete Purchase
                                </Button>
                            </form>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Order Summary
                                </h2>

                                {/* Cart Items */}
                                <div className="space-y-3 mb-4">
                                    {cart.map((item) => (
                                        <div key={item.ticketTypeId} className="flex justify-between text-sm">
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {item.ticketTypeName}
                                                </div>
                                                <div className="text-gray-500">
                                                    Qty: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                ${(item.subtotal / 100).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount ({promoCode})</span>
                                            <span className="font-semibold">-${(discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Fees</span>
                                        <span className="font-semibold">${(estimatedFees / 100).toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-2xl text-primary">
                                            ${(total / 100).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
