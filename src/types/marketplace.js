/**
 * Marketplace Domain Types
 *
 * NOTE: These are informal JSDoc typedefs to improve IDE hints across the JS codebase.
 * When migrating files to TypeScript we can promote these shapes to real interfaces.
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} [current_page]
 * @property {number} [last_page]
 * @property {number} [per_page]
 * @property {number} [total]
 */

/**
 * @typedef {Object} ApiListResponse
 * @property {Array} [data]
 * @property {PaginationMeta} [meta]
 * @property {Object} [links]
 */

/**
 * @typedef {Object} AdAttribute
 * @property {number} id
 * @property {string} title
 * @property {string} name
 * @property {string} type
 * @property {string} [description]
 * @property {string} [image]
 * @property {boolean|number|string} [required]
 * @property {boolean|number|string} [status]
 */

/**
 * @typedef {Object} AdCategory
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} [image]
 * @property {number} [parent_id]
 * @property {string|number} [price]
 * @property {string|number|boolean} [status]
 * @property {number} [classified_ad_type_id]
 * @property {AdCategory[]} [children]
 * @property {AdAttribute[]} [classified_ad_attributes]
 */

/**
 * @typedef {Object} AdType
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {string|number} [price]
 * @property {string} [image]
 * @property {boolean|number|string} [status]
 * @property {number} [totalCategory]
 * @property {number} [totalActiveCategory]
 * @property {number} [totalDeactivateCategory]
 */

/**
 * @typedef {Object} AdListing
 * @property {number} id
 * @property {string} title
 * @property {string} status
 * @property {string} [classifiedAdType]
 * @property {string} [categoryName]
 * @property {string|number} [price]
 * @property {string[]} [image]
 * @property {Object[]} [classifiedAdAttributes]
 * @property {string} [valid_date]
 */

/**
 * @typedef {"idle"|"loading"|"succeeded"|"failed"} AsyncStatus
 */


