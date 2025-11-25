"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { AdminAdvertisingPackageFormFields } from "./AdminAdvertisingPackageFormFields";
import { updateAdminAdvertisingPackage } from "@/features/advertising/adminAdvertisingPackagesSlice";
import { userAdvertisingService } from "@/services/advertising";

const buildTypeOptions = (types) => {
    if (!Array.isArray(types)) {
        return [];
    }

    return types.map((item) => ({
        value: String(item.id ?? item.value ?? ""),
        label: item.title || item.name || `Type #${item.id}`,
        placeType: item.placeType || item.type || "",
    }));
};

const buildMediaUrl = (pack) => {
    if (!pack?.image) {
        return null;
    }

    if (typeof pack.image === "string" && pack.image.startsWith("http")) {
        return pack.image;
    }

    const base = process.env.NEXT_PUBLIC_URL_KEY || "";
    const normalizedPath = pack.path ? `${pack.path.replace(/\/+$/, "")}/` : "";

    return `${base}${normalizedPath}${pack.image}`;
};

const createValidationSchema = (typesMap, fallbackPlacement) =>
    Yup.object({
        title: Yup.string().required("Title is required"),
        advertisingType: Yup.string().required("Advertising type is required"),
        days: Yup.number()
            .typeError("Days must be a number")
            .integer("Days must be a whole number")
            .min(1, "At least 1 day")
            .required("Duration is required"),
        price: Yup.number()
            .typeError("Price must be a number")
            .min(0, "Price cannot be negative")
            .required("Price is required"),
        socialMedia: Yup.number()
            .typeError("Social media price must be a number")
            .min(0, "Cannot be negative")
            .required("Social media price is required"),
        width: Yup.number()
            .typeError("Width must be a number")
            .when("advertisingType", {
                is: (value) => {
                    const meta = typesMap.get(String(value));
                    const placement = meta?.placeType || fallbackPlacement || "";
                    return placement.toLowerCase() !== "video";
                },
                then: (schema) =>
                    schema
                        .min(1, "Width must be greater than zero")
                        .required("Width is required for banner placements"),
                otherwise: (schema) => schema.nullable().notRequired(),
            }),
        height: Yup.number()
            .typeError("Height must be a number")
            .when("advertisingType", {
                is: (value) => {
                    const meta = typesMap.get(String(value));
                    const placement = meta?.placeType || fallbackPlacement || "";
                    return placement.toLowerCase() !== "video";
                },
                then: (schema) =>
                    schema
                        .min(1, "Height must be greater than zero")
                        .required("Height is required for banner placements"),
                otherwise: (schema) => schema.nullable().notRequired(),
            }),
        description: Yup.string().required("Description is required"),
        status: Yup.string().required("Status is required"),
        image: Yup.mixed().nullable(),
    });

export function AdminAdvertisingPackageEditModal({
    isOpen,
    packageData,
    onClose,
    onUpdated,
}) {
    const dispatch = useAppDispatch();
    const { updating } = useAppSelector((state) => state.adminAdvertisingPackages);

    const [typeOptions, setTypeOptions] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [typesError, setTypesError] = useState(null);

    useEffect(() => {
        if (!isOpen || loadingTypes || typeOptions.length > 0) {
            return;
        }

        const fetchTypes = async () => {
            setLoadingTypes(true);
            setTypesError(null);
            try {
                const response = await userAdvertisingService.listTypes();
                setTypeOptions(buildTypeOptions(response));
            } catch (error) {
                setTypesError(error?.message || "Failed to load advertising types");
            } finally {
                setLoadingTypes(false);
            }
        };

        fetchTypes();
    }, [isOpen, loadingTypes, typeOptions.length]);

    const typesMetaMap = useMemo(() => {
        const map = new Map();
        typeOptions.forEach((option) => {
            map.set(String(option.value), option);
        });
        return map;
    }, [typeOptions]);

    const fallbackPlacement = (packageData?.placeType || packageData?.type || "").toLowerCase();

    const validationSchema = useMemo(
        () => createValidationSchema(typesMetaMap, fallbackPlacement),
        [typesMetaMap, fallbackPlacement]
    );

    const initialValues = {
        title: packageData?.title || "",
        advertisingType: packageData?.advertisingType
            ? String(packageData.advertisingType)
            : packageData?.typeId
            ? String(packageData.typeId)
            : "",
        days: packageData?.days ?? "",
        price: packageData?.price ?? "",
        socialMedia: packageData?.socialMedia ?? packageData?.socialMediaPrice ?? "",
        width: packageData?.width ?? "",
        height: packageData?.height ?? "",
        description: packageData?.description || "",
        status: packageData?.status || "Pending",
        image: null,
    };

    const handleSubmit = async (values, formikHelpers) => {
        if (!packageData?.id) {
            return;
        }

        try {
            const selectedMeta = typesMetaMap.get(String(values.advertisingType));
            const placement = (selectedMeta?.placeType || fallbackPlacement || "").toLowerCase();
            const isVideoPlacement = placement === "video";

            await dispatch(
                updateAdminAdvertisingPackage({
                    id: packageData.id,
                    changes: {
                        title: values.title,
                        advertisingType: values.advertisingType,
                        days: values.days,
                        price: values.price,
                        socialMedia: values.socialMedia,
                        width: isVideoPlacement ? undefined : values.width,
                        height: isVideoPlacement ? undefined : values.height,
                        description: values.description,
                        status: values.status,
                        image: values.image || undefined,
                    },
                })
            ).unwrap();

            toast.success("Advertising package updated successfully");
            formikHelpers.resetForm({ values: { ...values, image: null } });
            onUpdated?.();
            onClose?.();
        } catch (error) {
            toast.error(error || "Failed to update advertising package");
        }
    };

    const previewUrl = buildMediaUrl(packageData);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Advertising Package"
            size="xl"
        >
            {typesError && (
                <div
                    className="mb-4 rounded-lg px-4 py-3 text-sm"
                    style={{
                        backgroundColor: "var(--color-warning-surface)",
                        color: "var(--color-warning)",
                    }}
                >
                    {typesError}
                </div>
            )}

            {previewUrl ? (
                <div className="flex justify-center mb-6">
                    <div
                        className="relative w-48 h-32 overflow-hidden rounded-xl border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <Image
                            src={previewUrl}
                            alt={packageData?.title || "Package media"}
                            fill
                            sizes="192px"
                            className="object-cover"
                        />
                    </div>
                </div>
            ) : null}

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, isSubmitting }) => {
                    const selectedMeta = typesMetaMap.get(String(values.advertisingType));
                    const placement = (selectedMeta?.placeType || fallbackPlacement || "").toLowerCase();
                    const isVideoPlacement = placement === "video";

                    const fileAccept = isVideoPlacement
                        ? {
                              "video/*": [".mp4", ".mov", ".webm"],
                          }
                        : {
                              "image/*": [".jpg", ".jpeg", ".png", ".webp"],
                          };

                    return (
                        <Form className="space-y-6">
                            <AdminAdvertisingPackageFormFields
                                typeOptions={typeOptions}
                                includeStatus
                                showDimensions={!isVideoPlacement}
                                fileAccept={fileAccept}
                            />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={updating || isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={updating || isSubmitting || loadingTypes}
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
}

export default AdminAdvertisingPackageEditModal;
