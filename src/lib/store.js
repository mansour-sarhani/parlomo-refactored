import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "@/features/users/usersSlice";
import bookmarksReducer from "@/features/bookmarks/bookmarksSlice";
import eventCategoriesReducer from "@/features/eventCategories/eventCategoriesSlice";
import eventsReducer from "@/features/events/eventsSlice";
import publicEventsReducer from "@/features/public-events/publicEventsSlice";
import publicEventCategoriesReducer from "@/features/public-events/publicEventCategoriesSlice";
import ticketingReducer from "@/features/ticketing/ticketingSlice";
import ordersReducer from "@/features/ticketing/ordersSlice";
import adTypesReducer from "@/features/marketplace/adTypesSlice";
import adCategoriesReducer from "@/features/marketplace/adCategoriesSlice";
import adAttributesReducer from "@/features/marketplace/adAttributesSlice";
import adListingsReducer from "@/features/marketplace/adListingsSlice";
import adWizardReducer from "@/features/marketplace/adWizardSlice";
import businessCategoriesReducer from "@/features/businesses/businessCategoriesSlice";
import businessListingsReducer from "@/features/businesses/businessListingsSlice";
import businessBadgesReducer from "@/features/businesses/businessBadgesSlice";
import businessWizardReducer from "@/features/businesses/businessWizardSlice";
import adminBadgesReducer from "@/features/adminBadges/adminBadgesSlice";
import badgePurchaseReducer from "@/features/badgePurchase/badgePurchaseSlice";
import adminAdvertisingTypesReducer from "@/features/advertising/adminAdvertisingTypesSlice";
import adminAdvertisingPackagesReducer from "@/features/advertising/adminAdvertisingPackagesSlice";
import adminAdvertisingOrdersReducer from "@/features/advertising/adminAdvertisingOrdersSlice";
import advertisingPurchaseReducer from "@/features/advertising/advertisingPurchaseSlice";
import userAdvertisingOrdersReducer from "@/features/advertising/userAdvertisingOrdersSlice";
import adminPromotionCodesReducer from "@/features/promotionCodes/adminPromotionCodesSlice";
import adminSettingsReducer from "@/features/adminSettings/adminSettingsSlice";
import reportsReducer from "@/features/reports/reportsSlice";
import chatReducer from "@/features/chat/chatSlice";
import {
    adminReviewAdsReducer,
    adminReviewDirectoriesReducer,
    adminReviewCommentsReducer,
    adminReviewEventsReducer,
} from "@/features/adminReview";
import { adminCommentsReducer } from "@/features/adminComments";

// Import other slices here as we create them
// import companiesReducer from "@/features/companies/companiesSlice";
// import transactionsReducer from "@/features/transactions/transactionsSlice";
// import packagesReducer from "@/features/packages/packagesSlice";
// import paymentsReducer from "@/features/payments/paymentsSlice";
// import promotionsReducer from "@/features/promotions/promotionsSlice";

export const makeStore = () => {
    return configureStore({
        reducer: {
            users: usersReducer,
            bookmarks: bookmarksReducer,
            eventCategories: eventCategoriesReducer,
            events: eventsReducer,
            publicEvents: publicEventsReducer,
            publicEventCategories: publicEventCategoriesReducer,
            ticketing: ticketingReducer,
            orders: ordersReducer,
            marketplaceAdTypes: adTypesReducer,
            marketplaceAdCategories: adCategoriesReducer,
            marketplaceAdAttributes: adAttributesReducer,
            marketplaceAdListings: adListingsReducer,
            marketplaceAdWizard: adWizardReducer,
            businessCategories: businessCategoriesReducer,
            businessListings: businessListingsReducer,
            businessBadges: businessBadgesReducer,
            businessWizard: businessWizardReducer,
            adminBadges: adminBadgesReducer,
            badgePurchase: badgePurchaseReducer,
            adminAdvertisingTypes: adminAdvertisingTypesReducer,
            adminAdvertisingPackages: adminAdvertisingPackagesReducer,
            adminAdvertisingOrders: adminAdvertisingOrdersReducer,
            advertisingPurchase: advertisingPurchaseReducer,
            userAdvertisingOrders: userAdvertisingOrdersReducer,
            adminReviewAds: adminReviewAdsReducer,
            adminReviewDirectories: adminReviewDirectoriesReducer,
            adminReviewComments: adminReviewCommentsReducer,
            adminReviewEvents: adminReviewEventsReducer,
            adminComments: adminCommentsReducer,
            adminPromotionCodes: adminPromotionCodesReducer,
            adminSettings: adminSettingsReducer,
            reports: reportsReducer,
            chat: chatReducer,
            // Add other reducers here as we create them
            // companies: companiesReducer,
            // transactions: transactionsReducer,
            // packages: packagesReducer,
            // payments: paymentsReducer,
            // promotions: promotionsReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Ignore these action types for non-serializable values (File objects in payloads)
                    ignoredActions: [
                        "businessWizard/setBusinessWizardDraft",
                        "marketplaceAdWizard/setWizardDraft",
                        "marketplace/adAttributes/create/pending",
                        "marketplace/adAttributes/create/fulfilled",
                        "marketplace/adAttributes/create/rejected",
                        "marketplace/adAttributes/update/pending",
                        "marketplace/adAttributes/update/fulfilled",
                        "marketplace/adAttributes/update/rejected",
                        "publicEventCategories/create/pending",
                        "publicEventCategories/create/fulfilled",
                        "publicEventCategories/create/rejected",
                        "publicEventCategories/update/pending",
                        "publicEventCategories/update/fulfilled",
                        "publicEventCategories/update/rejected",
                        // Public events with image uploads
                        "publicEvents/createEvent/pending",
                        "publicEvents/createEvent/fulfilled",
                        "publicEvents/createEvent/rejected",
                        "publicEvents/updateEvent/pending",
                        "publicEvents/updateEvent/fulfilled",
                        "publicEvents/updateEvent/rejected",
                    ],
                    // Ignore these paths in state for non-serializable values (File objects)
                    ignoredPaths: [
                        "businessWizard.draft.logo",
                        "businessWizard.draft.images",
                        "businessWizard.draft.certificates",
                        "marketplaceAdWizard.draft.detailsForm.images",
                    ],
                    // Ignore these paths in action payloads for non-serializable values (File objects)
                    ignoredActionPaths: [
                        "payload.logo",
                        "payload.images",
                        "payload.certificates",
                        "payload.detailsForm.images",
                        "meta.arg.draft.logo",
                        "meta.arg.draft.images",
                        "meta.arg.draft.certificates",
                        "meta.arg.image", // Ad attributes image uploads
                    ],
                },
            }),
        devTools: process.env.NODE_ENV !== "production",
    });
};

// Infer the type of makeStore
export const store = makeStore();

// Infer the `RootState` and `AppDispatch` types from the store itself
export const selectUsers = (state) => state.users;
export const selectBookmarks = (state) => state.bookmarks;
export const selectCompanies = (state) => state.companies;
export const selectTransactions = (state) => state.transactions;
export const selectPackages = (state) => state.packages;
export const selectPayments = (state) => state.payments;
export const selectPromotions = (state) => state.promotions;
export const selectBusinessCategories = (state) => state.businessCategories;
export const selectBusinessListings = (state) => state.businessListings;
export const selectBusinessBadges = (state) => state.businessBadges;
export const selectBusinessWizard = (state) => state.businessWizard;
export const selectAdminBadges = (state) => state.adminBadges;
export const selectBadgePurchase = (state) => state.badgePurchase;
export const selectAdminAdvertisingTypes = (state) => state.adminAdvertisingTypes;
export const selectAdminAdvertisingPackages = (state) => state.adminAdvertisingPackages;
export const selectAdminAdvertisingOrders = (state) => state.adminAdvertisingOrders;
export const selectAdvertisingPurchase = (state) => state.advertisingPurchase;
export const selectUserAdvertisingOrders = (state) => state.userAdvertisingOrders;
export const selectAdminReviewAds = (state) => state.adminReviewAds;
export const selectAdminReviewDirectories = (state) => state.adminReviewDirectories;
export const selectAdminReviewComments = (state) => state.adminReviewComments;
export const selectAdminReviewEvents = (state) => state.adminReviewEvents;
export const selectAdminPromotionCodes = (state) => state.adminPromotionCodes;
export const selectChat = (state) => state.chat;

