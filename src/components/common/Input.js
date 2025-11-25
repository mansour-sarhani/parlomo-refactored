"use client";

export function Input({
    label,
    description,
    error,
    className = "",
    ...props
}) {
    return (
        <label className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {label}
                </span>
            )}
            <input
                className="rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2"
                style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "var(--color-background)",
                    color: "var(--color-text-primary)",
                    boxShadow: "var(--shadow-xs)",
                }}
                {...props}
            />
            {description && (
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {description}
                </span>
            )}
            {error && (
                <span
                    className="text-xs"
                    style={{ color: "var(--color-error)" }}
                >
                    {error}
                </span>
            )}
        </label>
    );
}

export default Input;

