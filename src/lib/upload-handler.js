/**
 * @fileoverview File Upload Handler Utility
 * Handles file uploads for Next.js API routes
 * Supports multipart/form-data parsing and file storage
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Base upload directory (relative to project root)
const UPLOAD_BASE_DIR = 'public/uploads';

/**
 * Ensure upload directory exists
 * @param {string} subDir - Subdirectory within uploads
 * @returns {Promise<string>} Full path to directory
 */
async function ensureUploadDir(subDir) {
    const fullPath = path.join(process.cwd(), UPLOAD_BASE_DIR, subDir);
    if (!existsSync(fullPath)) {
        await mkdir(fullPath, { recursive: true });
    }
    return fullPath;
}

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
function generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName).toLowerCase();
    const baseName = path.basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 30);
    return `${baseName}-${timestamp}-${random}${ext}`;
}

/**
 * Validate file type
 * @param {string} mimeType - File MIME type
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid
 */
function isValidFileType(mimeType, allowedTypes) {
    return allowedTypes.some(type => {
        if (type.endsWith('/*')) {
            // Wildcard match (e.g., 'image/*')
            return mimeType.startsWith(type.replace('/*', '/'));
        }
        return mimeType === type;
    });
}

/**
 * Save uploaded file
 * @param {File} file - File object from FormData
 * @param {Object} options - Upload options
 * @param {string} options.subDir - Subdirectory for upload (e.g., 'categories')
 * @param {Array} options.allowedTypes - Allowed MIME types (default: images)
 * @param {number} options.maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {Promise<Object>} Upload result with path and url
 */
export async function saveUploadedFile(file, options = {}) {
    const {
        subDir = 'misc',
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        maxSize = 5 * 1024 * 1024, // 5MB default
    } = options;

    // Validate file exists
    if (!file || !file.name) {
        throw new Error('No file provided');
    }

    // Validate file type
    if (!isValidFileType(file.type, allowedTypes)) {
        throw new Error(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Validate file size
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
    }

    // Ensure directory exists
    const uploadDir = await ensureUploadDir(subDir);

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const filePath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return public URL path (relative to public folder)
    const publicUrl = `/uploads/${subDir}/${filename}`;

    return {
        filename,
        path: filePath,
        url: publicUrl,
        size: file.size,
        type: file.type,
    };
}

/**
 * Delete uploaded file
 * @param {string} url - Public URL path (e.g., '/uploads/categories/image.jpg')
 * @returns {Promise<boolean>} True if deleted successfully
 */
export async function deleteUploadedFile(url) {
    if (!url || !url.startsWith('/uploads/')) {
        return false;
    }

    try {
        // Convert URL to file path
        const relativePath = url.replace('/uploads/', '');
        const fullPath = path.join(process.cwd(), UPLOAD_BASE_DIR, relativePath);

        if (existsSync(fullPath)) {
            await unlink(fullPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

/**
 * Parse multipart form data from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} Parsed form data with fields and files
 */
export async function parseFormData(request) {
    const formData = await request.formData();

    const fields = {};
    const files = {};

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            // It's a file
            if (value.size > 0) {
                files[key] = value;
            }
        } else {
            // It's a regular field
            fields[key] = value;
        }
    }

    return { fields, files };
}

/**
 * Handle category image upload
 * @param {File} file - Image file
 * @param {string|null} existingImageUrl - URL of existing image to delete
 * @returns {Promise<string|null>} New image URL or null
 */
export async function handleCategoryImageUpload(file, existingImageUrl = null) {
    // Delete existing image if provided
    if (existingImageUrl) {
        await deleteUploadedFile(existingImageUrl);
    }

    // If no new file, return null
    if (!file || file.size === 0) {
        return existingImageUrl; // Keep existing if no new file
    }

    // Save new file
    const result = await saveUploadedFile(file, {
        subDir: 'categories',
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 2 * 1024 * 1024, // 2MB for category images
    });

    return result.url;
}

/**
 * Get file info from URL
 * @param {string} url - Public URL path
 * @returns {Object|null} File info or null
 */
export function getFileInfoFromUrl(url) {
    if (!url || !url.startsWith('/uploads/')) {
        return null;
    }

    const relativePath = url.replace('/uploads/', '');
    const fullPath = path.join(process.cwd(), UPLOAD_BASE_DIR, relativePath);

    if (!existsSync(fullPath)) {
        return null;
    }

    const filename = path.basename(relativePath);
    const ext = path.extname(filename).toLowerCase();

    return {
        url,
        path: fullPath,
        filename,
        extension: ext,
    };
}
