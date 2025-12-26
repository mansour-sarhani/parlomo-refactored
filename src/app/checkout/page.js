'use client';

/**
 * Checkout Page
 * Handles payment and order completion
 * Uses checkout session data from API with Stripe integration
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart, useTicketing, usePromoCode } from '@/hooks/useTicketing';
import { FrontLayout } from '@/components/layout/FrontLayout';
import { Button } from '@/components/common/Button';
import { CreditCard, Lock, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import StripeCheckoutForm, { PaymentMethodSelector } from '@/components/ticketing/StripeCheckoutForm';
import ticketingService from '@/services/ticketing.service';

/**
 * Format seconds to MM:SS
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, cartCount, clearCart } = useCart();
    const { promoCode } = usePromoCode();
    const { completeCheckout, checkoutSession, loading, resetTicketing } = useTicketing();

    const [buyerInfo, setBuyerInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });

    const [processing, setProcessing] = useState(false);
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(null);

    // Payment states
    const [paymentMethod, setPaymentMethod] = useState('stripe');
    const [clientSecret, setClientSecret] = useState(null);
    const [paymentError, setPaymentError] = useState(null);
    const [paymentStep, setPaymentStep] = useState('info'); // 'info' | 'payment'

    // Calculate time remaining from expires_at
    const calculateTimeRemaining = useCallback(() => {
        if (!checkoutSession?.expiresAt) return 0;
        const expiresAt = new Date(checkoutSession.expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        return remaining;
    }, [checkoutSession?.expiresAt]);

    // Initialize and update countdown timer
    useEffect(() => {
        if (!checkoutSession?.expiresAt) return;

        // Set initial time
        setTimeRemaining(calculateTimeRemaining());

        // Update every second
        const interval = setInterval(() => {
            const remaining = calculateTimeRemaining();
            setTimeRemaining(remaining);

            // Session expired
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [checkoutSession?.expiresAt, calculateTimeRemaining]);

    // Redirect if no session or session expired
    useEffect(() => {
        if (!checkoutSession && !checkoutComplete) {
            router.push('/');
        } else if (timeRemaining === 0 && !checkoutComplete) {
            alert('Your checkout session has expired. Please try again.');
            resetTicketing();
            router.push('/');
        }
    }, [checkoutSession, timeRemaining, checkoutComplete, router, resetTicketing]);

    const handleInputChange = (e) => {
        setBuyerInfo({
            ...buyerInfo,
            [e.target.name]: e.target.value,
        });
    };

    // Validate buyer info before proceeding to payment
    const validateBuyerInfo = () => {
        return buyerInfo.firstName && buyerInfo.lastName && buyerInfo.email;
    };

    // Handle proceeding to payment step - creates payment intent
    const handleProceedToPayment = async (e) => {
        e.preventDefault();

        if (!validateBuyerInfo()) {
            setPaymentError('Please fill in all required fields');
            return;
        }

        setProcessing(true);
        setPaymentError(null);

        try {
            // Create payment intent with session ID
            const response = await ticketingService.createPaymentIntent(checkoutSession.sessionId);

            if (response.success && response.data.client_secret) {
                setClientSecret(response.data.client_secret);
                setPaymentStep('payment');
            } else if (!response.data.requires_payment) {
                // Free order - complete directly
                await handleFreeCheckout();
            } else {
                setPaymentError('Failed to initialize payment. Please try again.');
            }
        } catch (error) {
            console.error('Payment intent error:', error);
            setPaymentError(error.response?.data?.message || 'Failed to initialize payment. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Handle free checkout (no payment required)
    const handleFreeCheckout = async () => {
        try {
            const completeResult = await completeCheckout({
                sessionId: checkoutSession.sessionId,
                eventId: checkoutSession.eventId,
                userId: 1,
                cartItems: checkoutSession.cartItems,
                buyerInfo,
                subtotal: checkoutSession.subtotal,
                discount: checkoutSession.discount,
                fees: checkoutSession.fees,
                feeBreakdown: checkoutSession.feeBreakdown,
                total: checkoutSession.total,
                promoCode: checkoutSession.promoCode,
                promoCodeId: checkoutSession.promoCodeId,
                paymentIntentId: null,
                paymentMethod: 'free',
            });

            if (completeResult.payload?.order) {
                setCheckoutComplete(true);
                clearCart();
                router.push(`/order-confirmation/${completeResult.payload.order.id}`);
            }
        } catch (error) {
            console.error('Free checkout error:', error);
            setPaymentError('Checkout failed. Please try again.');
        }
    };

    // Handle successful Stripe payment
    const handlePaymentSuccess = async (paymentIntent) => {
        setProcessing(true);

        try {
            // Verify payment and complete order
            const verifyResult = await ticketingService.verifyPayment({
                sessionId: checkoutSession.sessionId,
                paymentIntentId: paymentIntent.id,
                buyerInfo,
            });

            if (verifyResult.success && verifyResult.data?.order) {
                setCheckoutComplete(true);
                clearCart();
                // Pass email as query param for guest order lookup
                const emailParam = encodeURIComponent(buyerInfo.email);
                router.push(`/order-confirmation/${verifyResult.data.order.id}?email=${emailParam}`);
            } else {
                setPaymentError(verifyResult.message || 'Order creation failed. Please contact support.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setPaymentError(
                error.response?.data?.message ||
                'Payment successful but order creation failed. Please contact support.'
            );
        } finally {
            setProcessing(false);
        }
    };

    // Handle Stripe payment error
    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        setPaymentError(error.message || 'Payment failed. Please try again.');
    };

    // Go back to info step
    const handleBackToInfo = () => {
        setPaymentStep('info');
        setClientSecret(null);
        setPaymentError(null);
    };

    // Show loading if no session yet
    if (!checkoutSession) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading checkout...</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    const isExpiringSoon = timeRemaining !== null && timeRemaining <= 60;

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

                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

                        {/* Countdown Timer */}
                        {timeRemaining !== null && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                isExpiringSoon
                                    ? 'bg-red-100 text-red-700 animate-pulse'
                                    : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {isExpiringSoon ? (
                                    <AlertTriangle className="w-5 h-5" />
                                ) : (
                                    <Clock className="w-5 h-5" />
                                )}
                                <span className="font-semibold">
                                    {formatTime(timeRemaining)}
                                </span>
                                <span className="text-sm">remaining</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            {/* Step indicator */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`flex items-center gap-2 ${paymentStep === 'info' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${paymentStep === 'info' ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</span>
                                    <span>Your Details</span>
                                </div>
                                <div className="flex-1 h-0.5 bg-gray-200" />
                                <div className={`flex items-center gap-2 ${paymentStep === 'payment' ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${paymentStep === 'payment' ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</span>
                                    <span>Payment</span>
                                </div>
                            </div>

                            {/* Error message */}
                            {paymentError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700">{paymentError}</p>
                                </div>
                            )}

                            {paymentStep === 'info' ? (
                                <form onSubmit={handleProceedToPayment} className="space-y-6">
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

                                    {/* Payment Method Selection */}
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Payment Method
                                        </h2>
                                        <PaymentMethodSelector
                                            selectedMethod={paymentMethod}
                                            onMethodChange={setPaymentMethod}
                                        />
                                    </div>

                                    {/* Continue to Payment */}
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        fullWidth
                                        size="lg"
                                        disabled={processing || loading || timeRemaining === 0}
                                        loading={processing || loading}
                                        className="font-bold text-lg py-4"
                                        icon={!processing && !loading ? <Lock className="w-5 h-5" /> : null}
                                    >
                                        {timeRemaining === 0 ? 'Session Expired' : 'Continue to Payment'}
                                    </Button>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    {/* Back button */}
                                    <button
                                        type="button"
                                        onClick={handleBackToInfo}
                                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to your details
                                    </button>

                                    {/* Buyer Info Summary */}
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <h2 className="text-lg font-bold text-gray-900 mb-3">
                                            Your Details
                                        </h2>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Name:</span> {buyerInfo.firstName} {buyerInfo.lastName}</p>
                                            <p><span className="font-medium">Email:</span> {buyerInfo.email}</p>
                                            {buyerInfo.phone && <p><span className="font-medium">Phone:</span> {buyerInfo.phone}</p>}
                                        </div>
                                    </div>

                                    {/* Stripe Payment Form */}
                                    <div className="bg-white rounded-xl shadow-md p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Card Payment
                                        </h2>
                                        <StripeCheckoutForm
                                            clientSecret={clientSecret}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            processing={processing}
                                            setProcessing={setProcessing}
                                            disabled={timeRemaining === 0}
                                            buyerInfo={buyerInfo}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Order Summary
                                </h2>

                                {/* Cart Items from Session */}
                                <div className="space-y-3 mb-4">
                                    {checkoutSession.cartItems?.map((item) => (
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
                                                £{(item.subtotal / 100).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-semibold">£{(checkoutSession.subtotal / 100).toFixed(2)}</span>
                                    </div>

                                    {/* Discount */}
                                    {checkoutSession.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Discount {checkoutSession.promoCode && `(${checkoutSession.promoCode})`}</span>
                                            <span className="font-semibold">-£{(checkoutSession.discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Service Charges (fee_breakdown) - Only show when buyer pays */}
                                    {checkoutSession.feePaidBy === 'buyer' && checkoutSession.feeBreakdown?.map((fee, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{fee.name}</span>
                                            <span className="font-semibold">£{(fee.amount / 100).toFixed(2)}</span>
                                        </div>
                                    ))}

                                    {/* Tax */}
                                    {checkoutSession.tax > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="font-semibold">£{(checkoutSession.tax / 100).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                                        <span className="font-bold text-gray-900">Total</span>
                                        <span className="font-bold text-2xl text-primary">
                                            £{(checkoutSession.total / 100).toFixed(2)}
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
