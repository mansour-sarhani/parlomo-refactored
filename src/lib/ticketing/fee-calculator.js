/**
 * Fee Calculator Utility
 * Calculates platform fees, taxes, and totals for ticket orders
 */

/**
 * Fee configuration
 * In production, these would come from database/settings
 */
const FEE_CONFIG = {
    serviceFee: {
        type: 'percent',
        amount: 5, // 5%
        cap: 1000, // Max £10 (in cents/pence)
        payer: 'buyer',
    },
    processingFee: {
        type: 'fixed',
        amount: 200, // £2.00 (in cents/pence)
        payer: 'buyer',
    },
    platformFee: {
        type: 'percent',
        amount: 3, // 3%
        payer: 'organizer',
    },
};

/**
 * Calculate service fee
 * @param {number} subtotal - Subtotal in cents/pence
 * @returns {number} Service fee in cents/pence
 */
function calculateServiceFee(subtotal) {
    const fee = Math.round(subtotal * (FEE_CONFIG.serviceFee.amount / 100));
    return Math.min(fee, FEE_CONFIG.serviceFee.cap);
}

/**
 * Calculate processing fee
 * @returns {number} Processing fee in cents/pence
 */
function calculateProcessingFee() {
    return FEE_CONFIG.processingFee.amount;
}

/**
 * Calculate platform fee (paid by organizer)
 * @param {number} subtotal - Subtotal in cents/pence
 * @returns {number} Platform fee in cents/pence
 */
function calculatePlatformFee(subtotal) {
    return Math.round(subtotal * (FEE_CONFIG.platformFee.amount / 100));
}

/**
 * Calculate all buyer fees
 * @param {number} subtotal - Order subtotal in cents/pence
 * @returns {Object} Fee breakdown
 */
export function calculateBuyerFees(subtotal) {
    const serviceFee = calculateServiceFee(subtotal);
    const processingFee = calculateProcessingFee();
    const totalFees = serviceFee + processingFee;

    return {
        serviceFee,
        processingFee,
        totalFees,
        breakdown: [
            {
                name: 'Service Fee',
                amount: serviceFee,
                description: `${FEE_CONFIG.serviceFee.amount}% (max £${(FEE_CONFIG.serviceFee.cap / 100).toFixed(2)})`,
            },
            {
                name: 'Processing Fee',
                amount: processingFee,
                description: 'Per order',
            },
        ],
    };
}

/**
 * Calculate organizer fees (deducted from revenue)
 * @param {number} subtotal - Order subtotal in cents/pence
 * @returns {Object} Fee breakdown
 */
export function calculateOrganizerFees(subtotal) {
    const platformFee = calculatePlatformFee(subtotal);

    return {
        platformFee,
        totalFees: platformFee,
        breakdown: [
            {
                name: 'Platform Fee',
                amount: platformFee,
                description: `${FEE_CONFIG.platformFee.amount}% of ticket price`,
            },
        ],
    };
}

/**
 * Calculate complete order totals
 * @param {Object} params - Calculation parameters
 * @param {number} params.subtotal - Order subtotal in cents/pence
 * @param {number} params.discount - Discount amount in cents/pence
 * @param {boolean} params.includeFees - Whether to include buyer fees
 * @returns {Object} Complete order breakdown
 */
export function calculateOrderTotal({ subtotal, discount = 0, includeFees = true }) {
    const discountedSubtotal = subtotal - discount;

    let fees = 0;
    let feeBreakdown = [];

    if (includeFees) {
        const buyerFees = calculateBuyerFees(discountedSubtotal);
        fees = buyerFees.totalFees;
        feeBreakdown = buyerFees.breakdown;
    }

    const total = discountedSubtotal + fees;

    return {
        subtotal,
        discount,
        discountedSubtotal,
        fees,
        feeBreakdown,
        total,
        currency: 'GBP',
    };
}

/**
 * Calculate organizer payout
 * @param {Object} params - Calculation parameters
 * @param {number} params.ticketRevenue - Total ticket revenue in cents/pence
 * @param {number} params.refunds - Total refunds in cents/pence
 * @returns {Object} Payout breakdown
 */
export function calculateOrganizerPayout({ ticketRevenue, refunds = 0 }) {
    const netRevenue = ticketRevenue - refunds;
    const organizerFees = calculateOrganizerFees(netRevenue);
    const payout = netRevenue - organizerFees.totalFees;

    return {
        ticketRevenue,
        refunds,
        netRevenue,
        platformFee: organizerFees.platformFee,
        payout,
        currency: 'GBP',
        breakdown: {
            gross: ticketRevenue,
            refunds: -refunds,
            platformFee: -organizerFees.platformFee,
            net: payout,
        },
    };
}

/**
 * Calculate tax (if applicable)
 * @param {number} amount - Amount to calculate tax on (in cents/pence)
 * @param {number} taxRate - Tax rate as percentage (e.g., 8.5 for 8.5%)
 * @returns {number} Tax amount in cents/pence
 */
export function calculateTax(amount, taxRate = 0) {
    if (taxRate <= 0) return 0;
    return Math.round(amount * (taxRate / 100));
}

/**
 * Format currency for display
 * @param {number} cents - Amount in cents/pence
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(cents, currency = 'GBP') {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
    }).format(dollars);
}

/**
 * Calculate percentage of total
 * @param {number} amount - Amount
 * @param {number} total - Total
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(amount, total) {
    if (total === 0) return 0;
    return (amount / total) * 100;
}

/**
 * Apply discount to amount
 * @param {Object} params - Discount parameters
 * @param {number} params.amount - Amount to discount
 * @param {string} params.discountType - 'percent' or 'fixed'
 * @param {number} params.discountValue - Discount value (percentage or cents/pence)
 * @returns {number} Discount amount in cents/pence
 */
export function applyDiscount({ amount, discountType, discountValue }) {
    if (discountType === 'percent') {
        return Math.round(amount * (discountValue / 100));
    } else if (discountType === 'fixed') {
        return Math.min(discountValue, amount); // Don't exceed amount
    }
    return 0;
}

/**
 * Get fee configuration (for display/settings)
 * @returns {Object} Current fee configuration
 */
export function getFeeConfig() {
    return {
        ...FEE_CONFIG,
        serviceFeeDisplay: `${FEE_CONFIG.serviceFee.amount}% (max ${formatCurrency(FEE_CONFIG.serviceFee.cap)})`,
        processingFeeDisplay: formatCurrency(FEE_CONFIG.processingFee.amount),
        platformFeeDisplay: `${FEE_CONFIG.platformFee.amount}%`,
    };
}
