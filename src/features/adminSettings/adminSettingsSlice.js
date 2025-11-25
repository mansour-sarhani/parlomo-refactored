"use client";

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adminSettingsService } from "@/services/adminSettings.service";

const getErrorMessage = (error, fallback = "Something went wrong") => {
    if (!error) {
        return fallback;
    }

    if (typeof error === "string") {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    if (error?.response?.data?.message) {
        return error.response.data.message;
    }

    return fallback;
};

export const fetchAdminSetting = createAsyncThunk(
    "adminSettings/fetchSetting",
    async ({ key }, { rejectWithValue }) => {
        try {
            const value = await adminSettingsService.fetchSetting(key);
            return { key, value };
        } catch (error) {
            return rejectWithValue({ key, message: getErrorMessage(error, "Failed to load setting") });
        }
    }
);

export const updateAdminSetting = createAsyncThunk(
    "adminSettings/updateSetting",
    async ({ key, value }, { rejectWithValue }) => {
        try {
            const updatedValue = await adminSettingsService.updateSetting({ key, value });
            return { key, value: updatedValue || value };
        } catch (error) {
            return rejectWithValue({ key, message: getErrorMessage(error, "Failed to update setting") });
        }
    }
);

const ensureEntry = (state, key) => {
    if (!state.entries[key]) {
        state.entries[key] = {
            value: "",
            loading: false,
            saving: false,
            error: null,
            lastFetched: null,
            lastUpdated: null,
        };
    }

    return state.entries[key];
};

const initialState = {
    entries: {},
};

const adminSettingsSlice = createSlice({
    name: "adminSettings",
    initialState,
    reducers: {
        clearAdminSettingError(state, action) {
            const { key } = action.payload ?? {};
            if (!key) return;
            const entry = ensureEntry(state, key);
            entry.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdminSetting.pending, (state, action) => {
                const { key } = action.meta.arg;
                const entry = ensureEntry(state, key);
                entry.loading = true;
                entry.error = null;
            })
            .addCase(fetchAdminSetting.fulfilled, (state, action) => {
                const { key, value } = action.payload;
                const entry = ensureEntry(state, key);
                entry.value = value ?? "";
                entry.loading = false;
                entry.error = null;
                entry.lastFetched = Date.now();
            })
            .addCase(fetchAdminSetting.rejected, (state, action) => {
                const { key, message } = action.payload || {};
                if (!key) return;
                const entry = ensureEntry(state, key);
                entry.loading = false;
                entry.error = message ?? "Failed to load setting";
            })
            .addCase(updateAdminSetting.pending, (state, action) => {
                const { key } = action.meta.arg;
                const entry = ensureEntry(state, key);
                entry.saving = true;
            })
            .addCase(updateAdminSetting.fulfilled, (state, action) => {
                const { key, value } = action.payload;
                const entry = ensureEntry(state, key);
                entry.value = value ?? "";
                entry.saving = false;
                entry.error = null;
                entry.lastUpdated = Date.now();
            })
            .addCase(updateAdminSetting.rejected, (state, action) => {
                const { key, message } = action.payload || {};
                if (!key) return;
                const entry = ensureEntry(state, key);
                entry.saving = false;
                entry.error = message ?? "Failed to update setting";
            });
    },
});

export const { clearAdminSettingError } = adminSettingsSlice.actions;

export const selectAdminSetting = (state, key) => state.adminSettings?.entries?.[key] ?? null;

export const selectAdminSettingsState = (state) => state.adminSettings ?? initialState;

export default adminSettingsSlice.reducer;


