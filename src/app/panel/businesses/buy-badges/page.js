"use client";

import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import WizardStepper from "@/components/marketplace/wizard/WizardStepper";
import {
    BadgePurchaseIntro,
    BadgePackagesStep,
    DirectorySelectionStep,
    PurchaseSummaryStep,
} from "@/features/badgePurchase";
import {
    fetchBadgeIntro,
    fetchBadgePackages,
    fetchUserDirectories,
    submitBadgePurchase,
    startWizard,
    resetWizard,
    selectBadge,
    selectDirectory,
    goToNextStep,
    goToPreviousStep,
} from "@/features/badgePurchase/badgePurchaseSlice";
import { useAppSelector } from "@/lib/hooks";

const steps = [{ title: "Badge" }, { title: "Directory" }, { title: "Review" }];

export default function BuyBusinessBadgesPage() {
    const dispatch = useDispatch();
    const badgePurchase = useAppSelector((state) => state.badgePurchase);

    useEffect(() => {
        dispatch(fetchBadgeIntro());
        dispatch(fetchBadgePackages());
    }, [dispatch]);

    useEffect(() => {
        if (
            badgePurchase.started &&
            badgePurchase.currentStep === 1 &&
            !badgePurchase.directoriesLoaded &&
            !badgePurchase.directoriesLoading
        ) {
            dispatch(fetchUserDirectories());
        }
    }, [
        badgePurchase.started,
        badgePurchase.currentStep,
        badgePurchase.directoriesLoaded,
        badgePurchase.directoriesLoading,
        dispatch,
    ]);

    const selectedBadge = useMemo(() => {
        if (!badgePurchase.selectedBadgeId) return null;
        return badgePurchase.badges.find((badge) => badge.id === badgePurchase.selectedBadgeId);
    }, [badgePurchase.selectedBadgeId, badgePurchase.badges]);

    const selectedDirectory = useMemo(() => {
        if (!badgePurchase.selectedDirectoryId) return null;
        return badgePurchase.directories.find(
            (directory) => directory.id === badgePurchase.selectedDirectoryId
        );
    }, [badgePurchase.selectedDirectoryId, badgePurchase.directories]);

    const handleStart = () => {
        dispatch(startWizard());
    };

    const handleReset = () => {
        dispatch(resetWizard());
        dispatch(fetchBadgePackages());
    };

    const handleSubmit = () => {
        dispatch(submitBadgePurchase());
    };

    return (
        <ContentWrapper className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1
                        className="text-2xl font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Buy Badges
                    </h1>
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Boost your directory visibility with sponsored and verification badges.
                    </p>
                </div>
            </div>

            {!badgePurchase.started ? (
                <BadgePurchaseIntro
                    intro={badgePurchase.intro}
                    loading={badgePurchase.introLoading}
                    error={badgePurchase.introError}
                    onStart={handleStart}
                />
            ) : (
                <Card className="space-y-6">
                    <WizardStepper steps={steps} currentStep={badgePurchase.currentStep} />

                    {badgePurchase.currentStep === 0 && (
                        <BadgePackagesStep
                            badges={badgePurchase.badges}
                            selectedBadgeId={badgePurchase.selectedBadgeId}
                            onSelect={(id) => dispatch(selectBadge(id))}
                            onContinue={() => dispatch(goToNextStep())}
                            loading={badgePurchase.badgesLoading}
                            error={badgePurchase.badgesError}
                        />
                    )}

                    {badgePurchase.currentStep === 1 && (
                        <DirectorySelectionStep
                            directories={badgePurchase.directories}
                            selectedDirectoryId={badgePurchase.selectedDirectoryId}
                            onSelect={(id) => dispatch(selectDirectory(id))}
                            onBack={() => dispatch(goToPreviousStep())}
                            onContinue={() => dispatch(goToNextStep())}
                            loading={badgePurchase.directoriesLoading}
                            error={badgePurchase.directoriesError}
                        />
                    )}

                    {badgePurchase.currentStep === 2 && (
                        <PurchaseSummaryStep
                            badge={selectedBadge}
                            directory={selectedDirectory}
                            result={badgePurchase.purchaseResult}
                            submitting={badgePurchase.submitting}
                            error={badgePurchase.submitError}
                            onBack={() => dispatch(goToPreviousStep())}
                            onSubmit={handleSubmit}
                            onReset={handleReset}
                        />
                    )}
                </Card>
            )}
        </ContentWrapper>
    );
}
