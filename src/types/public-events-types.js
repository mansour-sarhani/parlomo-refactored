/**
 * Public Events Type Definitions
 * 
 * This file defines the data structure for organizer-created public events,
 * which are separate from admin-managed platform events.
 */

/**
 * @typedef {Object} PublicEvent
 * 
 * // Core Event Info
 * @property {number} id - Auto-generated unique identifier
 * @property {number} organizerId - Creator's user ID
 * @property {string} title - Event name
 * @property {string} slug - URL-friendly identifier (auto-generated from title)
 * @property {string} description - Full event description (supports HTML/markdown)
 * @property {string} category - Event category (concert, conference, workshop, etc.)
 * 
 * // Date & Time
 * @property {string} startDate - ISO 8601 date-time (e.g., "2024-12-25T19:00:00Z")
 * @property {string|null} endDate - ISO 8601 date-time (nullable for single-day events)
 * @property {string} timezone - IANA timezone (e.g., "America/New_York", "Europe/London")
 * @property {string|null} doorsOpen - Time doors open (e.g., "18:30") (nullable)
 * 
 * // Venue & Location
 * @property {string} venueName - Venue/location name
 * @property {string} venueAddress - Full street address
 * @property {string} city - City name
 * @property {string} state - State/province/region
 * @property {string} country - Country name or ISO code
 * @property {string} postcode - Postal/ZIP code
 * @property {number|null} latitude - Geographic latitude for map display (nullable)
 * @property {number|null} longitude - Geographic longitude for map display (nullable)
 * 
 * // Ticketing Configuration
 * @property {EventType} eventType - Type of ticketing ("general_admission" | "seated" | "hybrid")
 * @property {number|null} globalCapacity - Maximum total attendees (null = unlimited)
 * @property {string} currency - ISO 4217 currency code ("USD", "EUR", "GBP", etc.)
 * @property {boolean} waitlistEnabled - Allow waitlist when sold out
 * 
 * // Organizer Information
 * @property {string} organizerName - Public display name for organizer
 * @property {string} organizerEmail - Contact email address
 * @property {string|null} organizerPhone - Contact phone number (nullable)
 * @property {string|null} organizerWebsite - Organizer website URL (nullable)
 * 
 * // Media Assets
 * @property {string|null} coverImage - Main event image URL (nullable)
 * @property {string[]} galleryImages - Array of additional image URLs
 * @property {string|null} videoUrl - YouTube/Vimeo embed URL (nullable)
 * 
 * // Status & Visibility
 * @property {EventStatus} status - Current event status
 * @property {boolean} isPublic - Whether event is visible to public
 * @property {boolean} isOnline - Whether event is virtual/online
 * 
 * // Additional Features
 * @property {string[]} tags - Array of tags for categorization/search
 * @property {AgeRestriction} ageRestriction - Age restriction level
 * @property {string|null} refundPolicy - Refund policy description (nullable)
 * @property {string|null} termsAndConditions - Event-specific terms (nullable)
 * 
 * // Tax & Fees Configuration
 * @property {boolean} taxInclusive - Whether displayed prices include tax
 * @property {number} taxRate - Tax percentage (e.g., 8.5 for 8.5%)
 * 
 * // Metadata
 * @property {string} createdAt - ISO 8601 timestamp of creation
 * @property {string} updatedAt - ISO 8601 timestamp of last update
 * @property {Object} metadata - Extensible JSON field for custom data
 */

/**
 * @typedef {'general_admission' | 'seated' | 'hybrid'} EventType
 * - general_admission: No assigned seating, first-come first-served
 * - seated: Assigned seating with seat selection
 * - hybrid: Mix of general admission and seated sections
 */

/**
 * @typedef {'draft' | 'published' | 'cancelled' | 'completed' | 'sold_out' | 'postponed' | 'archived'} EventStatus
 * - draft: Event created but not yet published
 * - published: Event is live and visible to public
 * - cancelled: Event has been cancelled
 * - completed: Event has ended
 * - sold_out: Event is fully booked
 * - postponed: Event has been postponed
 * - archived: Event is archived and hidden
 */

/**
 * @typedef {'all_ages' | '13+' | '16+' | '18+' | '21+'} AgeRestriction
 * Age restriction levels for event attendance
 */

/**
 * @typedef {Object} EventCategory
 * @property {string} id - Category identifier
 * @property {string} name - Display name
 * @property {string} slug - URL-friendly identifier
 * @property {string|null} icon - Icon name (Lucide React icon)
 * @property {string|null} description - Category description
 */

/**
 * @typedef {Object} VenueInfo
 * Structured venue information
 * @property {string} name - Venue name
 * @property {string} address - Street address
 * @property {string} city - City
 * @property {string} state - State/province
 * @property {string} country - Country
 * @property {string} postcode - Postal code
 * @property {number|null} latitude - Latitude
 * @property {number|null} longitude - Longitude
 * @property {string|null} placeId - Google Places ID (for future integration)
 */

/**
 * @typedef {Object} OrganizerInfo
 * Structured organizer contact information
 * @property {string} name - Organizer name
 * @property {string} email - Contact email
 * @property {string|null} phone - Contact phone
 * @property {string|null} website - Website URL
 * @property {string|null} logo - Logo image URL
 */

/**
 * @typedef {Object} EventFormData
 * Form data structure for creating/editing events
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string[]} tags
 * @property {string} startDate
 * @property {string|null} endDate
 * @property {string} timezone
 * @property {string|null} doorsOpen
 * @property {VenueInfo} venue
 * @property {OrganizerInfo} organizer
 * @property {EventType} eventType
 * @property {number|null} globalCapacity
 * @property {string} currency
 * @property {boolean} waitlistEnabled
 * @property {string|null} coverImage
 * @property {string[]} galleryImages
 * @property {string|null} videoUrl
 * @property {boolean} isPublic
 * @property {boolean} isOnline
 * @property {AgeRestriction} ageRestriction
 * @property {string|null} refundPolicy
 * @property {string|null} termsAndConditions
 * @property {boolean} taxInclusive
 * @property {number} taxRate
 */

/**
 * @typedef {Object} EventStats
 * Event statistics and analytics
 * @property {number} eventId
 * @property {number} totalTicketsSold
 * @property {number} totalRevenue - In cents
 * @property {number} totalOrders
 * @property {number} totalAttendees
 * @property {number} checkedInCount
 * @property {number} remainingCapacity
 * @property {Object.<string, number>} ticketTypeBreakdown - Sales by ticket type
 * @property {Object.<string, number>} revenueByTicketType - Revenue by ticket type
 * @property {number} promoCodeUsageCount
 * @property {number} promoCodeDiscountTotal - Total discount given in cents
 */

/**
 * @typedef {Object} EventListFilters
 * Filters for querying event lists
 * @property {number|null} organizerId - Filter by organizer
 * @property {EventStatus|null} status - Filter by status
 * @property {string|null} category - Filter by category
 * @property {boolean|null} isPublic - Filter by visibility
 * @property {string|null} search - Search query (title, description)
 * @property {string|null} startDateFrom - Filter events starting after this date
 * @property {string|null} startDateTo - Filter events starting before this date
 * @property {number} page - Page number (1-indexed)
 * @property {number} limit - Items per page
 * @property {string} sortBy - Sort field (createdAt, startDate, title)
 * @property {string} sortOrder - Sort direction (asc, desc)
 */

/**
 * Default values for new events
 */
export const DEFAULT_EVENT_VALUES = {
    eventType: 'general_admission',
    currency: 'GBP',
    timezone: 'Europe/London',
    waitlistEnabled: false,
    isPublic: true,
    isOnline: false,
    ageRestriction: 'all_ages',
    taxInclusive: false,
    taxRate: 0,
    status: 'draft',
    tags: [],
    galleryImages: [],
    bookingDeadline: null,
    organizerFacebook: null,
    organizerInstagram: null,
    organizerWhatsApp: null,
    serviceCharges: [],
    videoUrl: null,
};

/**
 * Default event categories (used for seeding)
 * NOTE: Runtime categories are stored in MongoDB (PublicEventCategory collection).
 * These defaults are used when seeding the database via /api/public-events/categories/seed.
 * Use the API /api/public-events/categories to fetch actual categories from MongoDB.
 */
export const EVENT_CATEGORIES = [
    { id: 'concert', name: 'Concert', slug: 'concert', icon: 'Music' },
    { id: 'conference', name: 'Conference', slug: 'conference', icon: 'Users' },
    { id: 'workshop', name: 'Workshop', slug: 'workshop', icon: 'Wrench' },
    { id: 'festival', name: 'Festival', slug: 'festival', icon: 'PartyPopper' },
    { id: 'sports', name: 'Sports', slug: 'sports', icon: 'Trophy' },
    { id: 'theater', name: 'Theater', slug: 'theater', icon: 'Theater' },
    { id: 'comedy', name: 'Comedy', slug: 'comedy', icon: 'Laugh' },
    { id: 'networking', name: 'Networking', slug: 'networking', icon: 'Network' },
    { id: 'charity', name: 'Charity', slug: 'charity', icon: 'Heart' },
    { id: 'other', name: 'Other', slug: 'other', icon: 'MoreHorizontal' },
];

/**
 * Available currencies
 */
export const CURRENCIES = [
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

/**
 * Age restriction options
 */
export const AGE_RESTRICTIONS = [
    { value: 'all_ages', label: 'All Ages' },
    { value: '13+', label: '13+' },
    { value: '16+', label: '16+' },
    { value: '18+', label: '18+' },
    { value: '21+', label: '21+' },
];

/**
 * Service charge type options
 * - per_ticket: Charge applied to each ticket purchased
 * - per_cart: Charge applied once per order/cart
 */
export const SERVICE_CHARGE_TYPES = [
    { value: 'per_ticket', label: 'Per Ticket' },
    { value: 'per_cart', label: 'Per Cart/Order' },
];

/**
 * Service charge amount type options
 * - fixed_price: Fixed amount in currency
 * - percentage: Percentage of ticket/cart price
 */
export const SERVICE_CHARGE_AMOUNT_TYPES = [
    { value: 'fixed_price', label: 'Fixed Price' },
    { value: 'percentage', label: 'Percentage' },
];

/**
 * Common timezones
 */
export const COMMON_TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Toronto', label: 'Toronto' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Dubai', label: 'Dubai' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Australia/Sydney', label: 'Sydney' },
];

/**
 * Validation helper: Check if event is editable
 * @param {PublicEvent} event
 * @returns {boolean}
 */
export const isEventEditable = (event) => {
    return event.status === 'draft' || event.status === 'published';
};

/**
 * Validation helper: Check if event is past
 * @param {PublicEvent} event
 * @returns {boolean}
 */
export const isEventPast = (event) => {
    return new Date(event.startDate) < new Date();
};

/**
 * Validation helper: Check if event is upcoming
 * @param {PublicEvent} event
 * @returns {boolean}
 */
export const isEventUpcoming = (event) => {
    return new Date(event.startDate) > new Date();
};

/**
 * Helper: Generate slug from title
 * @param {string} title
 * @returns {string}
 */
export const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Remove consecutive hyphens
};

/**
 * Helper: Format event date range
 * @param {PublicEvent} event
 * @returns {string}
 */
export const formatEventDateRange = (event) => {
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;

    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    if (!end) {
        return start.toLocaleDateString('en-US', options);
    }

    // Same day event
    if (start.toDateString() === end.toDateString()) {
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Multi-day event
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};

/**
 * Helper: Get event status badge color
 * @param {EventStatus} status
 * @returns {string}
 */
export const getEventStatusColor = (status) => {
    const colors = {
        draft: 'gray',
        published: 'green',
        cancelled: 'red',
        completed: 'blue',
        sold_out: 'orange',
        postponed: 'yellow',
        archived: 'gray',
    };
    return colors[status] || 'gray';
};
