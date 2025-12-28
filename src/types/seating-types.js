/**
 * Seating Types
 * JSDoc type definitions for seats.io integration
 */

/**
 * Seating configuration returned from API
 * @typedef {Object} SeatingConfig
 * @property {string} workspace_key - Seats.io workspace public key
 * @property {string} event_key - Seats.io event key (Parlomo event UUID)
 * @property {'eu' | 'na'} region - Seats.io region
 * @property {CategoryPricing[]} pricing - Pricing by seat category
 * @property {number} max_selected_objects - Max seats user can select
 * @property {string} currency - Currency code (GBP, USD, etc.)
 */

/**
 * Category pricing from seating config
 * @typedef {Object} CategoryPricing
 * @property {string} category - Seats.io category key
 * @property {number} price - Price in currency units (not cents)
 * @property {string} ticketTypeId - Parlomo ticket type UUID
 * @property {string} ticketTypeName - Display name for ticket type
 */

/**
 * Selected seat stored in Redux state
 * @typedef {Object} SelectedSeat
 * @property {string} label - Seat label (e.g., "A-15", "Section A-Row 1-Seat 5")
 * @property {string} category - Category key from seats.io
 * @property {string} ticketTypeId - Parlomo ticket type ID
 * @property {string} ticketTypeName - Ticket type display name
 * @property {number} price - Price in currency units (not cents)
 */

/**
 * Seats.io object received in callbacks
 * @typedef {Object} SeatsioObject
 * @property {string} label - Seat display label
 * @property {'Seat' | 'GeneralAdmissionArea' | 'Booth' | 'Table'} objectType - Type of object
 * @property {SeatsioCategory} category - Category information
 * @property {SeatsioPricing} pricing - Pricing information
 * @property {'free' | 'booked' | 'reservedByToken' | 'blocked'} status - Seat status
 */

/**
 * Seats.io category object
 * @typedef {Object} SeatsioCategory
 * @property {string} key - Category key
 * @property {string} label - Category display label
 * @property {string} color - Category color (hex)
 */

/**
 * Seats.io pricing object
 * @typedef {Object} SeatsioPricing
 * @property {number} price - Price for this seat
 */

/**
 * Seats.io chart instance (for programmatic access)
 * @typedef {Object} SeatsioChart
 * @property {function(): Promise<SeatsioObject[]>} listSelectedObjects - Get all selected objects
 * @property {SeatsioObject[]} selectedObjects - Array of currently selected objects
 * @property {function(Object): void} changeConfig - Update chart configuration
 */

// ========================================
// CHART MANAGEMENT TYPES (Organizer Flow)
// ========================================

/**
 * Venue chart (admin or organizer created)
 * @typedef {Object} VenueChart
 * @property {string} id - Chart UUID
 * @property {string} name - Chart name (e.g., "Summer Concert Layout")
 * @property {string} venue_name - Venue name (e.g., "O2 Arena")
 * @property {string|null} venue_address - Full venue address
 * @property {string|null} city - City
 * @property {string|null} country - Country
 * @property {string} seatsio_chart_key - Seats.io chart key
 * @property {number} total_capacity - Total seat capacity
 * @property {ChartCategory[]} categories - Seating categories
 * @property {boolean} is_admin_chart - Whether this is a platform admin chart
 * @property {boolean} is_active - Whether the chart is active
 * @property {'draft' | 'published'} status - Chart status
 * @property {string} [thumbnail_url] - Chart thumbnail URL
 * @property {{id: string, name: string}} created_by - Creator info
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * Chart category
 * @typedef {Object} ChartCategory
 * @property {string} key - Category key (e.g., "vip", "standard")
 * @property {string} label - Display label (e.g., "VIP Section")
 * @property {string} color - Hex color code (e.g., "#FFD700")
 */

/**
 * Designer configuration from API
 * Response from GET /api/ticketing/seatsio/charts/{id}/designer
 * @typedef {Object} DesignerConfig
 * @property {string} chart_key - Seats.io chart key to load in the designer
 * @property {string} secret_key - Workspace secret key for authentication
 * @property {'eu' | 'na'} region - API region for CDN script loading
 * @property {'safe' | 'normal'} mode - Designer mode (safe recommended)
 */

/**
 * Request to create a new chart
 * @typedef {Object} CreateChartRequest
 * @property {string} name - Chart name
 * @property {string} venue_name - Venue name
 * @property {string} [venue_address] - Venue address
 * @property {string} [city] - City
 * @property {string} [country] - Country
 * @property {ChartCategory[]} categories - Initial categories
 */

/**
 * Category to ticket type mapping
 * @typedef {Object} CategoryMapping
 * @property {string} category_key - Seats.io category key
 * @property {string} category_label - Category display label
 * @property {string} ticket_type_id - Parlomo ticket type ID
 */

/**
 * Saved category mapping with ticket type details
 * @typedef {Object} SavedCategoryMapping
 * @property {string} id - Mapping UUID
 * @property {string} event_id - Event UUID
 * @property {string} seatsio_category_key - Category key
 * @property {string} category_label - Category label
 * @property {{id: string, name: string, price: number}} ticket_type - Ticket type details
 */

/**
 * Event with seating information
 * @typedef {Object} EventWithSeating
 * @property {string} id - Event UUID
 * @property {string} title - Event title
 * @property {'general_admission' | 'seated'} event_type - Event type
 * @property {string|null} venue_chart_id - Assigned chart ID
 * @property {string|null} seatsio_chart_key - Seats.io chart key
 * @property {string|null} seatsio_event_key - Seats.io event key (after publish)
 * @property {VenueChart|null} venue_chart - Chart details
 * @property {SavedCategoryMapping[]} category_mappings - Category mappings
 */

// Export empty object for module resolution
export {};
