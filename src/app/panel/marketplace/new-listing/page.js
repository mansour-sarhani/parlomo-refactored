"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { ShoppingBag, Tag, MapPin, Camera, Phone } from "lucide-react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import WizardStepper from "@/components/marketplace/wizard/WizardStepper";
import PostcodeStep from "@/components/marketplace/wizard/PostcodeStep";
import TypeStep from "@/components/marketplace/wizard/TypeStep";
import CategoryStep from "@/components/marketplace/wizard/CategoryStep";
import DetailsStep from "@/components/marketplace/wizard/DetailsStep";
import PhoneStep from "@/components/marketplace/wizard/PhoneStep";
import CodeStep from "@/components/marketplace/wizard/CodeStep";
import SuccessStep from "@/components/marketplace/wizard/SuccessStep";
import { resetWizard, fetchWizardDraft } from "@/features/marketplace/adWizardSlice";
import { fetchAdminSetting, selectAdminSetting } from "@/features/adminSettings/adminSettingsSlice";

const steps = [
    { title: "Postcode" },
    { title: "Type" },
    { title: "Category" },
    { title: "Details" },
    { title: "Phone" },
    { title: "Verification" },
    { title: "Complete" },
];

const stepComponents = [
    PostcodeStep,
    TypeStep,
    CategoryStep,
    DetailsStep,
    PhoneStep,
    CodeStep,
    SuccessStep,
];

export default function MarketplaceNewListingPage() {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const [showWizard, setShowWizard] = useState(Boolean(searchParams.get("id")));
    const { activeStep, isEditing, fetchingDraft, verificationError } = useSelector(
        (state) => state.marketplaceAdWizard
    );
    const adSettingEntry = useSelector((state) => selectAdminSetting(state, "Ad"));

    const listingId = searchParams.get("id");
    const isEditMode = Boolean(listingId);

    // Fetch the "Ad" intro content on mount (only for new listings)
    useEffect(() => {
        if (!isEditMode) {
            dispatch(fetchAdminSetting({ key: "Ad" }));
        }
    }, [dispatch, isEditMode]);

    useEffect(() => {
        if (listingId) {
            // Edit mode - fetch existing listing data
            dispatch(fetchWizardDraft(listingId))
                .unwrap()
                .catch((error) => {
                    toast.error(error || "Failed to load listing data");
                });
        } else {
            // New listing mode - reset wizard
            dispatch(resetWizard());
        }
    }, [dispatch, listingId]);

    useEffect(() => {
        if (verificationError && !fetchingDraft) {
            toast.error(verificationError);
        }
    }, [verificationError, fetchingDraft]);

    const handleStartWizard = () => {
        setShowWizard(true);
    };

    const StepContent = stepComponents[activeStep] || SuccessStep;
    const pageTitle = isEditing ? "Edit Listing" : "Create New Listing";
    const pageDescription = isEditing
        ? "Update your listing details and republish."
        : "Step through the wizard to publish a classified ad on behalf of a user.";

    const listingFeatures = [
        {
            icon: Tag,
            title: "Categories & Type",
            description: "Choose from a wide range of categories for your ad",
        },
        {
            icon: MapPin,
            title: "Location Based",
            description: "Target buyers in your local area with postcode search",
        },
        {
            icon: Camera,
            title: "Photos & Details",
            description: "Add images and descriptions to attract buyers",
        },
        {
            icon: Phone,
            title: "Verified Contact",
            description: "Verify your phone for trusted transactions",
        },
    ];

    // Show intro content for new listings before starting wizard
    if (!isEditMode && !showWizard) {
        const introContent = adSettingEntry?.value || "";
        const isLoadingIntro = adSettingEntry?.loading;
        const sanitizedContent = typeof window !== "undefined" && introContent
            ? DOMPurify.sanitize(introContent)
            : "";

        return (
            <ContentWrapper title="New Advertisement" description="Create a new classified ad listing.">
                <Card className="p-6 md:p-8">
                    <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] items-start">
                        <div className="space-y-4">
                            <div>
                                <h1
                                    className="text-2xl md:text-3xl font-semibold leading-tight"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Post Your Classified Ad
                                </h1>
                                <p
                                    className="mt-3 text-sm md:text-base leading-relaxed"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    Sell your items quickly on Parlomo Marketplace. Our simple wizard
                                    guides you through creating an effective listing that reaches local buyers.
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
                                        className="new-listing-intro-content max-w-none"
                                        style={{ color: "var(--color-text-primary)" }}
                                        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                    />
                                    <style jsx global>{`
                                        .new-listing-intro-content h1 {
                                            font-size: 1.875rem;
                                            font-weight: 700;
                                            margin-bottom: 0.75rem;
                                            color: var(--color-text-primary);
                                        }
                                        .new-listing-intro-content h2 {
                                            font-size: 1.5rem;
                                            font-weight: 600;
                                            margin-bottom: 0.5rem;
                                            color: var(--color-text-primary);
                                        }
                                        .new-listing-intro-content h3 {
                                            font-size: 1.25rem;
                                            font-weight: 600;
                                            margin-bottom: 0.5rem;
                                            color: var(--color-text-primary);
                                        }
                                        .new-listing-intro-content p {
                                            margin-bottom: 0.75rem;
                                            line-height: 1.6;
                                        }
                                        .new-listing-intro-content ul,
                                        .new-listing-intro-content ol {
                                            margin-left: 1.5rem;
                                            margin-bottom: 0.75rem;
                                        }
                                        .new-listing-intro-content ul {
                                            list-style-type: disc;
                                        }
                                        .new-listing-intro-content ol {
                                            list-style-type: decimal;
                                        }
                                        .new-listing-intro-content li {
                                            margin-bottom: 0.25rem;
                                        }
                                        .new-listing-intro-content a {
                                            color: var(--color-primary);
                                            text-decoration: underline;
                                        }
                                        .new-listing-intro-content a:hover {
                                            opacity: 0.8;
                                        }
                                        .new-listing-intro-content strong,
                                        .new-listing-intro-content b {
                                            font-weight: 600;
                                        }
                                        .new-listing-intro-content em,
                                        .new-listing-intro-content i {
                                            font-style: italic;
                                        }
                                        .new-listing-intro-content u {
                                            text-decoration: underline;
                                        }
                                        .new-listing-intro-content s,
                                        .new-listing-intro-content strike {
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
                                    Complete the wizard to publish your classified ad.
                                </p>
                            </div>
                        </div>

                        {/* Visual Element with Features */}
                        <div className="space-y-4">
                            {/* Marketplace Visual */}
                            <div
                                className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border"
                                style={{
                                    borderColor: "var(--color-border)",
                                    background:
                                        "radial-gradient(circle at 20% 20%, var(--color-primary-light) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(251, 146, 60, 0.12) 0%, transparent 55%), radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)",
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
                                        <ShoppingBag
                                            className="h-8 w-8"
                                            style={{ color: "var(--color-primary)" }}
                                        />
                                    </div>
                                    <span
                                        className="text-sm font-semibold tracking-wide uppercase block"
                                        style={{ color: "var(--color-primary)" }}
                                    >
                                        Sell on Parlomo
                                    </span>
                                    <p
                                        className="text-xs"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Reach thousands of local buyers
                                    </p>
                                </div>
                            </div>

                            {/* Features List */}
                            <div className="space-y-3">
                                {listingFeatures.map((feature, index) => {
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
        <ContentWrapper title={pageTitle} description={pageDescription}>
            <div className="space-y-6">
                <WizardStepper steps={steps} currentStep={activeStep} />
                {fetchingDraft ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Loading listing data...
                        </div>
                    </div>
                ) : (
                    <StepContent />
                )}
            </div>
        </ContentWrapper>
    );
}
