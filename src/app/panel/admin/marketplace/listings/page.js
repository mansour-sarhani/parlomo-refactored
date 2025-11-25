"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCcw } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { SkeletonTable } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import {
    Table,
    TableHeader,
    TableHeaderCell,
    TableRow,
    TableCell,
    TableBody,
    TableActions,
} from "@/components/tables";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import {
    fetchAdminListings,
    fetchAdminListingById,
    setAdListingFilters,
    setAdListingPage,
} from "@/features/marketplace/adListingsSlice";
import { fetchAllAdTypes } from "@/features/marketplace/adTypesSlice";
import { fetchAllAdCategories } from "@/features/marketplace/adCategoriesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { adWizardService } from "@/services/marketplace/adWizard.service";

function LocationAutocompleteField({ value, onChange, onSelect, clearSelection }) {
    const [results, setResults] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const query = value?.trim();
        if (!query) {
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(async () => {
            try {
                const response = await adWizardService.searchLiveLocation(query);
                if (!controller.signal.aborted) {
                    setResults(response.data?.locationList || []);
                    setError(null);
                }
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err?.message || "Unable to fetch locations");
                }
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [value]);

    return (
        <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">
                Postcode / Location
            </label>
            <div className="relative mt-2">
                <input
                    type="text"
                    className="w-full rounded-lg border px-4 py-2 text-sm"
                    value={value}
                    placeholder="Search postcode or address"
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={() => {
                        if (!value) {
                            clearSelection();
                        }
                    }}
                    style={{ borderColor: "var(--color-border)" }}
                />
                {value && results.length > 0 && (
                    <ul className="absolute z-10 mt-2 w-full rounded-lg border bg-white shadow">
                        {results.map((result) => (
                            <li
                                key={result.name}
                                className="cursor-pointer px-4 py-2 text-sm hover:bg-neutral-100"
                                onMouseDown={() => {
                                    onSelect(result);
                                    setResults([]);
                                    setError(null);
                                }}
                            >
                                {result.name}
                            </li>
                        ))}
                    </ul>
                )}
                {value && error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        </div>
    );
}

const buildQueryFromSearchParams = (params) => ({
    page: Number(params.get("page") || 1),
    query: params.get("query") || "",
    type: params.get("type") || "",
    category: params.get("category") || "",
    postcode: params.get("postcode") || "",
    location: params.get("location") || "",
    radius: params.get("radius") || "",
});

const sanitizeParams = (filters = {}) => {
    const result = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            result[key] = value;
        }
    });
    return result;
};

const buildTypeOptions = (types) =>
    (types || []).map((type) => ({
        value: String(type.id),
        label: type.title,
    }));

const buildCategoryOptions = (categories, selectedType) =>
    (categories || [])
        .filter((category) => {
            if (!selectedType) return true;
            const categoryTypeId = category.classified_ad_type_id ?? category.type;
            return String(categoryTypeId) === String(selectedType);
        })
        .map((category) => ({
            value: String(category.id),
            label: category.title,
        }));

export default function MarketplaceListingsPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { adminList, loading, pagination, filters, currentAdminListing, error } = useAppSelector(
        (state) => state.marketplaceAdListings
    );
    const { allOptions: typeOptionsRaw } = useAppSelector((state) => state.marketplaceAdTypes);
    const { allOptions: categoryOptionsRaw } = useAppSelector(
        (state) => state.marketplaceAdCategories
    );

    const [showReloadNotice, setShowReloadNotice] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const tableRef = useRef(null);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

    const formValues = useMemo(
        () => ({
            query: filters.query,
            type: filters.type,
            category: filters.category,
            postcode: filters.postcode,
            location: filters.location,
            locationQuery: filters.location || filters.postcode || "",
            radius: filters.radius,
        }),
        [filters]
    );

    const typeOptions = useMemo(() => buildTypeOptions(typeOptionsRaw), [typeOptionsRaw]);

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
        dispatch(fetchAllAdTypes());
        dispatch(fetchAllAdCategories());
    }, [dispatch]);

    useEffect(() => {
        const parsed = buildQueryFromSearchParams(searchParams);
        let page = parsed.page;
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        dispatch(setAdListingFilters(parsed));
        dispatch(setAdListingPage(page));

        dispatch(
            fetchAdminListings({
                page,
                limit: 10,
                query: parsed.query || undefined,
                type: parsed.type || undefined,
                category: parsed.category || undefined,
                postcode: parsed.postcode || undefined,
                location: parsed.location || undefined,
                radius: parsed.radius || undefined,
            })
        );
    }, [dispatch, searchParams]);

    const handleSearchSubmit = useCallback(
        (values) => {
            const { locationQuery, ...rest } = values;
            const trimmedQuery = locationQuery?.trim();
            const submission = { ...rest };
            if (!submission.postcode && !submission.location && trimmedQuery) {
                submission.postcode = trimmedQuery;
            }

            const payload = sanitizeParams(submission);
            updateUrl({
                page: 1,
                ...payload,
            });
        },
        [updateUrl]
    );

    const handlePageChange = useCallback(
        (newPage) => {
            const currentFilters = buildQueryFromSearchParams(searchParams);
            updateUrl({
                page: newPage,
                query: currentFilters.query || undefined,
                type: currentFilters.type || undefined,
                category: currentFilters.category || undefined,
                postcode: currentFilters.postcode || undefined,
                location: currentFilters.location || undefined,
                radius: currentFilters.radius || undefined,
            });

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        },
        [searchParams, updateUrl]
    );

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const parsed = buildQueryFromSearchParams(searchParams);
            await dispatch(
                fetchAdminListings({
                    page: parsed.page,
                    limit: memoisedLimit,
                    query: parsed.query || undefined,
                    type: parsed.type || undefined,
                    category: parsed.category || undefined,
                    postcode: parsed.postcode || undefined,
                    location: parsed.location || undefined,
                    radius: parsed.radius || undefined,
                })
            ).unwrap();

            setShowReloadNotice(true);
            setTimeout(() => setShowReloadNotice(false), 5000);
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        } finally {
            setIsRefreshing(false);
        }
    }, [dispatch, memoisedLimit, searchParams]);

    const handleReset = useCallback(() => {
        updateUrl({});
    }, [updateUrl]);

    const handleViewListing = (id) => {
        dispatch(fetchAdminListingById(id));
    };

    const totalListings = pagination.total || 0;

    return (
        <ContentWrapper>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Marketplace Listings ({totalListings})
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        Review and manage all classified ads submitted to the platform.
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
                </div>
            </div>

            <div className="space-y-6">
                <Card className="p-5">
                    <Formik
                        initialValues={formValues}
                        enableReinitialize
                        onSubmit={handleSearchSubmit}
                    >
                        {({ values, setFieldValue }) => {
                            const categoryOptions = buildCategoryOptions(
                                categoryOptionsRaw,
                                values.type
                            );

                            return (
                                <Form className="grid gap-4 md:grid-cols-6">
                                    <InputField
                                        name="query"
                                        label="Search"
                                        placeholder="Title or user"
                                        className="md:col-span-2"
                                    />

                                    <SelectField
                                        name="type"
                                        label="Type"
                                        options={[{ value: "", label: "All" }, ...typeOptions]}
                                        className="md:col-span-1"
                                        onChange={(event) => {
                                            setFieldValue("type", event.target.value);
                                            setFieldValue("category", "");
                                        }}
                                    />

                                    <SelectField
                                        name="category"
                                        label="Category"
                                        options={[{ value: "", label: "All" }, ...categoryOptions]}
                                        className="md:col-span-1"
                                        disabled={!values.type}
                                    />

                                    <LocationAutocompleteField
                                        value={values.locationQuery}
                                        onChange={(value) => {
                                            setFieldValue("locationQuery", value);
                                            setFieldValue("postcode", "");
                                            setFieldValue("location", "");
                                        }}
                                        onSelect={(result) => {
                                            setFieldValue("locationQuery", result.name);
                                            if (result.type === "postcode") {
                                                setFieldValue("postcode", result.name);
                                                setFieldValue("location", "");
                                            } else {
                                                setFieldValue("location", result.name);
                                                setFieldValue("postcode", "");
                                            }
                                        }}
                                        clearSelection={() => {
                                            setFieldValue("locationQuery", "");
                                            setFieldValue("postcode", "");
                                            setFieldValue("location", "");
                                        }}
                                    />

                                    <SelectField
                                        name="radius"
                                        label="Radius"
                                        options={[
                                            { value: "", label: "Any" },
                                            { value: "5", label: "5 miles" },
                                            { value: "10", label: "10 miles" },
                                            { value: "15", label: "15 miles" },
                                            { value: "20", label: "20 miles" },
                                        ]}
                                        className="md:col-span-1"
                                    />

                                    <div className="flex items-end gap-3 md:col-span-6">
                                        <Button type="submit" loading={loading}>
                                            Apply Filters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            type="button"
                                            onClick={handleReset}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="p-0">
                        <div ref={tableRef}>
                            {loading ? (
                                <SkeletonTable rows={8} />
                            ) : error ? (
                                <div className="py-12 text-center space-y-4">
                                    <p style={{ color: "var(--color-error)" }}>{error}</p>
                                    <Button onClick={handleRefresh}>Try Again</Button>
                                </div>
                            ) : adminList.length === 0 ? (
                                <EmptyState
                                    title="No listings found"
                                    description="Try adjusting your filters or check back later."
                                />
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHeaderCell>ID</TableHeaderCell>
                                                <TableHeaderCell>Title</TableHeaderCell>
                                                <TableHeaderCell>Type</TableHeaderCell>
                                                <TableHeaderCell>Category</TableHeaderCell>
                                                <TableHeaderCell>Price</TableHeaderCell>
                                                <TableHeaderCell>Status</TableHeaderCell>
                                                <TableHeaderCell className="w-[150px]">
                                                    Actions
                                                </TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {adminList.map((listing) => (
                                                <TableRow key={listing.id}>
                                                    <TableCell>{listing.id}</TableCell>
                                                    <TableCell>{listing.title}</TableCell>
                                                    <TableCell>
                                                        {listing.classifiedAdType}
                                                    </TableCell>
                                                    <TableCell>{listing.categoryName}</TableCell>
                                                    <TableCell>{listing.price || "—"}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                                listing.status === "Active"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-neutral-200 text-neutral-600"
                                                            }`}
                                                        >
                                                            {listing.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TableActions
                                                            actions={["view"]}
                                                            onView={() =>
                                                                handleViewListing(listing.id)
                                                            }
                                                            loading={loading}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="mt-6 px-4 pb-4">
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

                    <Card className="p-0">
                        <div className="border-b border-[var(--color-border)] px-4 py-3">
                            <h3 className="text-sm font-semibold text-neutral-700">
                                Listing Details
                            </h3>
                        </div>
                        <div className="space-y-4 p-5">
                            {currentAdminListing ? (
                                <>
                                    <div>
                                        <h4 className="text-lg font-semibold text-neutral-800">
                                            {currentAdminListing.title}
                                        </h4>
                                        <p className="text-xs uppercase text-neutral-400">
                                            #{currentAdminListing.id} ·{" "}
                                            {currentAdminListing.classifiedAdType}
                                        </p>
                                    </div>

                                    <div className="grid gap-3 text-sm text-neutral-600">
                                        <div>
                                            <span className="text-neutral-400">Category</span>
                                            <p className="font-medium">
                                                {currentAdminListing.categoryName}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Price</span>
                                            <p className="font-medium">
                                                {currentAdminListing.price || "Not provided"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Valid till</span>
                                            <p className="font-medium">
                                                {currentAdminListing.validDate || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Posted by</span>
                                            <p className="font-medium">
                                                {currentAdminListing.user || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-neutral-400">Status</span>
                                            <p className="font-medium">
                                                {currentAdminListing.status}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs uppercase text-neutral-400">
                                            Description
                                        </span>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            {currentAdminListing.description ||
                                                "No description provided."}
                                        </p>
                                    </div>

                                    {currentAdminListing.classifiedAdAttributes?.length ? (
                                        <div>
                                            <span className="text-xs uppercase text-neutral-400">
                                                Attributes
                                            </span>
                                            <div className="mt-2 space-y-2">
                                                {currentAdminListing.classifiedAdAttributes.map(
                                                    (attribute) => (
                                                        <div
                                                            key={attribute.id}
                                                            className="rounded-lg border px-3 py-2 text-sm"
                                                            style={{
                                                                borderColor: "var(--color-border)",
                                                            }}
                                                        >
                                                            <strong>{attribute.name}</strong>:{" "}
                                                            {attribute.value}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ) : null}
                                </>
                            ) : (
                                <p className="text-sm text-neutral-500">
                                    Select a listing to view its details.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </ContentWrapper>
    );
}
