"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form } from "formik";
import { Plus, RefreshCcw, Search as SearchIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchBusinessListings,
    setBusinessListingFilters,
    setBusinessListingPage,
} from "@/features/businesses/businessListingsSlice";
import { fetchBusinessCategoryOptions } from "@/features/businesses/businessCategoriesSlice";
import { BusinessListingTable, BusinessListingChangeOwnerModal } from "@/features/businesses";
import { buildCategoryOptions } from "@/features/businesses/components/utils";
import { businessWizardService } from "@/services/businesses/businessWizard.service";

const radiusOptions = [
    { value: "", label: "Radius" },
    { value: "5", label: "5 miles" },
    { value: "10", label: "10 miles" },
    { value: "15", label: "15 miles" },
    { value: "20", label: "20 miles" },
];

export default function AllBusinessesPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        adminList: listings,
        loading,
        error,
        pagination,
        filters,
    } = useAppSelector((state) => state.businessListings);
    const categoryTree = useAppSelector((state) => state.businessCategories.options);

    const [formValues, setFormValues] = useState({
        query: "",
        category: "",
        postcode: "",
        location: "",
        radius: "",
    });

    const [locationInput, setLocationInput] = useState("");
    const [locationResults, setLocationResults] = useState([]);
    const [locationLoading, setLocationLoading] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showReloadNotice, setShowReloadNotice] = useState(false);

    const [changeOwnerListing, setChangeOwnerListing] = useState(null);
    const tableRef = useRef(null);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const categoryOptions = useMemo(
        () => [{ value: "", label: "All categories" }, ...buildCategoryOptions(categoryTree)],
        [categoryTree]
    );

    const updateUrl = useCallback(
        (params) => {
            const url = new URL(window.location.href);

            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== "") {
                    url.searchParams.set(key, value);
                } else {
                    url.searchParams.delete(key);
                }
            });

            if (url.searchParams.get("page") === "1") {
                url.searchParams.delete("page");
            }

            router.push(`${url.pathname}${url.search}`, { scroll: false });
        },
        [router]
    );

    useEffect(() => {
        if (categoryTree.length === 0) {
            dispatch(fetchBusinessCategoryOptions());
        }
    }, [dispatch, categoryTree.length]);

    useEffect(() => {
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        const nextValues = {
            query: searchParams.get("query") || "",
            category: searchParams.get("category") || "",
            postcode: searchParams.get("postcode") || "",
            location: searchParams.get("location") || "",
            radius: searchParams.get("radius") || "",
        };

        setFormValues((prev) => {
            const prevString = JSON.stringify(prev);
            const nextString = JSON.stringify(nextValues);
            if (prevString === nextString) {
                return prev;
            }
            return nextValues;
        });

        const preferredLocation = nextValues.postcode || nextValues.location;
        setLocationInput(preferredLocation || "");
        setLocationResults([]);

        dispatch(setBusinessListingPage(page));
        dispatch(setBusinessListingFilters(nextValues));

        dispatch(
            fetchBusinessListings({
                page,
                limit: 10,
                query: nextValues.query || undefined,
                category: nextValues.category || undefined,
                postcode: nextValues.postcode || undefined,
                location: nextValues.location || undefined,
                radius: nextValues.radius || undefined,
            })
        );
    }, [searchParams, dispatch]);

    useEffect(() => {
        if (!locationInput || locationInput.trim().length < 3) {
            setLocationResults([]);
            return;
        }

        let isActive = true;
        const timeoutId = setTimeout(async () => {
            setLocationLoading(true);
            try {
                const response = await businessWizardService.searchLiveLocation(
                    locationInput.trim()
                );
                if (!isActive) return;
                setLocationResults(response.data?.locationList || []);
            } catch (err) {
                if (isActive) {
                    setLocationResults([]);
                }
            } finally {
                if (isActive) {
                    setLocationLoading(false);
                }
            }
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timeoutId);
        };
    }, [locationInput]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await dispatch(
                fetchBusinessListings({
                    page: pagination.page || 1,
                    limit: memoisedLimit,
                    query: filters.query || undefined,
                    category: filters.category || undefined,
                    postcode: filters.postcode || undefined,
                    location: filters.location || undefined,
                    radius: filters.radius || undefined,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [
        dispatch,
        filters.query,
        filters.category,
        filters.postcode,
        filters.location,
        filters.radius,
        memoisedLimit,
        pagination.page,
    ]);

    const handleSearchSubmit = useCallback(
        (values) => {
            updateUrl({
                page: 1,
                query: values.query,
                category: values.category,
                postcode: values.postcode,
                location: values.location,
                radius: values.radius,
            });
        },
        [updateUrl]
    );

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
                query: filters.query,
                category: filters.category,
                postcode: filters.postcode,
                location: filters.location,
                radius: filters.radius,
            });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [filters, updateUrl]
    );

    const handleViewListing = useCallback(
        (listing) => {
            if (!listing?.id) {
                toast.error("Unable to open business details");
                return;
            }
            router.push(`/panel/admin/businesses/list/${listing.id}?from=list`);
        },
        [router]
    );

    const handleEditListing = useCallback(
        (listing) => {
            if (!listing?.id) {
                toast.error("Unable to open business for editing");
                return;
            }
            router.push(`/panel/businesses/new-business?id=${listing.id}`);
        },
        [router]
    );

    const totalBusinesses = pagination.total || listings.length || 0;

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        All Businesses ({totalBusinesses})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Monitor every business listing in Parlomo with moderation-ready tools.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {showReloadNotice && (
                        <span className="text-sm" style={{ color: "var(--color-success)" }}>
                            List reloaded!
                        </span>
                    )}
                    <Button
                        variant="secondary"
                        icon={<RefreshCcw size={16} />}
                        onClick={handleRefresh}
                        loading={isRefreshing}
                    >
                        Refresh
                    </Button>
                    <Button
                        icon={<Plus size={16} />}
                        onClick={() => router.push("/panel/businesses/new-business")}
                    >
                        New Business
                    </Button>
                </div>
            </div>

            <Card className="mb-6">
                <Formik enableReinitialize initialValues={formValues} onSubmit={handleSearchSubmit}>
                    {({ values, setFieldValue }) => (
                        <Form className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1.2fr_1.2fr_1.2fr_auto]">
                            <div className="relative">
                                <SearchIcon
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--color-text-secondary)" }}
                                />
                                <input
                                    name="query"
                                    value={values.query}
                                    onChange={(event) => setFieldValue("query", event.target.value)}
                                    placeholder="Search businesses..."
                                    className="w-full rounded-lg border px-10 py-2 text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                            </div>

                            <select
                                name="category"
                                value={values.category}
                                onChange={(event) => setFieldValue("category", event.target.value)}
                                className="w-full rounded-lg border px-4 py-2 text-sm"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <div className="relative">
                                <MapPin
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: "var(--color-text-secondary)" }}
                                />
                                <input
                                    value={locationInput}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setLocationInput(value);
                                        setFieldValue("location", value);
                                        setFieldValue("postcode", "");
                                    }}
                                    onBlur={(event) => {
                                        if (!event.target.value) {
                                            setLocationResults([]);
                                            setFieldValue("location", "");
                                            setFieldValue("postcode", "");
                                        }
                                    }}
                                    placeholder="Postcode or address"
                                    className="w-full rounded-lg border px-10 py-2 text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                                {locationLoading && (
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        Searching...
                                    </span>
                                )}
                                {locationResults.length > 0 && (
                                    <ul
                                        className="absolute z-20 mt-2 w-full max-h-48 overflow-y-auto rounded-lg border text-sm"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor: "var(--color-card-bg)",
                                        }}
                                    >
                                        {locationResults.map((result) => (
                                            <li
                                                key={result.name}
                                                className="px-4 py-2 cursor-pointer hover:bg-[var(--color-hover)]"
                                                style={{ color: "var(--color-text-secondary)" }}
                                                onMouseDown={() => {
                                                    setLocationInput(result.name);
                                                    if (result.type === "postcode") {
                                                        setFieldValue("postcode", result.name);
                                                        setFieldValue("location", "");
                                                    } else {
                                                        setFieldValue("location", result.name);
                                                        setFieldValue("postcode", "");
                                                    }
                                                    setLocationResults([]);
                                                }}
                                            >
                                                {result.name}
                                                <span
                                                    className="ml-2 text-xs uppercase"
                                                    style={{ color: "var(--color-text-tertiary)" }}
                                                >
                                                    {result.type}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <select
                                name="radius"
                                value={values.radius}
                                onChange={(event) => setFieldValue("radius", event.target.value)}
                                className="w-full rounded-lg border px-4 py-2 text-sm"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {radiusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex md:justify-end">
                                <Button type="submit" className="w-full md:w-auto">
                                    Search
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>

            <Card>
                <div ref={tableRef}>
                    {loading ? (
                        <SkeletonTable rows={8} />
                    ) : error ? (
                        <div className="py-12 text-center space-y-4">
                            <p style={{ color: "var(--color-error)" }}>{error}</p>
                            <Button onClick={handleRefresh}>Try Again</Button>
                        </div>
                    ) : listings.length === 0 ? (
                        <EmptyState
                            title="No businesses found"
                            description="Try adjusting your search filters or onboarding a new listing."
                        />
                    ) : (
                        <>
                            <BusinessListingTable
                                listings={listings}
                                onView={handleViewListing}
                                onEdit={handleEditListing}
                                onChangeOwner={setChangeOwnerListing}
                            />
                            <div className="mt-6">
                                <Pagination
                                    currentPage={pagination.page || 1}
                                    totalPages={pagination.pages || 1}
                                    totalItems={pagination.total || 0}
                                    itemsPerPage={memoisedLimit}
                                    onPageChange={handlePageChange}
                                    showItemsPerPage={false}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <BusinessListingChangeOwnerModal
                listing={changeOwnerListing}
                isOpen={Boolean(changeOwnerListing)}
                onClose={() => setChangeOwnerListing(null)}
                onUpdated={() => {
                    setChangeOwnerListing(null);
                    handleRefresh();
                }}
            />
        </ContentWrapper>
    );
}
