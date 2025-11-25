"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, CheckboxField } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchEventCategoryById,
    updateEventCategory,
    clearCurrentCategory,
} from "@/features/eventCategories/eventCategoriesSlice";
import { ImageIcon } from "lucide-react";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    status: Yup.boolean(),
});

const buildImageUrl = (category) => {
    if (!category?.image) return null;
    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const path = category.path ? `${category.path.replace(/\/+$/, "")}/` : "";
    return `${base}${path}${category.image}`;
};

export function EventCategoryEditModal({
    categoryId,
    isOpen,
    onClose,
    onUpdated,
}) {
    const dispatch = useAppDispatch();
    const { currentCategory, fetchingSingle, updating } = useAppSelector(
        (state) => state.eventCategories
    );

    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
    const fileInputRef = useRef(null);

    const imageUrl = useMemo(() => buildImageUrl(currentCategory), [currentCategory]);

    useEffect(() => {
        if (isOpen && categoryId) {
            dispatch(fetchEventCategoryById(categoryId));
        }

        return () => {
            dispatch(clearCurrentCategory());
            setImagePreviewOpen(false);
        };
    }, [dispatch, isOpen, categoryId]);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            if (!currentCategory) {
                return;
            }

            const changes = {};

            const trimmedTitle = values.title.trim();
            if (trimmedTitle && trimmedTitle !== currentCategory.title) {
                changes.title = trimmedTitle;
            }

            const statusBoolean = Boolean(values.status);
            if (statusBoolean !== Boolean(currentCategory.status)) {
                changes.status = statusBoolean;
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
                    updateEventCategory({
                        id: categoryId,
                        changes,
                    })
                ).unwrap();

                toast.success("Event category updated successfully");
                formikHelpers.resetForm({
                    values: {
                        ...values,
                        image: null,
                    },
                });
                onUpdated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to update event category");
            }
        },
        [categoryId, currentCategory, dispatch, onClose, onUpdated]
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Edit Event Category"
                size="lg"
            >
                {fetchingSingle ? (
                    <div className="py-10 text-center" style={{ color: "var(--color-text-secondary)" }}>
                        Loading category details...
                    </div>
                ) : currentCategory ? (
                    <Formik
                        enableReinitialize
                        initialValues={{
                            title: currentCategory.title || "",
                            status: Boolean(currentCategory.status),
                            image: null,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, setFieldValue, values }) => (
                            <Form className="space-y-6">
                                <InputField
                                    name="title"
                                    label="Title"
                                    placeholder="Enter category title"
                                    required
                                />

                                <div className="space-y-2">
                                    <label
                                        className="text-sm font-medium"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Category Image
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="relative flex items-center justify-center w-20 h-20 rounded-full border"
                                            style={{
                                                borderColor: "var(--color-border)",
                                                backgroundColor: "var(--color-background-secondary)",
                                            }}
                                        >
                                            {imageUrl ? (
                                                <Image
                                                    src={imageUrl}
                                                    alt={currentCategory.title || "Category image"}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover rounded-full"
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
                                                {imageUrl ? "Change image" : "Upload image"}
                                            </button>

                                            {imageUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => setImagePreviewOpen(true)}
                                                    className="text-xs"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                >
                                                    View full size
                                                </button>
                                            )}

                                            {values.image instanceof File && (
                                                <div
                                                    className="text-xs"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                >
                                                    Selected: {values.image.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFieldValue("image", null);
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = "";
                                                            }
                                                        }}
                                                        className="ml-2"
                                                        style={{ color: "var(--color-primary)" }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.currentTarget.files?.[0];
                                            if (file) {
                                                setFieldValue("image", file);
                                            }
                                            if (event.target) {
                                                event.target.value = "";
                                            }
                                        }}
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
                                        Upload a square image (JPG, PNG, or WEBP). Existing image will be replaced.
                                    </p>
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
                        Unable to load event category
                    </div>
                )}
            </Modal>

            {imagePreviewOpen && imageUrl && (
                <Modal
                    isOpen={imagePreviewOpen}
                    onClose={() => setImagePreviewOpen(false)}
                    title={currentCategory?.title || "Category image"}
                    size="lg"
                >
                    <div className="relative w-full h-[400px]">
                        <Image
                            src={imageUrl}
                            alt={currentCategory?.title || "Category image"}
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

export default EventCategoryEditModal;

