"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Button } from "@/components/common/Button";
import { Field } from "formik";

const ATTRIBUTE_TYPES = [
    "date",
    "month",
    "number",
    "tel",
    "text",
    "time",
    "url",
    "week",
];

const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    name: Yup.string().required("Name is required"),
    type: Yup.string().required("Type is required"),
});

const buildOptions = () =>
    ATTRIBUTE_TYPES.map((value) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
    }));

export default function AttributeFormModal({
    isOpen,
    onClose,
    mode = "create",
    initialValues,
    onSubmit,
    loading = false,
}) {
    const formId = mode === "edit" ? "attribute-edit-form" : "attribute-create-form";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === "edit" ? "Edit Attribute" : "Create Attribute"}
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" form={formId} loading={loading}>
                        {mode === "edit" ? "Save changes" : "Create attribute"}
                    </Button>
                </>
            }
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue }) => (
                    <Form id={formId} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField name="title" label="Title" required placeholder="e.g. Make" />
                            <InputField name="name" label="Field Name" required placeholder="e.g. make" />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <SelectField
                                name="type"
                                label="Input Type"
                                required
                                options={buildOptions()}
                                placeholder="Select input type"
                            />
                            <InputField
                                name="description"
                                label="Description"
                                placeholder="Optional helper text"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label
                                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Field
                                    type="checkbox"
                                    name="required"
                                    checked={Boolean(values.required)}
                                    onChange={(event) => setFieldValue("required", event.target.checked)}
                                />
                                <span className="text-neutral-700">Mark as required</span>
                            </label>
                            <label
                                className="flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Field
                                    type="checkbox"
                                    name="status"
                                    checked={Boolean(values.status ?? true)}
                                    onChange={(event) => setFieldValue("status", event.target.checked)}
                                />
                                <span className="text-neutral-700">Active</span>
                            </label>
                        </div>

                        <FileUploadField
                            name="image"
                            label="Icon"
                            helperText="Optional icon shown in selection lists"
                            showPreview
                        />
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

