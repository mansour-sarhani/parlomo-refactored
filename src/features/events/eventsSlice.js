import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { eventsService } from "@/services/events.service";

const initialState = {
    list: [],
    currentEvent: null,
    loading: false,
    creating: false,
    updating: false,
    fetchingSingle: false,
    categories: [],
    categoriesLoading: false,
    categoriesLoaded: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    filters: {
        name: "",
        category: "",
    },
    links: {
        next: null,
        prev: null,
    },
};

export const fetchEvents = createAsyncThunk(
    "events/fetchList",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await eventsService.getEvents(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load events");
        }
    }
);

export const fetchEventById = createAsyncThunk(
    "events/fetchById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await eventsService.getEventById(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load event");
        }
    }
);

export const createEvent = createAsyncThunk(
    "events/create",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await eventsService.createEvent(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create event");
        }
    }
);

export const updateEvent = createAsyncThunk(
    "events/update",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await eventsService.updateEvent(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update event");
        }
    }
);

export const fetchEventCategories = createAsyncThunk(
    "events/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await eventsService.getEventCategories();
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load event categories");
        }
    }
);

const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers: {
        setFilters(state, action) {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        setPage(state, action) {
            state.pagination.page = action.payload;
        },
        clearCurrentEvent(state) {
            state.currentEvent = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload || {};
                state.list = payload.data || [];
                const meta = payload.meta || {};
                state.pagination.page = meta.current_page || 1;
                state.pagination.pages = meta.last_page || 0;
                state.pagination.total = meta.total || 0;
                state.pagination.limit = meta.per_page || state.pagination.limit;
                state.links.next = payload.links?.next ?? null;
                state.links.prev = payload.links?.prev ?? null;
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchEventById.pending, (state) => {
                state.fetchingSingle = true;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.fetchingSingle = false;
                state.currentEvent = action.payload || null;
            })
            .addCase(fetchEventById.rejected, (state) => {
                state.fetchingSingle = false;
            })

            .addCase(createEvent.pending, (state) => {
                state.creating = true;
            })
            .addCase(createEvent.fulfilled, (state) => {
                state.creating = false;
            })
            .addCase(createEvent.rejected, (state) => {
                state.creating = false;
            })

            .addCase(updateEvent.pending, (state) => {
                state.updating = true;
            })
            .addCase(updateEvent.fulfilled, (state) => {
                state.updating = false;
            })
            .addCase(updateEvent.rejected, (state) => {
                state.updating = false;
            })

            .addCase(fetchEventCategories.pending, (state) => {
                state.categoriesLoading = true;
            })
            .addCase(fetchEventCategories.fulfilled, (state, action) => {
                state.categoriesLoading = false;
                state.categoriesLoaded = true;
                state.categories = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchEventCategories.rejected, (state) => {
                state.categoriesLoading = false;
            });
    },
});

export const { setFilters, setPage, clearCurrentEvent, clearError } = eventsSlice.actions;

export default eventsSlice.reducer;

