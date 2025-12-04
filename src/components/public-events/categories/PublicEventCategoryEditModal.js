"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import * as LucideIcons from "lucide-react";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, TextareaField, SelectField, CheckboxField } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchPublicEventCategoryById,
    updatePublicEventCategory,
    clearCurrentCategory,
} from "@/features/public-events/publicEventCategoriesSlice";

// Common Lucide icons for categories
const ICON_OPTIONS = [
    { value: "Music", label: "Music" },
    { value: "Users", label: "Users / Conference" },
    { value: "Wrench", label: "Wrench / Workshop" },
    { value: "PartyPopper", label: "Party / Festival" },
    { value: "Trophy", label: "Trophy / Sports" },
    { value: "Theater", label: "Theater" },
    { value: "Laugh", label: "Laugh / Comedy" },
    { value: "Network", label: "Network / Networking" },
    { value: "Heart", label: "Heart / Charity" },
    { value: "Calendar", label: "Calendar" },
    { value: "Mic", label: "Microphone" },
    { value: "Film", label: "Film" },
    { value: "Palette", label: "Palette / Art" },
    { value: "Utensils", label: "Utensils / Food" },
    { value: "GraduationCap", label: "Graduation / Education" },
    { value: "Briefcase", label: "Briefcase / Business" },
    { value: "MoreHorizontal", label: "Other" },
];

const validationSchema = Yup.object({
    name: Yup.string()
        .required("Name is required")
        .max(100, "Name cannot exceed 100 characters"),
    icon: Yup.string().required("Icon is required"),
    description: Yup.string().max(500, "Description cannot exceed 500 characters"),
    sortOrder: Yup.number().integer().min(0, "Sort order must be 0 or greater"),
});

export function PublicEventCategoryEditModal({
    categoryId,
    isOpen,
    onClose,
    onUpdated,
}) {
    const dispatch = useAppDispatch();
    const { currentCategory, loading, updating } = useAppSelector(
        (state) => state.publicEventCategories
    );

    const [imagePreview, setImagePreview] = useState(null);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const [removeExistingImage, setRemoveExistingImage] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && categoryId) {
            dispatch(fetchPublicEventCategoryById(categoryId));
        }

        return () => {
            dispatch(clearCurrentCategory());
            setImagePreview(null);
            setRemoveExistingImage(false);
            setImagePreviewOpen(false);
        };
    }, [dispatch, isOpen, categoryId]);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            if (!currentCategory) {
                return;
            }

            const changes = {};

            // Check for changes
            const trimmedName = values.name.trim();
            if (trimmedName && trimmedName !== currentCategory.name) {
                changes.name = trimmedName;
            }

            if (values.icon !== currentCategory.icon) {
                changes.icon = values.icon;
            }

            const trimmedDescription = values.description?.trim() || "";
            if (trimmedDescription !== (currentCategory.description || "")) {
                changes.description = trimmedDescription;
            }

            const newStatus = values.isActive ? "active" : "inactive";
            if (newStatus !== currentCategory.status) {
                changes.status = newStatus;
            }

            if (values.sortOrder !== currentCategory.sortOrder) {
                changes.sortOrder = values.sortOrder;
            }

            // Handle image changes
            if (removeExistingImage) {
                changes.removeImage = true;
            } else if (values.image instanceof File) {
                changes.image = values.image;
            }

            if (Object.keys(changes).length === 0) {
                toast.info("No changes detected");
                return;
            }

            try {
                await dispatch(
                    updatePublicEventCategory({
                        id: categoryId,
                        changes,
                    })
                ).unwrap();

                toast.success("Category updated successfully");
                formikHelpers.resetForm({
                    values: {
                        ...values,
                        image: null,
                    },
                });
                setImagePreview(null);
                setRemoveExistingImage(false);
                onUpdated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to update category");
            }
        },
        [categoryId, currentCategory, dispatch, onClose, onUpdated, removeExistingImage]
    );

    const handleImageChange = (event, setFieldValue) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            setFieldValue("image", file);
            setRemoveExistingImage(false);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleRemoveImage = (setFieldValue) => {
        setFieldValue("image", null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setRemoveExistingImage(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        // Clean up preview URL
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        setRemoveExistingImage(false);
        onClose?.();
    };

    // Determine what image to show
    const displayImage = imagePreview || (!removeExistingImage && currentCategory?.image);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                title="Edit Event Category"
                size="lg"
            >
                {loading ? (
                    <div
                        className="py-10 text-center"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Loading category details...
                    </div>
                ) : currentCategory ? (
                    <Formik
                        enableReinitialize
                        initialValues={{
                            name: currentCategory.name || "",
                            icon: currentCategory.icon || "MoreHorizontal",
                            description: currentCategory.description || "",
                            isActive: currentCategory.status === "active",
                            sortOrder: currentCategory.sortOrder ?? 0,
                            image: null,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, setFieldValue, values }) => {
                            // Get the selected icon component
                            const SelectedIcon = LucideIcons[values.icon] || LucideIcons.MoreHorizontal;

                            return (
                                <Form className="space-y-6">
                                    <InputField
                                        name="name"
                                        label="Category Name"
                                        placeholder="Enter category name"
                                        required
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <SelectField
                                            name="icon"
                                            label="Icon"
                                            required
                                        >
                                            {ICON_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </SelectField>

                                        <div className="flex items-end pb-1">
                                            <div
                                                className="flex items-center justify-center w-12 h-12 rounded-lg border"
                                                style={{
                                                    borderColor: "var(--color-border)",
                                                    backgroundColor: "var(--color-background-elevated)",
                                                }}
                                            >
                                                <SelectedIcon
                                                    className="w-6 h-6"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                />
                                            </div>
                                            <span
                                                className="ml-3 text-sm"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                Preview
                                            </span>
                                        </div>
                                    </div>

                                    <TextareaField
                                        name="description"
                                        label="Description"
                                        placeholder="Enter category description (optional)"
                                        rows={3}
                                    />

                                    <InputField
                                        name="sortOrder"
                                        label="Sort Order"
                                        type="number"
                                        placeholder="0"
                                        min={0}
                                    />

                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <label
                                            className="text-sm font-medium"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            Category Image
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="relative flex items-center justify-center w-20 h-20 rounded-lg border overflow-hidden"
                                                style={{
                                                    borderColor: "var(--color-border)",
                                                    backgroundColor: "var(--color-background-secondary)",
                                                }}
                                            >
                                                {displayImage ? (
                                                    imagePreview ? (
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Image
                                                            src={displayImage}
                                                            alt={currentCategory.name || "Category"}
                                                            fill
                                                            sizes="80px"
                                                            className="object-cover"
                                                        />
                                                    )
                                                ) : (
                                                    <ImageIcon
                                                        className="w-8 h-8"
                                                        style={{ color: "var(--color-text-tertiary)" }}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1 text-sm">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="font-medium"
                                                    style={{ color: "var(--color-primary)" }}
                                                >
                                                    {displayImage ? "Change image" : "Upload image"}
                                                </button>

                                                {displayImage && !imagePreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setImagePreviewOpen(true)}
                                                        className="text-xs"
                                                        style={{ color: "var(--color-text-secondary)" }}
                                                    >
                                                        View full size
                                                    </button>
                                                )}

                                                {displayImage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(setFieldValue)}
                                                        className="text-xs"
                                                        style={{ color: "var(--color-error)" }}
                                                    >
                                                        Remove image
                                                    </button>
                                                )}

                                                {values.image instanceof File && (
                                                    <span
                                                        className="text-xs"
                                                        style={{ color: "var(--color-text-secondary)" }}
                                                    >
                                                        New: {values.image.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(e, setFieldValue)}
                                        />

                                        <ErrorMessage name="image">
                                            {(msg) => (
                                                <p
                                                    className="text-xs font-medium"
                                                    style={{ color: "var(--color-error)" }}
                                                >
                                                    {msg}
                                                </p>
                                            )}
                                        </ErrorMessage>

                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--color-text-tertiary)" }}
                                        >
                                            Supported formats: JPG, PNG, GIF, WEBP. Max size: 2MB.
                                        </p>
                                    </div>

                                    <CheckboxField
                                        name="isActive"
                                        label="Active category (visible to users)"
                                    />

                                    <div className="flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleClose}
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
                            );
                        }}
                    </Formik>
                ) : (
                    <div
                        className="py-10 text-center"
                        style={{ color: "var(--color-error)" }}
                    >
                        Unable to load category
                    </div>
                )}
            </Modal>

            {/* Image Preview Modal */}
            {imagePreviewOpen && currentCategory?.image && (
                <Modal
                    isOpen={imagePreviewOpen}
                    onClose={() => setImagePreviewOpen(false)}
                    title={currentCategory?.name || "Category image"}
                    size="lg"
                >
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={currentCategory.image}
                            alt={currentCategory?.name || "Category image"}
                            fill
                            sizes="(max-width: 768px) 100vw, 800px"
                            className="object-contain"
                        />
                    </div>
                </Modal>
            )}
        </>
    );
}

export default PublicEventCategoryEditModal;
