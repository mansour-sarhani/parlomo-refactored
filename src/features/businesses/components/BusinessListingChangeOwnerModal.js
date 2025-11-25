"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { SelectField } from "@/components/forms";
import { businessListingsService } from "@/services/businesses/businessListings.service";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { changeBusinessListingOwner } from "@/features/businesses/businessListingsSlice";

const validationSchema = Yup.object({
    username: Yup.string().required("Please select a user"),
    userId: Yup.string().required("Please select a user"),
    status: Yup.string().nullable(),
});

const STATUS_OPTIONS = [
    { value: "", label: "-- Choose Status --" },
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
    { value: "ActiveByAdmin", label: "Active By Admin" },
];

export function BusinessListingChangeOwnerModal({
    listing,
    isOpen,
    onClose,
    onUpdated,
}) {
    const dispatch = useAppDispatch();
    const { changingOwner } = useAppSelector((state) => state.businessListings);

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const initialValues = useMemo(() => {
        const normalizedStatus =
            listing?.status && typeof listing.status === "string"
                ? listing.status
                : "";

        return {
            username: "",
            userId: "",
            status: normalizedStatus,
        };
    }, [listing]);

    const resetState = useCallback(() => {
        setSearchTerm("");
        setResults([]);
        setSearchError(null);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            resetState();
            return;
        }

        if (!searchTerm || searchTerm.trim().length < 3) {
            setResults([]);
            setSearchError(null);
            return;
        }

        let isCurrent = true;
        const timeoutId = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const response = await businessListingsService.searchUsers(searchTerm.trim());
                if (!isCurrent) return;
                setResults(response.data?.data || []);
                setSearchError(null);
            } catch (error) {
                if (!isCurrent) return;
                setSearchError(error?.message || "Unable to search users");
            } finally {
                if (isCurrent) {
                    setSearchLoading(false);
                }
            }
        }, 300);

        return () => {
            isCurrent = false;
            clearTimeout(timeoutId);
        };
    }, [searchTerm, isOpen]);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            if (!listing?.id) {
                toast.error("Listing information missing");
                return;
            }

            try {
                await dispatch(
                    changeBusinessListingOwner({
                        directory: listing.id,
                        user: values.userId,
                        status: values.status || undefined,
                    })
                ).unwrap();

                toast.success("Business owner updated successfully");
                formikHelpers.resetForm();
                onUpdated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to update owner");
            }
        },
        [dispatch, listing, onClose, onUpdated]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Business Owner"
            size="lg"
        >
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-6">
                        <div className="space-y-1">
                            <label
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Current Owner
                            </label>
                            <div
                                className="rounded-lg border px-4 py-2 text-sm"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {listing?.user || listing?.owner || "—"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                New Owner
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={values.username || searchTerm}
                                    onChange={(event) => {
                                        const nextValue = event.target.value;
                                        setSearchTerm(nextValue);
                                        setFieldValue("username", nextValue);
                                        setFieldValue("userId", "");
                                    }}
                                    placeholder="Search by name or username..."
                                    className="w-full rounded-lg border px-4 py-2 text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />

                                {searchLoading && (
                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        Searching...
                                    </span>
                                )}
                            </div>

                            {searchError && (
                                <p className="text-xs" style={{ color: "var(--color-error)" }}>
                                    {searchError}
                                </p>
                            )}

                            {results.length > 0 && (
                                <ul
                                    className="max-h-48 overflow-y-auto rounded-lg border mt-2"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-card-bg)",
                                    }}
                                >
                                    {results.map((result) => (
                                        <li
                                            key={result.id}
                                            className="px-4 py-2 text-sm cursor-pointer hover:bg-[var(--color-hover)]"
                                            style={{ color: "var(--color-text-secondary)" }}
                                            onClick={() => {
                                                setFieldValue("username", result.username || result.name || "");
                                                setFieldValue("userId", String(result.id));
                                                setSearchTerm(result.username || result.name || "");
                                                setResults([]);
                                            }}
                                        >
                                            <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                                                {result.name || "Unnamed user"}
                                            </div>
                                            <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                                @{result.username || "unknown"}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <SelectField
                            name="status"
                            label="Listing Status"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={changingOwner || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={changingOwner || isSubmitting}
                                disabled={!values.userId}
                            >
                                Update Owner
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default BusinessListingChangeOwnerModal;


