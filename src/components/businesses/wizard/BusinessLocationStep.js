"use client";

import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    setBusinessWizardDraft,
    verifyBusinessPostcode,
    searchBusinessLocations,
} from "@/features/businesses/businessWizardSlice";

const schema = Yup.object({
    postcode: Yup.string().optional(),
    location: Yup.string().nullable(),
});

export default function BusinessLocationStep() {
    const dispatch = useAppDispatch();
    const { draft, postcodeStatus, postcodeError, locationResults, locationLoading } = useAppSelector(
        (state) => state.businessWizard
    );

    const [localPostcode, setLocalPostcode] = useState(draft.postcode || "");
    const [selectedResult, setSelectedResult] = useState(draft.location || "");

    useEffect(() => {
        if (localPostcode.trim().length >= 3) {
            dispatch(searchBusinessLocations(localPostcode.trim()));
        }
    }, [dispatch, localPostcode]);

    return (
        <Formik
            initialValues={{
                postcode: draft.postcode || "",
                location: draft.location || "",
            }}
            validationSchema={schema}
            enableReinitialize
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    // If postcode is empty, skip verification and proceed
                    if (!values.postcode || values.postcode.trim() === "") {
                        dispatch(
                            setBusinessWizardDraft({
                                postcode: values.postcode || "",
                                location: values.location || selectedResult || "",
                            })
                        );
                        dispatch(nextBusinessWizardStep());
                        return;
                    }

                    // If postcode is provided, verify it before proceeding
                    const res = await dispatch(
                        verifyBusinessPostcode({
                            postcode: values.postcode,
                        })
                    ).unwrap();

                    if (res?.message === true || res?.status === "success" || res === true) {
                        dispatch(
                            setBusinessWizardDraft({
                                postcode: values.postcode,
                                location: values.location || selectedResult || "",
                            })
                        );
                        dispatch(nextBusinessWizardStep());
                    }
                } catch (error) {
                    // error surfaced via slice
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                <Form className="space-y-6">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    Verify business location
                                </h2>
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    Enter the business postcode if applicable (optional for online businesses). We'll confirm it's valid before continuing.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Postcode
                                </label>
                                <input
                                    name="postcode"
                                    value={values.postcode}
                                    onChange={(event) => {
                                        const next = event.target.value.toUpperCase();
                                        setFieldValue("postcode", next);
                                        setLocalPostcode(next);
                                    }}
                                    placeholder="e.g. SW1A 1AA (optional)"
                                    className="w-full rounded-lg border px-4 py-2 text-sm"
                                    style={{
                                        borderColor: touched.postcode && errors.postcode ? "var(--color-error)" : "var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                                {touched.postcode && errors.postcode && (
                                    <p className="text-xs" style={{ color: "var(--color-error)" }}>
                                        {errors.postcode}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label
                                    className="text-sm font-medium"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Location name (optional)
                                </label>
                                <input
                                    name="location"
                                    value={values.location}
                                    onChange={(event) => {
                                        const next = event.target.value;
                                        setFieldValue("location", next);
                                        setSelectedResult("");
                                    }}
                                    placeholder="Business area or town"
                                    className="w-full rounded-lg border px-4 py-2 text-sm"
                                    style={{
                                        borderColor: "var(--color-border)",
                                        backgroundColor: "var(--color-background)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                                {locationLoading && (
                                    <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                        Searching postcode directory…
                                    </p>
                                )}
                                {locationResults.length > 0 && (
                                    <ul
                                        className="max-h-48 overflow-y-auto rounded-lg border text-sm"
                                        style={{
                                            borderColor: "var(--color-border)",
                                            backgroundColor: "var(--color-card-bg)",
                                        }}
                                    >
                                        {locationResults.map((result) => (
                                            <li
                                                key={result.name}
                                                className="cursor-pointer px-4 py-2 hover:bg-[var(--color-hover)]"
                                                style={{ color: "var(--color-text-secondary)" }}
                                                onClick={() => {
                                                    setFieldValue("location", result.name);
                                                    setSelectedResult(result.name);
                                                }}
                                            >
                                                {result.name}
                                                <span className="ml-2 text-xs uppercase" style={{ color: "var(--color-text-tertiary)" }}>
                                                    {result.type}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {postcodeStatus === "failed" && postcodeError && (
                                <div className="rounded-md border border-[var(--color-error)] bg-red-50 px-4 py-2 text-sm"
                                    style={{ color: "var(--color-error)" }}
                                >
                                    {postcodeError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button type="submit" loading={isSubmitting || postcodeStatus === "loading"}>
                                    Continue
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
}


