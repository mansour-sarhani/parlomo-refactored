import {
    InputField,
    SelectField,
    TextareaField,
    FileUploadField,
} from "@/components/forms";

const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
    { value: "End", label: "Ended" },
];

export function AdminAdvertisingPackageFormFields({
    typeOptions = [],
    requireImage = false,
    includeStatus = false,
    showDimensions = true,
    fileAccept = {
        "image/*": [".jpg", ".jpeg", ".png", ".webp"],
        "video/*": [".mp4", ".mov", ".webm"],
    },
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
                name="title"
                label="Title"
                placeholder="Enter package title"
                required
                className="md:col-span-2"
            />

            <SelectField
                name="advertisingType"
                label="Advertising Type"
                placeholder="Select advertising type"
                options={typeOptions}
                required
                className="md:col-span-1"
            />

            <InputField
                name="days"
                label="Duration (days)"
                type="number"
                min={1}
                step="1"
                required
            />

            <InputField
                name="price"
                label="Price (£)"
                type="number"
                min={0}
                step="0.01"
                required
            />

            <InputField
                name="socialMedia"
                label="Social Media Price (£)"
                type="number"
                min={0}
                step="0.01"
                required
            />

            {showDimensions ? (
                <>
                    <InputField
                        name="width"
                        label="Banner Width (px)"
                        type="number"
                        min={0}
                        step="1"
                        required
                    />
                    <InputField
                        name="height"
                        label="Banner Height (px)"
                        type="number"
                        min={0}
                        step="1"
                        required
                    />
                </>
            ) : (
                <div className="md:col-span-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Video placements do not require width & height values.
                </div>
            )}

            <TextareaField
                name="description"
                label="Description"
                placeholder="Describe what is included in this advertising package"
                rows={6}
                required
                className="md:col-span-2"
            />

            {includeStatus ? (
                <SelectField
                    name="status"
                    label="Status"
                    placeholder="Select status"
                    options={STATUS_OPTIONS}
                    required
                    className="md:col-span-2"
                />
            ) : null}

            <div className="md:col-span-2">
                <FileUploadField
                    name="image"
                    label="Media Asset"
                    helperText="Upload the banner image or promotional video"
                    required={requireImage}
                    accept={fileAccept}
                />
            </div>
        </div>
    );
}

export default AdminAdvertisingPackageFormFields;
