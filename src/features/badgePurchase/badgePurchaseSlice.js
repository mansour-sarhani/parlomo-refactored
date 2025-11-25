import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { badgePurchaseService } from "@/services/badgePurchase.service";

const normalizeError = (error, fallbackMessage) => {
    if (!error) {
        return fallbackMessage;
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

export const fetchBadgeIntro = createAsyncThunk(
    "badgePurchase/fetchIntro",
    async (_, { rejectWithValue }) => {
        try {
            const intro = await badgePurchaseService.getIntroContent();
            return intro;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load badge information.")
            );
        }
    }
);

export const fetchBadgePackages = createAsyncThunk(
    "badgePurchase/fetchPackages",
    async (_, { rejectWithValue }) => {
        try {
            const badges = await badgePurchaseService.getBadgePackages();
            return badges;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load badge packages.")
            );
        }
    }
);

export const fetchUserDirectories = createAsyncThunk(
    "badgePurchase/fetchDirectories",
    async (_, { rejectWithValue }) => {
        try {
            const directories = await badgePurchaseService.getUserDirectories();
            return directories;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load your directories.")
            );
        }
    }
);

export const submitBadgePurchase = createAsyncThunk(
    "badgePurchase/submit",
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState().badgePurchase;
            const payload = {
                badgePackage: state.selectedBadgeId,
                directory: state.selectedDirectoryId,
            };

            if (!payload.badgePackage || !payload.directory) {
                return rejectWithValue("Select a badge and directory first.");
            }

            const result = await badgePurchaseService.purchaseBadge(payload);
            return result;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to complete badge purchase.")
            );
        }
    }
);

const initialState = {
    intro: "",
    introLoading: false,
    introError: null,
    badges: [],
    badgesLoading: false,
    badgesError: null,
    directories: [],
    directoriesLoading: false,
    directoriesLoaded: false,
    directoriesError: null,
    currentStep: 0,
    started: false,
    selectedBadgeId: null,
    selectedDirectoryId: null,
    purchaseResult: null,
    submitting: false,
    submitError: null,
};

const badgePurchaseSlice = createSlice({
    name: "badgePurchase",
    initialState,
    reducers: {
        startWizard(state) {
            state.started = true;
            state.currentStep = 0;
            state.purchaseResult = null;
            state.submitError = null;
            state.selectedBadgeId = null;
            state.selectedDirectoryId = null;
        },
        resetWizard(state) {
            Object.assign(state, {
                ...initialState,
                intro: state.intro,
                introLoading: state.introLoading,
                introError: state.introError,
                badges: state.badges,
                badgesLoading: state.badgesLoading,
                badgesError: state.badgesError,
                directories: [],
                directoriesLoaded: false,
                directoriesLoading: false,
                directoriesError: null,
            });
        },
        setCurrentStep(state, action) {
            state.currentStep = action.payload;
        },
        selectBadge(state, action) {
            state.selectedBadgeId = action.payload;
            state.submitError = null;
        },
        selectDirectory(state, action) {
            state.selectedDirectoryId = action.payload;
            state.submitError = null;
        },
        goToNextStep(state) {
            state.currentStep = Math.min(state.currentStep + 1, 2);
        },
        goToPreviousStep(state) {
            state.currentStep = Math.max(state.currentStep - 1, 0);
        },
        clearSubmission(state) {
            state.purchaseResult = null;
            state.submitError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBadgeIntro.pending, (state) => {
                state.introLoading = true;
                state.introError = null;
            })
            .addCase(fetchBadgeIntro.fulfilled, (state, action) => {
                state.introLoading = false;
                state.intro = action.payload || "";
            })
            .addCase(fetchBadgeIntro.rejected, (state, action) => {
                state.introLoading = false;
                state.introError = action.payload;
            })

            .addCase(fetchBadgePackages.pending, (state) => {
                state.badgesLoading = true;
                state.badgesError = null;
            })
            .addCase(fetchBadgePackages.fulfilled, (state, action) => {
                state.badgesLoading = false;
                state.badges = Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(fetchBadgePackages.rejected, (state, action) => {
                state.badgesLoading = false;
                state.badgesError = action.payload;
            })

            .addCase(fetchUserDirectories.pending, (state) => {
                state.directoriesLoading = true;
                state.directoriesError = null;
            })
            .addCase(fetchUserDirectories.fulfilled, (state, action) => {
                state.directoriesLoading = false;
                state.directoriesLoaded = true;
                state.directories = Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(fetchUserDirectories.rejected, (state, action) => {
                state.directoriesLoading = false;
                state.directoriesLoaded = true;
                state.directoriesError = action.payload;
            })

            .addCase(submitBadgePurchase.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(submitBadgePurchase.fulfilled, (state, action) => {
                state.submitting = false;
                state.purchaseResult = action.payload;
                state.currentStep = 2;
            })
            .addCase(submitBadgePurchase.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            });
    },
});

export const {
    startWizard,
    resetWizard,
    setCurrentStep,
    selectBadge,
    selectDirectory,
    goToNextStep,
    goToPreviousStep,
    clearSubmission,
} = badgePurchaseSlice.actions;

export default badgePurchaseSlice.reducer;


