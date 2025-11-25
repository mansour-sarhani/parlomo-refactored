"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
    createBusinessWizardListing,
    updateBusinessWizardListing,
    clearBusinessWizardErrors,
    goToBusinessWizardStep,
} from "@/features/businesses/businessWizardSlice";
import { buildBusinessPayload } from "./payload";

// UK phone format: must start with 0 and be 10, 11, or 13 digits total
const phoneRegExp = /^0(?:\d{9}|\d{10}|\d{12})$/;

const schema = Yup.object({
    verifyMobile: Yup.string()
        .matches(phoneRegExp, "Enter a valid UK mobile number (must start with 0, 10-13 digits)")
        .required("Mobile number is required"),
});

export default function BusinessPhoneStep() {
    const dispatch = useAppDispatch();
    const { draft, loading, verificationError, isEditing, listingId } = useAppSelector(
        (state) => state.businessWizard
    );

    const initialValues = {
        verifyMobile: draft.verifyMobile || "",
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const payload = buildBusinessPayload(draft, { verifyMobile: values.verifyMobile });

        try {
            if (isEditing && listingId) {
                // Update existing business
                await dispatch(
                    updateBusinessWizardListing({
                        id: listingId,
                        changes: payload,
                    })
                ).unwrap();
            } else {
                // Create new business
                await dispatch(createBusinessWizardListing(payload)).unwrap();
            }
            dispatch(
                setBusinessWizardDraft({
                    verifyMobile: values.verifyMobile,
                })
            );
            // Go directly to success step (step 7, after Phone which is step 6)
            dispatch(goToBusinessWizardStep(7));
        } catch (err) {
            // error surfaced via slice
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
            {({ isSubmitting, errors, touched, values, setFieldValue }) => (
                <Form className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            Emergency contact number
                        </h2>
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            This number will not be displayed to anyone and will be used only if ever needed to contact you.
                        </p>
                    </div>

                    <div className="max-w-sm space-y-2">
                        <label
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Contact number <span className="text-red-500">*</span>
                        </label>
                        <input
                            name="verifyMobile"
                            value={values.verifyMobile}
                            onChange={(event) => setFieldValue("verifyMobile", event.target.value)}
                            placeholder="e.g. 07123 456 789"
                            className="w-full rounded-lg border px-4 py-2 text-sm"
                            style={{
                                borderColor: touched.verifyMobile && errors.verifyMobile
                                    ? "var(--color-error)"
                                    : "var(--color-border)",
                                backgroundColor: "var(--color-background)",
                                color: "var(--color-text-primary)",
                            }}
                        />
                        {touched.verifyMobile && errors.verifyMobile && (
                            <p className="text-xs" style={{ color: "var(--color-error)" }}>
                                {errors.verifyMobile}
                            </p>
                        )}
                    </div>

                    {verificationError && (
                        <div className="rounded-md border border-[var(--color-error)] bg-red-50 px-4 py-2 text-sm"
                            style={{ color: "var(--color-error)" }}
                        >
                            {verificationError}
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                dispatch(clearBusinessWizardErrors());
                                dispatch(prevBusinessWizardStep());
                            }}
                            disabled={isSubmitting || loading}
                        >
                            Back
                        </Button>
                        <Button type="submit" loading={isSubmitting || loading}>
                            {isEditing ? "Update Business" : "Submit Business"}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}


