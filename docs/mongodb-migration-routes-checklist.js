// Checklist of API routes to migrate to MongoDB
// Status: [x] = Completed, [ ] = Pending

const routesToMigrate = [
    // Public Events
    { path: 'src/app/api/public-events/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/public-events/[id]/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/public-events/slug/[slug]/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/public-events/[id]/stats/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/public-events/[id]/publish/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/public-events/[id]/unpublish/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/public-events/[id]/cancel/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/public-events/categories/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/events/[eventName]/route.js', status: '[x]', priority: 'High' }, // Public facing event page API

    // Ticketing - Core
    { path: 'src/app/api/ticketing/checkout/start/route.js', status: '[x]', priority: 'Critical' },
    { path: 'src/app/api/ticketing/checkout/complete/route.js', status: '[x]', priority: 'Critical' },
    { path: 'src/app/api/ticketing/orders/[orderId]/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/ticketing/orders/[orderId]/tickets/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/ticketing/promo/validate/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/ticketing/scanner/scan/route.js', status: '[x]', priority: 'High' },

    // Ticketing - Event Management
    { path: 'src/app/api/ticketing/events/[eventId]/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/ticketing/events/[eventId]/ticket-types/route.js', status: '[x]', priority: 'High' },
    { path: 'src/app/api/ticketing/events/[eventId]/promo-codes/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/ticketing/events/[eventId]/promo-codes/[codeId]/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/ticketing/events/[eventId]/attendees/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/ticketing/events/[eventId]/financials/route.js', status: '[x]', priority: 'Medium' },

    // Financials
    { path: 'src/app/api/financials/settlements/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/financials/settlements/[id]/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/financials/settlements/admin/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/financials/settlements/organizer/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/financials/refunds/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/financials/refunds/[id]/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/financials/refunds/admin/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/financials/refunds/organizer/route.js', status: '[x]', priority: 'Low' },

    // Seeding & Testing
    { path: 'src/app/api/seed-ticketing/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/seed-public-events/route.js', status: '[x]', priority: 'Medium' },
    { path: 'src/app/api/reset-public-events/route.js', status: '[x]', priority: 'Low' },
    { path: 'src/app/api/test-ticketing/tickets/route.js', status: '[x]', priority: 'Low' },
];

module.exports = routesToMigrate;
