"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common/Button";
import { Field, ErrorMessage } from "formik";
import {
    nextStep,
    prevStep,
    setWizardDraft,
    createWizardListing,
} from "@/features/marketplace/adWizardSlice";

const schema = Yup.object({
    verifyMobile: Yup.string()
        .matches(/^[1-9]\d{9}$/g, "Enter a 10-digit UK mobile number")
        .required("Mobile number is required"),
});

export default function PhoneStep() {
    const dispatch = useDispatch();
    const { draft, loading, verificationError } = useSelector(
        (state) => state.marketplaceAdWizard
    );

    const initialValues = {
        verifyMobile: draft.verifyMobile ? draft.verifyMobile.replace("+44", "") : "",
    };

    const handleBack = () => {
        dispatch(prevStep());
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        if (!draft.listingPayload) {
            setSubmitting(false);
            return;
        }

        const payload = {
            ...draft.listingPayload,
            verifyMobile: `+44${values.verifyMobile}`,
        };

        try {
            await dispatch(createWizardListing(payload)).unwrap();
            dispatch(
                setWizardDraft({
                    verifyMobile: payload.verifyMobile,
                    listingPayload: payload,
                })
            );
            dispatch(nextStep());
        } catch (err) {
            // handled by slice
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-800">Verify Phone Number</h2>
                <p className="text-sm text-neutral-500">
                    We’ll send a verification code to confirm the contact number for this listing.
                </p>
            </div>

            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <div className="max-w-xs space-y-2">
                            <label className="block text-sm font-medium text-neutral-700">
                                Mobile number
                                <span className="ml-1 text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 rounded-l-lg border border-r-0 border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-medium">
                                    +44
                                </span>
                                <Field
                                    name="verifyMobile"
                                    placeholder="7*********"
                                    className="w-full rounded-lg border border-neutral-200 px-14 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>
                            <ErrorMessage name="verifyMobile">
                                {(msg) => <p className="text-xs text-red-500">{msg}</p>}
                            </ErrorMessage>
                        </div>

                        {verificationError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                                {verificationError}
                            </div>
                        )}

                        <div className="flex justify-between">
                            <Button variant="outline" type="button" onClick={handleBack}>
                                Back
                            </Button>
                            <Button
                                type="submit"
                                loading={isSubmitting || loading}
                                disabled={!draft.listingPayload}
                            >
                                Send Code
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

