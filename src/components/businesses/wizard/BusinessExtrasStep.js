"use client";

import { useMemo } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
} from "@/features/businesses/businessWizardSlice";
import { Button } from "@/components/common/Button";
import { TextareaField, InputField, FileUploadField } from "@/components/forms";

const validationSchema = Yup.object({
    faqs: Yup.array().of(
        Yup.object({
            question: Yup.string().required("Question is required"),
            answer: Yup.string().required("Answer is required"),
        })
    ),
    certificates: Yup.array().of(
        Yup.object({
            title: Yup.string().max(50, "Title must be 50 characters or less"),
            description: Yup.string().max(300, "Description must be 300 characters or less"),
            image: Yup.mixed().nullable(),
        })
    ),
});

export default function BusinessExtrasStep() {
    const dispatch = useAppDispatch();
    const draft = useAppSelector((state) => state.businessWizard.draft);

    const initialValues = useMemo(
        () => {
            // Debug: Log draft data for this step
            console.log("[BusinessExtrasStep] Draft data:", draft);
            console.log("[BusinessExtrasStep] FAQs:", draft.faqs);
            console.log("[BusinessExtrasStep] Certificates:", draft.certificates);
            
            const faqs = Array.isArray(draft.faqs) && draft.faqs.length > 0
                ? draft.faqs.map((faq) => ({
                      question: faq.question || "",
                      answer: faq.answer || "",
                  }))
                : [
                      {
                          question: "",
                          answer: "",
                      },
                  ];
            
            const certificates = Array.isArray(draft.certificates) && draft.certificates.length > 0
                ? draft.certificates.map((cert) => ({
                      title: cert.title || "",
                      description: cert.description || "",
                      image: cert.image || null, // This should be a URL string now
                      imageFilename: cert.imageFilename || null, // Keep original filename
                  }))
                : [];
            
            console.log("[BusinessExtrasStep] Normalized FAQs:", faqs);
            console.log("[BusinessExtrasStep] Normalized Certificates:", certificates);
            
            return {
                faqs,
                certificates,
            };
        },
        [draft.faqs, draft.certificates]
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                dispatch(
                    setBusinessWizardDraft({
                        ...draft,
                        faqs: values.faqs,
                        certificates: values.certificates || [],
                    })
                );
                dispatch(nextBusinessWizardStep());
            }}
        >
            {({ values }) => (
                <Form className="space-y-6">
                    <FieldArray name="faqs">
                        {({ remove, push }) => (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3
                                        className="text-sm font-semibold"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Frequently Asked Questions
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            push({
                                                question: "",
                                                answer: "",
                                            })
                                        }
                                    >
                                        Add FAQ
                                    </Button>
                                </div>
                                {values.faqs.map((faq, index) => (
                                    <div
                                        key={`faq-${index}`}
                                        className="rounded-lg border p-4 space-y-3"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <InputField
                                            name={`faqs[${index}].question`}
                                            label="Question"
                                            placeholder="What should customers know?"
                                            required
                                        />
                                        <TextareaField
                                            name={`faqs[${index}].answer`}
                                            label="Answer"
                                            rows={3}
                                            required
                                        />
                                        {values.faqs.length > 1 && (
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    onClick={() => remove(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </FieldArray>

                    <FieldArray name="certificates">
                        {({ remove, push }) => (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3
                                        className="text-sm font-semibold"
                                        style={{ color: "var(--color-text-primary)" }}
                                    >
                                        Certificates (Optional)
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            push({
                                                title: "",
                                                description: "",
                                                image: null,
                                            })
                                        }
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Certificate
                                    </Button>
                                </div>
                                {values.certificates && values.certificates.length > 0 ? (
                                    values.certificates.map((certificate, index) => (
                                        <div
                                            key={`certificate-${index}`}
                                            className="rounded-lg border p-4 space-y-4"
                                            style={{ borderColor: "var(--color-border)" }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{ color: "var(--color-text-secondary)" }}
                                                >
                                                    Certificate #{index + 1}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                            <InputField
                                                name={`certificates[${index}].title`}
                                                label="Title"
                                                placeholder="Enter certificate title"
                                                maxLength={50}
                                            />
                                            <FileUploadField
                                                name={`certificates[${index}].image`}
                                                label="Image"
                                                helperText="Upload certificate image. Optional."
                                                multiple={false}
                                            />
                                            <TextareaField
                                                name={`certificates[${index}].description`}
                                                label="Description"
                                                placeholder="Enter certificate description"
                                                rows={3}
                                                maxLength={300}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 rounded-lg border border-dashed" style={{ borderColor: "var(--color-border)" }}>
                                        <p
                                            className="text-sm mb-4"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            No certificates added yet
                                        </p>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() =>
                                                push({
                                                    title: "",
                                                    description: "",
                                                    image: null,
                                                })
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add a Certificate
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </FieldArray>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => dispatch(prevBusinessWizardStep())}
                        >
                            Back
                        </Button>
                        <Button type="submit">
                            Continue
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}


