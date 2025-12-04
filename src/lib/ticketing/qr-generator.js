/**
 * QR Code Generator Utility
 * Generates secure QR codes for tickets using JWT signing
 */

import jwt from 'jsonwebtoken';

// Secret key for signing (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'ticketing-secret-key-change-in-production';

/**
 * Generate QR code payload for a ticket
 * @param {Object} ticketData - Ticket information
 * @param {number} ticketData.ticketId - Ticket ID
 * @param {string} ticketData.ticketCode - Unique ticket code
 * @param {number} ticketData.eventId - Event ID
 * @param {number} ticketData.ticketTypeId - Ticket type ID
 * @param {number} ticketData.orderId - Order ID
 * @returns {string} Signed JWT token for QR code
 */
export function generateQRPayload(ticketData) {
    const { ticketId, ticketCode, eventId, ticketTypeId, orderId } = ticketData;

    // Create payload
    const payload = {
        ticketId,
        ticketCode,
        eventId,
        ticketTypeId,
        orderId,
        iat: Math.floor(Date.now() / 1000), // Issued at
    };

    // Sign the payload
    const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '365d', // Valid for 1 year
        issuer: 'parlomo-ticketing',
        subject: 'ticket-qr',
    });

    return token;
}

/**
 * Verify and decode QR code payload
 * @param {string} token - JWT token from QR code
 * @returns {Object|null} Decoded ticket data or null if invalid
 */
export function verifyQRPayload(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: 'parlomo-ticketing',
            subject: 'ticket-qr',
        });

        return {
            ticketId: decoded.ticketId,
            ticketCode: decoded.ticketCode,
            eventId: decoded.eventId,
            ticketTypeId: decoded.ticketTypeId,
            orderId: decoded.orderId,
            issuedAt: decoded.iat,
        };
    } catch (error) {
        console.error('QR verification error:', error.message);
        return null;
    }
}

/**
 * Generate QR code data URL (for display)
 * Note: This is a server-side function. For client-side rendering,
 * use a library like 'qrcode' or 'react-qr-code'
 * 
 * @param {string} payload - QR code payload (JWT token)
 * @returns {Promise<string>} Data URL for QR code image
 */
export async function generateQRCodeDataURL(payload) {
    // For server-side generation, we'd use the 'qrcode' package
    // For now, return the payload as-is (client will handle rendering)
    return payload;
}

/**
 * Validate QR code format
 * @param {string} qrData - QR code data
 * @returns {boolean} True if valid format
 */
export function isValidQRFormat(qrData) {
    if (!qrData || typeof qrData !== 'string') {
        return false;
    }

    // Check if it's a JWT (3 parts separated by dots)
    const parts = qrData.split('.');
    return parts.length === 3;
}

/**
 * Extract ticket code from QR payload without verification
 * Useful for quick lookups before full verification
 * @param {string} token - JWT token
 * @returns {string|null} Ticket code or null
 */
export function extractTicketCode(token) {
    try {
        // Decode without verification (just parse)
        const decoded = jwt.decode(token);
        return decoded?.ticketCode || null;
    } catch (error) {
        return null;
    }
}

/**
 * Check if QR code is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
export function isQRExpired(token) {
    try {
        jwt.verify(token, JWT_SECRET);
        return false;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return true;
        }
        return false;
    }
}
