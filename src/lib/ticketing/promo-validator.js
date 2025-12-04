/**
 * Promo Code Validator Utility
 * Validates promo codes and calculates discounts
 */

/**
 * Validate promo code
 * @param {Object} promoCode - Promo code object from database
 * @param {Object} context - Validation context
 * @param {number} context.cartTotal - Cart total in cents
 * @param {number[]} context.ticketTypeIds - Ticket type IDs in cart
 * @param {number} context.userId - User ID (for per-user limits)
 * @param {number} context.userUseCount - Number of times user has used this promo
 * @returns {Object} Validation result
 */
export function validatePromoCode(promoCode, context) {
    const { cartTotal, ticketTypeIds = [], userId, userUseCount = 0 } = context;

    // Check if promo code exists
    if (!promoCode) {
        return {
            valid: false,
            error: 'Promo code not found',
            errorCode: 'NOT_FOUND',
        };
    }

    // Check if active
    if (!promoCode.active) {
        return {
            valid: false,
            error: 'This promo code is no longer active',
            errorCode: 'INACTIVE',
        };
    }

    // Check validity period
    const now = new Date();
    const validFrom = new Date(promoCode.validFrom);
    const validTo = new Date(promoCode.validTo);

    if (now < validFrom) {
        return {
            valid: false,
            error: `This promo code is not valid until ${validFrom.toLocaleDateString()}`,
            errorCode: 'NOT_YET_VALID',
            validFrom: validFrom.toISOString(),
        };
    }

    if (now > validTo) {
        return {
            valid: false,
            error: 'This promo code has expired',
            errorCode: 'EXPIRED',
            validTo: validTo.toISOString(),
        };
    }

    // Check max uses (global)
    if (promoCode.maxUses > 0 && promoCode.currentUses >= promoCode.maxUses) {
        return {
            valid: false,
            error: 'This promo code has reached its maximum number of uses',
            errorCode: 'MAX_USES_REACHED',
        };
    }

    // Check max uses per user
    if (promoCode.maxPerUser > 0 && userUseCount >= promoCode.maxPerUser) {
        return {
            valid: false,
            error: `You have already used this promo code ${promoCode.maxPerUser} time(s)`,
            errorCode: 'USER_LIMIT_REACHED',
        };
    }

    // Check minimum order value
    if (promoCode.minOrderValue > 0 && cartTotal < promoCode.minOrderValue) {
        const minAmount = (promoCode.minOrderValue / 100).toFixed(2);
        return {
            valid: false,
            error: `Minimum order value of $${minAmount} required`,
            errorCode: 'MIN_ORDER_NOT_MET',
            minOrderValue: promoCode.minOrderValue,
        };
    }

    // Check if promo applies to ticket types in cart
    if (promoCode.appliesToTicketTypeIds && promoCode.appliesToTicketTypeIds.length > 0) {
        const hasApplicableTicket = ticketTypeIds.some((id) =>
            promoCode.appliesToTicketTypeIds.includes(id)
        );

        if (!hasApplicableTicket) {
            return {
                valid: false,
                error: 'This promo code is not applicable to the selected tickets',
                errorCode: 'NOT_APPLICABLE',
            };
        }
    }

    // All checks passed
    return {
        valid: true,
        promoCode,
    };
}

/**
 * Calculate discount amount from promo code
 * @param {Object} promoCode - Promo code object
 * @param {number} cartTotal - Cart total in cents
 * @returns {number} Discount amount in cents
 */
export function calculatePromoDiscount(promoCode, cartTotal) {
    if (!promoCode) return 0;

    let discount = 0;

    if (promoCode.type === 'percent') {
        discount = Math.round(cartTotal * (promoCode.amount / 100));
    } else if (promoCode.type === 'fixed') {
        discount = promoCode.amount;
    }

    // Don't allow discount to exceed cart total
    return Math.min(discount, cartTotal);
}

/**
 * Get promo code display information
 * @param {Object} promoCode - Promo code object
 * @returns {Object} Display information
 */
export function getPromoDisplayInfo(promoCode) {
    if (!promoCode) return null;

    let discountDisplay = '';
    if (promoCode.type === 'percent') {
        discountDisplay = `${promoCode.amount}% off`;
    } else if (promoCode.type === 'fixed') {
        discountDisplay = `$${(promoCode.amount / 100).toFixed(2)} off`;
    }

    return {
        code: promoCode.code,
        discountDisplay,
        description: promoCode.metadata?.description || '',
        validUntil: new Date(promoCode.validTo).toLocaleDateString(),
        usesRemaining: promoCode.maxUses > 0 
            ? promoCode.maxUses - promoCode.currentUses 
            : null,
    };
}

/**
 * Check if promo code is about to expire
 * @param {Object} promoCode - Promo code object
 * @param {number} daysThreshold - Days before expiry to warn (default: 7)
 * @returns {boolean} True if expiring soon
 */
export function isPromoExpiringSoon(promoCode, daysThreshold = 7) {
    if (!promoCode) return false;

    const now = new Date();
    const validTo = new Date(promoCode.validTo);
    const daysUntilExpiry = (validTo - now) / (1000 * 60 * 60 * 24);

    return daysUntilExpiry > 0 && daysUntilExpiry <= daysThreshold;
}

/**
 * Check if promo code is running low on uses
 * @param {Object} promoCode - Promo code object
 * @param {number} threshold - Percentage threshold (default: 10%)
 * @returns {boolean} True if running low
 */
export function isPromoRunningLow(promoCode, threshold = 10) {
    if (!promoCode || promoCode.maxUses === 0) return false;

    const remaining = promoCode.maxUses - promoCode.currentUses;
    const percentageRemaining = (remaining / promoCode.maxUses) * 100;

    return percentageRemaining <= threshold && percentageRemaining > 0;
}

/**
 * Validate multiple promo codes (for stacking, if allowed)
 * @param {Object[]} promoCodes - Array of promo code objects
 * @param {Object} context - Validation context
 * @returns {Object} Combined validation result
 */
export function validateMultiplePromoCodes(promoCodes, context) {
    const results = promoCodes.map((promo) => validatePromoCode(promo, context));
    
    const allValid = results.every((result) => result.valid);
    const errors = results.filter((result) => !result.valid).map((result) => result.error);

    if (!allValid) {
        return {
            valid: false,
            errors,
        };
    }

    // Calculate combined discount
    let totalDiscount = 0;
    results.forEach((result, index) => {
        if (result.valid) {
            totalDiscount += calculatePromoDiscount(promoCodes[index], context.cartTotal);
        }
    });

    // Don't allow total discount to exceed cart total
    totalDiscount = Math.min(totalDiscount, context.cartTotal);

    return {
        valid: true,
        totalDiscount,
        appliedCodes: promoCodes.map((p) => p.code),
    };
}

/**
 * Generate promo code (for admin use)
 * @param {Object} options - Generation options
 * @param {number} options.length - Code length (default: 8)
 * @param {boolean} options.includeNumbers - Include numbers (default: true)
 * @param {string} options.prefix - Optional prefix
 * @returns {string} Generated promo code
 */
export function generatePromoCode(options = {}) {
    const { length = 8, includeNumbers = true, prefix = '' } = options;
    
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O to avoid confusion
    const numbers = '23456789'; // Exclude 0, 1 to avoid confusion
    const chars = includeNumbers ? letters + numbers : letters;
    
    let code = prefix;
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
}

/**
 * Sanitize promo code input
 * @param {string} code - User input
 * @returns {string} Sanitized code
 */
export function sanitizePromoCode(code) {
    if (!code) return '';
    
    return code
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9]/g, ''); // Remove special characters
}
