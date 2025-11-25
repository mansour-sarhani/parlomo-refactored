"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/common/Button";
import {
    InputField,
    TextareaField,
    DatePickerField,
    FileUploadField,
} from "@/components/forms";
import { Card } from "@/components/common/Card";

const tomorrowDateString = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
};

const createValidationSchema = (isVideoPlacement) =>
    Yup.object({
        startDate: Yup.string().required("Start date is required"),
        link: Yup.string().url("Enter a valid URL").nullable(),
        title: isVideoPlacement
            ? Yup.string().required("Video title is required")
            : Yup.string().nullable(),
        description: isVideoPlacement
            ? Yup.string().required("Video description is required")
            : Yup.string().nullable(),
        file: Yup.mixed()
            .required("Please upload your creative")
            .test("fileType", "Unsupported file type", (value) => {
                if (!value) {
                    return false;
                }

                const acceptedVideo = ["video/mp4", "video/quicktime", "video/webm"];
                const acceptedImages = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/heic",
                    "image/heif",
                ];

                if (value.type) {
                    return isVideoPlacement
                        ? acceptedVideo.includes(value.type)
                        : acceptedImages.includes(value.type);
                }

                return true;
            })
            .test("fileSize", "File is too large (max 25MB)", (value) => {
                if (!value || !value.size) {
                    return true;
                }

                return value.size <= 25 * 1024 * 1024;
            }),
    });

const getFileAccept = (isVideoPlacement) =>
    isVideoPlacement
        ? {
              "video/*": [".mp4", ".mov", ".webm"],
          }
        : {
              "image/*": [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"],
          };

const computeEndDateLabel = (startDate, durationDays) => {
    if (!startDate || !durationDays) {
        return "Calculated when start date is set";
    }

    const start = new Date(startDate);
    if (Number.isNaN(start.getTime())) {
        return "Calculated when start date is valid";
    }

    const end = new Date(start);
    end.setDate(end.getDate() + Number(durationDays));

    return end.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export function AdvertisingMediaStep({
    selectedPackage,
    includeSocialMedia,
    initialValues,
    submitting,
    submitError,
    onBack,
    onSubmit,
}) {
    const isVideoPlacement = (selectedPackage?.typeTitle || selectedPackage?.type || "")
        .toLowerCase()
        .includes("video");

    const validationSchema = createValidationSchema(isVideoPlacement);
    const accept = getFileAccept(isVideoPlacement);
    const minDate = tomorrowDateString();

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2
                        className="text-xl font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Provide Your Creative
                    </h2>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Upload the artwork or video for your campaign and schedule when it should go
                        live. We&apos;ll generate an exact end date based on the package duration.
                    </p>
                </div>
                <Card className="w-full max-w-sm border bg-[var(--color-background-elevated)]">
                    <div className="space-y-1">
                        <p
                            className="text-xs uppercase tracking-wide"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Package summary
                        </p>
                        <p
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {selectedPackage?.title}
                        </p>
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {selectedPackage?.days ?? 0} days · {selectedPackage?.typeTitle || selectedPackage?.type || "Custom"}
                        </p>
                        {includeSocialMedia ? (
                            <p
                                className="text-xs"
                                style={{ color: "var(--color-primary)" }}
                            >
                                Includes social media amplification
                            </p>
                        ) : null}
                    </div>
                </Card>
            </div>

            <Formik
                enableReinitialize
                initialValues={{
                    startDate: initialValues?.startDate || minDate,
                    link: initialValues?.link || "",
                    title: initialValues?.title || "",
                    description: initialValues?.description || "",
                    file: null,
                }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <DatePickerField
                                name="startDate"
                                label="Start Date"
                                min={minDate}
                                required
                            />

                            <Card className="border bg-[var(--color-background-elevated)]">
                                <p
                                    className="text-xs uppercase tracking-wide"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                >
                                    End date
                                </p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {computeEndDateLabel(values.startDate, selectedPackage?.days)}
                                </p>
                                <p
                                    className="text-xs"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    We add the package duration to your chosen start date.
                                </p>
                            </Card>

                            <InputField
                                name="link"
                                label="Landing Page URL"
                                placeholder="https://yourbusiness.co.uk/offer"
                                className="md:col-span-2"
                            />

                            {isVideoPlacement ? (
                                <>
                                    <InputField
                                        name="title"
                                        label="Video Title"
                                        placeholder="Give your video a descriptive title"
                                        required
                                        className="md:col-span-2"
                                    />
                                    <TextareaField
                                        name="description"
                                        label="Video Description"
                                        placeholder="Describe your video advertisement"
                                        rows={4}
                                        required
                                        className="md:col-span-2"
                                    />
                                </>
                            ) : null}
                        </div>

                        <FileUploadField
                            name="file"
                            label={isVideoPlacement ? "Upload Video" : "Upload Banner Image"}
                            helperText={
                                isVideoPlacement
                                    ? "Supported formats: MP4, MOV, WEBM (max 25MB)"
                                    : `Supported formats: JPG, PNG, WEBP, HEIC (max 25MB). Recommended size ${
                                          selectedPackage?.width || "auto"
                                      } x ${selectedPackage?.height || "auto"} px.`
                            }
                            accept={accept}
                            required
                            showPreview={!isVideoPlacement}
                        />

                        {submitError ? (
                            <p className="text-sm" style={{ color: "var(--color-error)" }}>
                                {submitError}
                            </p>
                        ) : null}

                        <div className="flex justify-between">
                            <Button type="button" variant="secondary" onClick={onBack}>
                                Back
                            </Button>
                            <Button type="submit" loading={submitting || isSubmitting}>
                                Submit for Review
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
}

export default AdvertisingMediaStep;
