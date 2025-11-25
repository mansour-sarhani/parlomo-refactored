"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { FileUploadField } from "@/components/forms/FileUploadField";
import { Avatar } from "@/components/common/Avatar";
import { Loader } from "@/components/common/Loader";
import { ArrowLeft } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

const profileValidationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string()
        .email("Invalid email address")
        .test("required-if-unlocked", "Email is required", function (value) {
            const { emailLocked } = this?.options?.context || {};
            if (emailLocked) {
                return true;
            }
            return Boolean(value);
        }),
    role: Yup.string()
        .oneOf(["customer", "system-admin", "super-admin"], "Select a valid role")
        .required("Role is required"),
    mobile: Yup.string().nullable(),
    isBan: Yup.string().oneOf(["0", "1"]).required(),
    newAvatar: Yup.mixed().nullable(),
});

const buildAvatarUrl = (user) => {
    const avatar = user?.avatar;
    if (!avatar) return null;

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const path = user?.path ? `${user.path}${user.path.endsWith("/") ? "" : "/"}` : "";

    return `${base}${path}${avatar}`;
};

export default function EditUserPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();

    const usernameParam = searchParams.get("username");
    const sectionParam = searchParams.get("section");

    const [user, setUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [profileSaving, setProfileSaving] = useState(false);
    const [permissionsSaving, setPermissionsSaving] = useState(false);

    const permissionSectionRef = useRef(null);

    const userId = useMemo(() => unwrappedParams.id, [unwrappedParams.id]);

    // Fetch user and permissions from legacy endpoints
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                setProfileLoading(false);
                setError("Missing user identifier");
                return;
            }

            try {
                setProfileLoading(true);
                const queryParams = { limit: 1 };

                if (usernameParam) {
                    queryParams.username = usernameParam;
                }

                const response = await userService.getUsers(queryParams);
                const payload = response.data;

                const resolvedUser = payload?.data?.find((item) => String(item.id ?? item._id) === String(userId))
                    || payload?.data?.[0];

                if (!resolvedUser) {
                    throw new Error("User not found");
                }

                setUser(resolvedUser);
                setError(null);

                setPermissionsLoading(true);
                const permissionsResponse = await userService.getUserPermissions(resolvedUser.id ?? resolvedUser._id);
                const permissionsPayload = permissionsResponse.data;
                const groups = Array.isArray(permissionsPayload)
                    ? permissionsPayload
                    : Array.isArray(permissionsPayload?.data)
                    ? permissionsPayload.data
                    : [];
                setPermissions(groups);
            } catch (err) {
                const message = err?.message || err?.response?.data?.message || "Failed to load user";
                setError(message);
                toast.error(message);
            } finally {
                setProfileLoading(false);
                setPermissionsLoading(false);
            }
        };

        fetchUserData();
    }, [userId, usernameParam]);

    // Scroll into permissions when requested
    useEffect(() => {
        if (sectionParam === "permissions" && !permissionsLoading && permissionSectionRef.current) {
            permissionSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [sectionParam, permissionsLoading]);

    const emailLocked = useMemo(() => Boolean(user?.emailIsLock ?? user?.email_is_lock), [user]);
    const mobileLocked = useMemo(() => Boolean(user?.mobileIsLock ?? user?.mobile_is_lock), [user]);

    const profileInitialValues = useMemo(() => ({
        name: user?.name ?? "",
        email: user?.email ?? "",
        role: user?.role ?? "customer",
        mobile: user?.mobile ?? user?.phone ?? "",
        isBan: (user?.isBan === true || user?.isBan === 1 || user?.isBan === "1") ? "1" : "0",
        newAvatar: null,
    }), [user]);

    const permissionInitialValues = useMemo(() => {
        const values = {};
        permissions.forEach((group) => {
            group.permissions?.forEach((permission) => {
                values[permission.id] = Boolean(permission.state);
            });
        });
        return values;
    }, [permissions]);

    const handleProfileSubmit = async (values, actions) => {
        if (!user) {
            actions.setSubmitting(false);
            return;
        }

        try {
            setProfileSaving(true);

            const payload = {};

            if (values.name !== (user.name ?? "")) {
                payload.name = values.name;
            }

            if (!emailLocked && values.email !== (user.email ?? "")) {
                payload.email = values.email;
            }

            if (values.role !== (user.role ?? "customer")) {
                payload.role = values.role;
            }

            if (!mobileLocked && values.mobile !== (user.mobile ?? user.phone ?? "")) {
                payload.mobile = values.mobile;
            }

            const initialBan = (user?.isBan === true || user?.isBan === 1 || user?.isBan === "1") ? "1" : "0";
            if (values.isBan !== initialBan) {
                payload.isBan = values.isBan;
            }

            if (values.newAvatar) {
                payload.avatar = values.newAvatar;
            }

            payload.id = user.id ?? user._id;
            payload._method = "PATCH";

            const changeKeys = Object.keys(payload).filter((key) => !["_method", "id"].includes(key));

            if (changeKeys.length === 0) {
                toast.info("No changes detected");
                return;
            }

            await userService.updateAdminUserProfile(user.id ?? user._id, payload);

            let refreshedUser = null;
            const lookupUsername = usernameParam || user.username;
            if (lookupUsername) {
                const refreshedResponse = await userService.getUsers({ username: lookupUsername, limit: 1 });
                const refreshedPayload = refreshedResponse.data;
                refreshedUser = refreshedPayload?.data?.find((item) => String(item.id ?? item._id) === String(userId))
                    || refreshedPayload?.data?.[0];
            }

            if (refreshedUser) {
                setUser(refreshedUser);
            } else {
                setUser((prev) => ({
                    ...prev,
                    name: values.name,
                    email: !emailLocked ? values.email : prev.email,
                    role: values.role,
                    mobile: !mobileLocked ? values.mobile : prev.mobile,
                    phone: !mobileLocked ? values.mobile : prev.phone,
                    isBan: values.isBan === "1",
                }));
            }

            toast.success("User profile updated");
        } catch (err) {
            const message = err?.message || err?.response?.data?.message || "Failed to update user";
            toast.error(message);
            if (err?.errors) {
                actions.setErrors(err.errors);
            }
        } finally {
            setProfileSaving(false);
            actions.setSubmitting(false);
        }
    };

    const handlePermissionsSubmit = async (values, actions) => {
        if (!user) {
            actions.setSubmitting(false);
            return;
        }

        try {
            setPermissionsSaving(true);
            const selectedPermissionIds = Object.entries(values)
                .filter(([, value]) => value === true)
                .map(([key]) => Number(key));

            await userService.updateUserPermissions(user.id ?? user._id, selectedPermissionIds);

            toast.success("Permissions updated");
        } catch (err) {
            const message = err?.message || err?.response?.data?.message || "Failed to update permissions";
            toast.error(message);
        } finally {
            setPermissionsSaving(false);
            actions.setSubmitting(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center py-12">
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6">
                <Card>
                    <div className="text-center py-12">
                        <p style={{ color: "var(--color-error)" }}>{error || "User not found"}</p>
                        <Button
                            variant="primary"
                            className="mt-4"
                            onClick={() => router.push("/panel/admin/users")}
                        >
                            Back to Users
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const avatarUrl = buildAvatarUrl(user);

    return (
        <ContentWrapper>
            <div className="mb-6">
                <Button
                    variant="secondary"
                    icon={<ArrowLeft size={18} />}
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    Back
                </Button>
                <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    Edit User & Permissions
                </h1>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                    Manage profile details and permission groups
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <Card className="h-full">
                        <Formik
                            initialValues={profileInitialValues}
                            validationSchema={profileValidationSchema}
                            enableReinitialize
                            onSubmit={handleProfileSubmit}
                            context={{ emailLocked, mobileLocked }}
                        >
                            {({ isSubmitting, values, setFieldValue }) => (
                                <Form>
                                    <div className="flex flex-col items-center pb-8 mb-8 border-b" style={{ borderColor: "var(--color-border)" }}>
                                        <Avatar src={avatarUrl} alt={user?.name} size="2xl" />
                                        <h3 className="text-xl font-semibold mt-4" style={{ color: "var(--color-text-primary)" }}>
                                            {user?.name}
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                                            {user?.email}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <InputField
                                            name="name"
                                            label="Full Name"
                                            placeholder="Enter full name"
                                            required
                                        />

                                        <InputField
                                            name="email"
                                            label="Email Address"
                                            type="email"
                                            placeholder="Enter email"
                                            disabled={emailLocked}
                                            helperText={emailLocked ? "Email is locked for this user" : undefined}
                                        />

                                        <InputField
                                            name="mobile"
                                            label="Mobile Number"
                                            type="tel"
                                            placeholder="Enter mobile number"
                                            disabled={mobileLocked}
                                            helperText={mobileLocked ? "Mobile number is locked for this user" : undefined}
                                        />

                                        <SelectField name="role" label="Role" required>
                                            <option value="customer">Customer</option>
                                            <option value="system-admin">System Admin</option>
                                            <option value="super-admin">Super Admin</option>
                                        </SelectField>

                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium block" style={{ color: "var(--color-text-secondary)" }}>
                                                Ban User
                                            </label>
                                            <div className="mt-2 flex items-center gap-2">
                                                <Field name="isBan">
                                                    {({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="checkbox"
                                                            checked={field.value === "1"}
                                                            onChange={(event) => setFieldValue("isBan", event.target.checked ? "1" : "0")}
                                                        />
                                                    )}
                                                </Field>
                                                <span style={{ color: "var(--color-text-secondary)" }}>
                                                    {values.isBan === "1" ? "User is banned" : "User is active"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <FileUploadField
                                                name="newAvatar"
                                                label="Avatar"
                                                accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                                                helperText="Upload a new profile picture to replace the existing one (PNG, JPG, WEBP - Max 5MB)"
                                                showPreview
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                                        <Button type="submit" variant="primary" loading={isSubmitting || profileSaving} disabled={isSubmitting || profileSaving}>
                                            Save Changes
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={isSubmitting || profileSaving}>
                                            Cancel
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </Card>
                </div>

                <div className="lg:col-span-8" ref={permissionSectionRef}>
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    Permission Groups
                                </h2>
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    Toggle capabilities for this user
                                </p>
                            </div>
                        </div>

                        {permissionsLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader />
                            </div>
                        ) : permissions.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                No permissions configured for this user.
                            </p>
                        ) : (
                            <Formik initialValues={permissionInitialValues} enableReinitialize onSubmit={handlePermissionsSubmit}>
                                {({ isSubmitting, values, setFieldValue }) => (
                                    <Form className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {permissions.map((group) => (
                                                <div
                                                    key={group.groupName}
                                                    className="rounded-lg border p-4"
                                                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)" }}
                                                >
                                                    <h3 className="text-md font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                                                        {group.groupName}
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {group.permissions?.map((permission) => (
                                                            <label key={permission.id} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={values[permission.id] || false}
                                                                    onChange={(event) => setFieldValue(permission.id, event.target.checked)}
                                                                />
                                                                <span>{permission.description}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                                            <Button type="submit" variant="primary" loading={isSubmitting || permissionsSaving} disabled={isSubmitting || permissionsSaving}>
                                                Save Permissions
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </Card>
                </div>
            </div>
        </ContentWrapper>
    );
}

