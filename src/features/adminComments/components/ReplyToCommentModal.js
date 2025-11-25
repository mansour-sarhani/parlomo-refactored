"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { toast } from "sonner";

const validationSchema = Yup.object().shape({
    body: Yup.string()
        .required("This field is required.")
        .min(1, "Message cannot be empty"),
});

export function ReplyToCommentModal({ isOpen, onClose, comment, onSubmit }) {
    const [error, setError] = useState(null);

    const initialValues = {
        body: "",
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setError(null);
        try {
            await onSubmit({
                body: values.body,
                parent: comment?.id,
            });
            toast.success("Your reply has been submitted. Please refresh the list.");
            onClose();
        } catch (err) {
            setError(err.message || "Failed to submit reply");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reply to the Comment"
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form className="space-y-4">
                        <div>
                            <label
                                className="block text-sm font-medium mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Your Message
                            </label>
                            <Field
                                as="textarea"
                                name="body"
                                rows={6}
                                className="w-full rounded-lg border px-4 py-2 text-sm resize-none"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-background)",
                                    color: "var(--color-text-primary)",
                                }}
                                placeholder="Enter your reply..."
                            />
                            {touched.body && errors.body && (
                                <div
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--color-error)" }}
                                >
                                    {errors.body}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div
                                className="text-sm p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-error-bg)",
                                    color: "var(--color-error)",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default ReplyToCommentModal;

