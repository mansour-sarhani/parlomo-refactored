import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reportsService } from "@/services/reports.service";

const normalizeError = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
    }

    if (typeof error === "string") {
        return error;
    }

    const responseData = error.response?.data;

    return (
        responseData?.message ||
        responseData?.error ||
        responseData?.errors?.[0] ||
        error.message ||
        fallbackMessage
    );
};

const parsePagination = (meta = {}, fallbackLimit = 10) => ({
    page: meta.current_page || 1,
    pages: meta.last_page || 0,
    total: meta.total || 0,
    limit: meta.per_page || fallbackLimit,
});

const createCollectionState = () => ({
    list: [],
    loading: false,
    error: null,
    pagination: {
        page: 1,
        pages: 0,
        total: 0,
        limit: 10,
    },
    links: {
        next: null,
        prev: null,
    },
    filters: {
        startDate: null,
        endDate: null,
    },
});

const initialState = {
    admin: createCollectionState(),
    user: createCollectionState(),
};

const applyCollectionPending = (stateSection) => {
    stateSection.loading = true;
    stateSection.error = null;
};

const applyCollectionFulfilled = (stateSection, payload) => {
    const data = payload || {};

    stateSection.loading = false;
    stateSection.list = data.data || [];
    stateSection.pagination = parsePagination(
        data.meta,
        stateSection.pagination.limit
    );
    stateSection.links.next = data.links?.next ?? null;
    stateSection.links.prev = data.links?.prev ?? null;
};

const applyCollectionRejected = (stateSection, error) => {
    stateSection.loading = false;
    stateSection.error = error;
};

export const fetchAdminReports = createAsyncThunk(
    "reports/fetchAdminReports",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await reportsService.listAdminInvoices(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load admin reports")
            );
        }
    }
);

export const fetchUserReports = createAsyncThunk(
    "reports/fetchUserReports",
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await reportsService.listUserInvoices(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load user reports")
            );
        }
    }
);

const reportsSlice = createSlice({
    name: "reports",
    initialState,
    reducers: {
        setAdminFilters(state, action) {
            state.admin.filters = {
                ...state.admin.filters,
                ...action.payload,
            };
        },
        setUserFilters(state, action) {
            state.user.filters = {
                ...state.user.filters,
                ...action.payload,
            };
        },
        setAdminPage(state, action) {
            state.admin.pagination.page = action.payload;
        },
        setUserPage(state, action) {
            state.user.pagination.page = action.payload;
        },
        clearAdminError(state) {
            state.admin.error = null;
        },
        clearUserError(state) {
            state.user.error = null;
        },
        resetAdminState(state) {
            state.admin = createCollectionState();
        },
        resetUserState(state) {
            state.user = createCollectionState();
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminReports.pending, (state) => {
                applyCollectionPending(state.admin);
            })
            .addCase(fetchAdminReports.fulfilled, (state, action) => {
                applyCollectionFulfilled(state.admin, action.payload);
            })
            .addCase(fetchAdminReports.rejected, (state, action) => {
                applyCollectionRejected(state.admin, action.payload);
            })
            .addCase(fetchUserReports.pending, (state) => {
                applyCollectionPending(state.user);
            })
            .addCase(fetchUserReports.fulfilled, (state, action) => {
                applyCollectionFulfilled(state.user, action.payload);
            })
            .addCase(fetchUserReports.rejected, (state, action) => {
                applyCollectionRejected(state.user, action.payload);
            });
    },
});

export const {
    setAdminFilters,
    setUserFilters,
    setAdminPage,
    setUserPage,
    clearAdminError,
    clearUserError,
    resetAdminState,
    resetUserState,
} = reportsSlice.actions;

export default reportsSlice.reducer;

