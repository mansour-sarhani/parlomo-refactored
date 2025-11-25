"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "sonner";
import { GoogleAuthButton } from "./GoogleAuthButton";

const validationSchema = Yup.object().shape({
    username: Yup.string().required("Email or phone number is required"),
    password: Yup.string().required("Password is required"),
});

const initialValues = {
    username: process.env.NODE_ENV === "development" ? "ehsan@gmail.com" : "",
    password: process.env.NODE_ENV === "development" ? "AppTest@123!er87" : "",
};

const FormField = ({ label, name, type = "text", placeholder, autoComplete, renderRight }) => (
    <Field name={name}>
        {({ field, meta }) => {
            const hasError = meta.touched && meta.error;

            return (
                <div className="space-y-2">
                    <label
                        htmlFor={name}
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {label}
                    </label>
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                            backgroundColor: "var(--color-background-elevated)",
                            border: `1px solid ${
                                hasError ? "var(--color-error)" : "var(--color-border)"
                            }`,
                        }}
                    >
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

export const LoginForm = () => {
    const router = useRouter();
    const { login } = useAuth();
    const { executeRecaptcha } = useGoogleReCaptcha();
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
                setFormError("");

                if (!executeRecaptcha) {
                    toast.error("reCAPTCHA not ready. Please try again.");
                    setSubmitting(false);
                    return;
                }

                try {
                    const token = await executeRecaptcha("login");
                    const payload = {
                        username: values.username,
                        password: values.password,
                        token,
                    };

                    const result = await login(payload);

                    if (!result.success) {
                        const message = result.message || "Login failed. Please try again.";
                        setFormError(message);
                        toast.error(message);
                        return;
                    }

                    toast.success("Welcome back!");

                    if (result.data?.needToVerify) {
                        router.push("/auth/code-verification?redirect=login");
                        return;
                    }

                    router.push("/panel/dashboard");
                } catch (error) {
                    console.error("Login error", error);
                    const message = error?.message || "An unexpected error occurred.";
                    setFormError(message);
                    toast.error(message);
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ isSubmitting }) => (
                <Form className="space-y-8">
                    <div className="space-y-2 text-center lg:text-left">
                        <h2
                            className="text-2xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Great to have you back!
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            If you already have an account, sign in to continue.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <FormField
                            name="username"
                            label="Email or Phone Number"
                            placeholder="you@example.com"
                            autoComplete="username"
                        />

                        <FormField
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            autoComplete="current-password"
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

                        <div className="flex justify-end">
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm font-medium"
                                style={{ color: "var(--color-primary)" }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {formError && (
                        <div
                            className="p-3 rounded-lg text-sm"
                            style={{
                                backgroundColor: "var(--color-error-light)",
                                color: "var(--color-error)",
                            }}
                        >
                            {formError}
                        </div>
                    )}

                    <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Login"}
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
                        Not a member?{" "}
                        <Link
                            href="/register"
                            className="font-semibold"
                            style={{ color: "var(--color-primary)" }}
                        >
                            Register now
                        </Link>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default LoginForm;
