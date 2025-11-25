"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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
import { Card } from "@/components/common/Card";
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
    const listingId = searchParams.get("id");

    const { activeStep, loading, isEditing } = useSelector((state) => state.businessWizard);

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

    const StepContent = stepComponents[activeStep] || BusinessSuccessStep;
    const isLoadingExisting = Boolean(listingId) && loading && activeStep === 0 && isEditing;

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


