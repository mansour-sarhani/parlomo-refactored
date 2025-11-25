const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined || value === "") return [];
    return [value];
};

/**
 * Build FormData with proper nested array formatting for Laravel backend
 */
export const buildBusinessFormData = (draft = {}, overrides = {}) => {
    const formData = new FormData();

    // Basic fields
    if (draft.title) formData.append("title", draft.title);
    if (draft.shortDescription) formData.append("shortDescription", draft.shortDescription);
    if (draft.description) formData.append("description", draft.description);
    if (draft.contactNumber) formData.append("contactNumber", draft.contactNumber);
    if (draft.email) formData.append("email", draft.email);
    if (draft.siteLink) formData.append("siteLink", draft.siteLink);
    if (draft.youtubeLink) formData.append("youtubeLink", draft.youtubeLink);
    if (draft.socialMediaLink) formData.append("socialMediaLink", draft.socialMediaLink);
    formData.append("showOnMap", draft.showOnMap ? "1" : "0");
    if (draft.fullAddress) formData.append("fullAddress", draft.fullAddress);
    if (draft.postcode) formData.append("postcode", draft.postcode);
    if (draft.location) formData.append("location", draft.location);
    
    const verifyMobile = overrides.verifyMobile ?? draft.verifyMobile ?? "";
    if (verifyMobile) formData.append("verifyMobile", verifyMobile);

    if (draft.categoryId) formData.append("category", draft.categoryId);
    if (draft.categoryParentId) formData.append("cat_parent_id", draft.categoryParentId);
    if (draft.subCategoryId) formData.append("subCategory", draft.subCategoryId);

    // Business Hours - format as nested array for Laravel
    const businessHours = Array.isArray(draft.businessHours)
        ? draft.businessHours
        : Array.isArray(draft.business_hours)
        ? draft.business_hours
        : [];

    businessHours.forEach((hour, index) => {
        if (hour && typeof hour === "object") {
            formData.append(`businessHours[${index}][day]`, hour.day || "");
            // Laravel boolean validation - must be string "true" or "false" for strict validation
            formData.append(`businessHours[${index}][isClosed]`, hour.closed ? "true" : "false");
            formData.append(`businessHours[${index}][open]`, hour.open || "");
            formData.append(`businessHours[${index}][close]`, hour.close || "");
        }
    });

    // FAQs - format as nested array for Laravel
    const faqs = Array.isArray(draft.faqs)
        ? draft.faqs
        : Array.isArray(draft.FAQS)
        ? draft.FAQS
        : [];

    faqs.forEach((faq, index) => {
        if (faq && typeof faq === "object") {
            if (faq.question) formData.append(`FAQS[${index}][question]`, faq.question);
            if (faq.answer) formData.append(`FAQS[${index}][answer]`, faq.answer);
        }
    });

    // Badges
    if (draft.verifyBadgeId) formData.append("verifyBadge", draft.verifyBadgeId);
    if (draft.sponsorBadgeId || draft.sponsoredBadgeId) {
        formData.append("sponsoreBadge", draft.sponsorBadgeId || draft.sponsoredBadgeId);
    }

    // Logo
    if (draft.logo instanceof File || draft.logo instanceof Blob) {
        formData.append("logo", draft.logo);
    } else if (typeof draft.logo === "string" && draft.logo) {
        formData.append("existingLogo", draft.logo);
    }

    // Images
    const images = toArray(draft.images ?? draft.image ?? []);
    const existingImages = images.filter((item) => typeof item === "string");
    const newImages = images.filter((item) => item instanceof File || item instanceof Blob);

    newImages.forEach((img) => {
        formData.append("image[]", img);
    });
    existingImages.forEach((img) => {
        formData.append("existingImages[]", img);
    });

    // Certificates - backend expects objects with title, description, and image fields
    // Legacy structure: certificates[0][title], certificates[0][description], certificates[0][image]
    const certificates = toArray(draft.certificates);
    
    certificates.forEach((cert, index) => {
        if (cert && typeof cert === "object" && !(cert instanceof File) && !(cert instanceof Blob)) {
            // Certificate is an object with title, description, image
            if (cert.title) formData.append(`certificates[${index}][title]`, cert.title);
            if (cert.description) formData.append(`certificates[${index}][description]`, cert.description);
            if (cert.image instanceof File || cert.image instanceof Blob) {
                formData.append(`certificates[${index}][image]`, cert.image);
            } else if (typeof cert.image === "string" && cert.image) {
                formData.append(`existingCertificates[${index}][image]`, cert.image);
            }
        } else if (cert instanceof File || cert instanceof Blob) {
            // Certificate is just a file - send with empty title/description to match legacy structure
            formData.append(`certificates[${index}][title]`, "");
            formData.append(`certificates[${index}][description]`, "");
            formData.append(`certificates[${index}][image]`, cert);
        } else if (typeof cert === "string" && cert) {
            // Existing certificate path
            formData.append(`existingCertificates[${index}][image]`, cert);
        }
    });

    // 24h flag
    formData.append("is24h", draft.is24h ? "1" : "0");

    return formData;
};

/**
 * Legacy function - kept for backward compatibility
 * Now returns a plain object that will be converted to FormData by the service
 */
export const buildBusinessPayload = (draft = {}, overrides = {}) => {
    // Return a special marker object that the service can detect
    return {
        __useFormDataBuilder: true,
        draft,
        overrides,
    };
};


