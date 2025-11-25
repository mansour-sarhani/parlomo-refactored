import { api } from "@/lib/axios";

/**
 * Chat Service
 * Mirrors legacy Laravel endpoints used by the original admin panel chat feature.
 * These helpers provide a typed wrapper around the existing REST endpoints so the
 * refactored app can keep endpoint contracts stable while modernising the UI/state.
 */

/**
 * Fetch all conversations for the authenticated admin user.
 * @returns {Promise<any>} Conversations payload from backend.
 */
export const getConversations = async () => {
    const response = await api.get("/api/conversations");
    return response.data;
};

/**
 * Load messages for a specific conversation thread.
 * @param {string} conversationId
 * @returns {Promise<any>} Messages payload.
 */
export const loadConversation = async (conversationId) => {
    const response = await api.post("/api/conversations/loadMessage", {
        id: conversationId,
    });
    return response.data;
};

/**
 * Send a message to a user by their public id.
 * The backend resolves the conversation and returns the updated thread meta.
 * @param {{ publicId: string, message: string }} payload
 * @returns {Promise<any>} Backend response including conversation identifiers.
 */
export const sendMessageToPublicId = async ({ publicId, message }) => {
    const payloadId = publicId?.startsWith("@") ? publicId.slice(1) : publicId;
    const response = await api.post("/api/conversations/sendMessageToUserByUserId", {
        id: payloadId,
        message,
    });
    return response.data;
};

/**
 * Delete an entire conversation by its id.
 * @param {string} conversationId
 * @returns {Promise<any>}
 */
export const deleteConversationById = async (conversationId) => {
    const response = await api.post("/api/conversations/deleteByConversationsById", {
        id: conversationId,
    });
    return response.data;
};

/**
 * Check whether the current admin user has a public id assigned.
 * Required before opening chat threads.
 * @returns {Promise<any>}
 */
export const checkUserPublicId = async () => {
    const response = await api.get("/api/user/userHasPublicId");
    return response.data;
};

/**
 * Lookup users by partial public id when starting a new chat thread.
 * @param {{ publicId: string }} payload
 * @returns {Promise<any>}
 */
export const searchUsersByPublicId = async (payload) => {
    const response = await api.post("/api/user/publicIdAutocomplete", payload);
    return response.data;
};

/**
 * Fetch user/contact details and related conversation (if exists) by public id.
 * @param {string} publicId Without the leading @ – backend expects { publicId: "@value" }.
 * @returns {Promise<any>}
 */
export const getUserByPublicId = async (publicId) => {
    const response = await api.post("/api/user/get-user-public", {
        publicId: `@${publicId}`,
    });
    return response.data;
};


