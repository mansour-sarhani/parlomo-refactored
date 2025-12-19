/**
 * Currency utility functions for formatting and parsing amounts
 * All amounts are stored in cents (integer) in the database
 */

/**
 * Format amount in cents to currency string
 * @param {number} amountInCents - Amount in cents
 * @param {string} currency - Currency code (GBP, USD, EUR)
 * @returns {string} Formatted currency string (e.g., "£6,250.00")
 */
export function formatCurrency(amountInCents, currency = 'GBP') {
    if (amountInCents === null || amountInCents === undefined) {
        return '-';
    }

    const amount = amountInCents / 100;

    const symbols = {
        GBP: '£',
        USD: '$',
        EUR: '€'
    };

    const symbol = symbols[currency] || currency;

    return `${symbol}${amount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

/**
 * Parse currency string to cents
 * @param {string} currencyString - Currency string (e.g., "50.00", "£50.00", or "-50.00")
 * @returns {number} Amount in cents
 */
export function parseCurrencyToCents(currencyString) {
    if (!currencyString && currencyString !== 0) {
        return 0;
    }

    // Convert to string in case a number is passed
    const str = String(currencyString);

    // Check if negative
    const isNegative = str.trim().startsWith('-');

    // Remove any non-numeric characters except decimal point
    const cleaned = str.replace(/[^0-9.]/g, '');
    const amount = parseFloat(cleaned);

    if (isNaN(amount)) {
        return 0;
    }

    const cents = Math.round(amount * 100);
    return isNegative ? -cents : cents;
}

/**
 * Format amount in cents with symbol
 * @param {number} amountInCents - Amount in cents
 * @param {string} currency - Currency code
 * @returns {object} Object with symbol and formatted amount
 */
export function getCurrencyParts(amountInCents, currency = 'GBP') {
    if (amountInCents === null || amountInCents === undefined) {
        return { symbol: '', amount: '-' };
    }

    const amount = amountInCents / 100;

    const symbols = {
        GBP: '£',
        USD: '$',
        EUR: '€'
    };

    const symbol = symbols[currency] || currency;
    const formattedAmount = amount.toLocaleString('en-GB', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return { symbol, amount: formattedAmount };
}
