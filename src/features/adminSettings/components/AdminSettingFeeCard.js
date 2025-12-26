"use client";

import { useEffect, useMemo } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";

import { Card, CardFooter, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonForm } from "@/components/common/Skeleton";
import { InputField } from "@/components/forms/InputField";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchAdminSetting, selectAdminSetting, updateAdminSetting } from "../adminSettingsSlice";

const formatTimestamp = (timestamp) => {
    if (!timestamp) {
        return null;
    }

    try {
        return new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(timestamp));
    } catch {
        return null;
    }
};

const validationSchema = Yup.object({
    percentage: Yup.number()
        .required("Percentage is required")
        .min(0, "Percentage cannot be negative")
        .max(100, "Percentage cannot exceed 100"),
});

export const AdminSettingFeeCard = ({
    settingKey,
    title,
    description,
    helperText,
}) => {
    const dispatch = useAppDispatch();
    const entry = useAppSelector((state) => selectAdminSetting(state, settingKey));

    const isLoadingInitial = Boolean(entry?.loading && !entry?.lastFetched);
    const isSaving = Boolean(entry?.saving);
    // Value comes as a string directly from the API (e.g., "10")
    const initialPercentage = entry?.value ? Number(entry.value) : 0;
    const lastFetchedLabel = formatTimestamp(entry?.lastFetched);
    const lastUpdatedLabel = formatTimestamp(entry?.lastUpdated);
    const fetchError = entry?.error;

    useEffect(() => {
        if (!settingKey) {
            return;
        }

        if (!entry || (!entry.lastFetched && !entry.loading)) {
            dispatch(fetchAdminSetting({ key: settingKey }));
        }
    }, [dispatch, entry, settingKey]);

    const headerActions = useMemo(() => {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => dispatch(fetchAdminSetting({ key: settingKey }))}
                    loading={Boolean(entry?.loading) && !isSaving}
                >
                    Reload
                </Button>
            </div>
        );
    }, [dispatch, entry?.loading, isSaving, settingKey]);

    return (
        <Card
            header={
                <CardHeader
                    title={title}
                    subtitle={description}
                    actions={headerActions}
                />
            }
        >
            {isLoadingInitial ? (
                <SkeletonForm />
            ) : (
                <Formik
                    enableReinitialize
                    initialValues={{
                        percentage: initialPercentage,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            await dispatch(
                                updateAdminSetting({
                                    key: settingKey,
                                    value: Number(values.percentage),
                                })
                            ).unwrap();
                            toast.success(`${title} updated successfully`);
                            resetForm({
                                values: {
                                    percentage: values.percentage,
                                },
                            });
                        } catch (error) {
                            const message =
                                error?.message || "Unable to update setting. Please try again.";
                            toast.error(message);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ dirty, isSubmitting, resetForm }) => {
                        const disableSubmit = !dirty || isSaving || isSubmitting;

                        return (
                            <Form className="space-y-6">
                                <div className="max-w-md space-y-4">
                                    <InputField
                                        name="percentage"
                                        label="Admin Percentage (%)"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        placeholder="Enter percentage"
                                        required
                                    />
                                    {helperText && (
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            {helperText}
                                        </p>
                                    )}

                                    {fetchError && (
                                        <div
                                            role="alert"
                                            className="rounded-md border border-[var(--color-error)] bg-[color-mix(in srgb, var(--color-error) 8%, transparent)] px-4 py-3 text-sm"
                                            style={{ color: "var(--color-error)" }}
                                        >
                                            {fetchError}
                                        </div>
                                    )}
                                </div>

                                <CardFooter align="between" className="flex-wrap gap-3">
                                    <div className="text-xs md:text-sm space-y-1" style={{ color: "var(--color-text-secondary)" }}>
                                        {lastFetchedLabel && <div>Last loaded: {lastFetchedLabel}</div>}
                                        {lastUpdatedLabel && <div>Last updated: {lastUpdatedLabel}</div>}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => resetForm()}
                                            disabled={!dirty || isSubmitting || isSaving}
                                        >
                                            Reset changes
                                        </Button>
                                        <Button
                                            type="submit"
                                            loading={isSubmitting || isSaving}
                                            disabled={disableSubmit}
                                        >
                                            Save changes
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Form>
                        );
                    }}
                </Formik>
            )}
        </Card>
    );
};

export default AdminSettingFeeCard;
