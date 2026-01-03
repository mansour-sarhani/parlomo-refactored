import {
    LayoutDashboard,
    Users,
    Blocks,
    UserPlus,
    Database,
    Network,
    UserCircle,
    Bookmark,
    CalendarDays,
    FolderKanban,
    Store,
    Layers,
    Tag,
    ClipboardList,
    ClipboardPlus,
    TicketPercent,
    Building2,
    BriefcaseBusiness,
    ShoppingCart,
    ShieldCheck,
    Megaphone,
    ClipboardCheck,
    Gavel,
    MessageSquare,
    Settings,
    Receipt,
    DollarSign,
    Ticket,
    MapPin,
} from "lucide-react";

export const navigation = [
    {
        name: "Dashboard",
        href: "/panel/dashboard",
        icon: LayoutDashboard,
        // No permission check - always visible
    },
    {
        name: "Profile",
        href: "/panel/profile",
        icon: UserCircle,
        // No permission check - always visible
    },
    {
        name: "Invoices",
        href: "/panel/reports",
        icon: Receipt,
        // No permission check - always visible
    },
    {
        name: "Bookmarks",
        href: "/panel/bookmarks",
        icon: Bookmark,
        // No permission check - always visible
    },
    {
        name: "Chat",
        href: "/panel/chat",
        icon: MessageSquare,
        permission: {
            groupName: "Chat",
        },
    },
    {
        name: "Events",
        icon: CalendarDays,
        permission: {
            groupName: "Public Event",
        },
        children: [
            {
                name: "My Events",
                href: "/panel/my-events",
                icon: CalendarDays,
                permission: {
                    groupName: "Public Event",
                },
            },
            {
                name: "Create Event",
                href: "/panel/my-events/create",
                icon: ClipboardPlus,
                permission: {
                    groupName: "Public Event",
                    permission: "create PublicEvent",
                },
            },
            {
                name: "Bookings Report",
                href: "/panel/my-bookings",
                icon: Receipt,
                permission: {
                    groupName: "Public Event",
                },
            },
        ],
    },
    {
        name: "Marketplace",
        icon: Store,
        // User-facing marketplace menu
        children: [
            {
                name: "My Listings",
                href: "/panel/marketplace/my-listings",
                icon: ClipboardList,
                // Always visible for users
            },
            {
                name: "New Listing",
                href: "/panel/marketplace/new-listing",
                icon: ClipboardPlus,
                // Always visible for users
            },
        ],
    },
    {
        name: "Businesses",
        icon: BriefcaseBusiness,
        // User-facing businesses menu
        children: [
            {
                name: "My Business",
                href: "/panel/businesses/my-business",
                icon: Building2,
                permission: {
                    groupName: "Directory Listing",
                    permission: "add DirectoryListing",
                },
            },
            {
                name: "New Business",
                href: "/panel/businesses/new-business",
                icon: ClipboardPlus,
                permission: {
                    groupName: "Directory Listing",
                    permission: "add DirectoryListing",
                },
            },
            {
                name: "Buy Badge",
                href: "/panel/businesses/buy-badges",
                icon: ShieldCheck,
                // Always visible
            },
        ],
    },
    {
        name: "Advertising",
        icon: Megaphone,
        // Parent always visible, children have permissions
        children: [
            {
                name: "Buy Advertising",
                href: "/panel/businesses/buy-advertising",
                icon: ShoppingCart,
                // Always visible
            },
            {
                name: "Advertising Orders",
                href: "/panel/businesses/advertising-orders",
                icon: ClipboardCheck,
                // Always visible
            },
        ],
    },
];

// Admin-only navigation items
export const adminNavigation = [
    {
        name: "Events",
        icon: CalendarDays,
        permission: {
            superAdminOnly: true,
        },
        children: [
            {
                name: "All Events",
                href: "/panel/admin/events",
                icon: CalendarDays,
                permission: {
                    groupName: "Event",
                    permission: "show admin event",
                },
            },
            {
                name: "Categories",
                href: "/panel/admin/events/categories",
                icon: FolderKanban,
                permission: {
                    groupName: "Event Category",
                    permission: "show admin eventCategory",
                },
            },
        ],
    },
    {
        name: "Public Events",
        icon: Ticket,
        permission: {
            groupName: "Admin",
        },
        children: [
            {
                name: "All Events",
                href: "/panel/admin/public-events",
                icon: CalendarDays,
                permission: {
                    groupName: "Admin",
                },
            },
            {
                name: "Categories",
                href: "/panel/admin/public-events/categories",
                icon: FolderKanban,
                permission: {
                    groupName: "Admin",
                },
            },
            {
                name: "Bookings Report",
                href: "/panel/admin/public-events/bookings",
                icon: Receipt,
                permission: {
                    groupName: "Admin",
                },
            },
        ],
    },
    {
        name: "Venue Charts",
        href: "/panel/admin/seatsio/venue-charts",
        icon: MapPin,
        permission: {
            superAdminOnly: true,
        },
    },
    {
        name: "Marketplace",
        icon: Store,
        // Admin marketplace menu
        children: [
            {
                name: "Types",
                href: "/panel/admin/marketplace/types",
                icon: Layers,
                permission: {
                    groupName: "Classified Ad Type",
                    permission: "show admin adsType",
                },
            },
            {
                name: "Categories",
                href: "/panel/admin/marketplace/categories",
                icon: FolderKanban,
                permission: {
                    groupName: "Classified Ad Category",
                    permission: "show admin classifiedAdCategory",
                },
            },
            {
                name: "Attributes",
                href: "/panel/admin/marketplace/attributes",
                icon: Tag,
                permission: {
                    groupName: "Classified Ad Attribute",
                    permission: "show admin categoryAttribute",
                },
            },
            {
                name: "All Listings",
                href: "/panel/admin/marketplace/listings",
                icon: ClipboardList,
                permission: {
                    groupName: "Classified Ad",
                    permission: "show admin ClassifiedAd",
                },
            },
        ],
    },
    {
        name: "Businesses",
        icon: BriefcaseBusiness,
        // Admin businesses menu
        children: [
            {
                name: "Business Categories",
                href: "/panel/admin/businesses/categories",
                icon: FolderKanban,
                permission: {
                    groupName: "Directory Listing Category",
                    permission: "show admin DirectoryListingCategory",
                },
            },
            {
                name: "All Businesses",
                href: "/panel/admin/businesses/list",
                icon: ClipboardList,
                permission: {
                    groupName: "Directory Listing",
                    permission: "Show Directory Listing to Admin",
                },
            },
        ],
    },
    {
        name: "Comments",
        href: "/panel/admin/comments",
        icon: MessageSquare,
        permission: {
            requiresDirectory: true,
        },
    },
    {
        name: "User Management",
        href: "/panel/admin/users",
        icon: Users,
        permission: {
            groupName: "Admin",
        },
    },
    {
        name: "Badges",
        href: "/panel/admin/badges",
        icon: ShieldCheck,
        permission: {
            groupName: "Badge Package",
            permission: "Admin show BadgePackage",
        },
    },
    {
        name: "Advertising",
        icon: Megaphone,
        // Parent always visible, children have permissions
        children: [
            {
                name: "Types",
                href: "/panel/admin/advertising/types",
                icon: Layers,
                permission: {
                    groupName: "OmidAdvertising",
                    permission: "OmidAdvertisingType",
                },
            },
            {
                name: "Packages",
                href: "/panel/admin/advertising/packages",
                icon: ClipboardList,
                permission: {
                    groupName: "OmidAdvertising",
                    permission: "show admin OmidAdvertising",
                },
            },
            {
                name: "Orders",
                href: "/panel/admin/advertising/orders",
                icon: ClipboardCheck,
                permission: {
                    groupName: "OmidAdvertising",
                    permission: "OmidAdvertisingOrder",
                },
            },
        ],
    },
    {
        name: "Promotion Codes",
        href: "/panel/admin/promotion-codes",
        icon: TicketPercent,
        permission: {
            groupName: "Discount",
        },
    },
    {
        name: "Reports",
        href: "/panel/admin/reports",
        icon: Receipt,
        permission: {
            permission: "show AdminReport",
        },
    },
    {
        name: "Financials",
        icon: DollarSign,
        permission: {
            groupName: "Admin",
        },
        children: [
            {
                name: "Settlements",
                href: "/panel/admin/financials/settlements",
                icon: DollarSign,
                permission: {
                    groupName: "Admin",
                },
            },
            {
                name: "Refunds",
                href: "/panel/admin/financials/refunds",
                icon: Receipt,
                permission: {
                    groupName: "Admin",
                },
            },
        ],
    },
    {
        name: "Settings",
        href: "/panel/admin/settings",
        icon: Settings,
        permission: {
            groupName: "Setting",
        },
    },
    {
        name: "Review",
        icon: Gavel,
        permission: {
            groupName: "Admin",
        },
        children: [
            {
                name: "Ads",
                href: "/panel/admin/review/ads",
                icon: Megaphone,
                permission: {
                    permission: "show AdminReview",
                },
            },
            {
                name: "Businesses",
                href: "/panel/admin/review/directories",
                icon: Building2,
                permission: {
                    permission: "show AdminReview",
                },
            },
            {
                name: "Events",
                href: "/panel/admin/review/events",
                icon: CalendarDays,
                permission: {
                    permission: "show admin Event",
                },
            },
            {
                name: "Comments",
                href: "/panel/admin/review/comments",
                icon: MessageSquare,
                permission: {
                    permission: "show admin DirectoryReview",
                },
            },
        ],
    },
];

// Development/Testing pages (optional, can be hidden in production)
export const devNavigation = [
    {
        name: "Components Demo",
        href: "/panel/components-demo",
        icon: Blocks,
    },
    //add ticket-testing seed
    {
        name: "Seed Data",
        href: "/panel/test-ticketing/seed",
        icon: TicketPercent,
    },
];
