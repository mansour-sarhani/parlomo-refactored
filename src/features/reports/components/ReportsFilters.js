"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { DatePickerField } from "@/components/forms";
import { Button } from "@/components/common/Button";

const validationSchema = Yup.object().shape({
    startDate: Yup.string()
        .nullable()
        .test(
            "is-valid-date",
            "Start date must be a valid date",
            (value) => !value || !Number.isNaN(Date.parse(value))
        ),
    endDate: Yup.string()
        .nullable()
        .test(
            "is-valid-date",
            "End date must be a valid date",
            (value) => !value || !Number.isNaN(Date.parse(value))
        )
        .test(
            "end-after-start",
            "End date must be after start date",
            function (value) {
                const { startDate } = this.parent;

                if (!value || !startDate) {
                    return true;
                }

                return new Date(value) >= new Date(startDate);
            }
        ),
});

const defaultValues = {
    startDate: "",
    endDate: "",
};

export function ReportsFilters({
    initialValues = defaultValues,
    onSubmit,
    onReset,
}) {
    const mergedInitialValues = {
        ...defaultValues,
        ...initialValues,
    };

    return (
        <Formik
            enableReinitialize
            initialValues={mergedInitialValues}
            validationSchema={validationSchema}
            onSubmit={(values, formikHelpers) => {
                const payload = {
                    startDate: values.startDate || null,
                    endDate: values.endDate || null,
                };

                onSubmit?.(payload);
                formikHelpers.setSubmitting(false);
            }}
        >
            {({ isSubmitting, dirty, resetForm }) => (
                <Form className="p-4 rounded-lg border space-y-4 md:flex md:items-end md:gap-4 md:space-y-0" style={{ borderColor: "var(--color-border)" }}>
                    <div className="flex-1 grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
                        <div className="[&>div]:!mb-0">
                            <DatePickerField
                                name="startDate"
                                label="Start Date"
                                placeholder="YYYY-MM-DD"
                            />
                        </div>
                        <div className="[&>div]:!mb-0">
                            <DatePickerField
                                name="endDate"
                                label="End Date"
                                placeholder="YYYY-MM-DD"
                            />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <Button
                            type="submit"
                            loading={isSubmitting}
                            disabled={!dirty && !initialValues.startDate && !initialValues.endDate}
                        >
                            Apply
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                resetForm();
                                onReset?.();
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}

export default ReportsFilters;

