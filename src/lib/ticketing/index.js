/**
 * Ticketing Utilities Index
 * Central export point for all ticketing utilities
 */

// QR Code utilities
export {
    generateQRPayload,
    verifyQRPayload,
    generateQRCodeDataURL,
    isValidQRFormat,
    extractTicketCode,
    isQRExpired,
} from './qr-generator';

// Fee calculation utilities
export {
    calculateBuyerFees,
    calculateOrganizerFees,
    calculateOrderTotal,
    calculateOrganizerPayout,
    calculateTax,
    formatCurrency,
    calculatePercentage,
    applyDiscount,
    getFeeConfig,
} from './fee-calculator';

// Promo code utilities
export {
    validatePromoCode,
    calculatePromoDiscount,
    getPromoDisplayInfo,
    isPromoExpiringSoon,
    isPromoRunningLow,
    validateMultiplePromoCodes,
    generatePromoCode,
    sanitizePromoCode,
} from './promo-validator';

// Ticket generation utilities
export {
    generateTicketCode,
    generateTicketCodes,
    generateTicketInstance,
    generateTicketInstances,
    generateTicketNumber,
    isValidTicketCode,
    parseTicketCode,
    generateBarcodeNumber,
    generateTicketMetadata,
    createTransferRecord,
    isValidTicketStatus,
    getTicketStatusDisplay,
    canTransferTicket,
    canRefundTicket,
} from './ticket-generator';
