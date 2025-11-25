import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
    checkUserPublicId,
    deleteConversationById,
    getConversations,
    getUserByPublicId,
    loadConversation,
    searchUsersByPublicId,
    sendMessageToPublicId,
} from "@/services/chat/chat.service";

const mapErrorMessage = (error, fallbackMessage) =>
    error?.message || error?.statusText || fallbackMessage;

const initialState = {
    conversations: {
        items: [],
        loading: false,
        error: null,
    },
    activeConversationId: null,
    messages: {
        items: [],
        loading: false,
        error: null,
    },
    contact: null,
    hasPublicId: {
        status: null,
        message: null,
        loading: false,
        error: null,
    },
    search: {
        query: "",
        results: [],
        loading: false,
        error: null,
    },
    sendStatus: "idle",
    deleteStatus: "idle",
};

// --- Async Thunks -----------------------------------------------------------

export const fetchConversations = createAsyncThunk(
    "chat/fetchConversations",
    async (_, { rejectWithValue }) => {
        try {
            const data = await getConversations();
            return data?.data ?? [];
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to load conversations"));
        }
    }
);

export const fetchConversationMessages = createAsyncThunk(
    "chat/fetchConversationMessages",
    async (conversationId, { rejectWithValue }) => {
        try {
            if (!conversationId) {
                throw new Error("Conversation id is required");
            }
            const response = await loadConversation(conversationId);
            return response?.data ?? {};
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to load conversation"));
        }
    }
);

export const sendMessage = createAsyncThunk(
    "chat/sendMessage",
    async ({ publicId, message }, { dispatch, rejectWithValue }) => {
        try {
            const response = await sendMessageToPublicId({ publicId, message });
            const conversationId =
                response?.data?.conversation_id ?? response?.conversation_id ?? null;

            if (conversationId) {
                // Refresh conversation details
                dispatch(fetchConversationMessages(conversationId));
            }

            // Refresh list so unread counts stay up to date
            dispatch(fetchConversations());

            return {
                raw: response,
                conversationId,
            };
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to send message"));
        }
    }
);

export const deleteConversation = createAsyncThunk(
    "chat/deleteConversation",
    async (conversationId, { dispatch, rejectWithValue }) => {
        try {
            await deleteConversationById(conversationId);
            dispatch(fetchConversations());
            return conversationId;
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to delete conversation"));
        }
    }
);

export const ensureUserHasPublicId = createAsyncThunk(
    "chat/ensureUserHasPublicId",
    async (_, { rejectWithValue }) => {
        try {
            const response = await checkUserPublicId();
            return response;
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to validate public id"));
        }
    }
);

export const searchContactsByPublicId = createAsyncThunk(
    "chat/searchContactsByPublicId",
    async (query, { rejectWithValue }) => {
        try {
            const response = await searchUsersByPublicId({ publicId: query });
            return {
                query,
                results: response?.data ?? [],
            };
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to search users"));
        }
    }
);

export const fetchContactByPublicId = createAsyncThunk(
    "chat/fetchContactByPublicId",
    async (publicId, { dispatch, rejectWithValue }) => {
        try {
            const response = await getUserByPublicId(publicId);

            if (response?.conversation) {
                dispatch(fetchConversationMessages(response.conversation));
            }

            return response;
        } catch (error) {
            return rejectWithValue(mapErrorMessage(error, "Failed to fetch user"));
        }
    }
);

// --- Slice -----------------------------------------------------------------

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setActiveConversationId: (state, action) => {
            state.activeConversationId = action.payload;
        },
        setContact: (state, action) => {
            state.contact = action.payload;
        },
        clearMessages: (state) => {
            state.messages.items = [];
            state.messages.error = null;
        },
        appendIncomingMessage: (state, action) => {
            state.messages.items.push(action.payload);
        },
        resetSearchResults: (state) => {
            state.search.results = [];
            state.search.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Conversations -----------------------------------------------------
            .addCase(fetchConversations.pending, (state) => {
                state.conversations.loading = true;
                state.conversations.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversations.loading = false;
                state.conversations.items = action.payload ?? [];
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.conversations.loading = false;
                state.conversations.error = action.payload;
            })

            // Conversation messages --------------------------------------------
            .addCase(fetchConversationMessages.pending, (state) => {
                state.messages.loading = true;
                state.messages.error = null;
            })
            .addCase(fetchConversationMessages.fulfilled, (state, action) => {
                state.messages.loading = false;
                state.messages.items = action.payload?.messages ?? [];

                if (action.meta?.arg) {
                    state.activeConversationId = action.meta.arg;
                }
            })
            .addCase(fetchConversationMessages.rejected, (state, action) => {
                state.messages.loading = false;
                state.messages.error = action.payload;
            })

            // Send message ------------------------------------------------------
            .addCase(sendMessage.pending, (state) => {
                state.sendStatus = "loading";
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.sendStatus = "succeeded";
                if (action.payload?.conversationId) {
                    state.activeConversationId = action.payload.conversationId;
                }
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.sendStatus = "failed";
                state.messages.error = action.payload;
            })

            // Delete conversation ----------------------------------------------
            .addCase(deleteConversation.pending, (state) => {
                state.deleteStatus = "loading";
            })
            .addCase(deleteConversation.fulfilled, (state, action) => {
                state.deleteStatus = "succeeded";
                if (state.activeConversationId === action.payload) {
                    state.activeConversationId = null;
                    state.messages.items = [];
                }
            })
            .addCase(deleteConversation.rejected, (state, action) => {
                state.deleteStatus = "failed";
                state.conversations.error = action.payload;
            })

            // Public id check ---------------------------------------------------
            .addCase(ensureUserHasPublicId.pending, (state) => {
                state.hasPublicId.loading = true;
                state.hasPublicId.error = null;
            })
            .addCase(ensureUserHasPublicId.fulfilled, (state, action) => {
                state.hasPublicId.loading = false;
                state.hasPublicId.status = action.payload?.status ?? null;
                state.hasPublicId.message = action.payload?.message ?? null;
            })
            .addCase(ensureUserHasPublicId.rejected, (state, action) => {
                state.hasPublicId.loading = false;
                state.hasPublicId.error = action.payload;
            })

            // Search ------------------------------------------------------------
            .addCase(searchContactsByPublicId.pending, (state) => {
                state.search.loading = true;
                state.search.error = null;
            })
            .addCase(searchContactsByPublicId.fulfilled, (state, action) => {
                state.search.loading = false;
                state.search.query = action.payload?.query ?? "";
                state.search.results = action.payload?.results ?? [];
            })
            .addCase(searchContactsByPublicId.rejected, (state, action) => {
                state.search.loading = false;
                state.search.error = action.payload;
            })

            // Contact info ------------------------------------------------------
            .addCase(fetchContactByPublicId.pending, (state) => {
                state.messages.loading = true;
                state.messages.error = null;
            })
            .addCase(fetchContactByPublicId.fulfilled, (state, action) => {
                state.messages.loading = false;

                const user = action.payload?.user ?? null;
                const conversationId = action.payload?.conversation ?? null;

                state.contact = user
                    ? {
                          name: user?.name,
                          publicId: user?.publicId,
                          avatar: user?.avatar,
                          path: user?.path,
                      }
                    : null;

                if (conversationId) {
                    state.activeConversationId = conversationId;
                } else {
                    state.activeConversationId = null;
                    state.messages.items = [];
                }
            })
            .addCase(fetchContactByPublicId.rejected, (state, action) => {
                state.messages.loading = false;
                state.messages.error = action.payload;
            });
    },
});

export const {
    setActiveConversationId,
    setContact,
    clearMessages,
    appendIncomingMessage,
    resetSearchResults,
} = chatSlice.actions;

export const selectChatState = (state) => state.chat;
export const selectChatConversations = (state) => state.chat.conversations;
export const selectChatMessages = (state) => state.chat.messages;
export const selectChatContact = (state) => state.chat.contact;
export const selectChatPublicIdStatus = (state) => state.chat.hasPublicId;

export default chatSlice.reducer;


