import { InputField, SelectField } from "@/components/forms";

const MODEL_OPTIONS = [
    { value: "", label: "All modules" },
    { value: "Directory", label: "Directory" },
    { value: "Ads", label: "Ads" },
    { value: "Advertising", label: "Advertising" },
    { value: "Badge  ", label: "Badge" },
];

const TYPE_OPTIONS = [
    { value: "price", label: "Fixed amount" },
    { value: "percentage", label: "Percentage" },
];

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
];

export function AdminPromotionCodeFormFields({
    disableCode = false,
    includeStatus = true,
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
                name="code"
                label="Promotion Code"
                placeholder="e.g. SUMMER24"
                required
                disabled={disableCode}
                className="md:col-span-1"
            />

            <SelectField
                name="model"
                label="Applies To"
                options={MODEL_OPTIONS}
                placeholder="Choose module"
                helperText="Choose which product category this code applies to. Leave as All for a global promotion."
                className="md:col-span-1"
            />

            <SelectField
                name="discountType"
                label="Discount Type"
                options={TYPE_OPTIONS}
                placeholder="Choose type"
                required
                className="md:col-span-1"
            />

            <InputField
                name="price"
                label="Discount Value"
                type="number"
                min={0}
                step="0.01"
                placeholder="Enter amount"
                helperText="For percentage discounts use whole numbers between 0 and 100."
                required
                className="md:col-span-1"
            />

            <InputField
                name="useTime"
                label="Usage Limit"
                type="number"
                min={1}
                step="1"
                placeholder="Total number of redemptions"
                required
                className="md:col-span-1"
            />

            <InputField
                name="validFrom"
                label="Valid From"
                type="datetime-local"
                helperText="Optional start date/time. Leave empty to activate immediately."
                className="md:col-span-1"
            />

            <InputField
                name="validTo"
                label="Valid Until"
                type="datetime-local"
                helperText="Optional expiry date/time. Leave empty for no expiry."
                className="md:col-span-1"
            />

            {includeStatus && (
                <SelectField
                    name="status"
                    label="Status"
                    options={STATUS_OPTIONS}
                    placeholder="Select status"
                    required
                    className="md:col-span-1"
                />
            )}
        </div>
    );
}

export default AdminPromotionCodeFormFields;

