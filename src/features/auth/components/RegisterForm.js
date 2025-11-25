"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import { GoogleAuthButton } from "./GoogleAuthButton";

const phoneRegExp = /^[1-9]\d{9}$/;

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Full name is required"),
    registerWithPhone: Yup.boolean(),
    email: Yup.string().when("registerWithPhone", {
        is: false,
        then: (schema) => schema.email("Enter a valid email").required("Email is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    phone: Yup.string().when("registerWithPhone", {
        is: true,
        then: (schema) =>
            schema
                .matches(phoneRegExp, "Enter an 10-digit UK mobile number")
                .required("Phone number is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    password: Yup.string().min(8, "Use at least 8 characters").required("Password is required"),
    passwordConfirm: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm your password"),
});

const initialValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirm: "",
    registerWithPhone: false,
};

const getFirstErrorMessage = (errors) => {
    if (!errors || typeof errors !== "object") {
        return null;
    }

    const firstKey = Object.keys(errors)[0];

    if (!firstKey) {
        return null;
    }

    const value = errors[firstKey];

    if (Array.isArray(value)) {
        return value[0] || null;
    }

    if (typeof value === "string") {
        return value;
    }

    return null;
};

const FormField = ({
    label,
    name,
    type = "text",
    placeholder,
    autoComplete,
    renderLeft,
    renderRight,
    helperText,
}) => (
    <Field name={name}>
        {({ field, meta }) => {
            const hasError = meta.touched && meta.error;

            return (
                <div className="space-y-2">
                    {label && (
                        <label
                            htmlFor={name}
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {label}
                        </label>
                    )}
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                            backgroundColor: "var(--color-background-elevated)",
                            border: `1px solid ${
                                hasError ? "var(--color-error)" : "var(--color-border)"
                            }`,
                        }}
                    >
                        {renderLeft ? renderLeft() : null}
                        <input
                            {...field}
                            id={name}
                            type={type}
                            placeholder={placeholder}
                            autoComplete={autoComplete}
                            className="flex-1 text-sm bg-transparent outline-none"
                            style={{ color: "var(--color-text-primary)" }}
                        />
                        {renderRight ? renderRight(hasError) : null}
                    </div>
                    {helperText && !hasError && (
                        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                            {helperText}
                        </p>
                    )}
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

export const RegisterForm = () => {
    const router = useRouter();
    const { register } = useAuth();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState(null);

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                setFormError(null);

                if (!executeRecaptcha) {
                    toast.error("reCAPTCHA not ready. Please try again.");
                    setSubmitting(false);
                    return;
                }

                try {
                    const token = await executeRecaptcha("register");
                    const username = values.registerWithPhone
                        ? `+44${values.phone.replace(/^0+/, "")}`
                        : values.email;

                    const payload = {
                        name: values.name,
                        username,
                        password: values.password,
                        token,
                    };

                    const result = await register(payload);

                    if (!result.success) {
                        const message = result.message || "Registration failed";
                        const detailMessage = getFirstErrorMessage(result.errors);
                        const displayMessage = detailMessage || message;

                        setFormError({ message: displayMessage, details: result.errors });
                        toast.error(displayMessage);
                        return;
                    }

                    toast.success("Account created! Verify your email to continue.");
                    router.push("/auth/code-verification?redirect=register");
                } catch (error) {
                    console.error("Registration error", error);
                    setFormError({ message: error?.message || "Unexpected error" });
                    toast.error(error?.message || "Unexpected error");
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ values, isSubmitting, setFieldValue }) => (
                <Form className="space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2
                            className="text-2xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Create your Parlomo account
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Choose email or mobile to sign up and start managing your listings.
                        </p>
                    </div>

                    <div
                        className="flex items-center justify-between rounded-xl px-4 py-3"
                        style={{
                            backgroundColor: "var(--color-background-secondary)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Register with phone number
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setFieldValue("registerWithPhone", !values.registerWithPhone)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                values.registerWithPhone
                                    ? "bg-[var(--color-primary)]"
                                    : "bg-[var(--color-border)]"
                            }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                    values.registerWithPhone ? "translate-x-5" : "translate-x-1"
                                }`}
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                            name="name"
                            label="Full name"
                            placeholder="Jane Doe"
                            autoComplete="name"
                        />

                        {values.registerWithPhone ? (
                            <FormField
                                name="phone"
                                label="UK mobile number"
                                type="tel"
                                placeholder="7123456789"
                                autoComplete="tel"
                                renderLeft={() => (
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        +44
                                    </span>
                                )}
                            />
                        ) : (
                            <FormField
                                name="email"
                                label="Email address"
                                type="email"
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        )}

                        <FormField
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            autoComplete="new-password"
                            renderRight={() => (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        />

                        <FormField
                            name="passwordConfirm"
                            label="Confirm password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repeat your password"
                            autoComplete="new-password"
                            renderRight={() => (
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                    aria-label={
                                        showConfirmPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        />
                    </div>

                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        Use at least 8 characters with a mix of letters, numbers, and symbols for a
                        strong password.
                    </p>

                    {formError && (
                        <div
                            className="space-y-2 rounded-lg p-3"
                            style={{
                                backgroundColor: "var(--color-error-light)",
                                color: "var(--color-error)",
                            }}
                        >
                            <p className="text-sm font-medium">{formError.message}</p>
                            {formError.details && (
                                <ul className="space-y-1 text-sm list-disc list-inside">
                                    {Object.entries(formError.details).map(([field, messages]) => (
                                        <li key={field}>
                                            <strong>{field}</strong>:{" "}
                                            {Array.isArray(messages)
                                                ? messages.join(", ")
                                                : messages}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Register"}
                    </Button>

                    <div className="flex items-center gap-3">
                        <div
                            className="h-px flex-1"
                            style={{ backgroundColor: "var(--color-border)" }}
                        />
                        <span
                            className="text-xs uppercase tracking-wide"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            or
                        </span>
                        <div
                            className="h-px flex-1"
                            style={{ backgroundColor: "var(--color-border)" }}
                        />
                    </div>

                    <GoogleAuthButton />

                    <div
                        className="text-center text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Already a member?{" "}
                        <Link
                            href="/login"
                            className="font-semibold"
                            style={{ color: "var(--color-primary)" }}
                        >
                            Login now
                        </Link>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default RegisterForm;
