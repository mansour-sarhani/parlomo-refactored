"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export function BadgePurchaseIntro({ intro, loading, error, onStart }) {
    const [sanitizedIntro, setSanitizedIntro] = useState("");

    useEffect(() => {
        let isMounted = true;

        if (!intro) {
            setSanitizedIntro("");
            return () => {
                isMounted = false;
            };
        }

        import("isomorphic-dompurify")
            .then((module) => {
                if (!isMounted) {
                    return;
                }

                const DOMPurify = module.default || module;
                setSanitizedIntro(DOMPurify.sanitize(intro));
            })
            .catch(() => {
                if (isMounted) {
                    setSanitizedIntro("");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [intro]);

    const features = [
        {
            icon: ShieldCheck,
            title: "Verification Badges",
            description: "Build trust with verified business badges",
        },
        {
            icon: Sparkles,
            title: "Sponsored Badges",
            description: "Stand out with premium sponsored placements",
        },
        {
            icon: Check,
            title: "Easy Assignment",
            description: "Quickly assign badges to your directories",
        },
    ];

    return (
        <Card className="p-6 md:p-8">
            {/* Hero Section */}
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-start">
                <div className="space-y-4">
                    <div>
                        <h1
                            className="text-2xl md:text-3xl font-semibold leading-tight"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Boost Your Business Visibility with Badges
                        </h1>
                        <p
                            className="mt-3 text-sm md:text-base leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Choose a badge package to highlight your business listing, then assign
                            it to one of your directories. Stand out from the crowd and build trust
                            with verified and sponsored badges.
                        </p>
                    </div>

                    {loading ? (
                        <div
                            className="rounded-lg animate-pulse h-32"
                            style={{ backgroundColor: "var(--color-background-elevated)" }}
                        />
                    ) : error ? (
                        <div
                            className="rounded-lg border px-4 py-3 text-sm"
                            style={{
                                borderColor: "var(--color-error)",
                                color: "var(--color-error)",
                            }}
                        >
                            {error}
                        </div>
                    ) : sanitizedIntro ? (
                        <div
                            className="prose prose-sm max-w-none"
                            style={{ color: "var(--color-text-secondary)" }}
                            dangerouslySetInnerHTML={{ __html: sanitizedIntro }}
                        />
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                        <Button onClick={onStart} size="lg">
                            Browse Badge Packages
                        </Button>
                        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                            Select a package and assign it to your directory in minutes.
                        </p>
                    </div>
                </div>

                {/* Visual Element with Features */}
                <div className="space-y-4">
                    {/* Badge Icons */}
                    <div
                        className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border"
                        style={{
                            borderColor: "var(--color-border)",
                            background:
                                "radial-gradient(circle at 20% 20%, var(--color-primary-light) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.12) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 60%)",
                        }}
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-full border-2"
                                    style={{
                                        borderColor: "var(--color-primary)",
                                        backgroundColor: "var(--color-primary-light)",
                                    }}
                                >
                                    <ShieldCheck
                                        className="h-8 w-8"
                                        style={{ color: "var(--color-primary)" }}
                                    />
                                </div>
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Verified
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-full border-2"
                                    style={{
                                        borderColor: "var(--color-primary)",
                                        backgroundColor: "var(--color-primary-light)",
                                    }}
                                >
                                    <Sparkles
                                        className="h-8 w-8"
                                        style={{ color: "var(--color-primary)" }}
                                    />
                                </div>
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Sponsored
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="flex gap-3">
                                    <div
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: "var(--color-primary-light)" }}
                                    >
                                        <Icon
                                            className="h-5 w-5"
                                            style={{ color: "var(--color-primary)" }}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h3
                                            className="text-sm font-semibold"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {feature.title}
                                        </h3>
                                        <p
                                            className="text-xs leading-relaxed"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default BadgePurchaseIntro;
