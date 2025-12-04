/**
 * @fileoverview Mock Public Events Database
 * JSON file-based mock database for public events system
 * Provides CRUD operations with persistence to JSON files
 */

import fs from 'fs';
import path from 'path';
import { generateSlug } from '@/types/public-events-types';

// Path to mock data directory
const MOCK_DATA_DIR = path.join(process.cwd(), 'public', 'mock-data', 'public-events');

// Ensure directory exists
if (!fs.existsSync(MOCK_DATA_DIR)) {
    fs.mkdirSync(MOCK_DATA_DIR, { recursive: true });
}

/**
 * Read data from JSON file
 * @param {string} filename - Name of the JSON file
 * @returns {Object} Parsed JSON data
 */
function readData(filename) {
    const filePath = path.join(MOCK_DATA_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return {};
    }

    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return {};
    }
}

/**
 * Write data to JSON file
 * @param {string} filename - Name of the JSON file
 * @param {Object} data - Data to write
 */
function writeData(filename, data) {
    const filePath = path.join(MOCK_DATA_DIR, filename);

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
    }
}

/**
 * Generate next ID for a collection
 * @param {Object} collection - Collection object
 * @returns {number} Next available ID
 */
function getNextId(collection) {
    const ids = Object.keys(collection).map(Number);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

/**
 * Ensure slug uniqueness
 * @param {string} slug - Base slug
 * @param {number|null} excludeId - ID to exclude from uniqueness check
 * @returns {string} Unique slug
 */
function ensureUniqueSlug(slug, excludeId = null) {
    const events = getAllPublicEvents();
    const existingSlugs = Object.values(events)
        .filter(event => event.id !== excludeId)
        .map(event => event.slug);

    let uniqueSlug = slug;
    let counter = 1;

    while (existingSlugs.includes(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
}

// ==================== PUBLIC EVENTS ====================

/**
 * Get all public events
 * @returns {Object} Events indexed by ID
 */
export function getAllPublicEvents() {
    return readData('events.json');
}

/**
 * Get public event by ID
 * @param {number} id - Event ID
 * @returns {Object|null} Event or null
 */
export function getPublicEvent(id) {
    const events = getAllPublicEvents();
    return events[id] || null;
}

/**
 * Get public event by slug
 * @param {string} slug - Event slug
 * @returns {Object|null} Event or null
 */
export function getPublicEventBySlug(slug) {
    const events = getAllPublicEvents();
    return Object.values(events).find(event => event.slug === slug) || null;
}

/**
 * Get events by organizer ID
 * @param {number} organizerId - Organizer user ID
 * @returns {Array} Array of events
 */
export function getEventsByOrganizer(organizerId) {
    const events = getAllPublicEvents();
    return Object.values(events).filter(event => event.organizerId === organizerId);
}

/**
 * Get events by status
 * @param {string} status - Event status
 * @returns {Array} Array of events
 */
export function getEventsByStatus(status) {
    const events = getAllPublicEvents();
    return Object.values(events).filter(event => event.status === status);
}

/**
 * Get events by category
 * @param {string} category - Event category
 * @returns {Array} Array of events
 */
export function getEventsByCategory(category) {
    const events = getAllPublicEvents();
    return Object.values(events).filter(event => event.category === category);
}

/**
 * Query events with filters
 * @param {Object} filters - Query filters
 * @returns {Object} Paginated results with events and metadata
 */
export function queryPublicEvents(filters = {}) {
    const {
        organizerId = null,
        status = null,
        category = null,
        isPublic = null,
        search = null,
        startDateFrom = null,
        startDateTo = null,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = filters;

    let events = Object.values(getAllPublicEvents());

    // Apply filters
    if (organizerId !== null) {
        events = events.filter(event => event.organizerId === organizerId);
    }

    if (status !== null) {
        events = events.filter(event => event.status === status);
    }

    if (category !== null) {
        events = events.filter(event => event.category === category);
    }

    if (isPublic !== null) {
        events = events.filter(event => event.isPublic === isPublic);
    }

    if (search) {
        const searchLower = search.toLowerCase();
        events = events.filter(event =>
            event.title.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            event.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }

    if (startDateFrom) {
        events = events.filter(event => new Date(event.startDate) >= new Date(startDateFrom));
    }

    if (startDateTo) {
        events = events.filter(event => new Date(event.startDate) <= new Date(startDateTo));
    }

    // Sort
    events.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        // Handle date sorting
        if (sortBy === 'startDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
        }

        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    // Paginate
    const total = events.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedEvents = events.slice(offset, offset + limit);

    return {
        events: paginatedEvents,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Create new public event
 * @param {Object} eventData - Event data
 * @returns {Object} Created event
 */
export function createPublicEvent(eventData) {
    const events = getAllPublicEvents();
    const id = getNextId(events);

    // Generate slug from title
    const baseSlug = generateSlug(eventData.title);
    const slug = ensureUniqueSlug(baseSlug);

    const newEvent = {
        id,
        slug,
        status: 'draft',
        isPublic: true,
        isOnline: false,
        enableWaitlist: false,
        tags: [],
        galleryImages: [],
        taxInclusive: false,
        taxRate: 0,
        metadata: {},
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    events[id] = newEvent;
    writeData('events.json', events);

    return newEvent;
}

/**
 * Update public event
 * @param {number} id - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Object|null} Updated event or null
 */
export function updatePublicEvent(id, updates) {
    const events = getAllPublicEvents();

    if (!events[id]) {
        return null;
    }

    // If title is being updated, regenerate slug
    if (updates.title && updates.title !== events[id].title) {
        const baseSlug = generateSlug(updates.title);
        updates.slug = ensureUniqueSlug(baseSlug, id);
    }

    events[id] = {
        ...events[id],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    writeData('events.json', events);
    return events[id];
}

/**
 * Delete public event (soft delete by setting status to cancelled)
 * @param {number} id - Event ID
 * @returns {boolean} Success status
 */
export function deletePublicEvent(id) {
    const events = getAllPublicEvents();

    if (!events[id]) {
        return false;
    }

    // Soft delete by setting status to cancelled
    events[id].status = 'cancelled';
    events[id].updatedAt = new Date().toISOString();

    writeData('events.json', events);
    return true;
}

/**
 * Hard delete public event (permanently remove)
 * @param {number} id - Event ID
 * @returns {boolean} Success status
 */
export function hardDeletePublicEvent(id) {
    const events = getAllPublicEvents();

    if (!events[id]) {
        return false;
    }

    delete events[id];
    writeData('events.json', events);
    return true;
}

/**
 * Publish event (change status to published)
 * @param {number} id - Event ID
 * @returns {Object|null} Updated event or null
 */
export function publishEvent(id) {
    return updatePublicEvent(id, {
        status: 'published',
        isPublic: true,
    });
}

/**
 * Unpublish event (change status to draft)
 * @param {number} id - Event ID
 * @returns {Object|null} Updated event or null
 */
export function unpublishEvent(id) {
    return updatePublicEvent(id, {
        status: 'draft',
        isPublic: false,
    });
}

/**
 * Cancel event
 * @param {number} id - Event ID
 * @returns {Object|null} Updated event or null
 */
export function cancelEvent(id) {
    return updatePublicEvent(id, { status: 'cancelled' });
}

/**
 * Mark event as completed
 * @param {number} id - Event ID
 * @returns {Object|null} Updated event or null
 */
export function completeEvent(id) {
    return updatePublicEvent(id, { status: 'completed' });
}

// ==================== EVENT CATEGORIES ====================

/**
 * Get all event categories
 * @returns {Array} Array of categories
 */
export function getEventCategories() {
    const categoriesData = readData('categories.json');
    return categoriesData.categories || [];
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Object|null} Category or null
 */
export function getCategoryBySlug(slug) {
    const categories = getEventCategories();
    return categories.find(cat => cat.slug === slug) || null;
}

// ==================== EVENT STATISTICS ====================

/**
 * Get event statistics
 * @param {number} eventId - Event ID
 * @returns {Object} Event statistics
 */
export function getEventStats(eventId) {
    // Import ticketing database functions
    const ticketingDb = require('./mock-ticketing-db');

    const event = getPublicEvent(eventId);
    if (!event) {
        return null;
    }

    // Get all orders for this event
    const orders = ticketingDb.getOrdersByEvent(eventId);
    const paidOrders = orders.filter(order => order.status === 'paid');

    // Get all tickets for this event
    const allTickets = paidOrders.flatMap(order =>
        ticketingDb.getTicketsByOrder(order.id)
    );

    // Get ticket types for this event
    const ticketTypes = ticketingDb.getTicketTypesByEvent(eventId);

    // Calculate totals
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalTicketsSold = ticketTypes.reduce((sum, tt) => sum + tt.sold, 0);
    const checkedInCount = allTickets.filter(ticket => ticket.status === 'used').length;

    // Calculate remaining capacity
    const totalCapacity = event.globalCapacity ||
        ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);
    const remainingCapacity = totalCapacity - totalTicketsSold;

    // Breakdown by ticket type
    const ticketTypeBreakdown = {};
    const revenueByTicketType = {};

    ticketTypes.forEach(tt => {
        ticketTypeBreakdown[tt.name] = tt.sold;
        revenueByTicketType[tt.name] = tt.sold * tt.price;
    });

    // Promo code usage
    const ordersWithPromo = paidOrders.filter(order => order.promoCodeId);
    const promoCodeDiscountTotal = ordersWithPromo.reduce(
        (sum, order) => sum + (order.discountAmount || 0),
        0
    );

    return {
        eventId,
        totalTicketsSold,
        totalRevenue,
        totalOrders: paidOrders.length,
        totalAttendees: totalTicketsSold,
        checkedInCount,
        remainingCapacity,
        ticketTypeBreakdown,
        revenueByTicketType,
        promoCodeUsageCount: ordersWithPromo.length,
        promoCodeDiscountTotal,
    };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Reset all public events data (for testing)
 */
export function resetAllPublicEventsData() {
    writeData('events.json', {});
}

/**
 * Get database statistics
 * @returns {Object} Statistics
 */
export function getPublicEventsStats() {
    const events = getAllPublicEvents();
    const eventsArray = Object.values(events);

    return {
        total: eventsArray.length,
        draft: eventsArray.filter(e => e.status === 'draft').length,
        published: eventsArray.filter(e => e.status === 'published').length,
        cancelled: eventsArray.filter(e => e.status === 'cancelled').length,
        completed: eventsArray.filter(e => e.status === 'completed').length,
        byCategory: eventsArray.reduce((acc, event) => {
            acc[event.category] = (acc[event.category] || 0) + 1;
            return acc;
        }, {}),
    };
}

/**
 * Get upcoming events (published and future)
 * @param {number} limit - Maximum number of events to return
 * @returns {Array} Array of upcoming events
 */
export function getUpcomingEvents(limit = 10) {
    const events = getAllPublicEvents();
    const now = new Date();

    const visibleStatuses = ['published', 'sold_out', 'postponed'];

    return Object.values(events)
        .filter(event =>
            visibleStatuses.includes(event.status) &&
            event.isPublic &&
            new Date(event.startDate) > now
        )
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, limit);
}

/**
 * Get past events
 * @param {number} limit - Maximum number of events to return
 * @returns {Array} Array of past events
 */
export function getPastEvents(limit = 10) {
    const events = getAllPublicEvents();
    const now = new Date();

    return Object.values(events)
        .filter(event => new Date(event.startDate) < now)
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, limit);
}
