import { InputField, SelectField, FileUploadField } from "@/components/forms";

const PLACE_TYPE_OPTIONS = [
    { value: "Home", label: "Home Page" },
    { value: "Single", label: "Single Page" },
    { value: "Archive", label: "Archive Page" },
    { value: "Video", label: "Video" },
    { value: "Mobile", label: "Mobile" },
];

const STATUS_OPTIONS = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
];

export function AdminAdvertisingTypeFormFields({
    requireImage = false,
    includeStatus = false,
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
                name="title"
                label="Title"
                placeholder="Enter advertising type title"
                required
                className="md:col-span-2"
            />

            <SelectField
                name="placeType"
                label="Placement"
                placeholder="Select placement"
                options={PLACE_TYPE_OPTIONS}
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
                    label="Image"
                    helperText="Upload a banner preview image (JPG, PNG, WEBP)"
                    required={requireImage}
                />
            </div>
        </div>
    );
}

export default AdminAdvertisingTypeFormFields;
