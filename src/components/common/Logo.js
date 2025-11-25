"use client";

export const Logo = ({ size = "md" }) => {
    const sizeMap = {
        sm: "text-xl",
        md: "text-2xl",
        lg: "text-3xl",
    };

    return (
        <div className="flex items-center gap-2">
            <div
                className="flex items-center justify-center rounded-xl"
                style={{
                    width: size === "lg" ? "3.5rem" : size === "sm" ? "2.25rem" : "2.75rem",
                    height: size === "lg" ? "3.5rem" : size === "sm" ? "2.25rem" : "2.75rem",
                    backgroundColor: "var(--color-primary)",
                }}
            >
                <span className="text-white font-bold">P</span>
            </div>
            <span
                className={`font-semibold tracking-tight ${sizeMap[size]}`}
                style={{ color: "var(--color-text-primary)" }}
            >
                Parlomo
            </span>
        </div>
    );
};

export default Logo;

