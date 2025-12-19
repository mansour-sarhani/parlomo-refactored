'use client';

import { Input } from '@/components/common/Input';
import { CreditCard, CheckCircle } from 'lucide-react';

/**
 * PaymentDetailsForm Component
 *
 * Dynamic form for collecting payment details based on selected payment method
 *
 * @param {Object} props
 * @param {string} props.paymentMethod - Selected payment method (bank_transfer, paypal, stripe)
 * @param {Object} props.paymentDetails - Current payment details object
 * @param {function} props.onChange - Handler for payment details changes
 * @param {Object} props.errors - Validation errors object
 */
export const PaymentDetailsForm = ({
    paymentMethod,
    paymentDetails = {},
    onChange,
    errors = {}
}) => {
    const handleChange = (field, value) => {
        onChange({
            ...paymentDetails,
            [field]: value
        });
    };

    // Bank Transfer Fields
    if (paymentMethod === 'bank_transfer') {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Bank Account Details</h4>

                <Input
                    label="Account Holder Name"
                    value={paymentDetails.account_name || ''}
                    onChange={(e) => handleChange('account_name', e.target.value)}
                    placeholder="John Doe"
                    error={errors.account_name}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Account Number"
                        value={paymentDetails.account_number || ''}
                        onChange={(e) => handleChange('account_number', e.target.value)}
                        placeholder="12345678"
                        error={errors.account_number}
                        required
                    />

                    <Input
                        label="Sort Code"
                        value={paymentDetails.routing_number || ''}
                        onChange={(e) => handleChange('routing_number', e.target.value)}
                        placeholder="12-34-56"
                        error={errors.routing_number}
                        required
                    />
                </div>

                <Input
                    label="Bank Name"
                    value={paymentDetails.bank_name || ''}
                    onChange={(e) => handleChange('bank_name', e.target.value)}
                    placeholder="e.g., Barclays, HSBC, Lloyds"
                    error={errors.bank_name}
                    required
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        Your bank details will be securely stored and used for payment processing.
                        Ensure all information is accurate to avoid delays.
                    </p>
                </div>
            </div>
        );
    }

    // PayPal Fields
    if (paymentMethod === 'paypal') {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">PayPal Details</h4>

                <Input
                    label="PayPal Email Address"
                    type="email"
                    value={paymentDetails.paypal_email || ''}
                    onChange={(e) => handleChange('paypal_email', e.target.value)}
                    placeholder="your@email.com"
                    error={errors.paypal_email}
                    required
                />

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-800">
                        Payment will be sent to this PayPal account. Make sure the email is linked
                        to an active PayPal account.
                    </p>
                </div>
            </div>
        );
    }

    // Stripe - Requires bank account details for payout
    if (paymentMethod === 'stripe') {
        return (
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700">Stripe Payout - Bank Account Details</h4>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <CreditCard className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-purple-800">
                                Stripe Connect Payout
                            </p>
                            <p className="text-sm text-purple-700 mt-1">
                                Please provide your bank account details for Stripe to process the payout.
                                Funds typically arrive within 1-3 business days.
                            </p>
                        </div>
                    </div>
                </div>

                <Input
                    label="Account Holder Name"
                    value={paymentDetails.account_name || ''}
                    onChange={(e) => handleChange('account_name', e.target.value)}
                    placeholder="John Doe"
                    error={errors.account_name}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Account Number"
                        value={paymentDetails.account_number || ''}
                        onChange={(e) => handleChange('account_number', e.target.value)}
                        placeholder="12345678"
                        error={errors.account_number}
                        required
                    />

                    <Input
                        label="Sort Code / Routing Number"
                        value={paymentDetails.routing_number || ''}
                        onChange={(e) => handleChange('routing_number', e.target.value)}
                        placeholder="12-34-56"
                        error={errors.routing_number}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Bank Name"
                        value={paymentDetails.bank_name || ''}
                        onChange={(e) => handleChange('bank_name', e.target.value)}
                        placeholder="e.g., Barclays, HSBC"
                        error={errors.bank_name}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={paymentDetails.country || 'GB'}
                            onChange={(e) => handleChange('country', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                errors.country ? 'border-red-300' : 'border-gray-300'
                            }`}
                        >
                            <option value="GB">United Kingdom (GB)</option>
                            <option value="US">United States (US)</option>
                            <option value="DE">Germany (DE)</option>
                            <option value="FR">France (FR)</option>
                            <option value="ES">Spain (ES)</option>
                            <option value="IT">Italy (IT)</option>
                            <option value="NL">Netherlands (NL)</option>
                            <option value="IE">Ireland (IE)</option>
                            <option value="AU">Australia (AU)</option>
                            <option value="CA">Canada (CA)</option>
                        </select>
                        {errors.country && (
                            <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                        )}
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                        Your bank details will be securely processed through Stripe.
                        Ensure all information matches your bank account exactly.
                    </p>
                </div>
            </div>
        );
    }

    // Default / Unknown method
    return (
        <div className="text-center py-8 text-gray-500">
            <p>Please select a payment method</p>
        </div>
    );
};

/**
 * Validates payment details based on payment method
 * @param {string} paymentMethod - Selected payment method
 * @param {Object} paymentDetails - Payment details to validate
 * @returns {Object} Validation errors object (empty if valid)
 */
export const validatePaymentDetails = (paymentMethod, paymentDetails) => {
    const errors = {};

    if (paymentMethod === 'bank_transfer') {
        if (!paymentDetails.account_name?.trim()) {
            errors.account_name = 'Account holder name is required';
        }
        if (!paymentDetails.account_number?.trim()) {
            errors.account_number = 'Account number is required';
        } else if (!/^\d{6,8}$/.test(paymentDetails.account_number.replace(/\s/g, ''))) {
            errors.account_number = 'Invalid account number format';
        }
        if (!paymentDetails.routing_number?.trim()) {
            errors.routing_number = 'Sort code is required';
        } else if (!/^\d{2}-?\d{2}-?\d{2}$/.test(paymentDetails.routing_number.replace(/\s/g, ''))) {
            errors.routing_number = 'Invalid sort code format (e.g., 12-34-56)';
        }
        if (!paymentDetails.bank_name?.trim()) {
            errors.bank_name = 'Bank name is required';
        }
    }

    if (paymentMethod === 'paypal') {
        if (!paymentDetails.paypal_email?.trim()) {
            errors.paypal_email = 'PayPal email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentDetails.paypal_email)) {
            errors.paypal_email = 'Invalid email format';
        }
    }

    if (paymentMethod === 'stripe') {
        if (!paymentDetails.account_name?.trim()) {
            errors.account_name = 'Account holder name is required';
        }
        if (!paymentDetails.account_number?.trim()) {
            errors.account_number = 'Account number is required';
        }
        if (!paymentDetails.routing_number?.trim()) {
            errors.routing_number = 'Sort code / routing number is required';
        }
        if (!paymentDetails.bank_name?.trim()) {
            errors.bank_name = 'Bank name is required';
        }
        if (!paymentDetails.country?.trim()) {
            errors.country = 'Country is required';
        }
    }

    return errors;
};
