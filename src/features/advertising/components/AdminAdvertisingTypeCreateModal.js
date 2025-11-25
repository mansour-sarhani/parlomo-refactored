"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { createAdminAdvertisingType } from "@/features/advertising/adminAdvertisingTypesSlice";
import { AdminAdvertisingTypeFormFields } from "./AdminAdvertisingTypeFormFields";

const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    placeType: Yup.string().required("Placement is required"),
    image: Yup.mixed().required("Image is required"),
});

const initialValues = {
    title: "",
    placeType: "",
    status: "1",
    image: null,
};

export function AdminAdvertisingTypeCreateModal({ isOpen, onClose, onCreated }) {
    const dispatch = useAppDispatch();
    const { creating } = useAppSelector((state) => state.adminAdvertisingTypes);

    const handleSubmit = async (values, formikHelpers) => {
        try {
            await dispatch(
                createAdminAdvertisingType({
                    title: values.title,
                    placeType: values.placeType,
                    status: values.status,
                    image: values.image,
                })
            ).unwrap();

            toast.success("Advertising type created successfully");
            formikHelpers.resetForm();
            onCreated?.();
            onClose?.();
        } catch (error) {
            toast.error(error || "Failed to create advertising type");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Advertising Type"
            size="lg"
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <AdminAdvertisingTypeFormFields requireImage />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={creating || isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={creating || isSubmitting}>
                                Create Type
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}

export default AdminAdvertisingTypeCreateModal;
