"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { Logo } from "@/components/common/Logo";

const recaptchaKey = process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_KEY;

export const AuthShell = ({
    title,
    subtitle,
    children,
    footer,
    highlightLines = [],
    showAside = true,
}) => {
    return (
        <GoogleReCaptchaProvider
            reCaptchaKey={recaptchaKey || "test"}
            scriptProps={{
                async: true,
                defer: true,
            }}
        >
            <div className="w-full max-w-6xl mx-auto">
                <div
                    className={
                        showAside
                            ? "grid lg:grid-cols-[1fr_480px] gap-12 items-center"
                            : "flex justify-center"
                    }
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {showAside && (
                        <div className="hidden lg:block space-y-8">
                            <Logo size="lg" />
                            <div className="space-y-4">
                                <h1
                                    className="text-4xl font-bold"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {title}
                                </h1>
                                <p
                                    className="text-lg"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    {subtitle}
                                </p>
                            </div>
                            <div className="space-y-4">
                                {highlightLines.map(({ icon, title: lineTitle, description }) => (
                                    <div key={lineTitle} className="flex items-start gap-3">
                                        <div className="text-2xl" aria-hidden="true">
                                            {icon}
                                        </div>
                                        <div>
                                            <p
                                                className="font-semibold"
                                                style={{ color: "var(--color-text-primary)" }}
                                            >
                                                {lineTitle}
                                            </p>
                                            <p
                                                className="text-sm"
                                                style={{ color: "var(--color-text-secondary)" }}
                                            >
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div
                        className={showAside ? "w-full" : "w-full max-w-[520px] mx-auto"}
                        style={{
                            borderRadius: "1.5rem",
                            backgroundColor: "var(--color-card-bg)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="px-8 py-10 space-y-8">
                            <div className="lg:hidden flex justify-center">
                                <Logo size="md" />
                            </div>
                            {children}
                            {footer}
                        </div>
                    </div>
                </div>
            </div>
        </GoogleReCaptchaProvider>
    );
};

export default AuthShell;
