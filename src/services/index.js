/**
 * Services Index
 * Central export point for all service modules
 */

export { default as ticketingService } from './ticketing.service';
export { default as paymentService } from './payment.service';

// Re-export for convenience
import ticketingService from './ticketing.service';
import paymentService from './payment.service';

export default {
    ticketing: ticketingService,
    payment: paymentService,
};
