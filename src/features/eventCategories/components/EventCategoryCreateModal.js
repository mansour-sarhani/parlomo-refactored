"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useCallback } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, FileUploadField } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createEventCategory } from "@/features/eventCategories/eventCategoriesSlice";
import { toast } from "sonner";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    image: Yup.mixed().required("Image is required"),
});

export function EventCategoryCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const creating = useAppSelector((state) => state.eventCategories.creating);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            try {
                await dispatch(
                    createEventCategory({
                        title: values.title,
                        image: values.image,
                    })
                ).unwrap();

                toast.success("Event category created successfully");
                formikHelpers.resetForm();
                onCreated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to create event category");
            }
        },
        [dispatch, onClose, onCreated]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Event Category"
            size="lg"
        >
            <Formik
                initialValues={{
                    title: "",
                    image: null,
                }}
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

                        <FileUploadField
                            name="image"
                            label="Image"
                            helperText="Supported formats: JPG, PNG, WEBP"
                            required
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
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
                )}
            </Formik>
        </Modal>
    );
}

export default EventCategoryCreateModal;

