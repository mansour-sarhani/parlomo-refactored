import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "@/services/user.service";

// Async thunks for API calls
export const fetchUsers = createAsyncThunk(
    "users/fetchUsers",
    async (params, { rejectWithValue }) => {
        try {
            const response = await userService.getUsers(params);
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || error.message || "Failed to fetch users";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    list: [],
    currentUser: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    links: {
        next: null,
        prev: null,
    },
    filters: {
        name: "",
        username: "",
        publicName: "",
    },
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        // Synchronous actions
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setPage: (state, action) => {
            state.pagination.page = action.payload;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch users
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                
                // Handle backend response structure: { data, links, meta }
                state.list = action.payload.data;
                state.pagination.page = action.payload.meta.current_page;
                state.pagination.pages = action.payload.meta.last_page;
                state.pagination.total = action.payload.meta.total;
                state.pagination.limit = action.payload.meta.per_page ?? state.pagination.limit;
                state.links.next = action.payload.links?.next || null;
                state.links.prev = action.payload.links?.prev || null;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

    },
});

export const { setFilters, setPage, clearCurrentUser, clearError } = usersSlice.actions;

export default usersSlice.reducer;
