import { InputField, SelectField, TextareaField, FileUploadField } from "@/components/forms";

const BADGE_TYPE_OPTIONS = [
    { value: "Verify", label: "Verify" },
    { value: "Sponsore", label: "Sponsored" },
];

const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
];

export function AdminBadgeFormFields({
    showStatus = false,
    requireImage = false,
    helperText,
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
                name="title"
                label="Title"
                placeholder="Enter badge title"
                required
                className="md:col-span-2"
            />

            <InputField
                name="price"
                label="Price"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                required
                className="md:col-span-1"
            />

            <SelectField
                name="badgeType"
                label="Badge Type"
                options={BADGE_TYPE_OPTIONS}
                placeholder="Choose badge type"
                required
                className="md:col-span-1"
            />

            <InputField
                name="days"
                label="Badge Days"
                type="number"
                min={0}
                step="1"
                placeholder="0"
                required
                className="md:col-span-1"
            />

            <InputField
                name="extraDays"
                label="Extra Days"
                type="number"
                min={0}
                step="1"
                placeholder="Optional"
                className="md:col-span-1"
            />

            {showStatus ? (
                <SelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                    required
                    className="md:col-span-2"
                />
            ) : null}

            <TextareaField
                name="description"
                label="Description"
                placeholder="Describe the badge package"
                rows={5}
                required
                className="md:col-span-2"
            />

            <div className="md:col-span-2">
                <FileUploadField
                    name="image"
                    label="Image"
                    helperText={helperText || "Supported formats: JPG, PNG, WEBP"}
                    required={requireImage}
                />
            </div>
        </div>
    );
}

export default AdminBadgeFormFields;


