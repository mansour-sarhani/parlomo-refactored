"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import AttributeSummary from "@/components/marketplace/AttributeSummary";
import AttributeFormModal from "@/components/marketplace/AttributeFormModal";
import { Button } from "@/components/common/Button";
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
import {
    fetchAdAttributes,
    createAdAttribute,
    updateAdAttribute,
    setAdAttributePage,
} from "@/features/marketplace/adAttributesSlice";

const createInitialValues = (attribute) => ({
    title: attribute?.title ?? "",
    name: attribute?.name ?? "",
    type: attribute?.type ?? "",
    description: attribute?.description ?? "",
    required: Boolean(attribute?.required ?? false),
    status: attribute?.status !== undefined ? Boolean(attribute.status) : true,
    image: attribute?.image ? attribute.image : null,
});

export default function MarketplaceAttributesPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { list, loading, creating, updating, pagination, error } = useSelector(
        (state) => state.marketplaceAdAttributes
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);

    const memoisedLimit = useMemo(() => pagination.limit || 10, [pagination.limit]);

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
        let page = parseInt(searchParams.get("page") || "1", 10);
        if (Number.isNaN(page) || page < 1) {
            page = 1;
        }

        dispatch(setAdAttributePage(page));
        dispatch(fetchAdAttributes({ page, limit: memoisedLimit }));
    }, [searchParams, dispatch, memoisedLimit]);

    useEffect(() => {
        // Only show error toasts for fetch errors, not form submission errors
        // Form submission errors are handled in handleSubmit catch block
        if (error && !creating && !updating) {
            // Skip showing toast if this is a validation error (has errors object)
            // Validation errors are already shown individually in handleSubmit catch block
            const errorData = typeof error === "object" && error !== null ? error : { message: error, errors: null };
            if (errorData.errors && typeof errorData.errors === "object" && Object.keys(errorData.errors).length > 0) {
                // This is a validation error, already handled in catch block, skip
                return;
            }
            // Show toast only for non-validation errors (like fetch errors)
            toast.error(typeof error === "string" ? error : error?.message || "An error occurred");
        }
    }, [error, creating, updating]);

    const stats = useMemo(() => {
        const requiredCount = list.filter((item) => Boolean(item.required)).length;
        const uniqueTypes = new Set(list.map((item) => item.type)).size;
        return {
            total: pagination.total,
            required: requiredCount,
            uniqueTypes,
        };
    }, [list, pagination.total]);

    const handleRefresh = useCallback(async () => {
        const page = parseInt(searchParams.get("page") || "1", 10) || 1;
        try {
            await dispatch(fetchAdAttributes({ page, limit: memoisedLimit })).unwrap();
        } catch (error) {
            // Errors are surfaced through the slice/toasts; no-op here.
        }
    }, [dispatch, searchParams, memoisedLimit]);

    const handlePageChange = useCallback(
        (newPage) => {
            updateUrl({
                page: newPage,
            });

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        },
        [updateUrl]
    );

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAttribute(null);
    };

    const handleCreateClick = () => {
        setEditingAttribute(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (attribute) => {
        setEditingAttribute(attribute);
        setIsModalOpen(true);
    };

    const handleSubmit = async (values, { resetForm }) => {
        const payload = {
            title: values.title,
            name: values.name,
            type: values.type,
            description: values.description,
            required: values.required,
            status: values.status,
            image: values.image,
        };

        try {
            if (editingAttribute) {
                await dispatch(
                    updateAdAttribute({ id: editingAttribute.id, changes: payload })
                ).unwrap();
                toast.success("Attribute updated successfully");
            } else {
                await dispatch(createAdAttribute(payload)).unwrap();
                toast.success("Attribute created successfully");
            }

            closeModal();
            resetForm();
            const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;
            dispatch(fetchAdAttributes({ page: currentPage, limit: memoisedLimit }));
        } catch (err) {
            // The error from unwrap() is the value passed to rejectWithValue
            // which is now a structured object with message and errors
            const errorData = typeof err === "object" && err !== null ? err : { message: err, errors: null };
            
            // Show individual toasts for each validation error
            if (errorData.errors && typeof errorData.errors === "object") {
                const hasErrors = Object.keys(errorData.errors).length > 0;
                if (hasErrors) {
                    // Show individual validation error toasts, skip the general message
                    Object.entries(errorData.errors).forEach(([field, messages]) => {
                        const fieldMessages = Array.isArray(messages) ? messages : [messages];
                        const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
                        fieldMessages.forEach((msg) => {
                            toast.error(`${fieldLabel}: ${msg}`);
                        });
                    });
                    // Don't show the general message when we have specific validation errors
                    return;
                }
            }
            
            // Show single toast for non-validation errors (when no specific validation errors exist)
            const errorMessage = errorData.message || (typeof err === "string" ? err : "Unable to save attribute");
            toast.error(errorMessage);
        }
    };

    const initialValues = useMemo(() => createInitialValues(editingAttribute), [editingAttribute]);

    const isSubmitting = creating || updating;

    return (
        <ContentWrapper
            title="Ad Attributes"
            description="Define reusable attribute fields that appear on marketplace listings."
        >
            <div className="space-y-6">
                <AttributeSummary stats={stats} />

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-neutral-500">
                            {`Displaying ${list.length} of ${pagination.total} attributes.`}
                        </p>
                        <p className="text-xs text-neutral-400">
                            Attributes power the dynamic fields shown during listing creation.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                            {loading ? "Refreshing..." : "Refresh"}
                        </Button>
                        <Button onClick={handleCreateClick}>New Attribute</Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>ID</TableHeaderCell>
                            <TableHeaderCell>Title</TableHeaderCell>
                            <TableHeaderCell>Name</TableHeaderCell>
                            <TableHeaderCell>Type</TableHeaderCell>
                            <TableHeaderCell>Required</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell className="w-[150px]">Actions</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.map((attribute) => (
                            <TableRow key={attribute.id}>
                                <TableCell>{attribute.id}</TableCell>
                                <TableCell>{attribute.title}</TableCell>
                                <TableCell>{attribute.name}</TableCell>
                                <TableCell className="capitalize">{attribute.type}</TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            attribute.required
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-neutral-200 text-neutral-600"
                                        }`}
                                    >
                                        {attribute.required ? "Required" : "Optional"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            attribute.status
                                                ? "bg-green-100 text-green-700"
                                                : "bg-neutral-200 text-neutral-600"
                                        }`}
                                    >
                                        {attribute.status ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <TableActions
                                        actions={["edit"]}
                                        onEdit={() => handleEditClick(attribute)}
                                        loading={loading}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {!loading && list.length === 0 && (
                    <div className="rounded-lg border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                        No attributes found yet. Create your first attribute to get started.
                    </div>
                )}

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
            </div>

            <AttributeFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                mode={editingAttribute ? "edit" : "create"}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                loading={isSubmitting}
            />
        </ContentWrapper>
    );
}

