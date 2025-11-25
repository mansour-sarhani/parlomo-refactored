import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { businessWizardService } from "@/services/businesses";

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === "") return [];
    return [value];
};

// Helper to build full image URL from path and filename
const buildImageUrl = (basePath, filename) => {
    if (!filename) return null;
    // If already a full URL, return as is
    if (typeof filename === "string" && filename.startsWith("http")) {
        return filename;
    }
    const baseAssetUrl = (process.env.NEXT_PUBLIC_URL_KEY || "").replace(/\/+$/, "");
    const normalizedPath = basePath ? `${basePath.replace(/^\/+/, "").replace(/\/+$/, "")}/` : "";
    return `${baseAssetUrl}${normalizedPath ? "/" + normalizedPath : ""}${filename}`;
};

const normalizeDraft = (data = {}) => {
    // Debug: Log raw API response
    console.log("[normalizeDraft] Raw API data:", data);
    
    const basePath = data.path || "";
    const certificatesPath = data.certificatesPath || data.certificates_path || basePath;

    // Ensure we have 7 days
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const rawHours = Array.isArray(data.businessHours)
        ? data.businessHours
        : Array.isArray(data.business_hours)
        ? data.business_hours
        : [];

    const normalizedHours = rawHours.map((entry, index) => {
        // Debug: Log each hour entry
        console.log(`[normalizeDraft] Hour entry ${index}:`, entry);
        // Handle null values explicitly - convert null to empty string for time fields
        const fromTime = entry.open ?? entry.from;
        const toTime = entry.close ?? entry.to;
        return {
            day: entry.day ?? entry.title ?? daysOfWeek[index] ?? "",
            closed: Boolean(entry.closed ?? (entry.isClosed === true || entry.isClosed === "true")),
            open: fromTime != null ? String(fromTime) : "",
            close: toTime != null ? String(toTime) : "",
        };
    });
    while (normalizedHours.length < 7) {
        normalizedHours.push({
            day: daysOfWeek[normalizedHours.length],
            closed: false,
            open: "09:00",
            close: "17:00",
        });
    }

    const rawFaqs = Array.isArray(data.faqs)
        ? data.faqs
        : Array.isArray(data.faq)
        ? data.faq
        : Array.isArray(data.FAQS)
        ? data.FAQS
        : [];

    // Build image URLs
    const logoFilename = data.logo ?? data.logo_path ?? null;
    const logoUrl = logoFilename ? buildImageUrl(basePath, logoFilename) : null;

    const rawImages = toArray(data.images ?? data.image ?? []);
    const imageUrls = rawImages.map((img) => {
        if (typeof img === "string" && img.startsWith("http")) {
            return img;
        }
        return buildImageUrl(basePath, img);
    });

    // Build certificate image URLs
    const rawCertificates = toArray(data.certificates ?? data.documents ?? []);
    const normalizedCertificates = rawCertificates.map((cert) => {
        const certImageFilename = cert.image ?? cert.image_path ?? null;
        const certImageUrl = certImageFilename ? buildImageUrl(certificatesPath, certImageFilename) : null;
        return {
            ...cert,
            image: certImageUrl,
            imageFilename: certImageFilename, // Keep original filename for updates
        };
    });

    // Debug: Check for tags/keywords in various possible field names
    const possibleTagFields = {
        tags: data.tags,
        tag_list: data.tag_list,
        keywords: data.keywords,
        tag: data.tag,
        keyword: data.keyword,
    };
    console.log("[normalizeDraft] Possible tag fields:", possibleTagFields);
    const tagsValue = data.tags ?? data.tag_list ?? data.keywords ?? data.tag ?? data.keyword ?? "";

    const normalized = {
        id: data.id ?? null,
        title: data.title ?? data.name ?? "",
        shortDescription: data.shortDescription ?? data.short_description ?? "",
        description: data.description ?? "",
        contactNumber: data.contactNumber ?? data.contact_number ?? "",
        email: data.email ?? "",
        siteLink: data.siteLink ?? data.site_link ?? data.website ?? "",
        socialMediaLink: data.socialMediaLink ?? data.social_media_link ?? "",
        youtubeLink: data.youtubeLink ?? data.youtube_link ?? "",
        fullAddress: data.fullAddress ?? data.full_address ?? data.address ?? "",
        postcode: data.postcode ?? data.post_code ?? "",
        location: data.location ?? data.city ?? data.town ?? "",
        showOnMap: data.showOnMap ?? data.show_on_map ?? data.showMap ?? false,
        verifyMobile: data.verifyMobile ?? data.mobile_to_verify ?? data.mobileToVerify ?? data.contactNumber ?? "",
        logo: logoUrl,
        logoFilename: logoFilename, // Keep original filename for updates
        images: imageUrls,
        imageFilenames: rawImages, // Keep original filenames for updates
        categoryId: data.categoryId ?? data.category_id ?? "",
        categoryName: data.categoryName ?? data.category_name ?? "",
        categoryParentId: data.categoryParentId ?? data.cat_parent_id ?? "",
        subCategoryId: data.subCategoryId ?? data.sub_category_id ?? "",
        subCategoryName: data.subCategoryName ?? data.sub_category_name ?? "",
        tags: tagsValue,
        is24h: Boolean(data.is24h ?? data.is_24h),
        businessHours: normalizedHours,
        faqs: rawFaqs,
        certificates: normalizedCertificates,
        verifyBadgeId: data.verifyBadgeId ?? data.verifyBadge ?? data.verify_badge ?? "",
        sponsorBadgeId:
            data.sponsorBadgeId ?? data.sponsoredBadge ?? data.sponsored_badge ?? data.sponsoreBadge ?? "",
        isVerifiedBusiness: data.isVerifiedBusiness ?? data.is_verified_business ?? false,
        isSponsored: data.isSponsored ?? data.is_sponsored ?? false,
        validDate: data.validDate ?? data.valid_date ?? "",
        path: basePath, // Store path for reference
        certificatesPath: certificatesPath, // Store certificates path for reference
    };

    // Debug: Log normalized result
    console.log("[normalizeDraft] Normalized draft:", normalized);
    
    return normalized;
};

const initialState = {
    activeStep: 0,
    draft: {},
    loading: false,
    listingId: null,
    isEditing: false,
    submissionStatus: "idle",
    updateStatus: "idle",
    postcodeStatus: "idle",
    postcodeError: null,
    locationResults: [],
    locationLoading: false,
    locationError: null,
    categoryChildren: [],
    categoryChildrenLoading: false,
    categoryChildrenError: null,
    verificationStatus: "idle",
    verificationError: null,
    verifyLoading: false,
    resendStatus: "idle",
};

export const verifyBusinessPostcode = createAsyncThunk(
    "businessWizard/verifyPostcode",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.verifyPostcode(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to verify postcode");
        }
    }
);

export const searchBusinessLocations = createAsyncThunk(
    "businessWizard/searchLocations",
    async (query, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.searchLiveLocation(query);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load locations");
        }
    }
);

export const checkBusinessCategoryChildren = createAsyncThunk(
    "businessWizard/checkCategoryChildren",
    async (categoryId, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.checkCategoryChildren(categoryId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load category children");
        }
    }
);

export const createBusinessWizardListing = createAsyncThunk(
    "businessWizard/createListing",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.createBusiness(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to submit business");
        }
    }
);

export const updateBusinessWizardListing = createAsyncThunk(
    "businessWizard/updateListing",
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.updateBusiness(id, changes);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to update business");
        }
    }
);

export const verifyBusinessPhone = createAsyncThunk(
    "businessWizard/verifyPhone",
    async (payload, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.verifyPhone(payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to verify phone number");
        }
    }
);

export const resendBusinessVerificationCode = createAsyncThunk(
    "businessWizard/resendVerificationCode",
    async (directoryId, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.resendVerificationCode(directoryId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to resend verification code");
        }
    }
);

export const fetchBusinessWizardDraft = createAsyncThunk(
    "businessWizard/fetchDraft",
    async (id, { rejectWithValue }) => {
        try {
            const response = await businessWizardService.fetchOwnBusiness(id);
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to load business draft");
        }
    }
);

const businessWizardSlice = createSlice({
    name: "businessWizard",
    initialState,
    reducers: {
        goToBusinessWizardStep(state, action) {
            state.activeStep = action.payload;
        },
        nextBusinessWizardStep(state) {
            state.activeStep = state.activeStep + 1;
        },
        prevBusinessWizardStep(state) {
            state.activeStep = Math.max(0, state.activeStep - 1);
        },
        setBusinessWizardDraft(state, action) {
            state.draft = {
                ...state.draft,
                ...action.payload,
            };
        },
        resetBusinessWizard() {
            return { ...initialState };
        },
        clearBusinessWizardErrors(state) {
            state.postcodeError = null;
            state.locationError = null;
            state.categoryChildrenError = null;
            state.verificationError = null;
            state.verificationStatus = "idle";
            state.verifyLoading = false;
            state.resendStatus = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(verifyBusinessPostcode.pending, (state) => {
                state.postcodeStatus = "loading";
                state.postcodeError = null;
            })
            .addCase(verifyBusinessPostcode.fulfilled, (state, action) => {
                state.postcodeStatus = action.payload?.message === true ? "succeeded" : "failed";
            })
            .addCase(verifyBusinessPostcode.rejected, (state, action) => {
                state.postcodeStatus = "failed";
                state.postcodeError = action.payload;
            })

            .addCase(searchBusinessLocations.pending, (state) => {
                state.locationLoading = true;
                state.locationError = null;
            })
            .addCase(searchBusinessLocations.fulfilled, (state, action) => {
                state.locationLoading = false;
                state.locationResults = action.payload?.locationList || [];
            })
            .addCase(searchBusinessLocations.rejected, (state, action) => {
                state.locationLoading = false;
                state.locationError = action.payload;
            })

            .addCase(checkBusinessCategoryChildren.pending, (state) => {
                state.categoryChildrenLoading = true;
                state.categoryChildrenError = null;
            })
            .addCase(checkBusinessCategoryChildren.fulfilled, (state, action) => {
                state.categoryChildrenLoading = false;
                state.categoryChildren = action.payload?.data || [];
            })
            .addCase(checkBusinessCategoryChildren.rejected, (state, action) => {
                state.categoryChildrenLoading = false;
                state.categoryChildrenError = action.payload;
            })

            .addCase(createBusinessWizardListing.pending, (state) => {
                state.loading = true;
                state.submissionStatus = "loading";
                state.verificationError = null;
            })
            .addCase(createBusinessWizardListing.fulfilled, (state, action) => {
                state.loading = false;
                state.submissionStatus = "succeeded";
                // API response has business data nested in "Directrory" (typo in API)
                const businessData = action.payload?.Directrory || action.payload?.Directory || action.payload;
                // Try multiple possible ID fields from the response
                const responseId = businessData?.id 
                    || action.payload?.id 
                    || action.payload?.directoryId 
                    || action.payload?.data?.id 
                    || action.payload?.data?.directoryId;
                if (responseId) {
                    state.listingId = String(responseId);
                }
                state.isEditing = true;
                state.verificationStatus = "pending";
                state.verifyLoading = false;
                state.resendStatus = "idle";
                // Normalize the business data (from Directrory or root payload)
                if (businessData) {
                    state.draft = {
                        ...state.draft,
                        ...normalizeDraft(businessData),
                    };
                }
            })
            .addCase(createBusinessWizardListing.rejected, (state, action) => {
                state.loading = false;
                state.submissionStatus = "failed";
                state.verificationError = action.payload;
                state.verificationStatus = "failed";
                state.verifyLoading = false;
            })

            .addCase(updateBusinessWizardListing.pending, (state) => {
                state.loading = true;
                state.updateStatus = "loading";
            })
            .addCase(updateBusinessWizardListing.fulfilled, (state, action) => {
                state.loading = false;
                state.updateStatus = "succeeded";
                state.listingId = action.meta?.arg?.id ?? state.listingId;
                state.isEditing = true;
                if (action.payload) {
                    state.draft = {
                        ...state.draft,
                        ...normalizeDraft(action.payload),
                    };
                }
            })
            .addCase(updateBusinessWizardListing.rejected, (state, action) => {
                state.loading = false;
                state.updateStatus = "failed";
                state.verificationError = action.payload;
            })

            .addCase(verifyBusinessPhone.pending, (state) => {
                state.verifyLoading = true;
                state.verificationError = null;
            })
            .addCase(verifyBusinessPhone.fulfilled, (state, action) => {
                state.verifyLoading = false;
                state.verificationStatus = "succeeded";
                if (action.payload) {
                    state.draft = {
                        ...state.draft,
                        ...normalizeDraft(action.payload),
                    };
                }
            })
            .addCase(verifyBusinessPhone.rejected, (state, action) => {
                state.verifyLoading = false;
                state.verificationStatus = "failed";
                state.verificationError = action.payload;
            })

            .addCase(resendBusinessVerificationCode.pending, (state) => {
                state.resendStatus = "loading";
            })
            .addCase(resendBusinessVerificationCode.fulfilled, (state) => {
                state.resendStatus = "succeeded";
            })
            .addCase(resendBusinessVerificationCode.rejected, (state, action) => {
                state.resendStatus = "failed";
                state.verificationError = action.payload;
            })

            .addCase(fetchBusinessWizardDraft.pending, (state, action) => {
                state.loading = true;
                state.isEditing = true;
                state.listingId = action.meta?.arg ?? null;
            })
            .addCase(fetchBusinessWizardDraft.fulfilled, (state, action) => {
                state.loading = false;
                state.isEditing = true;
                state.listingId = action.meta?.arg ?? null;
                if (action.payload) {
                    state.draft = normalizeDraft(action.payload);
                    const isPhoneVerified = Boolean(
                        action.payload?.mobile_verified ?? action.payload?.is_verified_business
                    );
                    state.verificationStatus = isPhoneVerified ? "succeeded" : "idle";
                }
            })
            .addCase(fetchBusinessWizardDraft.rejected, (state, action) => {
                state.loading = false;
                state.isEditing = false;
                state.listingId = null;
                state.verificationError = action.payload;
            });
    },
});

export const {
    goToBusinessWizardStep,
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
    resetBusinessWizard,
    clearBusinessWizardErrors,
} = businessWizardSlice.actions;

export default businessWizardSlice.reducer;


