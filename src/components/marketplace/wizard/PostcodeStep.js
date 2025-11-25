"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { nextStep, setWizardDraft } from "@/features/marketplace/adWizardSlice";
import { verifyPostcode } from "@/features/marketplace/adWizardSlice";

const schema = Yup.object({
    postcode: Yup.string().optional(),
});

export default function PostcodeStep() {
    const dispatch = useDispatch();
    const { draft, postcodeStatus, postcodeError } = useSelector(
        (state) => state.marketplaceAdWizard
    );

    const initialValues = {
        postcode: draft.postcode || "",
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // If postcode is empty, skip verification and proceed
            if (!values.postcode || values.postcode.trim() === "") {
                dispatch(setWizardDraft(values));
                dispatch(nextStep());
                return;
            }

            // If postcode is provided, verify it before proceeding
            const result = await dispatch(verifyPostcode(values.postcode)).unwrap();
            if (result?.message === true) {
                dispatch(setWizardDraft(values));
                dispatch(nextStep());
            }
        } catch (err) {
            // error handled by slice state
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-800">Postcode Verification</h2>
                <p className="text-sm text-neutral-500">
                    Enter the postcode for this listing if applicable (optional for online businesses). We'll confirm it's valid before continuing.
                </p>
            </div>

            <Formik initialValues={initialValues} validationSchema={schema} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                    <Form className="space-y-6">
                        <InputField
                            name="postcode"
                            label="Postcode"
                            placeholder="e.g. SW1A 1AA (optional)"
                        />

                        {postcodeError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                                {postcodeError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <Button type="submit" loading={isSubmitting || postcodeStatus === "loading"}>
                                Continue
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

