"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import { toast } from "sonner";

import { Card, CardFooter, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonForm } from "@/components/common/Skeleton";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
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

export const AdminSettingEditorCard = ({
    settingKey,
    title,
    description,
    helperText,
    previewTitle = "Preview",
    editorLabel = "Page Content",
    editorPlaceholder = "Enter page content here...",
    editorMinHeight = 350,
}) => {
    const dispatch = useAppDispatch();
    const entry = useAppSelector((state) => selectAdminSetting(state, settingKey));
    const [purify, setPurify] = useState(null);

    useEffect(() => {
        import("dompurify").then((mod) => setPurify(() => mod.default));
    }, []);

    const isLoadingInitial = Boolean(entry?.loading && !entry?.lastFetched);
    const isSaving = Boolean(entry?.saving);
    const initialValue = entry?.value ?? "";
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
                        value: initialValue,
                    }}
                    onSubmit={async (values, { setSubmitting, resetForm }) => {
                        try {
                            await dispatch(
                                updateAdminSetting({
                                    key: settingKey,
                                    value: values.value,
                                })
                            ).unwrap();
                            toast.success(`${title} updated successfully`);
                            resetForm({
                                values: {
                                    value: values.value,
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
                    {({ values, dirty, isSubmitting, resetForm, setFieldValue }) => {
                        const sanitizedPreview = purify ? purify.sanitize(values.value ?? "") : "";
                        const disableSubmit = !dirty || isSaving || isSubmitting;

                        return (
                            <Form className="space-y-6">
                                <div className="grid gap-6 lg:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label
                                                className="block text-sm font-medium"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                {editorLabel}
                                            </label>
                                            <RichTextEditor
                                                value={values.value}
                                                onChange={(content) => setFieldValue("value", content)}
                                                placeholder={editorPlaceholder}
                                                minHeight={editorMinHeight}
                                            />
                                            {helperText && (
                                                <p
                                                    className="text-xs"
                                                    style={{ color: "var(--color-text-tertiary)" }}
                                                >
                                                    {helperText}
                                                </p>
                                            )}
                                        </div>

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

                                    <div className="space-y-3">
                                        <h4
                                            className="text-sm font-semibold uppercase tracking-wide"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {previewTitle}
                                        </h4>
                                        <div
                                            className="admin-preview-content rounded-lg border border-[var(--color-border)] bg-[var(--color-background-elevated)] p-4 text-sm max-w-none"
                                            style={{ color: "var(--color-text-primary)" }}
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    sanitizedPreview.trim().length > 0
                                                        ? sanitizedPreview
                                                        : "<p style='opacity:0.6;'>No content yet. Start writing on the left to see the live preview.</p>",
                                            }}
                                        />
                                        <style jsx global>{`
                                            .admin-preview-content h1 {
                                                font-size: 1.875rem;
                                                font-weight: 700;
                                                margin-bottom: 0.75rem;
                                                color: var(--color-text-primary);
                                            }
                                            .admin-preview-content h2 {
                                                font-size: 1.5rem;
                                                font-weight: 600;
                                                margin-bottom: 0.5rem;
                                                color: var(--color-text-primary);
                                            }
                                            .admin-preview-content h3 {
                                                font-size: 1.25rem;
                                                font-weight: 600;
                                                margin-bottom: 0.5rem;
                                                color: var(--color-text-primary);
                                            }
                                            .admin-preview-content p {
                                                margin-bottom: 0.75rem;
                                                line-height: 1.6;
                                            }
                                            .admin-preview-content ul,
                                            .admin-preview-content ol {
                                                margin-left: 1.5rem;
                                                margin-bottom: 0.75rem;
                                            }
                                            .admin-preview-content ul {
                                                list-style-type: disc;
                                            }
                                            .admin-preview-content ol {
                                                list-style-type: decimal;
                                            }
                                            .admin-preview-content li {
                                                margin-bottom: 0.25rem;
                                            }
                                            .admin-preview-content a {
                                                color: var(--color-primary);
                                                text-decoration: underline;
                                            }
                                            .admin-preview-content a:hover {
                                                opacity: 0.8;
                                            }
                                            .admin-preview-content strong,
                                            .admin-preview-content b {
                                                font-weight: 600;
                                            }
                                            .admin-preview-content em,
                                            .admin-preview-content i {
                                                font-style: italic;
                                            }
                                            .admin-preview-content u {
                                                text-decoration: underline;
                                            }
                                            .admin-preview-content s,
                                            .admin-preview-content strike {
                                                text-decoration: line-through;
                                            }
                                        `}</style>
                                    </div>
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

export default AdminSettingEditorCard;


