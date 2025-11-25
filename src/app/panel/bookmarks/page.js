'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { Pagination } from "@/components/common/Pagination";
import { Tabs } from "@/components/common/Tabs";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchBookmarkedAds,
    fetchBookmarkedDirectories,
    fetchBookmarkedEvents,
    toggleAdBookmark,
    toggleDirectoryBookmark,
    toggleEventBookmark,
    setAdsPage,
    setDirectoriesPage,
    setEventsPage,
} from "@/features/bookmarks/bookmarksSlice";
import {
    BookmarkAdCard,
    BookmarkDirectoryCard,
    BookmarkEventCard,
} from "@/features/bookmarks/components";

const parsePageParam = (value) => {
    const page = Number.parseInt(value ?? "1", 10);
    return Number.isNaN(page) || page < 1 ? 1 : page;
};

const DEFAULT_SECTION = "ads";

const SECTION_CONFIG = [
    {
        key: "ads",
        title: "Bookmarked Ads",
        subtitle: "Saved classified ads you want to keep an eye on.",
        label: "Ads",
    },
    {
        key: "directories",
        title: "Bookmarked Businesses",
        subtitle: "Your curated list of business listings.",
        label: "Businesses",
    },
    {
        key: "events",
        title: "Bookmarked Events",
        subtitle: "Events you plan to attend or follow.",
        label: "Events",
    },
];

export default function BookmarksPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const bookmarks = useAppSelector((state) => state.bookmarks);

    const [pendingToggle, setPendingToggle] = useState(null);

    const pageState = useMemo(() => ({
        ads: parsePageParam(searchParams.get("adsPage")),
        directories: parsePageParam(searchParams.get("directoriesPage")),
        events: parsePageParam(searchParams.get("eventsPage")),
    }), [searchParams]);

    const activeSection = useMemo(() => {
        const sectionParam = searchParams.get("section");
        const isValid = SECTION_CONFIG.some((section) => section.key === sectionParam);
        return isValid ? sectionParam : DEFAULT_SECTION;
    }, [searchParams]);

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                const isPageParam = key.endsWith("Page");
                const isDefaultPage = isPageParam && Number.parseInt(value, 10) === 1;
                const isDefaultSection = key === "section" && value === DEFAULT_SECTION;

                if (value && !isDefaultPage && !isDefaultSection) {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            router.push(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router]
    );

    // Fetch bookmarked data when query params change
    useEffect(() => {
        dispatch(setAdsPage(pageState.ads));
        dispatch(fetchBookmarkedAds({ page: pageState.ads }));
    }, [dispatch, pageState.ads]);

    useEffect(() => {
        dispatch(setDirectoriesPage(pageState.directories));
        dispatch(fetchBookmarkedDirectories({ page: pageState.directories }));
    }, [dispatch, pageState.directories]);

    useEffect(() => {
        dispatch(setEventsPage(pageState.events));
        dispatch(fetchBookmarkedEvents({ page: pageState.events }));
    }, [dispatch, pageState.events]);

    const handleToggle = useCallback(
        async (type, id) => {
            const toggleMap = {
                ads: toggleAdBookmark,
                directories: toggleDirectoryBookmark,
                events: toggleEventBookmark,
            };

            const thunk = toggleMap[type];
            if (!thunk) return;

            try {
                setPendingToggle({ type, id });
                await dispatch(thunk(id)).unwrap();
            } catch (error) {
                toast.error(error || "Unable to update bookmark");
            } finally {
                setPendingToggle(null);
            }
        },
        [dispatch]
    );

    const handlePageChange = useCallback(
        (type, page) => {
            const paramMap = {
                ads: "adsPage",
                directories: "directoriesPage",
                events: "eventsPage",
            };

            const currentParams = {
                adsPage: pageState.ads,
                directoriesPage: pageState.directories,
                eventsPage: pageState.events,
                section: activeSection,
            };

            const key = paramMap[type];
            if (!key) return;

            updateUrl({
                ...currentParams,
                [key]: page,
            });
        },
        [activeSection, pageState.ads, pageState.directories, pageState.events, updateUrl]
    );

    const isToggling = useCallback(
        (type, id) => pendingToggle?.type === type && pendingToggle?.id === id,
        [pendingToggle]
    );

    const renderSectionContent = useCallback((type) => {
        const data = bookmarks[type];
        if (!data) return null;

        if (data.loading) {
            return (
                <div className="space-y-4">
                    <Skeleton variant="card" count={3} />
                </div>
            );
        }

        if (data.error) {
            return (
                <EmptyState
                    variant="error"
                    title="We couldn't load your bookmarks"
                    description={data.error}
                />
            );
        }

        if (!data.items.length) {
            const emptyMessages = {
                ads: {
                    title: "No bookmarked ads yet",
                    description: "Save ads you care about to keep them handy.",
                },
                directories: {
                    title: "No bookmarked businesses yet",
                    description: "Bookmark businesses you want to revisit.",
                },
                events: {
                    title: "No bookmarked events yet",
                    description: "Keep track of interesting events by bookmarking them.",
                },
            };

            const copy = emptyMessages[type];
            return <EmptyState title={copy.title} description={copy.description} />;
        }

        const cardMap = {
            ads: BookmarkAdCard,
            directories: BookmarkDirectoryCard,
            events: BookmarkEventCard,
        };

        const CardComponent = cardMap[type];

        const pagination = data.pagination;

        return (
            <div className="space-y-6">
                <div className="space-y-4">
                    {data.items.map((item) => (
                        <CardComponent
                            key={item.id}
                            {...{
                                [type === "ads" ? "ad" : type === "directories" ? "directory" : "event"]: item,
                                onToggle: (id) => handleToggle(type, id),
                                isToggling: isToggling(type, item.id),
                            }}
                        />
                    ))}
                </div>

                <div className="flex justify-between border-t border-[var(--color-border)] pt-4">
                    <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages || 1}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={(page) => handlePageChange(type, page)}
                        showItemsPerPage={false}
                    />
                </div>
            </div>
        );
    }, [bookmarks, handlePageChange, handleToggle, isToggling]);

    const handleTabChange = useCallback(
        (nextSection) => {
            updateUrl({
                adsPage: pageState.ads,
                directoriesPage: pageState.directories,
                eventsPage: pageState.events,
                section: nextSection,
            });
        },
        [pageState.ads, pageState.directories, pageState.events, updateUrl]
    );

    const tabs = useMemo(
        () =>
            SECTION_CONFIG.map(({ key, label, title, subtitle }) => ({
                id: key,
                label,
                content: (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
                            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
                        </div>
                        {renderSectionContent(key)}
                    </div>
                ),
            })),
        [renderSectionContent]
    );

    return (
        <ContentWrapper>
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
                    Saved Items
                </h1>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    Manage all your bookmarked ads, businesses, and events from one place.
                </p>
            </div>

            <Card
                header={
                    <CardHeader
                        title="Your Bookmarks"
                        subtitle="Switch between saved ads, businesses, and events."
                    />
                }
            >
                <Tabs
                    tabs={tabs}
                    activeTab={activeSection}
                    onChange={handleTabChange}
                    variant="pills"
                    size="md"
                />
            </Card>
        </ContentWrapper>
    );
}


