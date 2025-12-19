'use client';

import { Building, CreditCard, Wallet } from 'lucide-react';

/**
 * PaymentMethodBadge Component
 *
 * Displays payment method with icon and appropriate styling
 *
 * @param {Object} props
 * @param {string} props.method - Payment method (bank_transfer, paypal, stripe)
 * @param {string} props.className - Additional CSS classes
 */
export const PaymentMethodBadge = ({ method, className = '' }) => {
    const config = {
        bank_transfer: {
            icon: Building,
            label: 'Bank Transfer',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-700'
        },
        paypal: {
            icon: Wallet,
            label: 'PayPal',
            bgColor: 'bg-indigo-100',
            textColor: 'text-indigo-700'
        },
        stripe: {
            icon: CreditCard,
            label: 'Stripe',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-700'
        }
    };

    const { icon: Icon, label, bgColor, textColor } = config[method] || config.bank_transfer;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};
