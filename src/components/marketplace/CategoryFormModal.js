"use client";

import { useEffect } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Button } from "@/components/common/Button";

const schema = Yup.object({
    title: Yup.string().required("Title is required"),
    type: Yup.string().required("Type is required"),
});

export default function CategoryFormModal({
    isOpen,
    onClose,
    mode = "create",
    initialValues,
    onSubmit,
    loading = false,
    typeOptions = [],
    parentOptions = [],
    onTypeChange,
}) {
    const formId = mode === "edit" ? "category-edit-form" : "category-create-form";

    useEffect(() => {
        if (!isOpen) return;
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Category" : "Create Category"}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" form={formId} loading={loading}>
                        {mode === "edit" ? "Save changes" : "Create category"}
                    </Button>
                </>
            }
        >
            <Formik
                initialValues={initialValues}
                validationSchema={schema}
                enableReinitialize
                onSubmit={onSubmit}
            >
                {({ values, setFieldValue }) => (
                    <Form id={formId} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField name="title" label="Title" required placeholder="e.g. Cars" />
                            <InputField
                                name="price"
                                label="Price"
                                placeholder="Optional price override"
                                type="number"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <SelectField
                                name="type"
                                label="Ad Type"
                                required
                                options={typeOptions}
                                placeholder="Select type"
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setFieldValue("type", value);
                                    onTypeChange?.(value);
                                }}
                                value={values.type}
                            />

                            <SelectField
                                name="parent"
                                label="Parent category"
                                options={parentOptions}
                                placeholder="Optional parent"
                                value={values.parent || ""}
                                onChange={(event) => setFieldValue("parent", event.target.value)}
                            />
                        </div>

                        <InputField
                            name="quoteText"
                            label="Custom CTA"
                            placeholder="Label replacing the default 'Get Quote'"
                        />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label
                                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(values.showPrice)}
                                    onChange={(event) =>
                                        setFieldValue("showPrice", event.target.checked)
                                    }
                                />
                                <span className="text-neutral-700">Show price in listing form</span>
                            </label>

                            <label
                                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(values.status ?? true)}
                                    onChange={(event) =>
                                        setFieldValue("status", event.target.checked)
                                    }
                                />
                                <span className="text-neutral-700">Active</span>
                            </label>
                        </div>

                        <FileUploadField
                            name="image"
                            label="Image"
                            helperText="Category icon shown across the marketplace"
                            showPreview
                        />
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

