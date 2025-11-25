import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { businessBadgesService } from "@/services/businesses";

const initialState = {
    packagesByType: {},
    loading: false,
    purchasing: false,
    error: null,
    purchaseError: null,
    purchaseResult: null,
};

export const fetchBusinessBadgePackages = createAsyncThunk(
    "businessBadges/fetchByType",
    async (type, { rejectWithValue }) => {
        try {
            const response = await businessBadgesService.fetchPackages(type);
            return { type, data: response.data };
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load badge packages");
        }
    }
);

export const purchaseBusinessBadge = createAsyncThunk(
    "businessBadges/purchase",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessBadgesService.purchaseBadge(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to purchase badge");
        }
    }
);

const businessBadgesSlice = createSlice({
    name: "businessBadges",
    initialState,
    reducers: {
        clearBadgeErrors(state) {
            state.error = null;
            state.purchaseError = null;
        },
        clearPurchaseResult(state) {
            state.purchaseResult = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinessBadgePackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinessBadgePackages.fulfilled, (state, action) => {
                state.loading = false;
                const { type, data } = action.payload || {};
                const payloadData = data?.data ?? data ?? [];
                if (type) {
                    state.packagesByType[type] = payloadData;
                } else {
                    state.packagesByType = {
                        ...state.packagesByType,
                        default: payloadData,
                    };
                }
            })
            .addCase(fetchBusinessBadgePackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(purchaseBusinessBadge.pending, (state) => {
                state.purchasing = true;
                state.purchaseError = null;
            })
            .addCase(purchaseBusinessBadge.fulfilled, (state, action) => {
                state.purchasing = false;
                state.purchaseResult = action.payload || null;
            })
            .addCase(purchaseBusinessBadge.rejected, (state, action) => {
                state.purchasing = false;
                state.purchaseError = action.payload;
            });
    },
});

export const { clearBadgeErrors, clearPurchaseResult } = businessBadgesSlice.actions;

export default businessBadgesSlice.reducer;


