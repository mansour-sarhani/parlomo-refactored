import { isEmpty } from "@/lib/utils";

const isFileConstructorAvailable = () => typeof File !== "undefined";
const isBlobConstructorAvailable = () => typeof Blob !== "undefined";

/**
 * Normalize truthy values to the legacy API's expected "1"/"0" strings.
 * @param {unknown} value
 * @returns {string|undefined}
 */
export const normalizeFlag = (value) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (typeof value === "string") {
        if (value === "1" || value.toLowerCase() === "active" || value.toLowerCase() === "true") {
            return "1";
        }

        if (value === "0" || value.toLowerCase() === "inactive" || value.toLowerCase() === "false") {
            return "0";
        }
    }

    return value ? "1" : "0";
};

/**
 * Append a value to FormData if it is defined.
 * @param {FormData} formData
 * @param {string} key
 * @param {unknown} value
 */
export const appendIfDefined = (formData, key, value) => {
    if (value === undefined || value === null) {
        return;
    }

    // Preserve zeros and empty strings (API might rely on them)
    if (typeof value === "string" && value.length === 0) {
        formData.append(key, value);
        return;
    }

    formData.append(key, value);
};

/**
 * Helper to check if the provided value is a File or Blob.
 * @param {unknown} value
 * @returns {boolean}
 */
export const isFileLike = (value) => {
    if (!value) return false;

    if (isFileConstructorAvailable() && value instanceof File) {
        return true;
    }

    if (isBlobConstructorAvailable() && value instanceof Blob) {
        return true;
    }

    return false;
};

/**
 * Append images array (legacy API expects `image[]` fields)
 * @param {FormData} formData
 * @param {Array} files
 * @param {string} fieldName
 */
export const appendFileCollection = (formData, files = [], fieldName = "image") => {
    if (!Array.isArray(files) || isEmpty(files)) {
        return;
    }

    files.forEach((file) => {
        if (isFileLike(file)) {
            formData.append(`${fieldName}[]`, file);
        }
    });
};

/**
 * Ensure payload is FormData. Converts plain objects to FormData while
 * preserving arrays and nested attribute keys used by the legacy endpoints.
 * @param {FormData|Object} payload
 * @returns {FormData}
 */
export const ensureFormData = (payload = {}) => {
    if (payload instanceof FormData) {
        return payload;
    }

    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => {
                if (isFileLike(item)) {
                    formData.append(`${key}[]`, item);
                } else {
                    formData.append(`${key}[]`, item);
                }
            });
            return;
        }

        if (isFileLike(value)) {
            formData.append(key, value);
            return;
        }

        // For objects we JSON stringify to keep parity with legacy behaviour
        if (typeof value === "object") {
            formData.append(key, JSON.stringify(value));
            return;
        }

        formData.append(key, value);
    });

    return formData;
};


