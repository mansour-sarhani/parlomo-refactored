"use client";

import { useCallback, useEffect, useMemo } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { InputField, SelectField, FileUploadField } from "@/components/forms";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    createBusinessCategory,
    fetchBusinessCategoryOptions,
} from "@/features/businesses/businessCategoriesSlice";
import { buildCategoryOptions } from "./utils";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    parent: Yup.string().nullable(),
    image: Yup.mixed().required("Image is required"),
});

export function BusinessCategoryCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const { creating, options, optionsLoading } = useAppSelector((state) => state.businessCategories);

    useEffect(() => {
        if (!isOpen) return;
        dispatch(fetchBusinessCategoryOptions());
    }, [dispatch, isOpen]);

    const parentOptions = useMemo(() => buildCategoryOptions(options), [options]);

    const handleSubmit = useCallback(
        async (values, formikHelpers) => {
            try {
                await dispatch(
                    createBusinessCategory({
                        title: values.title,
                        parent: values.parent || undefined,
                        image: values.image,
                    })
                ).unwrap();

                toast.success("Business category created successfully");
                formikHelpers.resetForm();
                onCreated?.();
                onClose?.();
            } catch (error) {
                toast.error(error || "Failed to create business category");
            }
        },
        [dispatch, onClose, onCreated]
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Business Category"
            size="lg"
        >
            <Formik
                initialValues={{
                    title: "",
                    parent: "",
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

                        <SelectField
                            name="parent"
                            label="Parent Category"
                            disabled={optionsLoading}
                        >
                            <option value="">No parent</option>
                            {parentOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <FileUploadField
                            name="image"
                            label="Category Image"
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

export default BusinessCategoryCreateModal;


