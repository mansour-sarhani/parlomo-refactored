import { Megaphone, Video, Target, Share2 } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";

export function AdvertisingPurchaseIntro({ intro, loading, error, onStart }) {
    const features = [
        {
            icon: Video,
            title: "Banner & Video",
            description: "Choose from banner or video placements",
        },
        {
            icon: Target,
            title: "Targeted Reach",
            description: "Reach your ideal customers effectively",
        },
        {
            icon: Share2,
            title: "Social Media",
            description: "Extend reach with social media integration",
        },
    ];

    return (
        <Card className="p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-start">
                <div className="space-y-4">
                    <div>
                        <h1
                            className="text-2xl md:text-3xl font-semibold leading-tight"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Promote Your Business With Parlomo Advertising
                        </h1>
                        <p
                            className="mt-3 text-sm md:text-base leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Reach more customers by booking banner or video placements across
                            Parlomo. Choose a placement, select the package that matches your
                            goals, upload your creative, and you&apos;re ready to go.
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
                    ) : intro ? (
                        <div
                            className="prose prose-sm max-w-none"
                            style={{ color: "var(--color-text-secondary)" }}
                            dangerouslySetInnerHTML={{ __html: intro }}
                        />
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                        <Button onClick={onStart} size="lg">
                            Start Advertising
                        </Button>
                        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                            You can pause or update your campaign after purchase.
                        </p>
                    </div>
                </div>

                {/* Visual Element with Features */}
                <div className="space-y-4">
                    {/* Advertising Visual */}
                    <div
                        className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border"
                        style={{
                            borderColor: "var(--color-border)",
                            background:
                                "radial-gradient(circle at 20% 20%, var(--color-primary-light) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(255, 149, 0, 0.12) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(97, 218, 251, 0.1) 0%, transparent 60%)",
                        }}
                    >
                        <div className="text-center space-y-2">
                            <div
                                className="flex h-16 w-16 items-center justify-center rounded-full border-2 mx-auto"
                                style={{
                                    borderColor: "var(--color-primary)",
                                    backgroundColor: "var(--color-primary-light)",
                                }}
                            >
                                <Megaphone
                                    className="h-8 w-8"
                                    style={{ color: "var(--color-primary)" }}
                                />
                            </div>
                            <span
                                className="text-sm font-semibold tracking-wide uppercase block"
                                style={{ color: "var(--color-primary)" }}
                            >
                                Promote your brand
                            </span>
                            <p
                                className="text-xs"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Highlight seasonal offers, launches, and announcements across Parlomo.
                            </p>
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

export default AdvertisingPurchaseIntro;
