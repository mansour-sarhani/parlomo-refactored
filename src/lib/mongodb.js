/**
 * @fileoverview MongoDB Connection Module
 * Singleton connection pattern for Next.js with connection pooling
 * Handles both development and production environments
 */

import mongoose from 'mongoose';

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.DEV_MONGO_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the DEV_MONGO_URI or MONGO_URI environment variable inside .env.local'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB
 * @returns {Promise<typeof mongoose>} Mongoose connection
 */
async function connectDB() {
    // Return existing connection if available
    if (cached.conn) {
        console.log('✅ Using cached MongoDB connection');
        return cached.conn;
    }

    // Return existing promise if connection is in progress
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
            minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        console.log('🔄 Connecting to MongoDB...');
        console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***@')}`); // Hide credentials in logs

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('✅ MongoDB connected successfully');
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }

    return cached.conn;
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or graceful shutdown
 */
async function disconnectDB() {
    if (cached.conn) {
        await cached.conn.disconnect();
        cached.conn = null;
        cached.promise = null;
        console.log('🔌 MongoDB disconnected');
    }
}

/**
 * Get connection status
 * @returns {string} Connection state
 */
function getConnectionStatus() {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };

    const state = mongoose.connection.readyState;
    return states[state] || 'unknown';
}

/**
 * Check if MongoDB is connected
 * @returns {boolean} Connection status
 */
function isConnected() {
    return mongoose.connection.readyState === 1;
}

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
if (process.env.NODE_ENV !== 'production') {
    process.on('SIGINT', async () => {
        await disconnectDB();
        process.exit(0);
    });
}

export { connectDB, disconnectDB, getConnectionStatus, isConnected };
export default connectDB;
