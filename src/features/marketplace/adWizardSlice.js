import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { adWizardService } from "@/services/marketplace";

const initialState = {
    activeStep: 0,
    draft: {},
    loading: false,
    verifyLoading: false,
    postcodeStatus: "idle",
    postcodeError: null,
    locationResults: [],
    locationLoading: false,
    locationError: null,
    verificationError: null,
    resendStatus: "idle",
    paymentData: null,
    listingId: null,
    isEditing: false,
    fetchingDraft: false,
};

export const verifyPostcode = createAsyncThunk(
    "marketplace/adWizard/verifyPostcode",
    async (postcode, { rejectWithValue }) => {
        try {
            const response = await adWizardService.verifyPostcode(postcode);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to verify postcode");
        }
    }
);

export const searchLiveLocation = createAsyncThunk(
    "marketplace/adWizard/searchLocation",
    async (query, { rejectWithValue }) => {
        try {
            const response = await adWizardService.searchLiveLocation(query);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to fetch locations");
        }
    }
);

export const createWizardListing = createAsyncThunk(
    "marketplace/adWizard/createListing",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adWizardService.createDraftListing(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to submit listing");
        }
    }
);

export const verifyListingPhone = createAsyncThunk(
    "marketplace/adWizard/verifyPhone",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await adWizardService.verifyListingPhone(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to verify phone");
        }
    }
);

export const resendVerificationCode = createAsyncThunk(
    "marketplace/adWizard/resendCode",
    async (adsId, { rejectWithValue }) => {
        try {
            const response = await adWizardService.resendVerificationCode(adsId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to resend verification code");
        }
    }
);

export const fetchWizardDraft = createAsyncThunk(
    "marketplace/adWizard/fetchDraft",
    async (id, { rejectWithValue }) => {
        try {
            const response = await adWizardService.fetchListingForEdit(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load listing data");
        }
    }
);

const adWizardSlice = createSlice({
    name: "marketplaceAdWizard",
    initialState,
    reducers: {
        goToStep(state, action) {
            state.activeStep = action.payload;
        },
        nextStep(state) {
            state.activeStep = state.activeStep + 1;
        },
        prevStep(state) {
            state.activeStep = Math.max(0, state.activeStep - 1);
        },
        setWizardDraft(state, action) {
            state.draft = {
                ...state.draft,
                ...action.payload,
            };
        },
        resetWizard() {
            return { ...initialState };
        },
        clearWizardErrors(state) {
            state.postcodeError = null;
            state.locationError = null;
            state.verificationError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyPostcode.pending, (state) => {
                state.postcodeStatus = "loading";
                state.postcodeError = null;
            })
            .addCase(verifyPostcode.fulfilled, (state, action) => {
                state.postcodeStatus = action.payload?.message === true ? "succeeded" : "failed";
            })
            .addCase(verifyPostcode.rejected, (state, action) => {
                state.postcodeStatus = "failed";
                state.postcodeError = action.payload;
            })

            .addCase(searchLiveLocation.pending, (state) => {
                state.locationLoading = true;
                state.locationError = null;
            })
            .addCase(searchLiveLocation.fulfilled, (state, action) => {
                state.locationLoading = false;
                state.locationResults = action.payload?.locationList || [];
            })
            .addCase(searchLiveLocation.rejected, (state, action) => {
                state.locationLoading = false;
                state.locationError = action.payload;
            })

            .addCase(createWizardListing.pending, (state) => {
                state.loading = true;
                state.verificationError = null;
            })
            .addCase(createWizardListing.fulfilled, (state, action) => {
                state.loading = false;
                state.draft = {
                    ...state.draft,
                    ...action.payload?.adsDetails,
                };
            })
            .addCase(createWizardListing.rejected, (state, action) => {
                state.loading = false;
                state.verificationError = action.payload;
            })

            .addCase(verifyListingPhone.pending, (state) => {
                state.verifyLoading = true;
                state.verificationError = null;
            })
            .addCase(verifyListingPhone.fulfilled, (state, action) => {
                state.verifyLoading = false;
                state.draft = {
                    ...state.draft,
                    ...action.payload,
                };
                if (action.payload) {
                    state.paymentData = action.payload;
                }
            })
            .addCase(verifyListingPhone.rejected, (state, action) => {
                state.verifyLoading = false;
                state.verificationError = action.payload;
            })

            .addCase(resendVerificationCode.pending, (state) => {
                state.resendStatus = "loading";
            })
            .addCase(resendVerificationCode.fulfilled, (state) => {
                state.resendStatus = "succeeded";
            })
            .addCase(resendVerificationCode.rejected, (state, action) => {
                state.resendStatus = "failed";
                state.verificationError = action.payload;
            })

            .addCase(fetchWizardDraft.pending, (state) => {
                state.fetchingDraft = true;
                state.verificationError = null;
            })
            .addCase(fetchWizardDraft.fulfilled, (state, action) => {
                state.fetchingDraft = false;
                state.isEditing = true;
                state.listingId = action.payload?.id || null;
                
                // Normalize listing data to wizard draft format
                const listing = action.payload;
                
                // Debug: Log full response to see structure
                console.log("[adWizardSlice] Full API response:", listing);
                console.log("[adWizardSlice] All listing keys:", Object.keys(listing || {}));
                
                if (listing) {
                    // Build full image URLs from listing path and image filenames
                    const buildImageUrls = (images, path) => {
                        if (!images) return null;
                        const base = (process.env.NEXT_PUBLIC_URL_KEY || process.env.NEXT_PUBLIC_ASSET_BASE_URL || "").replace(/\/+$/, "");
                        const normalizedPath = path ? `${path.replace(/\/+$/, "")}/` : "";
                        const imageArray = Array.isArray(images) ? images : [images];
                        return imageArray.map((img) => {
                            if (typeof img === "string" && img.startsWith("http")) {
                                return img;
                            }
                            return `${base}${normalizedPath}${img}`;
                        });
                    };

                    // Try multiple possible field names for type ID (check camelCase first since API uses it)
                    const typeId = listing.classifiedAdTypeId
                        || listing.classified_ad_type_id 
                        || listing.type_id 
                        || listing.ad_type_id 
                        || listing.typeId 
                        || listing.type?.id
                        || listing.adType?.id
                        || null;
                    
                    // Try multiple possible field names for category ID
                    // Check if category is a number first (API returns it as a number)
                    const categoryId = (typeof listing.category === 'number' || typeof listing.category === 'string') 
                        ? listing.category
                        : listing.category?.id
                        || listing.category?.category_id
                        || listing.classifiedAdCategoryId
                        || listing.classified_ad_category_id
                        || listing.category_id
                        || listing.ad_category_id
                        || listing.categoryId
                        || listing.adCategory?.id
                        || null;
                    
                    // Try multiple possible field names for type title
                    const typeTitle = listing.classifiedAdType
                        || listing.type_title
                        || listing.type?.title
                        || listing.adType?.title
                        || "";
                    
                    // Try multiple possible field names for category title
                    const categoryTitle = listing.categoryName
                        || listing.category_title
                        || listing.category?.title
                        || listing.adCategory?.title
                        || "";
                    
                    console.log("[adWizardSlice] Found typeId:", typeId, "from fields:", {
                        classifiedAdTypeId: listing.classifiedAdTypeId,
                        classified_ad_type_id: listing.classified_ad_type_id,
                        type_id: listing.type_id,
                        typeId: listing.typeId,
                        'type?.id': listing.type?.id,
                    });
                    
                    // Debug: Log the category object to see its structure
                    console.log("[adWizardSlice] category object:", listing.category);
                    console.log("[adWizardSlice] category object keys:", listing.category ? Object.keys(listing.category) : null);
                    
                    console.log("[adWizardSlice] Found categoryId:", categoryId, "from fields:", {
                        category: listing.category,
                        'category type': typeof listing.category,
                        classifiedAdCategoryId: listing.classifiedAdCategoryId,
                        'category?.id': listing.category?.id,
                        categoryName: listing.categoryName,
                        categorySlug: listing.categorySlug,
                    });

                    // Store categorySlug and categoryName for fallback lookup
                    const categorySlug = listing.categorySlug || listing.category?.slug || "";
                    const categoryName = listing.categoryName || listing.category?.name || "";

                    state.draft = {
                        postcode: listing.postcode || "",
                        typeId: typeId ? String(typeId) : "",
                        typeTitle: typeTitle,
                        categoryId: categoryId ? String(categoryId) : "",
                        categoryTitle: categoryTitle,
                        categorySlug: categorySlug, // Store for fallback lookup
                        categoryName: categoryName, // Store for fallback lookup
                        detailsForm: {
                            title: listing.title || "",
                            description: listing.description || "",
                            contactNumber: listing.contact_number || listing.mobile || "",
                            email: listing.email || "",
                            siteLink: listing.site_link || listing.website || "",
                            youtubeLink: listing.youtube_link || listing.youtube || "",
                            socialMediaLink: listing.social_media_link || listing.social_media || "",
                            eventDate: listing.event_date || "",
                            eventTime: listing.event_time || "",
                            price: listing.price || "",
                            images: buildImageUrls(listing.image, listing.path),
                            attributes: listing.attributes || {},
                        },
                    };

                    // Debug: Log draft state
                    console.log("[adWizardSlice] Draft set after fetchWizardDraft.fulfilled");
                    console.log("[adWizardSlice] listing.classified_ad_type_id:", listing.classified_ad_type_id);
                    console.log("[adWizardSlice] state.draft.typeId:", state.draft.typeId);
                    console.log("[adWizardSlice] state.draft.typeTitle:", state.draft.typeTitle);
                    
                    // Always start from step 0 (Postcode) when editing
                    // This allows users to review and update all steps
                    state.activeStep = 0;
                }
            })
            .addCase(fetchWizardDraft.rejected, (state, action) => {
                state.fetchingDraft = false;
                state.isEditing = false;
                state.listingId = null;
                state.verificationError = action.payload;
            });
    },
});

export const { goToStep, nextStep, prevStep, setWizardDraft, resetWizard, clearWizardErrors } = adWizardSlice.actions;

export default adWizardSlice.reducer;


