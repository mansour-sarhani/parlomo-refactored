'use client';

/**
 * CurrencyDisplay Component
 *
 * Formats and displays currency amounts (amounts are stored in cents)
 *
 * @param {Object} props
 * @param {number} props.amount - Amount in cents
 * @param {string} props.currency - Currency code (GBP, USD, EUR)
 * @param {string} props.className - Additional CSS classes
 */
export const CurrencyDisplay = ({ amount, currency = 'GBP', className = '' }) => {
    if (amount === null || amount === undefined) {
        return <span className={className}>-</span>;
    }

    const amountInDecimal = amount / 100;

    const symbols = {
        GBP: '£',
        USD: '$',
        EUR: '€'
    };

    const symbol = symbols[currency] || currency;

    const formatted = amountInDecimal.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return (
        <span className={className}>
            {symbol}{formatted}
        </span>
    );
};
