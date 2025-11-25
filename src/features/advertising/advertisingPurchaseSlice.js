import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { userAdvertisingService } from "@/services/advertising";

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

const ensureFileInstance = (file) => {
    if (file instanceof File || file instanceof Blob) {
        return file;
    }

    if (Array.isArray(file) && file.length > 0) {
        const first = file[0];
        if (first instanceof File || first instanceof Blob) {
            return first;
        }
    }

    return undefined;
};

const initialState = {
    intro: "",
    introLoading: false,
    introError: null,
    types: [],
    typesLoading: false,
    typesLoaded: false,
    typesError: null,
    packagesByType: {},
    packagesLoading: false,
    packagesError: null,
    packagesLoadingType: null,
    started: false,
    currentStep: 0,
    selectedTypeId: null,
    selectedPackageId: null,
    selectedPackage: null,
    includeSocialMedia: false,
    mediaDetails: {
        startDate: null,
        link: "",
        title: "",
        description: "",
    },
    purchaseResult: null,
    needsPayment: false,
    submitting: false,
    submitError: null,
};

export const fetchAdvertisingIntro = createAsyncThunk(
    "advertisingPurchase/fetchIntro",
    async (_, { rejectWithValue }) => {
        try {
            const intro = await userAdvertisingService.getIntroContent();
            return intro;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising intro")
            );
        }
    }
);

export const fetchAdvertisingTypes = createAsyncThunk(
    "advertisingPurchase/fetchTypes",
    async (_, { rejectWithValue }) => {
        try {
            const types = await userAdvertisingService.listTypes();
            return types;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising types")
            );
        }
    }
);

export const fetchAdvertisingPackages = createAsyncThunk(
    "advertisingPurchase/fetchPackages",
    async (typeId, { rejectWithValue }) => {
        try {
            const packages = await userAdvertisingService.listPackagesByType(typeId);
            return { typeId, packages };
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to load advertising packages")
            );
        }
    }
);

export const submitAdvertisingPurchase = createAsyncThunk(
    "advertisingPurchase/submit",
    async (payload, { getState, rejectWithValue }) => {
        try {
            const state = getState().advertisingPurchase;

            if (!state.selectedPackageId) {
                return rejectWithValue("Select an advertising package first.");
            }

            const file = ensureFileInstance(payload?.file);
            if (!file) {
                return rejectWithValue("Please upload your banner or video file.");
            }

            const purchasePayload = {
                packageId: state.selectedPackageId,
                startDate: payload?.startDate || state.mediaDetails.startDate,
                link: payload?.link ?? state.mediaDetails.link,
                title: payload?.title ?? state.mediaDetails.title,
                description: payload?.description ?? state.mediaDetails.description,
                socialMedia: state.includeSocialMedia,
                file,
            };

            const response = await userAdvertisingService.purchase(purchasePayload);
            return response;
        } catch (error) {
            return rejectWithValue(
                normalizeError(error, "Failed to complete advertising purchase")
            );
        }
    }
);

const advertisingPurchaseSlice = createSlice({
    name: "advertisingPurchase",
    initialState,
    reducers: {
        startWizard(state) {
            state.started = true;
            state.currentStep = 0;
            state.purchaseResult = null;
            state.submitError = null;
            state.mediaDetails = { ...initialState.mediaDetails };
        },
        resetWizard(state) {
            Object.assign(state, {
                ...initialState,
                intro: state.intro,
                introLoading: state.introLoading,
                introError: state.introError,
                types: state.types,
                typesLoading: state.typesLoading,
                typesLoaded: state.typesLoaded,
                typesError: state.typesError,
                packagesByType: state.packagesByType,
                packagesLoading: false,
                packagesError: null,
            });
        },
        setCurrentStep(state, action) {
            state.currentStep = action.payload;
        },
        selectType(state, action) {
            const typeId = action.payload ?? null;
            state.selectedTypeId = typeId;
            state.selectedPackageId = null;
            state.selectedPackage = null;
            state.includeSocialMedia = false;
            state.mediaDetails = { ...initialState.mediaDetails };
            state.packagesError = null;
            state.currentStep = 0;
        },
        selectPackage(state, action) {
            const packageId = action.payload ?? null;
            state.selectedPackageId = packageId;
            state.selectedPackage = null;
            if (!packageId || !state.selectedTypeId) {
                return;
            }

            const packages = state.packagesByType[state.selectedTypeId] || [];
            const matched = packages.find((item) => String(item.id) === String(packageId));
            state.selectedPackage = matched || null;
        },
        setIncludeSocialMedia(state, action) {
            state.includeSocialMedia = Boolean(action.payload);
        },
        setMediaDetails(state, action) {
            state.mediaDetails = {
                ...state.mediaDetails,
                ...action.payload,
            };
        },
        goToNextStep(state) {
            state.currentStep = Math.min(state.currentStep + 1, 3);
        },
        goToPreviousStep(state) {
            state.currentStep = Math.max(state.currentStep - 1, 0);
        },
        clearPurchaseResult(state) {
            state.purchaseResult = null;
            state.submitError = null;
            state.needsPayment = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdvertisingIntro.pending, (state) => {
                state.introLoading = true;
                state.introError = null;
            })
            .addCase(fetchAdvertisingIntro.fulfilled, (state, action) => {
                state.introLoading = false;
                state.intro = action.payload || "";
            })
            .addCase(fetchAdvertisingIntro.rejected, (state, action) => {
                state.introLoading = false;
                state.introError = action.payload;
            })

            .addCase(fetchAdvertisingTypes.pending, (state) => {
                state.typesLoading = true;
                state.typesError = null;
            })
            .addCase(fetchAdvertisingTypes.fulfilled, (state, action) => {
                state.typesLoading = false;
                state.typesLoaded = true;
                state.types = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchAdvertisingTypes.rejected, (state, action) => {
                state.typesLoading = false;
                state.typesLoaded = true;
                state.typesError = action.payload;
            })

            .addCase(fetchAdvertisingPackages.pending, (state, action) => {
                state.packagesLoading = true;
                state.packagesError = null;
                state.packagesLoadingType = action.meta?.arg ?? null;
            })
            .addCase(fetchAdvertisingPackages.fulfilled, (state, action) => {
                state.packagesLoading = false;
                state.packagesLoadingType = null;
                const { typeId, packages } = action.payload || {};
                if (!typeId) {
                    return;
                }

                state.packagesByType = {
                    ...state.packagesByType,
                    [typeId]: Array.isArray(packages) ? packages : [],
                };

                if (state.selectedTypeId && String(state.selectedTypeId) === String(typeId)) {
                    if (state.selectedPackageId) {
                        const matched = (Array.isArray(packages) ? packages : []).find(
                            (item) => String(item.id) === String(state.selectedPackageId)
                        );
                        state.selectedPackage = matched || null;
                        if (!matched) {
                            state.selectedPackageId = null;
                        }
                    }
                }
            })
            .addCase(fetchAdvertisingPackages.rejected, (state, action) => {
                state.packagesLoading = false;
                state.packagesLoadingType = null;
                state.packagesError = action.payload;
            })

            .addCase(submitAdvertisingPurchase.pending, (state) => {
                state.submitting = true;
                state.submitError = null;
            })
            .addCase(submitAdvertisingPurchase.fulfilled, (state, action) => {
                state.submitting = false;
                state.purchaseResult = action.payload || null;
                state.needsPayment = Boolean(
                    action.payload?.needToPay || action.payload?.needToPay === 1
                );
                state.currentStep = 3;
            })
            .addCase(submitAdvertisingPurchase.rejected, (state, action) => {
                state.submitting = false;
                state.submitError = action.payload;
            });
    },
});

export const {
    startWizard,
    resetWizard,
    setCurrentStep,
    selectType,
    selectPackage,
    setIncludeSocialMedia,
    setMediaDetails,
    goToNextStep,
    goToPreviousStep,
    clearPurchaseResult,
} = advertisingPurchaseSlice.actions;

export default advertisingPurchaseSlice.reducer;
