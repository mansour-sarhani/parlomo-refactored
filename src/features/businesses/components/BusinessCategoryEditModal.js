"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, SelectField, FileUploadField, CheckboxField } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchBusinessCategoryById,
    fetchBusinessCategoryOptionsForEdit,
    updateBusinessCategory,
    clearBusinessCategory,
} from "@/features/businesses/businessCategoriesSlice";
import { buildCategoryOptions, collectDescendantIds } from "./utils";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    parent: Yup.string().nullable(),
    status: Yup.boolean(),
    image: Yup.mixed().nullable(),
});

const buildImageUrl = (category) => {
    if (!category?.image) return null;

    if (typeof category.image === "string" && category.image.startsWith("http")) {
        return category.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const path = category.path ? `${category.path.replace(/\/+$/, "")}/` : "";

    return `${base}${path}${category.image}`;
};

export function BusinessCategoryEditModal({ categoryId, isOpen, onClose, onUpdated }) {
    const dispatch = useAppDispatch();
    const {
        currentCategory,
        editOptions,
        fetchingSingle,
        updating,
        editOptionsLoading,
    } = useAppSelector((state) => state.businessCategories);

    useEffect(() => {
        if (isOpen && categoryId) {
            dispatch(fetchBusinessCategoryById(categoryId));
            dispatch(fetchBusinessCategoryOptionsForEdit());
        }

        return () => {
            dispatch(clearBusinessCategory());
        };
    }, [dispatch, isOpen, categoryId]);

    const exclusionSet = useMemo(
        () => collectDescendantIds(currentCategory || undefined),
        [currentCategory]
    );

    const parentOptions = useMemo(
        () => buildCategoryOptions(editOptions, exclusionSet),
        [editOptions, exclusionSet]
    );

    const imageUrl = useMemo(() => buildImageUrl(currentCategory), [currentCategory]);

    const initialValues = useMemo(
        () => ({
            title: currentCategory?.title || "",
            parent: currentCategory?.parent_id ? String(currentCategory.parent_id) : "",
            status: Boolean(currentCategory?.status),
            image: null,
        }),
        [currentCategory]
    );

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            if (!categoryId || !currentCategory) {
                return;
            }

            const changes = {};

            const trimmedTitle = values.title.trim();
            if (trimmedTitle && trimmedTitle !== currentCategory.title) {
                changes.title = trimmedTitle;
            }

            const selectedParent = values.parent || null;
            const currentParent = currentCategory.parent_id
                ? String(currentCategory.parent_id)
                : "";

            if ((selectedParent || "") !== (currentParent || "")) {
                changes.parent = selectedParent || null;
            }

            const statusBoolean = Boolean(values.status);
            if (statusBoolean !== Boolean(currentCategory.status)) {
                changes.status = statusBoolean ? "1" : "0";
            }

            if (values.image instanceof File || values.image instanceof Blob) {
                changes.image = values.image;
            }

            if (Object.keys(changes).length === 0) {
                toast.info("No changes detected");
                return;
            }

            try {
                await dispatch(
                    updateBusinessCategory({
                        id: categoryId,
                        changes,
                    })
                ).unwrap();

                toast.success("Business category updated successfully");
                formikHelpers.resetForm({
                    values: {
                        ...values,
                        image: null,
                    },
                });
                onUpdated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to update business category");
            }
        },
        [categoryId, currentCategory, dispatch, onClose, onUpdated]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Business Category"
            size="lg"
        >
            {fetchingSingle ? (
                <div className="py-10 text-center" style={{ color: "var(--color-text-secondary)" }}>
                    Loading category details...
                </div>
            ) : currentCategory ? (
                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-6">
                            <InputField
                                name="title"
                                label="Title"
                                placeholder="Enter category title"
                                required
                            />

                            <SelectField
                                name="parent"
                                label="Parent Category"
                                disabled={editOptionsLoading}
                            >
                                <option value="">No parent</option>
                                {parentOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectField>

                            <div className="space-y-3">
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Current Image
                                </p>
                                {imageUrl ? (
                                    <div
                                        className="relative w-24 h-24 overflow-hidden rounded-lg border"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={currentCategory.title || "Category image"}
                                            fill
                                            sizes="96px"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="flex items-center justify-center w-24 h-24 rounded-lg border text-xs"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            color: "var(--color-text-tertiary)",
                                            backgroundColor: "var(--color-background-elevated)",
                                        }}
                                    >
                                        No image
                                    </div>
                                )}

                                <FileUploadField
                                    name="image"
                                    label="Upload new image"
                                    helperText="Uploading a file replaces the existing image. Supported formats: JPG, PNG, WEBP."
                                />
                            </div>

                            <CheckboxField
                                name="status"
                                label="Active category"
                            />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={updating || isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={updating || isSubmitting}
                                >
                                    Update
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            ) : (
                <div className="py-10 text-center" style={{ color: "var(--color-error)" }}>
                    Unable to load business category
                </div>
            )}
        </Modal>
    );
}

export default BusinessCategoryEditModal;


