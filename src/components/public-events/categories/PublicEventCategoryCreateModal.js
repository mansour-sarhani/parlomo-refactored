"use client";

import { useCallback, useRef, useState } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import * as LucideIcons from "lucide-react";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, TextareaField, SelectField, CheckboxField } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createPublicEventCategory } from "@/features/public-events/publicEventCategoriesSlice";

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
    status: Yup.string().oneOf(["active", "inactive"]),
});

export function PublicEventCategoryCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const creating = useAppSelector((state) => state.publicEventCategories.creating);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            try {
                await dispatch(
                    createPublicEventCategory({
                        name: values.name,
                        icon: values.icon,
                        description: values.description,
                        status: values.isActive ? "active" : "inactive",
                        image: values.image,
                    })
                ).unwrap();

                toast.success("Category created successfully");
                formikHelpers.resetForm();
                setImagePreview(null);
                onCreated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to create category");
            }
        },
        [dispatch, onClose, onCreated]
    );

    const handleImageChange = (event, setFieldValue) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            setFieldValue("image", file);
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
        onClose?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Event Category"
            size="lg"
        >
            <Formik
                initialValues={{
                    name: "",
                    icon: "MoreHorizontal",
                    description: "",
                    isActive: true,
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

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Category Image (Optional)
                                </label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="relative flex items-center justify-center w-20 h-20 rounded-lg border overflow-hidden"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor: "var(--color-background-secondary)",
                                        }}
                                    >
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
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
                                            {imagePreview ? "Change image" : "Upload image"}
                                        </button>

                                        {imagePreview && (
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
                                                {values.image.name}
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
                                    disabled={creating || isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={creating || isSubmitting}
                                >
                                    Create
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
}

export default PublicEventCategoryCreateModal;
