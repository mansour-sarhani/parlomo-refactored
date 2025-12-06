"use client";

import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { sendContactForm } from "@/services/settings.service";
import { Info, CheckCircle } from "lucide-react";

const validationSchema = Yup.object().shape({
    title: Yup.string().required("This field is required"),
    email: Yup.string().email("Enter a valid email").required("This field is required"),
    message: Yup.string().required("This field is required"),
});

const initialValues = {
    title: "",
    email: "",
    message: "",
};

const FormField = ({ label, name, type = "text", placeholder, as, rows }) => (
    <Field name={name}>
        {({ field, meta }) => {
            const hasError = meta.touched && meta.error;
            const InputComponent = as === "textarea" ? "textarea" : "input";

            return (
                <div className="space-y-2">
                    {label && (
                        <label
                            htmlFor={name}
                            className="block text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {label}
                        </label>
                    )}
                    <InputComponent
                        {...field}
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        rows={rows}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{
                            backgroundColor: "var(--color-background-elevated)",
                            border: `1px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
                            color: "var(--color-text-primary)",
                        }}
                    />
                    {hasError && (
                        <p
                            className="flex items-center gap-1 text-xs"
                            style={{ color: "var(--color-error)" }}
                        >
                            <Info size={14} />
                            {meta.error}
                        </p>
                    )}
                </div>
            );
        }}
    </Field>
);

export const ContactForm = () => {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [formError, setFormError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    if (isSuccess) {
        return (
            <div
                className="rounded-xl p-8 text-center"
                style={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                }}
            >
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: "var(--color-success-light, #dcfce7)" }}
                >
                    <CheckCircle
                        className="w-8 h-8"
                        style={{ color: "var(--color-success)" }}
                    />
                </div>
                <h3
                    className="text-xl font-semibold mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Message Sent!
                </h3>
                <p
                    className="text-sm mb-6"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                >
                    Send Another Message
                </Button>
            </div>
        );
    }

    return (
        <div
            className="rounded-xl p-6 md:p-8"
            style={{
                backgroundColor: "var(--color-background)",
                border: "1px solid var(--color-border)",
            }}
        >
            <h2
                className="text-xl font-semibold mb-6"
                style={{ color: "var(--color-text-primary)" }}
            >
                Send us a Message
            </h2>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, resetForm }) => {
                    setFormError(null);

                    if (!executeRecaptcha) {
                        toast.error("reCAPTCHA not ready. Please try again.");
                        setSubmitting(false);
                        return;
                    }

                    try {
                        const token = await executeRecaptcha("contact");

                        const data = {
                            title: values.title,
                            email: values.email,
                            message: values.message,
                            token,
                        };

                        await sendContactForm(data);
                        toast.success("Your message has been sent.");
                        resetForm();
                        setIsSuccess(true);
                    } catch (error) {
                        console.error("Contact form error:", error);
                        const message = error?.message || "Failed to send message. Please try again.";
                        setFormError(message);
                        toast.error(message);
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-5">
                        <FormField
                            name="title"
                            label="Subject"
                            placeholder="What is your message about?"
                        />

                        <FormField
                            name="email"
                            label="Your Email"
                            type="email"
                            placeholder="you@example.com"
                        />

                        <FormField
                            name="message"
                            label="Your Message"
                            as="textarea"
                            rows={5}
                            placeholder="How can we help you?"
                        />

                        {formError && (
                            <div
                                className="rounded-lg p-3 text-sm"
                                style={{
                                    backgroundColor: "var(--color-error-light)",
                                    color: "var(--color-error)",
                                }}
                            >
                                {formError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            fullWidth
                            loading={isSubmitting}
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </Button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ContactForm;
