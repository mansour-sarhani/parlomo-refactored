/**
 * @fileoverview MongoDB Public Events Database Access Layer
 * Provides CRUD operations for public events using MongoDB
 * Replaces mock-public-events-db.js JSON file-based storage
 */

import { connectDB } from './mongodb.js';
import { PublicEvent, PublicEventCategory } from '@/models/ticketing/index.js';
import { generateSlug } from '@/types/public-events-types';
import {
    getOrdersByEvent,
    getTicketsByOrder,
    getTicketTypesByEvent,
} from './ticketing-db.js';
import { isValidObjectId, toObjectId } from './utils/objectid-helpers.js';

// Category populate fields (selective to reduce payload)
const CATEGORY_POPULATE_FIELDS = 'name slug icon';

// ==================== PUBLIC EVENTS ====================

/**
 * Get all public events
 * @returns {Promise<Object>} Events indexed by ID
 */
export async function getAllPublicEvents() {
    await connectDB();
    const events = await PublicEvent.find()
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();

    const result = {};
    events.forEach(event => {
        result[event._id.toString()] = {
            ...event,
            id: event._id.toString(),
        };
    });
    return result;
}

/**
 * Get public event by ID
 * @param {string|number} id - Event ID
 * @returns {Promise<Object|null>} Event or null
 */
export async function getPublicEvent(id) {
    await connectDB();
    const event = await PublicEvent.findById(id)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();
    if (!event) return null;

    return {
        ...event,
        id: event._id.toString(),
    };
}

/**
 * Get public event by slug
 * @param {string} slug - Event slug
 * @returns {Promise<Object|null>} Event or null
 */
export async function getPublicEventBySlug(slug) {
    await connectDB();
    const event = await PublicEvent.findOne({ slug })
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();
    if (!event) return null;

    return {
        ...event,
        id: event._id.toString(),
    };
}

/**
 * Get events by organizer ID
 * @param {string} organizerId - Organizer user ID
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsByOrganizer(organizerId) {
    await connectDB();
    const events = await PublicEvent.findByOrganizer(organizerId)
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();
    return events.map(event => ({
        ...event,
        id: event._id.toString(),
    }));
}

/**
 * Get events by status
 * @param {string} status - Event status
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsByStatus(status) {
    await connectDB();
    const events = await PublicEvent.find({ status })
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();
    return events.map(event => ({
        ...event,
        id: event._id.toString(),
    }));
}

/**
 * Resolve category to ObjectId
 * Accepts either ObjectId string or category slug
 * @param {string} category - Category ObjectId or slug
 * @returns {Promise<ObjectId|null>} Category ObjectId or null
 */
async function resolveCategoryId(category) {
    if (!category) return null;

    // If it's a valid ObjectId, use it directly
    if (isValidObjectId(category)) {
        return toObjectId(category);
    }

    // Otherwise, try to find by slug
    const categoryDoc = await PublicEventCategory.findOne({ slug: category }).lean();
    return categoryDoc ? categoryDoc._id : null;
}

/**
 * Get events by category
 * @param {string} category - Event category (ObjectId or slug)
 * @returns {Promise<Array>} Array of events
 */
export async function getEventsByCategory(category) {
    await connectDB();

    // Resolve category to ObjectId
    const categoryId = await resolveCategoryId(category);
    if (!categoryId) return [];

    const events = await PublicEvent.find({ category: categoryId })
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();
    return events.map(event => ({
        ...event,
        id: event._id.toString(),
    }));
}

/**
 * Query events with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Object>} Paginated results with events and metadata
 */
export async function queryPublicEvents(filters = {}) {
    await connectDB();

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

    // Build query
    const query = {};

    if (organizerId !== null) query.organizerId = organizerId;
    if (status !== null) query.status = status;
    if (isPublic !== null) query.isPublic = isPublic;

    // Handle category filter - resolve slug to ObjectId if needed
    if (category !== null) {
        const categoryId = await resolveCategoryId(category);
        if (categoryId) {
            query.category = categoryId;
        }
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } },
        ];
    }

    if (startDateFrom || startDateTo) {
        query.startDate = {};
        if (startDateFrom) query.startDate.$gte = new Date(startDateFrom);
        if (startDateTo) query.startDate.$lte = new Date(startDateTo);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
        PublicEvent.find(query)
            .populate('category', CATEGORY_POPULATE_FIELDS)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        PublicEvent.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        events: events.map(event => ({
            ...event,
            id: event._id.toString(),
        })),
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
 * Transform flat form data to nested model structure
 * @param {Object} formData - Flat form data from the frontend
 * @returns {Object} Data structured for Mongoose model
 */
function transformEventData(formData) {
    const {
        // Flat fields to transform
        venueName,
        venueAddress,
        city,
        state,
        country,
        postcode,
        latitude,
        longitude,
        organizerName,
        organizerEmail,
        organizerPhone,
        organizerWebsite,
        organizerFacebook,
        organizerInstagram,
        organizerWhatsApp,
        ageRestriction,
        // Rest of the data
        ...rest
    } = formData;

    // Build transformed data
    const transformed = { ...rest };

    // Transform venue
    if (venueName) {
        transformed.venue = {
            name: venueName,
            capacity: formData.globalCapacity || null,
        };
    }

    // Transform location
    if (venueAddress || city || country) {
        transformed.location = {
            address: venueAddress,
            city: city,
            state: state,
            country: country,
            postcode: postcode,
        };

        // Add coordinates if provided
        if (latitude !== undefined && longitude !== undefined) {
            transformed.location.coordinates = {
                lat: latitude,
                lng: longitude,
            };
        }
    }

    // Transform organizer
    if (organizerName || organizerEmail) {
        transformed.organizer = {
            name: organizerName,
            email: organizerEmail,
            phone: organizerPhone || null,
            website: organizerWebsite || null,
            facebook: organizerFacebook || null,
            instagram: organizerInstagram || null,
            whatsapp: organizerWhatsApp || null,
        };
    }

    // Transform ageRestriction from string to number if needed
    // Model expects Number, form sends strings like "18+", "all_ages"
    if (ageRestriction !== undefined && ageRestriction !== null) {
        if (ageRestriction === 'all_ages' || ageRestriction === '') {
            transformed.ageRestriction = 0;
        } else if (typeof ageRestriction === 'string') {
            // Extract number from strings like "18+", "21+"
            const match = ageRestriction.match(/(\d+)/);
            transformed.ageRestriction = match ? parseInt(match[1], 10) : 0;
        } else {
            transformed.ageRestriction = ageRestriction;
        }
    }

    return transformed;
}

/**
 * Create new public event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
export async function createPublicEvent(eventData) {
    await connectDB();

    // Transform flat form data to nested model structure
    const transformedData = transformEventData(eventData);

    // Validate and convert category to ObjectId (accepts ObjectId or slug)
    if (transformedData.category) {
        const categoryId = await resolveCategoryId(transformedData.category);
        if (!categoryId) {
            throw new Error(`Category not found: "${transformedData.category}". Please provide a valid category ObjectId or slug.`);
        }
        transformedData.category = categoryId;
    }

    // Generate slug from title if not provided
    let slug = transformedData.slug;
    if (!slug && transformedData.title) {
        slug = generateSlug(transformedData.title);
    }

    // Ensure slug uniqueness
    let uniqueSlug = slug;
    let counter = 1;
    while (await PublicEvent.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    const event = new PublicEvent({
        ...transformedData,
        slug: uniqueSlug,
        status: transformedData.status || 'draft',
    });

    await event.save();

    // Populate category before returning
    await event.populate('category', CATEGORY_POPULATE_FIELDS);

    return {
        ...event.toObject(),
        id: event._id.toString(),
    };
}

/**
 * Update public event
 * @param {string|number} id - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated event or null
 */
export async function updatePublicEvent(id, updates) {
    await connectDB();

    // Transform flat form data to nested model structure
    const transformedUpdates = transformEventData(updates);

    // Validate and convert category to ObjectId if provided (accepts ObjectId or slug)
    if (transformedUpdates.category) {
        const categoryId = await resolveCategoryId(transformedUpdates.category);
        if (!categoryId) {
            throw new Error(`Category not found: "${transformedUpdates.category}". Please provide a valid category ObjectId or slug.`);
        }
        transformedUpdates.category = categoryId;
    }

    // If title is being updated, regenerate slug
    if (transformedUpdates.title) {
        const event = await PublicEvent.findById(id);
        if (event && transformedUpdates.title !== event.title) {
            const baseSlug = generateSlug(transformedUpdates.title);

            // Ensure slug uniqueness
            let uniqueSlug = baseSlug;
            let counter = 1;
            while (await PublicEvent.findOne({ slug: uniqueSlug, _id: { $ne: id } })) {
                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;
            }

            transformedUpdates.slug = uniqueSlug;
        }
    }

    const event = await PublicEvent.findByIdAndUpdate(
        id,
        { ...transformedUpdates, updatedAt: new Date() },
        { new: true, runValidators: true }
    )
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .lean();

    if (!event) return null;

    return {
        ...event,
        id: event._id.toString(),
    };
}

/**
 * Delete public event (soft delete by setting status to cancelled)
 * @param {string|number} id - Event ID
 * @returns {Promise<boolean>} Success status
 */
export async function deletePublicEvent(id) {
    await connectDB();
    
    const event = await PublicEvent.findById(id);
    if (!event) return false;
    
    await event.cancel();
    return true;
}

/**
 * Hard delete public event (permanently remove)
 * @param {string|number} id - Event ID
 * @returns {Promise<boolean>} Success status
 */
export async function hardDeletePublicEvent(id) {
    await connectDB();
    
    const result = await PublicEvent.findByIdAndDelete(id);
    return !!result;
}

/**
 * Publish event (change status to published)
 * @param {string|number} id - Event ID
 * @returns {Promise<Object|null>} Updated event or null
 */
export async function publishEvent(id) {
    await connectDB();
    
    const event = await PublicEvent.findById(id);
    if (!event) return null;
    
    await event.publish();
    
    return {
        ...event.toObject(),
        id: event._id.toString(),
    };
}

/**
 * Unpublish event (change status to draft)
 * @param {string|number} id - Event ID
 * @returns {Promise<Object|null>} Updated event or null
 */
export async function unpublishEvent(id) {
    return updatePublicEvent(id, {
        status: 'draft',
    });
}

/**
 * Cancel event
 * @param {string|number} id - Event ID
 * @returns {Promise<Object|null>} Updated event or null
 */
export async function cancelEvent(id) {
    return updatePublicEvent(id, { status: 'cancelled' });
}

/**
 * Mark event as completed
 * @param {string|number} id - Event ID
 * @returns {Promise<Object|null>} Updated event or null
 */
export async function completeEvent(id) {
    return updatePublicEvent(id, { status: 'completed' });
}

// ==================== EVENT CATEGORIES ====================

/**
 * Get all event categories
 * @returns {Promise<Array>} Array of categories
 */
export async function getEventCategories() {
    await connectDB();
    
    // Get unique categories from existing events
    const categories = await PublicEvent.distinct('category');
    
    // Return formatted categories
    return categories.map(cat => ({
        slug: cat.toLowerCase().replace(/\s+/g, '-'),
        name: cat,
    }));
}

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>} Category or null
 */
export async function getCategoryBySlug(slug) {
    const categories = await getEventCategories();
    return categories.find(cat => cat.slug === slug) || null;
}

// ==================== EVENT STATISTICS ====================

/**
 * Get event statistics
 * @param {string|number} eventId - Event ID
 * @returns {Promise<Object|null>} Event statistics
 */
export async function getEventStats(eventId) {
    await connectDB();
    
    const event = await getPublicEvent(eventId);
    if (!event) return null;

    // Get all orders for this event
    const orders = await getOrdersByEvent(eventId);
    const paidOrders = orders.filter(order => order.status === 'paid');

    // Get all tickets for this event
    const allTicketsPromises = paidOrders.map(order => getTicketsByOrder(order.id));
    const allTicketsArrays = await Promise.all(allTicketsPromises);
    const allTickets = allTicketsArrays.flat();

    // Get ticket types for this event
    const ticketTypes = await getTicketTypesByEvent(eventId);

    // Calculate totals
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalTicketsSold = ticketTypes.reduce((sum, tt) => sum + (tt.sold || 0), 0);
    const checkedInCount = allTickets.filter(ticket => ticket.status === 'used').length;

    // Calculate remaining capacity
    const totalCapacity = event.globalCapacity ||
        ticketTypes.reduce((sum, tt) => sum + (tt.capacity || 0), 0);
    const remainingCapacity = totalCapacity - totalTicketsSold;

    // Breakdown by ticket type
    const ticketTypeBreakdown = {};
    const revenueByTicketType = {};

    ticketTypes.forEach(tt => {
        ticketTypeBreakdown[tt.name] = tt.sold || 0;
        revenueByTicketType[tt.name] = (tt.sold || 0) * (tt.price || 0);
    });

    // Promo code usage
    const ordersWithPromo = paidOrders.filter(order => order.promoCodeId);
    const promoCodeDiscountTotal = ordersWithPromo.reduce(
        (sum, order) => sum + (order.discount || 0),
        0
    );

    return {
        eventId,
        // Aliased for UI components
        ticketsSold: totalTicketsSold,
        revenue: totalRevenue,
        attendees: totalTicketsSold,
        // Original names (for backwards compatibility)
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
export async function resetAllPublicEventsData() {
    await connectDB();
    await PublicEvent.deleteMany({});
    console.log('✅ All public events data cleared from MongoDB');
}

/**
 * Get database statistics
 * @returns {Promise<Object>} Statistics
 */
export async function getPublicEventsStats() {
    await connectDB();
    
    const [total, draft, published, cancelled, completed] = await Promise.all([
        PublicEvent.countDocuments(),
        PublicEvent.countDocuments({ status: 'draft' }),
        PublicEvent.countDocuments({ status: 'published' }),
        PublicEvent.countDocuments({ status: 'cancelled' }),
        PublicEvent.countDocuments({ status: 'completed' }),
    ]);
    
    // Get category breakdown
    const categoryAgg = await PublicEvent.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    
    const byCategory = {};
    categoryAgg.forEach(item => {
        byCategory[item._id] = item.count;
    });

    return {
        total,
        draft,
        published,
        cancelled,
        completed,
        byCategory,
    };
}

/**
 * Get upcoming events (published and future)
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array>} Array of upcoming events
 */
export async function getUpcomingEvents(limit = 10) {
    await connectDB();

    const now = new Date();
    const visibleStatuses = ['published', 'sold_out', 'postponed'];

    const events = await PublicEvent.find({
        status: { $in: visibleStatuses },
        startDate: { $gt: now },
    })
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort({ startDate: 1 })
        .limit(limit)
        .lean();

    return events.map(event => ({
        ...event,
        id: event._id.toString(),
    }));
}

/**
 * Get past events
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array>} Array of past events
 */
export async function getPastEvents(limit = 10) {
    await connectDB();

    const now = new Date();

    const events = await PublicEvent.find({
        startDate: { $lt: now },
    })
        .populate('category', CATEGORY_POPULATE_FIELDS)
        .sort({ startDate: -1 })
        .limit(limit)
        .lean();

    return events.map(event => ({
        ...event,
        id: event._id.toString(),
    }));
}
