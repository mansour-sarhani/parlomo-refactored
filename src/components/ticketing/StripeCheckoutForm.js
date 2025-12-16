'use client';

/**
 * Stripe Checkout Form Component
 * Handles Stripe payment integration with card element
 */

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';

// Initialize Stripe with public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

// Card element styling
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a',
        },
    },
    hidePostalCode: true,
};

/**
 * Inner payment form component that uses Stripe hooks
 */
function PaymentForm({ clientSecret, onSuccess, onError, processing, setProcessing, disabled, buyerInfo }) {
    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState(null);
    const [cardComplete, setCardComplete] = useState(false);

    const handleCardChange = (event) => {
        setCardError(event.error ? event.error.message : null);
        setCardComplete(event.complete);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setCardError(null);

        try {
            const cardElement = elements.getElement(CardElement);

            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${buyerInfo.firstName} ${buyerInfo.lastName}`,
                        email: buyerInfo.email,
                        phone: buyerInfo.phone || undefined,
                    },
                },
            });

            if (error) {
                setCardError(error.message);
                onError(error);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            } else if (paymentIntent.status === 'requires_action') {
                // 3D Secure authentication handled automatically by Stripe
                setCardError('Additional authentication required. Please complete the verification.');
            } else {
                setCardError(`Unexpected payment status: ${paymentIntent.status}`);
                onError(new Error(`Payment failed with status: ${paymentIntent.status}`));
            }
        } catch (err) {
            setCardError(err.message || 'An unexpected error occurred');
            onError(err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Details
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={handleCardChange}
                    />
                </div>
            </div>

            {cardError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{cardError}</p>
                </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Lock className="w-4 h-4" />
                <span>Your payment is secured with SSL encryption</span>
            </div>

            <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={!stripe || !cardComplete || processing || disabled}
                loading={processing}
                className="font-bold text-lg py-4"
                icon={!processing ? <Lock className="w-5 h-5" /> : null}
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </Button>
        </form>
    );
}

/**
 * Stripe Checkout Form wrapper with Elements provider
 */
export default function StripeCheckoutForm({
    clientSecret,
    onSuccess,
    onError,
    processing,
    setProcessing,
    disabled,
    buyerInfo,
}) {
    if (!clientSecret) {
        return (
            <div className="text-center py-4 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Preparing payment...</p>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe',
        },
    };

    return (
        <Elements stripe={stripePromise} options={options}>
            <PaymentForm
                clientSecret={clientSecret}
                onSuccess={onSuccess}
                onError={onError}
                processing={processing}
                setProcessing={setProcessing}
                disabled={disabled}
                buyerInfo={buyerInfo}
            />
        </Elements>
    );
}

/**
 * Payment method selector component
 */
export function PaymentMethodSelector({ selectedMethod, onMethodChange }) {
    const methods = [
        {
            id: 'stripe',
            name: 'Credit / Debit Card',
            icon: CreditCard,
            description: 'Pay securely with Stripe',
        },
    ];

    return (
        <div className="space-y-3">
            {methods.map((method) => (
                <label
                    key={method.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedMethod === method.id}
                        onChange={(e) => onMethodChange(e.target.value)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <method.icon className="w-6 h-6 ml-3 text-gray-600" />
                    <div className="ml-3">
                        <p className="font-medium text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                </label>
            ))}
        </div>
    );
}
