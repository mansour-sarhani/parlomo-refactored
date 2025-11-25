"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import WizardStepper from "@/components/marketplace/wizard/WizardStepper";
import PostcodeStep from "@/components/marketplace/wizard/PostcodeStep";
import TypeStep from "@/components/marketplace/wizard/TypeStep";
import CategoryStep from "@/components/marketplace/wizard/CategoryStep";
import DetailsStep from "@/components/marketplace/wizard/DetailsStep";
import PhoneStep from "@/components/marketplace/wizard/PhoneStep";
import CodeStep from "@/components/marketplace/wizard/CodeStep";
import SuccessStep from "@/components/marketplace/wizard/SuccessStep";
import { resetWizard, fetchWizardDraft } from "@/features/marketplace/adWizardSlice";

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
    const { activeStep, isEditing, fetchingDraft, verificationError } = useSelector(
        (state) => state.marketplaceAdWizard
    );

    const listingId = searchParams.get("id");

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

    const StepContent = stepComponents[activeStep] || SuccessStep;
    const pageTitle = isEditing ? "Edit Listing" : "Create New Listing";
    const pageDescription = isEditing
        ? "Update your listing details and republish."
        : "Step through the wizard to publish a classified ad on behalf of a user.";

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
