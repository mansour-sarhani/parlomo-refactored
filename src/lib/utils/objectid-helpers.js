/**
 * ObjectId Helper Utilities
 *
 * Provides utility functions for working with MongoDB ObjectIds
 * in a safe and consistent manner across the application.
 */

import mongoose from 'mongoose';

/**
 * Check if a value is a valid MongoDB ObjectId
 * @param {string|mongoose.Types.ObjectId} id - The value to check
 * @returns {boolean} True if valid ObjectId format
 */
export function isValidObjectId(id) {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Convert a string or ObjectId to a MongoDB ObjectId
 * @param {string|mongoose.Types.ObjectId} id - The value to convert
 * @returns {mongoose.Types.ObjectId|null} The ObjectId or null if invalid
 */
export function toObjectId(id) {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (isValidObjectId(id)) {
        return new mongoose.Types.ObjectId(id);
    }
    return null;
}

/**
 * Safely convert to ObjectId, returning null on any error
 * @param {string|mongoose.Types.ObjectId} id - The value to convert
 * @returns {mongoose.Types.ObjectId|null} The ObjectId or null
 */
export function toObjectIdOrNull(id) {
    try {
        return toObjectId(id);
    } catch {
        return null;
    }
}

/**
 * Convert a string to ObjectId, throwing an error if invalid
 * @param {string|mongoose.Types.ObjectId} id - The value to convert
 * @param {string} fieldName - Name of the field (for error message)
 * @returns {mongoose.Types.ObjectId} The ObjectId
 * @throws {Error} If the id is invalid
 */
export function toObjectIdOrThrow(id, fieldName = 'ID') {
    const objectId = toObjectId(id);
    if (!objectId) {
        throw new Error(`Invalid ${fieldName}: ${id}`);
    }
    return objectId;
}

/**
 * Check if two ObjectIds are equal
 * @param {string|mongoose.Types.ObjectId} id1 - First ID
 * @param {string|mongoose.Types.ObjectId} id2 - Second ID
 * @returns {boolean} True if equal
 */
export function objectIdsEqual(id1, id2) {
    if (!id1 || !id2) return false;
    return id1.toString() === id2.toString();
}

/**
 * Convert an array of strings to ObjectIds, filtering out invalid ones
 * @param {Array<string|mongoose.Types.ObjectId>} ids - Array of IDs
 * @returns {Array<mongoose.Types.ObjectId>} Array of valid ObjectIds
 */
export function toObjectIdArray(ids) {
    if (!Array.isArray(ids)) return [];
    return ids
        .map((id) => toObjectIdOrNull(id))
        .filter((id) => id !== null);
}

/**
 * Extract the string representation of an ObjectId
 * Works with ObjectId instances, populated objects, or plain strings
 * @param {string|mongoose.Types.ObjectId|Object} value - The value
 * @returns {string|null} The string ID or null
 */
export function extractIdString(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value instanceof mongoose.Types.ObjectId) return value.toString();
    if (value._id) return extractIdString(value._id);
    return null;
}
