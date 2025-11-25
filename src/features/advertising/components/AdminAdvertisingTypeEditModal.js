"use client";

import Image from "next/image";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { updateAdminAdvertisingType } from "@/features/advertising/adminAdvertisingTypesSlice";
import { AdminAdvertisingTypeFormFields } from "./AdminAdvertisingTypeFormFields";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    placeType: Yup.string().required("Placement is required"),
    status: Yup.string().oneOf(["1", "0"]).required("Status is required"),
    image: Yup.mixed().nullable(),
});

const buildImageUrl = (type) => {
    if (!type?.image) {
        return null;
    }

    if (typeof type.image === "string" && type.image.startsWith("http")) {
        return type.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = type.path ? `${type.path.replace(/\/+$/, "")}/` : "";

    return `${base}${normalizedPath}${type.image}`;
};

export function AdminAdvertisingTypeEditModal({ isOpen, typeData, onClose, onUpdated }) {
    const dispatch = useAppDispatch();
    const { updating } = useAppSelector((state) => state.adminAdvertisingTypes);

    const initialValues = {
        title: typeData?.title || "",
        placeType: typeData?.placeType || "",
        status: typeData?.status === 0 || typeData?.status === "0" ? "0" : "1",
        image: null,
    };

    const handleSubmit = async (values, formikHelpers) => {
        if (!typeData?.id) {
            return;
        }

        try {
            await dispatch(
                updateAdminAdvertisingType({
                    id: typeData.id,
                    changes: {
                        title: values.title,
                        placeType: values.placeType,
                        status: values.status,
                        image: values.image || undefined,
                    },
                })
            ).unwrap();

            toast.success("Advertising type updated successfully");
            formikHelpers.resetForm({ values: { ...values, image: null } });
            onUpdated?.();
            onClose?.();
        } catch (error) {
            toast.error(error || "Failed to update advertising type");
        }
    };

    const imageUrl = buildImageUrl(typeData);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Advertising Type"
            size="lg"
        >
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        {imageUrl ? (
                            <div className="flex justify-center">
                                <div
                                    className="relative w-32 h-32 overflow-hidden rounded-xl border"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <Image
                                        src={imageUrl}
                                        alt={typeData?.title || "Advertising type"}
                                        fill
                                        sizes="128px"
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        ) : null}

                        <AdminAdvertisingTypeFormFields includeStatus />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={updating || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={updating || isSubmitting}>
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default AdminAdvertisingTypeEditModal;
