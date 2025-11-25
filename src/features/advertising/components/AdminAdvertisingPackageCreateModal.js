"use client";

import { useEffect, useMemo, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { AdminAdvertisingPackageFormFields } from "./AdminAdvertisingPackageFormFields";
import { createAdminAdvertisingPackage } from "@/features/advertising/adminAdvertisingPackagesSlice";
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

const createValidationSchema = (typesMap) =>
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
                    return (meta?.placeType || "").toLowerCase() !== "video";
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
                    return (meta?.placeType || "").toLowerCase() !== "video";
                },
                then: (schema) =>
                    schema
                        .min(1, "Height must be greater than zero")
                        .required("Height is required for banner placements"),
                otherwise: (schema) => schema.nullable().notRequired(),
            }),
        description: Yup.string().required("Description is required"),
        image: Yup.mixed().required("Media asset is required"),
    });

const initialValues = {
    title: "",
    advertisingType: "",
    days: "",
    price: "",
    socialMedia: "",
    width: "",
    height: "",
    description: "",
    image: null,
};

export function AdminAdvertisingPackageCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.adminAdvertisingPackages);

    const [typeOptions, setTypeOptions] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [typesError, setTypesError] = useState(null);

    useEffect(() => {
        if (!isOpen || typeOptions.length > 0 || loadingTypes) {
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

    const validationSchema = useMemo(
        () => createValidationSchema(typesMetaMap),
        [typesMetaMap]
    );

    const handleSubmit = async (values, formikHelpers) => {
        try {
            const selectedMeta = typesMetaMap.get(String(values.advertisingType));
            const isVideo = (selectedMeta?.placeType || "").toLowerCase() === "video";

            await dispatch(
                createAdminAdvertisingPackage({
                    title: values.title,
                    advertisingType: values.advertisingType,
                    days: values.days,
                    price: values.price,
                    socialMedia: values.socialMedia,
                    width: isVideo ? undefined : values.width,
                    height: isVideo ? undefined : values.height,
                    description: values.description,
                    image: values.image,
                })
            ).unwrap();

            toast.success("Advertising package created successfully");
            formikHelpers.resetForm();
            onCreated?.();
            onClose?.();
        } catch (error) {
            toast.error(error || "Failed to create advertising package");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Advertising Package"
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

            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, isSubmitting }) => {
                    const selectedMeta = typesMetaMap.get(String(values.advertisingType));
                    const isVideoPlacement =
                        (selectedMeta?.placeType || "").toLowerCase() === "video";

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
                                requireImage
                                showDimensions={!isVideoPlacement}
                                fileAccept={fileAccept}
                            />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onClose}
                                    disabled={creating || isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={creating || isSubmitting || loadingTypes}
                                >
                                    Create Package
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
}

export default AdminAdvertisingPackageCreateModal;
