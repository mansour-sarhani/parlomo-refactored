"use client";

import { useMemo } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    nextBusinessWizardStep,
    prevBusinessWizardStep,
    setBusinessWizardDraft,
} from "@/features/businesses/businessWizardSlice";
import { Button } from "@/components/common/Button";

const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

const defaultSchedule = daysOfWeek.map((day) => ({
    day,
    closed: false,
    open: "09:00",
    close: "17:00",
}));

const validationSchema = Yup.object({
    is24h: Yup.boolean(),
    schedule: Yup.array()
        .of(
            Yup.object({
                day: Yup.string().required(),
                closed: Yup.boolean(),
                open: Yup.string().nullable(),
                close: Yup.string().nullable(),
            })
        )
        .length(7),
});

export default function BusinessHoursStep() {
    const dispatch = useAppDispatch();
    const draft = useAppSelector((state) => state.businessWizard.draft);

    const initialValues = useMemo(
        () => {
            // Debug: Log draft data for this step
            console.log("[BusinessHoursStep] Draft data:", draft);
            console.log("[BusinessHoursStep] is24h:", draft.is24h);
            console.log("[BusinessHoursStep] businessHours:", draft.businessHours);
            
            const schedule =
                draft.businessHours && Array.isArray(draft.businessHours) && draft.businessHours.length > 0
                    ? draft.businessHours.map((entry, index) => {
                          const normalized = {
                              day: entry.day || daysOfWeek[index] || "",
                              closed: Boolean(entry.closed),
                              open: entry.open || "09:00",
                              close: entry.close || "17:00",
                          };
                          console.log(`[BusinessHoursStep] Normalized hour ${index}:`, normalized);
                          return normalized;
                      })
                    : defaultSchedule;
            
            // Ensure we have exactly 7 days
            while (schedule.length < 7) {
                schedule.push({
                    day: daysOfWeek[schedule.length],
                    closed: false,
                    open: "09:00",
                    close: "17:00",
                });
            }
            
            return {
                is24h: Boolean(draft.is24h),
                schedule: schedule.slice(0, 7), // Ensure exactly 7
            };
        },
        [draft.businessHours, draft.is24h]
    );

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                dispatch(
                    setBusinessWizardDraft({
                        ...draft,
                        is24h: Boolean(values.is24h),
                        businessHours: values.schedule,
                    })
                );
                dispatch(nextBusinessWizardStep());
            }}
        >
            {({ values, setFieldValue }) => (
                <Form className="space-y-6">
                    <div
                        className="flex flex-col gap-2 rounded-lg border p-4"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                    Opening hours configuration
                                </h3>
                                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                    Choose standard hours or mark the business as always open.
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-xs">
                                <input
                                    type="checkbox"
                                    checked={values.is24h}
                                    onChange={(event) => {
                                        const nextValue = event.target.checked;
                                        setFieldValue("is24h", nextValue);
                                        if (nextValue) {
                                            setFieldValue(
                                                "schedule",
                                                values.schedule.map((entry) => ({
                                                    ...entry,
                                                    closed: false,
                                                    open: "00:00",
                                                    close: "23:59",
                                                }))
                                            );
                                        }
                                    }}
                                />
                                Open 24/7
                            </label>
                        </div>
                        {values.is24h && (
                            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                Customers will see this business as always open.
                            </p>
                        )}
                    </div>

                    <FieldArray name="schedule">
                        {() => (
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {values.schedule.map((entry, index) => (
                                    <div
                                        key={entry.day}
                                        className="rounded-lg border p-4"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3
                                                className="text-sm font-semibold"
                                                style={{ color: "var(--color-text-primary)" }}
                                            >
                                                {entry.day}
                                            </h3>
                                            <label className="flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={entry.closed}
                                                    disabled={values.is24h}
                                                    onChange={(event) => {
                                                        setFieldValue(`schedule[${index}].closed`, event.target.checked);
                                                    }}
                                                />
                                                Closed
                                            </label>
                                        </div>
                                        {!entry.closed && !values.is24h ? (
                                            <div className="mt-3 grid grid-cols-2 gap-3">
                                                <div>
                                                    <label
                                                        className="mb-1 block text-xs uppercase tracking-wide"
                                                        style={{ color: "var(--color-text-secondary)" }}
                                                    >
                                                        Opens
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={entry.open}
                                                        onChange={(event) =>
                                                            setFieldValue(
                                                                `schedule[${index}].open`,
                                                                event.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                                        style={{
                                                            borderColor: "var(--color-border)",
                                                            backgroundColor: "var(--color-background)",
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        className="mb-1 block text-xs uppercase tracking-wide"
                                                        style={{ color: "var(--color-text-secondary)" }}
                                                    >
                                                        Closes
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={entry.close}
                                                        onChange={(event) =>
                                                            setFieldValue(
                                                                `schedule[${index}].close`,
                                                                event.target.value
                                                            )
                                                        }
                                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                                        style={{
                                                            borderColor: "var(--color-border)",
                                                            backgroundColor: "var(--color-background)",
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p
                                                className="mt-3 text-xs"
                                                style={{ color: "var(--color-text-tertiary)" }}
                                            >
                                                Customers will see this day as closed.
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </FieldArray>

                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => dispatch(prevBusinessWizardStep())}
                        >
                            Back
                        </Button>
                        <Button type="submit">
                            Continue
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}


