/**
 * @fileoverview Seed Ticketing Data
 * Populates MongoDB database with sample ticket types, promo codes, and fees
 * Run this script to initialize the ticketing system with test data
 */

import { connectDB } from './mongodb.js';
import {
    createTicketType,
    createPromoCode,
    createFee,
    createOrder,
    createOrderItem,
    createTicket,
    updateTicket,
    resetAllData,
    getStats,
} from './ticketing-db.js';
import { seedPublicEvents } from './seed-public-events-data.js';

/**
 * Generate unique ticket code
 * @returns {Promise<string>} Ticket code
 */
async function generateTicketCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TKT-';
    for (let i = 0; i < 9; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

/**
 * Generate QR payload (simplified for mock)
 * @param {string} ticketId - Ticket ID
 * @param {string} code - Ticket code
 * @returns {string} QR payload
 */
function generateQRPayload(ticketId, code) {
    // In production, this would be a signed JWT
    return JSON.stringify({
        ticketId,
        code,
        timestamp: Date.now(),
    });
}

/**
 * Seed ticket types for sample events
 * @param {Object} techEvent - Tech Conference Event
 * @param {Object} musicEvent - Music Festival Event
 * @param {Object} workshopEvent - Workshop Event
 * @returns {Promise<Object>} Map of created ticket types
 */
async function seedTicketTypes(techEvent, musicEvent, workshopEvent) {
    console.log('📝 Seeding ticket types...');

    const ticketTypes = {};

    // Event 1: Tech Conference (3 ticket types)
    ticketTypes.techEB = await createTicketType({
        eventId: techEvent.id,
        name: 'Early Bird',
        description: 'Limited early bird tickets with discounted pricing',
        // sku: 'TECH-CONF-EB', // Not in schema
        price: 9900, // £99.00
        currency: 'GBP',
        capacity: 100,
        // visible: true, // Not in schema, implied by active
        minPerOrder: 1,
        maxPerOrder: 5,
        // refundable: true, // Not in schema
        // transferAllowed: true, // Not in schema
        salesStart: new Date('2024-01-01'),
        salesEnd: new Date('2025-12-31'),
        // settings: {}, // Not in schema
    });

    ticketTypes.techGA = await createTicketType({
        eventId: techEvent.id,
        name: 'General Admission',
        description: 'Standard conference ticket with full access',
        price: 14900, // £149.00
        currency: 'GBP',
        capacity: 500,
        minPerOrder: 1,
        maxPerOrder: 10,
        salesStart: new Date('2024-01-01'),
        salesEnd: new Date('2025-12-31'),
    });

    ticketTypes.techVIP = await createTicketType({
        eventId: techEvent.id,
        name: 'VIP Pass',
        description: 'Premium access with exclusive networking sessions and swag',
        price: 29900, // £299.00
        currency: 'GBP',
        capacity: 50,
        minPerOrder: 1,
        maxPerOrder: 3,
        salesStart: new Date('2024-01-01'),
        salesEnd: new Date('2025-12-31'),
    });

    // Event 2: Music Festival (2 ticket types)
    ticketTypes.musicDay = await createTicketType({
        eventId: musicEvent.id,
        name: 'Single Day Pass',
        description: 'Access to one day of the festival',
        price: 7500, // £75.00
        currency: 'GBP',
        capacity: 1000,
        minPerOrder: 1,
        maxPerOrder: 8,
        salesStart: new Date('2024-01-01'),
        salesEnd: new Date('2025-12-31'),
    });

    ticketTypes.musicWeekend = await createTicketType({
        eventId: musicEvent.id,
        name: 'Weekend Pass',
        description: 'Full weekend access to all festival days',
        price: 12500, // £125.00
        currency: 'GBP',
        capacity: 800,
        minPerOrder: 1,
        maxPerOrder: 6,
        salesStart: new Date('2024-01-01'),
        salesEnd: new Date('2025-12-31'),
    });

    // Event 3: Workshop (1 ticket type)
    ticketTypes.workshop = await createTicketType({
        eventId: workshopEvent.id,
        name: 'Workshop Ticket',
        description: 'Hands-on workshop with materials included',
        price: 4900, // £49.00
        currency: 'GBP',
        capacity: 30,
        minPerOrder: 1,
        maxPerOrder: 2,
        salesStart: new Date('2024-01-01'),
        salesEnd: new Date('2025-12-31'),
    });

    console.log('✅ Ticket types seeded');
    return ticketTypes;
}

/**
 * Seed promo codes
 * @param {Object} techEvent - Tech Conference Event
 * @param {Object} musicEvent - Music Festival Event
 * @param {Object} ticketTypes - Created ticket types
 * @returns {Promise<Object>} Map of created promo codes
 */
async function seedPromoCodes(techEvent, musicEvent, ticketTypes) {
    console.log('📝 Seeding promo codes...');

    const promos = {};

    // Percentage discount
    promos.early2024 = await createPromoCode({
        eventId: musicEvent.id,
        code: 'EARLY2024',
        discountType: 'percentage',
        discountAmount: 20, // 20% off
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        maxUses: 100,
        maxUsesPerUser: 1,
        applicableTicketTypes: [], // All ticket types
        minPurchaseAmount: 5000, // £50 minimum
        description: 'Early bird 20% discount',
    });

    // Fixed amount discount
    promos.save10 = await createPromoCode({
        eventId: techEvent.id,
        code: 'SAVE10',
        discountType: 'fixed',
        discountAmount: 1000, // £10 off
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        maxUses: 0, // Unlimited
        maxUsesPerUser: 2,
        applicableTicketTypes: [],
        minPurchaseAmount: 3000, // £30 minimum
        description: '£10 off any order',
    });

    // VIP-only discount
    promos.vipOnly = await createPromoCode({
        eventId: techEvent.id,
        code: 'VIPONLY',
        discountType: 'percentage',
        discountAmount: 15, // 15% off
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        maxUses: 50,
        maxUsesPerUser: 1,
        applicableTicketTypes: [ticketTypes.techVIP.id], // Only VIP tickets
        minPurchaseAmount: 0,
        description: 'VIP exclusive discount',
    });

    // Expired promo (for testing)
    promos.expired = await createPromoCode({
        eventId: techEvent.id,
        code: 'EXPIRED',
        discountType: 'percentage',
        discountAmount: 50,
        validFrom: new Date('2023-01-01'),
        validUntil: new Date('2023-12-31'),
        maxUses: 100,
        maxUsesPerUser: 1,
        applicableTicketTypes: [],
        minPurchaseAmount: 0,
        description: 'Expired promo for testing',
    });

    console.log('✅ Promo codes seeded');
    return promos;
}

/**
 * Seed platform fees
 */
async function seedFees() {
    console.log('📝 Seeding fees...');

    // Service fee (percentage)
    await createFee({
        name: 'Service Fee',
        type: 'service',
        calculationType: 'percentage',
        amount: 5, // 5%
        appliesTo: 'subtotal',
        displayToCustomer: true,
        displayOrder: 1,
        description: 'Platform service fee',
    });

    // Processing fee (fixed per order)
    await createFee({
        name: 'Processing Fee',
        type: 'payment',
        calculationType: 'fixed',
        amount: 2, // £2.00 per order
        appliesTo: 'total',
        displayToCustomer: true,
        displayOrder: 2,
        description: 'Payment processing fee',
    });

    // Platform fee (percentage)
    await createFee({
        name: 'Platform Fee',
        type: 'platform',
        calculationType: 'percentage',
        amount: 3, // 3% of ticket price
        appliesTo: 'subtotal',
        displayToCustomer: false,
        displayOrder: 3,
        description: 'Platform commission',
    });

    console.log('✅ Fees seeded');
}

/**
 * Seed sample orders and tickets (for testing)
 * @param {Object} techEvent - Tech Conference Event
 * @param {Object} musicEvent - Music Festival Event
 * @param {Object} ticketTypes - Created ticket types
 * @param {Object} promos - Created promo codes
 */
async function seedSampleOrders(techEvent, musicEvent, ticketTypes, promos) {
    console.log('📝 Seeding sample orders...');

    // Sample Order 1: Tech Conference - 2 GA tickets
    const order1 = await createOrder({
        userId: 'user_mock_1', // Assuming user ID 1 exists
        eventId: techEvent.id,
        status: 'paid',
        subtotal: 29800, // 2 × £149
        discount: 0,
        fees: 1690, // Service fee (5% capped at £10) + Processing fee (£2)
        total: 31490,
        currency: 'GBP',
        promoCodeId: null,
        promoCode: null,
        paymentIntentId: 'pi_mock_123456',
        paymentMethod: 'card',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+1234567890',
        metadata: {},
    });

    // Create order items for order 1
    const orderItem1 = await createOrderItem({
        orderId: order1.id,
        ticketTypeId: ticketTypes.techGA.id,
        seatId: null,
        quantity: 2,
        unitPrice: 14900,
        discount: 0,
        subtotal: 29800,
        ticketTypeName: 'General Admission',
        metadata: {},
    });

    // Create tickets for order 1
    for (let i = 0; i < 2; i++) {
        const ticketCode = await generateTicketCode();
        const ticket = await createTicket({
            orderId: order1.id,
            // orderItemId: orderItem1.id, // Not in schema
            eventId: techEvent.id,
            ticketTypeId: ticketTypes.techGA.id,
            // seatId: null,
            code: ticketCode,
            qrCode: generateQRPayload(0, ticketCode), // ID will be assigned
            attendeeName: 'John Doe',
            attendeeEmail: 'john.doe@example.com',
            // transferHistory: null,
            metadata: {},
        });

        // Update QR payload with actual ticket ID
        const updatedQRPayload = generateQRPayload(ticket.id, ticketCode);
        await updateTicket(ticket.id, { qrCode: updatedQRPayload });
    }

    // Sample Order 2: Music Festival - 1 Weekend Pass with promo
    const order2 = await createOrder({
        userId: 'user_mock_2',
        eventId: musicEvent.id,
        status: 'paid',
        subtotal: 12500,
        discount: 2500, // 20% off with EARLY2024
        fees: 700, // Service fee (5% of discounted price) + Processing fee
        total: 10700,
        currency: 'GBP',
        promoCodeId: promos.early2024.id,
        promoCode: 'EARLY2024',
        paymentIntentId: 'pi_mock_789012',
        paymentMethod: 'card',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        customerPhone: '+1987654321',
        metadata: {},
    });

    await createOrderItem({
        orderId: order2.id,
        ticketTypeId: ticketTypes.musicWeekend.id,
        seatId: null,
        quantity: 1,
        unitPrice: 12500,
        discount: 2500,
        subtotal: 10000,
        ticketTypeName: 'Weekend Pass',
        metadata: {},
    });

    const ticketCode2 = await generateTicketCode();
    const ticket2 = await createTicket({
        orderId: order2.id,
        // orderItemId: 2,
        eventId: musicEvent.id,
        ticketTypeId: ticketTypes.musicWeekend.id,
        // seatId: null,
        code: ticketCode2,
        qrCode: generateQRPayload(0, ticketCode2),
        attendeeName: 'Jane Smith',
        attendeeEmail: 'jane.smith@example.com',
        // transferHistory: null,
        metadata: {},
    });

    const updatedQRPayload2 = generateQRPayload(ticket2.id, ticketCode2);
    await updateTicket(ticket2.id, { qrCode: updatedQRPayload2 });

    console.log('✅ Sample orders seeded');
}

/**
 * Main seed function
 * @returns {Promise<Object>} Database statistics after seeding
 */
export async function seedTicketingData() {
    console.log('🌱 Starting ticketing data seed...\n');

    await connectDB();

    // Reset existing ticketing data
    console.log('🗑️  Resetting existing ticketing data...');
    await resetAllData();
    console.log('✅ Ticketing data reset complete\n');

    // Seed public events first (this clears and reseeds public events)
    // We need events to link ticket types to
    const events = await seedPublicEvents();
    
    // Map events (assuming order from seed-public-events-data.js)
    // 0: Summer Music Festival
    // 1: Tech Innovation Summit
    // 2: Photography Masterclass
    const musicEvent = events[0];
    const techEvent = events[1];
    const workshopEvent = events[2];

    if (!musicEvent || !techEvent || !workshopEvent) {
        throw new Error('Failed to seed public events required for ticketing data');
    }

    // Seed all data
    const ticketTypes = await seedTicketTypes(techEvent, musicEvent, workshopEvent);
    const promos = await seedPromoCodes(techEvent, musicEvent, ticketTypes);
    await seedFees();
    await seedSampleOrders(techEvent, musicEvent, ticketTypes, promos);

    // Get stats
    const stats = await getStats();

    console.log('\n📊 Database Statistics:');
    console.log(stats);
    console.log('\n✅ Ticketing data seed complete!');

    return stats;
}

// Run seed if executed directly (for standalone script execution)
// Note: This check might need adjustment for ES modules in some environments
if (typeof window === 'undefined' && process.argv[1] && process.argv[1].endsWith('seed-ticketing-data.js')) {
    seedTicketingData().catch(console.error);
}
