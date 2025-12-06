"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { Building2, MapPin, Clock, Image, Shield } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import {
    BusinessWizardStepper,
    BusinessLocationStep,
    BusinessDetailsStep,
    BusinessCategoryStep,
    BusinessHoursStep,
    BusinessExtrasStep,
    BusinessBadgeStep,
    BusinessPhoneStep,
    BusinessSuccessStep,
} from "@/components/businesses/wizard";
import {
    resetBusinessWizard,
    fetchBusinessWizardDraft,
} from "@/features/businesses/businessWizardSlice";
import { fetchAdminSetting, selectAdminSetting } from "@/features/adminSettings/adminSettingsSlice";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { SkeletonTable } from "@/components/common/Skeleton";

const wizardSteps = [
    { title: "Location" },
    { title: "Details" },
    { title: "Categories" },
    { title: "Hours" },
    { title: "Extras" },
    { title: "Badges" },
    { title: "Phone" },
    { title: "Complete" },
];

const stepComponents = [
    BusinessLocationStep,
    BusinessDetailsStep,
    BusinessCategoryStep,
    BusinessHoursStep,
    BusinessExtrasStep,
    BusinessBadgeStep,
    BusinessPhoneStep,
    BusinessSuccessStep,
];

export default function NewBusinessPage() {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [showWizard, setShowWizard] = useState(false);
    const listingId = searchParams.get("id");
    const isEditMode = Boolean(listingId);

    const { activeStep, loading, isEditing } = useSelector((state) => state.businessWizard);
    const businessSettingEntry = useSelector((state) => selectAdminSetting(state, "Bussiness"));

    // Fetch the "Bussiness" intro content on mount (only for new businesses)
    useEffect(() => {
        if (!isEditMode) {
            dispatch(fetchAdminSetting({ key: "Bussiness" }));
        }
    }, [dispatch, isEditMode]);

    useEffect(() => {
        // Only reset if we're not editing (no listingId)
        if (!listingId) {
            dispatch(resetBusinessWizard());
        }
    }, [dispatch, listingId]);

    useEffect(() => {
        if (listingId) {
            // Fetch draft data for editing
            dispatch(fetchBusinessWizardDraft(listingId))
                .unwrap()
                .catch((error) => {
                    console.error("[NewBusinessPage] Failed to fetch draft:", error);
                });
        }
    }, [dispatch, listingId]);

    const handleStartWizard = () => {
        setShowWizard(true);
    };

    // For edit mode, always show the wizard (skip intro)
    const shouldShowWizard = isEditMode || showWizard;

    const StepContent = stepComponents[activeStep] || BusinessSuccessStep;
    const isLoadingExisting = Boolean(listingId) && loading && activeStep === 0 && isEditing;

    const businessFeatures = [
        {
            icon: MapPin,
            title: "Location & Address",
            description: "Add your business address and get discovered locally",
        },
        {
            icon: Clock,
            title: "Business Hours",
            description: "Set your opening hours so customers know when to visit",
        },
        {
            icon: Image,
            title: "Photos & Media",
            description: "Upload images to showcase your business",
        },
        {
            icon: Shield,
            title: "Verification",
            description: "Verify your phone to build trust with customers",
        },
    ];

    // Show intro content for new businesses before starting wizard
    if (!shouldShowWizard) {
        const introContent = businessSettingEntry?.value || "";
        const isLoadingIntro = businessSettingEntry?.loading;
        const sanitizedContent = typeof window !== "undefined" && introContent
            ? DOMPurify.sanitize(introContent)
            : "";

        return (
            <ContentWrapper title="New Business" description="Create a new business listing on Parlomo.">
                <Card className="p-6 md:p-8">
                    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-start">
                        <div className="space-y-4">
                            <div>
                                <h1
                                    className="text-2xl md:text-3xl font-semibold leading-tight"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Create Your Business Listing
                                </h1>
                                <p
                                    className="mt-3 text-sm md:text-base leading-relaxed"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    List your business on Parlomo and reach thousands of potential customers.
                                    Our step-by-step wizard makes it easy to create a professional listing.
                                </p>
                            </div>

                            {isLoadingIntro ? (
                                <div
                                    className="rounded-lg animate-pulse h-32"
                                    style={{ backgroundColor: "var(--color-background-elevated)" }}
                                />
                            ) : sanitizedContent ? (
                                <>
                                    <div
                                        className="new-business-intro-content max-w-none"
                                        style={{ color: "var(--color-text-primary)" }}
                                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                    />
                                    <style jsx global>{`
                                        .new-business-intro-content h1 {
                                            font-size: 1.875rem;
                                            font-weight: 700;
                                            margin-bottom: 0.75rem;
                                            color: var(--color-text-primary);
                                        }
                                        .new-business-intro-content h2 {
                                            font-size: 1.5rem;
                                            font-weight: 600;
                                            margin-bottom: 0.5rem;
                                            color: var(--color-text-primary);
                                        }
                                        .new-business-intro-content h3 {
                                            font-size: 1.25rem;
                                            font-weight: 600;
                                            margin-bottom: 0.5rem;
                                            color: var(--color-text-primary);
                                        }
                                        .new-business-intro-content p {
                                            margin-bottom: 0.75rem;
                                            line-height: 1.6;
                                        }
                                        .new-business-intro-content ul,
                                        .new-business-intro-content ol {
                                            margin-left: 1.5rem;
                                            margin-bottom: 0.75rem;
                                        }
                                        .new-business-intro-content ul {
                                            list-style-type: disc;
                                        }
                                        .new-business-intro-content ol {
                                            list-style-type: decimal;
                                        }
                                        .new-business-intro-content li {
                                            margin-bottom: 0.25rem;
                                        }
                                        .new-business-intro-content a {
                                            color: var(--color-primary);
                                            text-decoration: underline;
                                        }
                                        .new-business-intro-content a:hover {
                                            opacity: 0.8;
                                        }
                                        .new-business-intro-content strong,
                                        .new-business-intro-content b {
                                            font-weight: 600;
                                        }
                                        .new-business-intro-content em,
                                        .new-business-intro-content i {
                                            font-style: italic;
                                        }
                                        .new-business-intro-content u {
                                            text-decoration: underline;
                                        }
                                        .new-business-intro-content s,
                                        .new-business-intro-content strike {
                                            text-decoration: line-through;
                                        }
                                    `}</style>
                                </>
                            ) : null}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center pt-2">
                                <Button size="lg" onClick={handleStartWizard}>
                                    Start Now
                                </Button>
                                <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                    Complete the wizard to publish your business listing.
                                </p>
                            </div>
                        </div>

                        {/* Visual Element with Features */}
                        <div className="space-y-4">
                            {/* Business Visual */}
                            <div
                                className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border"
                                style={{
                                    borderColor: "var(--color-border)",
                                    background:
                                        "radial-gradient(circle at 20% 20%, var(--color-primary-light) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(34, 197, 94, 0.12) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 60%)",
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
                                        <Building2
                                            className="h-8 w-8"
                                            style={{ color: "var(--color-primary)" }}
                                        />
                                    </div>
                                    <span
                                        className="text-sm font-semibold tracking-wide uppercase block"
                                        style={{ color: "var(--color-primary)" }}
                                    >
                                        Your Business
                                    </span>
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Get discovered by customers in your area
                                    </p>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3">
                                {businessFeatures.map((feature, index) => {
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
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper
            title={listingId ? "Edit Business" : "Create New Business"}
            description="Step through the wizard to publish or update a Parlomo business listing."
        >
            <div className="space-y-6">
                <BusinessWizardStepper steps={wizardSteps} currentStep={activeStep} />

                {isLoadingExisting ? (
                    <Card>
                        <SkeletonTable rows={4} />
                    </Card>
                ) : (
                    <StepContent />
                )}
            </div>
        </ContentWrapper>
    );
}


