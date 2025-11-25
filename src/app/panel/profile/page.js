"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Loader } from "@/components/common/Loader";
import { Avatar } from "@/components/common/Avatar";
import {
    getCurrentUser,
    updateProfile,
    changePassword,
    checkPublicIdAvailability,
} from "@/services/settings.service";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

const profileSchema = Yup.object().shape({
    name: Yup.string().trim().required("Full name is required"),
    publicId: Yup.string().trim().required("Public ID is required"),
    email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
    mobile: Yup.string().nullable(),
});

const passwordSchema = Yup.object().shape({
    oldPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string().required("New password is required"),
});

const normalizeIsMessage = (value) => (value === 1 || value === "1" || value === true ? "1" : "0");

const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return typeof value === "string" && value.trim().length > 0 ? value : "—";
    }

    return parsed.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const PasswordInput = ({ name, label, isVisible, onToggle }) => (
    <Field name={name}>
        {({ field, meta }) => {
            const hasError = meta.touched && meta.error;

            return (
                <div className="space-y-2">
                    <label
                        htmlFor={name}
                        className="block text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {label}
                    </label>
                    <div className="relative">
                        <input
                            {...field}
                            id={name}
                            type={isVisible ? "text" : "password"}
                            className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 disabled:opacity-50"
                            style={
                                hasError
                                    ? {
                                          border: "1px solid var(--color-error)",
                                          backgroundColor: "var(--color-background-elevated)",
                                          color: "var(--color-text-primary)",
                                          boxShadow: "0 0 0 2px rgba(234, 88, 12, 0.2)",
                                      }
                                    : {
                                          border: "1px solid var(--color-border)",
                                          backgroundColor: "var(--color-background-elevated)",
                                          color: "var(--color-text-primary)",
                                          boxShadow: "0 0 0 2px rgba(91, 76, 230, 0.08)",
                                      }
                            }
                        />
                        <button
                            type="button"
                            onClick={onToggle}
                            className="absolute inset-y-0 right-3 flex items-center text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                            aria-label={isVisible ? "Hide password" : "Show password"}
                        >
                            {isVisible ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {hasError && (
                        <p className="text-xs font-medium" style={{ color: "var(--color-error)" }}>
                            {meta.error}
                        </p>
                    )}
                </div>
            );
        }}
    </Field>
);

export default function ProfilePage() {
    const { user, updateUser, loading: authLoading } = useAuth();
    const updateUserRef = useRef(updateUser);
    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [publicIdStatus, setPublicIdStatus] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        updateUserRef.current = updateUser;
    }, [updateUser]);

    const fetchProfile = useCallback(async () => {
        setLoadingProfile(true);
        try {
            const data = await getCurrentUser();
            setProfile(data);
            setFetchError(null);

            if (typeof updateUserRef.current === "function") {
                updateUserRef.current(data);
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
            const message = error?.message || "Unable to load your profile.";
            setFetchError(message);
            toast.error(message);
        } finally {
            setLoadingProfile(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const isInitialLoading = authLoading || (loadingProfile && !profile);

    const profileInitialValues = useMemo(() => {
        if (!profile) {
            return null;
        }

        return {
            name: profile.name || "",
            publicId: profile.publicId || profile.public_id || "",
            email: profile.email || "",
            mobile: profile.mobile || "",
            isMessage: normalizeIsMessage(profile.isMessage),
            avatar: null,
        };
    }, [profile]);

    const accountMeta = useMemo(() => {
        if (!profile) {
            return [];
        }

        return [
            {
                label: "Joined",
                value: formatDate(profile.createdAt || profile.created_at),
            },
            {
                label: "Last active",
                value: formatDate(
                    profile.lastLogin ||
                        profile.last_login ||
                        profile.updated_at ||
                        profile.updatedAt
                ),
            },
            {
                label: "Chat",
                value: normalizeIsMessage(profile.isMessage) === "1" ? "Enabled" : "Disabled",
            },
        ];
    }, [profile]);

    if (isInitialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size="lg" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md p-6 text-center space-y-4">
                    <AlertTriangle
                        className="w-10 h-10 mx-auto"
                        style={{ color: "var(--color-error)" }}
                    />
                    <div>
                        <h2
                            className="text-xl font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            We couldn&apos;t load your profile
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {fetchError || "Please try again later."}
                        </p>
                    </div>
                    <Button onClick={fetchProfile}>Retry</Button>
                </Card>
            </div>
        );
    }

    return (
        <ContentWrapper>
            <div className="max-w-5xl mx-auto space-y-8">
                <section
                    className="relative overflow-hidden rounded-3xl border"
                    style={{
                        borderColor: "var(--color-border)",
                        background:
                            "linear-gradient(135deg, var(--color-primary) 0%, rgba(17, 24, 39, 0.92) 100%)",
                        color: "var(--color-text-inverse)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-60"
                        style={{
                            background:
                                "radial-gradient(circle at top left, rgba(255,255,255,0.35) 0%, transparent 55%)",
                            mixBlendMode: "soft-light",
                        }}
                    />

                    <div className="relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-6">
                            <Avatar
                                src={profile.avatar}
                                alt={profile.name}
                                size="2xl"
                                className="shadow-2xl ring-4 ring-white/20"
                            />
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-3xl font-semibold tracking-tight">
                                        {profile.name || profile.username || "Admin"}
                                    </h1>
                                    {profile.role ? (
                                        <span
                                            className="px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full"
                                            style={{
                                                backgroundColor: "rgba(255, 255, 255, 0.16)",
                                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                                color: "var(--color-text-inverse)",
                                            }}
                                        >
                                            {profile.role}
                                        </span>
                                    ) : null}
                                </div>
                                <p className="text-sm text-white/80 md:text-base">
                                    {profile.email}
                                </p>
                                {profile.publicId || profile.public_id ? (
                                    <Badge
                                        variant="neutral"
                                        size="sm"
                                        className="bg-white/10 text-white border border-white/20"
                                    >
                                        @{profile.publicId || profile.public_id}
                                    </Badge>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
                            {accountMeta.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm"
                                >
                                    <p className="text-xs font-medium uppercase tracking-wider text-white/70">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-tight text-white">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
                    <Card className="p-6 space-y-6">
                        <div className="space-y-1">
                            <h2
                                className="text-xl font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Personal details
                            </h2>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Keep your information up to date. We only send fields that have
                                changed.
                            </p>
                        </div>

                        {profileInitialValues && (
                            <Formik
                                initialValues={profileInitialValues}
                                enableReinitialize
                                validationSchema={profileSchema}
                                onSubmit={async (values, { setSubmitting, resetForm }) => {
                                    const currentPublicId =
                                        profile.publicId || profile.public_id || "";
                                    const payload = {};

                                    if (values.name !== (profile.name || "")) {
                                        payload.name = values.name;
                                    }

                                    if (values.publicId !== currentPublicId) {
                                        payload.publicId = values.publicId;
                                    }

                                    if (values.email !== (profile.email || "")) {
                                        payload.email = values.email;
                                    }

                                    if (values.mobile !== (profile.mobile || "")) {
                                        payload.mobile = values.mobile;
                                    }

                                    const newIsMessage = normalizeIsMessage(values.isMessage);
                                    const currentIsMessage = normalizeIsMessage(profile.isMessage);
                                    if (newIsMessage !== currentIsMessage) {
                                        payload.isMessage = newIsMessage;
                                    }

                                    if (values.avatar) {
                                        payload.avatar = values.avatar;
                                    }

                                    if (Object.keys(payload).length === 0) {
                                        toast.info("No changes detected");
                                        setSubmitting(false);
                                        return;
                                    }

                                    try {
                                        await updateProfile(payload);
                                        toast.success("Profile updated successfully");
                                        setPublicIdStatus(null);
                                        await fetchProfile();
                                        resetForm();
                                    } catch (error) {
                                        console.error("Profile update failed:", error);
                                        toast.error(error?.message || "Failed to update profile");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({ isSubmitting, setFieldValue, values }) => {
                                    const publicIdFeedback =
                                        publicIdStatus &&
                                        publicIdStatus.checkedValue === values.publicId
                                            ? publicIdStatus
                                            : null;

                                    const isCheckingPublicId =
                                        publicIdStatus?.state === "checking" &&
                                        publicIdStatus.checkedValue === values.publicId;

                                    const feedbackVariant =
                                        publicIdFeedback?.state === "available"
                                            ? "success"
                                            : publicIdFeedback?.state === "info"
                                              ? "neutral"
                                              : "danger";

                                    return (
                                        <Form className="space-y-6">
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <InputField
                                                    label="Full Name"
                                                    name="name"
                                                    placeholder="Enter your full name"
                                                    required
                                                />

                                                <div className="space-y-2">
                                                    <label
                                                        htmlFor="publicId"
                                                        className="block text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        Public ID
                                                    </label>
                                                    <div className="flex flex-col gap-2 sm:flex-row">
                                                        <Field name="publicId">
                                                            {({ field, meta }) => (
                                                                <div className="flex-1">
                                                                    <input
                                                                        {...field}
                                                                        id="publicId"
                                                                        type="text"
                                                                        placeholder="Choose a public identifier"
                                                                        className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                                                                        style={
                                                                            meta.touched &&
                                                                            meta.error
                                                                                ? {
                                                                                      border: "1px solid var(--color-error)",
                                                                                      backgroundColor:
                                                                                          "var(--color-background-elevated)",
                                                                                      color: "var(--color-text-primary)",
                                                                                      boxShadow:
                                                                                          "0 0 0 2px rgba(234, 88, 12, 0.2)",
                                                                                  }
                                                                                : {
                                                                                      border: "1px solid var(--color-border)",
                                                                                      backgroundColor:
                                                                                          "var(--color-background-elevated)",
                                                                                      color: "var(--color-text-primary)",
                                                                                      boxShadow:
                                                                                          "0 0 0 2px rgba(91, 76, 230, 0.08)",
                                                                                  }
                                                                        }
                                                                    />
                                                                    {meta.touched && meta.error && (
                                                                        <p
                                                                            className="mt-1 text-xs font-medium"
                                                                            style={{
                                                                                color: "var(--color-error)",
                                                                            }}
                                                                        >
                                                                            {meta.error}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </Field>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            className="shrink-0"
                                                            disabled={
                                                                isCheckingPublicId ||
                                                                !values.publicId
                                                            }
                                                            onClick={async () => {
                                                                const nextValue =
                                                                    values.publicId?.trim();

                                                                if (!nextValue) {
                                                                    setPublicIdStatus({
                                                                        state: "error",
                                                                        message:
                                                                            "Enter a public ID to check availability.",
                                                                        checkedValue: "",
                                                                    });
                                                                    return;
                                                                }

                                                                if (
                                                                    nextValue ===
                                                                    (profile.publicId ||
                                                                        profile.public_id ||
                                                                        "")
                                                                ) {
                                                                    setPublicIdStatus({
                                                                        state: "info",
                                                                        message:
                                                                            "This is your current public ID.",
                                                                        checkedValue: nextValue,
                                                                    });
                                                                    return;
                                                                }

                                                                setPublicIdStatus({
                                                                    state: "checking",
                                                                    message:
                                                                        "Checking availability...",
                                                                    checkedValue: nextValue,
                                                                });

                                                                try {
                                                                    const result =
                                                                        await checkPublicIdAvailability(
                                                                            nextValue
                                                                        );
                                                                    const isAvailable =
                                                                        result?.status ??
                                                                        result?.available;

                                                                    if (isAvailable) {
                                                                        setPublicIdStatus({
                                                                            state: "available",
                                                                            message:
                                                                                "Great news! This public ID is available.",
                                                                            checkedValue: nextValue,
                                                                        });
                                                                    } else {
                                                                        setPublicIdStatus({
                                                                            state: "unavailable",
                                                                            message:
                                                                                result?.message ||
                                                                                "This public ID is already taken.",
                                                                            checkedValue: nextValue,
                                                                        });
                                                                    }
                                                                } catch (error) {
                                                                    setPublicIdStatus({
                                                                        state: "error",
                                                                        message:
                                                                            error?.message ||
                                                                            "We couldn't verify that ID. Please try again.",
                                                                        checkedValue: nextValue,
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            {isCheckingPublicId ? (
                                                                <span className="flex items-center gap-2">
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                    Checking...
                                                                </span>
                                                            ) : (
                                                                "Check"
                                                            )}
                                                        </Button>
                                                    </div>
                                                    {publicIdFeedback && (
                                                        <Badge
                                                            variant={feedbackVariant}
                                                            size="sm"
                                                            className="justify-start gap-1.5"
                                                        >
                                                            {publicIdFeedback.state ===
                                                            "available" ? (
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                            ) : null}
                                                            <span>{publicIdFeedback.message}</span>
                                                        </Badge>
                                                    )}
                                                </div>

                                                <InputField
                                                    label="Email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    required
                                                    disabled={Boolean(profile.emailIsLock)}
                                                    helperText={
                                                        profile.emailIsLock
                                                            ? "Email changes are locked. Contact support to update."
                                                            : null
                                                    }
                                                />

                                                <InputField
                                                    label="Mobile"
                                                    name="mobile"
                                                    type="tel"
                                                    placeholder="Enter your mobile number"
                                                    disabled={Boolean(profile.mobileIsLock)}
                                                    helperText={
                                                        profile.mobileIsLock
                                                            ? "Mobile number changes are locked. Contact support to update."
                                                            : "Optional"
                                                    }
                                                />
                                            </div>

                                            <FileUploadField
                                                label="Profile Picture"
                                                name="avatar"
                                                accept={{
                                                    "image/png": [".png"],
                                                    "image/jpeg": [".jpg", ".jpeg"],
                                                    "image/webp": [".webp"],
                                                }}
                                                helperText="PNG, JPG, WEBP up to 5MB"
                                            />

                                            <div
                                                className="flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                style={{
                                                    borderColor: "var(--color-border)",
                                                    backgroundColor:
                                                        "var(--color-background-elevated)",
                                                }}
                                            >
                                                <div>
                                                    <p
                                                        className="font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        Enable Chat Feature
                                                    </p>
                                                    <p
                                                        className="text-xs"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Allow other users to message you directly.
                                                    </p>
                                                </div>

                                                {(() => {
                                                    const isChatEnabled =
                                                        normalizeIsMessage(values.isMessage) ===
                                                        "1";

                                                    return (
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={isChatEnabled}
                                                            onClick={() =>
                                                                setFieldValue(
                                                                    "isMessage",
                                                                    isChatEnabled ? "0" : "1"
                                                                )
                                                            }
                                                            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                                            style={{
                                                                backgroundColor: isChatEnabled
                                                                    ? "var(--color-primary)"
                                                                    : "var(--color-border)",
                                                                boxShadow: isChatEnabled
                                                                    ? "0 0 0 4px rgba(91, 76, 230, 0.15)"
                                                                    : "none",
                                                            }}
                                                        >
                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute left-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white transition-transform"
                                                                style={{
                                                                    transform: isChatEnabled
                                                                        ? "translateX(20px)"
                                                                        : "translateX(0)",
                                                                    boxShadow:
                                                                        "0 6px 12px rgba(15, 23, 42, 0.2)",
                                                                }}
                                                            />
                                                        </button>
                                                    );
                                                })()}
                                            </div>

                                            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        resetForm();
                                                        setPublicIdStatus(null);
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    loading={isSubmitting}
                                                    disabled={isSubmitting}
                                                >
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </Form>
                                    );
                                }}
                            </Formik>
                        )}
                    </Card>

                    <div className="space-y-6">
                        <Card className="p-6 space-y-5">
                            <div className="space-y-1">
                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Account security
                                </h2>
                                <p
                                    className="text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Change your password regularly to keep your account secure.
                                </p>
                            </div>

                            <Formik
                                initialValues={{ oldPassword: "", newPassword: "" }}
                                validationSchema={passwordSchema}
                                onSubmit={async (values, { setSubmitting, resetForm }) => {
                                    try {
                                        await changePassword({
                                            oldPassword: values.oldPassword,
                                            newPassword: values.newPassword,
                                        });
                                        toast.success("Password updated successfully");
                                        resetForm();
                                    } catch (error) {
                                        console.error("Password update failed:", error);
                                        toast.error(error?.message || "Failed to update password");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="space-y-4">
                                        <PasswordInput
                                            name="oldPassword"
                                            label="Current Password"
                                            isVisible={showOldPassword}
                                            onToggle={() => setShowOldPassword((prev) => !prev)}
                                        />

                                        <PasswordInput
                                            name="newPassword"
                                            label="New Password"
                                            isVisible={showNewPassword}
                                            onToggle={() => setShowNewPassword((prev) => !prev)}
                                        />

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                loading={isSubmitting}
                                                disabled={isSubmitting}
                                            >
                                                Update Password
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </Card>

                        <Card
                            className="p-6 space-y-4 border border-dashed"
                            style={{ borderColor: "var(--color-error)" }}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle
                                    className="h-5 w-5"
                                    style={{ color: "var(--color-error)" }}
                                />
                                <h2
                                    className="text-base font-semibold"
                                    style={{ color: "var(--color-error)" }}
                                >
                                    Delete Account
                                </h2>
                            </div>
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                Request removal of your data from Parlomo. Our support team will
                                review your request as soon as possible.
                            </p>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() =>
                                    toast.success(
                                        "Your request has been submitted and we will review it as soon as we can."
                                    )
                                }
                            >
                                Delete my data
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </ContentWrapper>
    );
}
