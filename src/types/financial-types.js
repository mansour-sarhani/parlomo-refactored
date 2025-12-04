/**
 * @typedef {Object} SettlementRequest
 * @property {string} id - Unique identifier for the settlement request
 * @property {string} organizerId - ID of the organizer requesting settlement
 * @property {string} eventId - ID of the event for which settlement is requested
 * @property {number} amount - Amount requested for settlement
 * @property {'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'} status - Current status of the request
 * @property {string} requestedAt - ISO timestamp of when the request was made
 * @property {string} [processedAt] - ISO timestamp of when the request was processed (approved/rejected/paid)
 * @property {string} [adminNotes] - Optional notes added by admin
 */

/**
 * @typedef {Object} RefundRequest
 * @property {string} id - Unique identifier for the refund request
 * @property {string} organizerId - ID of the organizer requesting refund
 * @property {string} eventId - ID of the event for which refund is requested
 * @property {string} reason - Reason for the refund request
 * @property {'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'} status - Current status of the request
 * @property {'EVENT_CANCELLATION' | 'BULK_REFUND'} type - Type of refund request
 * @property {string} requestedAt - ISO timestamp of when the request was made
 * @property {string} [processedAt] - ISO timestamp of when the request was processed
 * @property {string} [adminNotes] - Optional notes added by admin
 */

export const FinancialStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAID: 'PAID',
  PROCESSED: 'PROCESSED'
};

export const RefundType = {
  EVENT_CANCELLATION: 'EVENT_CANCELLATION',
  BULK_REFUND: 'BULK_REFUND'
};
