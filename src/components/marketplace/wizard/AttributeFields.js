import { Field } from "formik";

const baseInputClasses =
    "w-full rounded-lg border px-4 py-2 text-sm transition focus:outline-none focus:ring-2";

export default function AttributeFields({ attributes, errors, touched }) {
    if (!Array.isArray(attributes) || attributes.length === 0) {
        return null;
    }

    const renderField = (attribute) => {
        const fieldName = `attributes.${attribute.id}`;
        const isRequired = Boolean(attribute.required);
        const error = errors?.attributes?.[attribute.id];
        const isTouched = touched?.attributes?.[attribute.id];

        const commonProps = {
            name: fieldName,
            required: isRequired,
        };

        const inputClass = `${baseInputClasses} ${
            isTouched && error ? "border-red-400 ring-2 ring-red-200" : "border-neutral-200"
        }`;

        switch (attribute.type) {
            case "textarea":
                return (
                    <Field
                        as="textarea"
                        className={`${inputClass} min-h-[120px] resize-y`}
                        placeholder={attribute.title}
                        {...commonProps}
                    />
                );
            case "date":
            case "time":
            case "number":
            case "tel":
            case "url":
            case "week":
            case "month":
                return (
                    <Field
                        type={attribute.type}
                        className={inputClass}
                        placeholder={attribute.title}
                        {...commonProps}
                    />
                );
            default:
                return (
                    <Field
                        type="text"
                        className={inputClass}
                        placeholder={attribute.title}
                        {...commonProps}
                    />
                );
        }
    };

    return (
        <div className="space-y-4">
            {attributes.map((attribute) => {
                const fieldName = `attributes.${attribute.id}`;
                const error = errors?.attributes?.[attribute.id];
                const isTouched = touched?.attributes?.[attribute.id];

                return (
                    <div key={attribute.id} className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">
                            {attribute.title}
                            {attribute.required ? (
                                <span className="ml-1 text-red-500">*</span>
                            ) : null}
                        </label>
                        {renderField(attribute)}
                        {isTouched && error ? (
                            <p className="text-xs text-red-500">{error}</p>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}

