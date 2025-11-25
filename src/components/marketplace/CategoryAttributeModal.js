"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/common/Modal";
import { SelectField } from "@/components/forms/SelectField";
import { Button } from "@/components/common/Button";

const schema = Yup.object({
    attribute: Yup.string().required("Attribute is required"),
});

export default function CategoryAttributeModal({
    isOpen,
    onClose,
    onSubmit,
    attributeOptions = [],
    loading = false,
}) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Attach Attribute"
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" form="category-attribute-form" loading={loading}>
                        Attach
                    </Button>
                </>
            }
        >
            <Formik
                initialValues={{ attribute: "" }}
                validationSchema={schema}
                onSubmit={onSubmit}
            >
                {() => (
                    <Form id="category-attribute-form" className="space-y-5">
                        <SelectField
                            name="attribute"
                            label="Attribute"
                            options={attributeOptions}
                            placeholder="Select an attribute to attach"
                            required
                        />
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

