"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import WizardStepper from "@/components/marketplace/wizard/WizardStepper";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    fetchAdvertisingIntro,
    fetchAdvertisingTypes,
    fetchAdvertisingPackages,
    submitAdvertisingPurchase,
    startWizard,
    resetWizard,
    selectType,
    selectPackage,
    setIncludeSocialMedia,
    setMediaDetails,
    goToNextStep,
    goToPreviousStep,
    clearPurchaseResult,
} from "@/features/advertising";
import {
    AdvertisingPurchaseIntro,
    AdvertisingTypeSelectionStep,
    AdvertisingPackageSelectionStep,
    AdvertisingMediaStep,
    AdvertisingPurchaseResultStep,
} from "@/features/advertising/purchase";

const steps = [
    { title: "Placement" },
    { title: "Package" },
    { title: "Creative" },
    { title: "Review" },
];

const getPackagesForType = (packagesByType, typeId) => {
    if (!typeId) {
        return [];
    }

    const key = String(typeId);
    return packagesByType?.[key] || [];
};

export default function BuyAdvertisingPage() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const purchase = useAppSelector((state) => state.advertisingPurchase);

    const [typeSelectionError, setTypeSelectionError] = useState(null);
    const [packageSelectionError, setPackageSelectionError] = useState(null);

    const selectedTypeId = purchase.selectedTypeId;
    const selectedPackageId = purchase.selectedPackageId;
    const selectedPackage = purchase.selectedPackage;
    const includeSocialMedia = purchase.includeSocialMedia;

    const availablePackages = useMemo(
        () => getPackagesForType(purchase.packagesByType, selectedTypeId),
        [purchase.packagesByType, selectedTypeId]
    );

    const packagesLoading =
        purchase.packagesLoading &&
        purchase.packagesLoadingType &&
        String(purchase.packagesLoadingType) === String(selectedTypeId);

    useEffect(() => {
        dispatch(fetchAdvertisingIntro());
        dispatch(fetchAdvertisingTypes());
        dispatch(resetWizard());
        dispatch(clearPurchaseResult());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedTypeId) {
            return;
        }

        const key = String(selectedTypeId);
        const hasPackages = Boolean(purchase.packagesByType[key]);
        const isAlreadyLoading =
            purchase.packagesLoading &&
            purchase.packagesLoadingType &&
            String(purchase.packagesLoadingType) === key;

        if (!hasPackages && !isAlreadyLoading) {
            dispatch(fetchAdvertisingPackages(selectedTypeId));
        }
    }, [
        dispatch,
        purchase.packagesByType,
        purchase.packagesLoading,
        purchase.packagesLoadingType,
        selectedTypeId,
    ]);

    const handleStart = () => {
        dispatch(startWizard());
        dispatch(clearPurchaseResult());
        setTypeSelectionError(null);
        setPackageSelectionError(null);
    };

    const handleSelectType = (typeId) => {
        if (String(typeId) !== String(selectedTypeId)) {
            dispatch(selectType(typeId));
            dispatch(setIncludeSocialMedia(false));
        }
    };

    const handleTypeContinue = () => {
        if (!selectedTypeId) {
            setTypeSelectionError("Please choose a placement before continuing.");
            return;
        }

        setTypeSelectionError(null);
        dispatch(goToNextStep());
    };

    const handleSelectPackage = (packageId) => {
        const isNewSelection = String(packageId) !== String(selectedPackageId);
        dispatch(selectPackage(packageId));
        if (isNewSelection) {
            dispatch(setIncludeSocialMedia(false));
        }
    };

    const handlePackageBack = () => {
        dispatch(goToPreviousStep());
    };

    const handlePackageContinue = () => {
        if (!selectedPackageId) {
            setPackageSelectionError("Please choose an advertising package to continue.");
            return;
        }

        setPackageSelectionError(null);
        dispatch(goToNextStep());
    };

    const handleToggleSocialMedia = (checked) => {
        dispatch(setIncludeSocialMedia(Boolean(checked)));
    };

    const handleMediaBack = () => {
        dispatch(goToPreviousStep());
    };

    const handleMediaSubmit = async (values, formikHelpers) => {
        dispatch(
            setMediaDetails({
                startDate: values.startDate,
                link: values.link,
                title: values.title,
                description: values.description,
            })
        );

        try {
            await dispatch(
                submitAdvertisingPurchase({
                    startDate: values.startDate,
                    link: values.link,
                    title: values.title,
                    description: values.description,
                    file: values.file,
                })
            ).unwrap();
        } catch (error) {
            // errors surface via slice state
        } finally {
            formikHelpers.setSubmitting(false);
        }
    };

    const handleResultStartOver = () => {
        dispatch(resetWizard());
        dispatch(clearPurchaseResult());
        dispatch(fetchAdvertisingTypes());
        setTypeSelectionError(null);
        setPackageSelectionError(null);
    };

    const handleResultViewOrders = () => {
        router.push("/panel/businesses/advertising-orders");
    };

    const mediaInitialValues = useMemo(
        () => ({
            startDate: purchase.mediaDetails?.startDate || "",
            link: purchase.mediaDetails?.link || "",
            title: purchase.mediaDetails?.title || "",
            description: purchase.mediaDetails?.description || "",
        }),
        [purchase.mediaDetails]
    );

    return (
        <ContentWrapper className="space-y-6">
            {!purchase.started ? (
                <AdvertisingPurchaseIntro
                    intro={purchase.intro}
                    loading={purchase.introLoading}
                    error={purchase.introError}
                    onStart={handleStart}
                />
            ) : (
                <div className="space-y-6">
                    <WizardStepper steps={steps} currentStep={purchase.currentStep} />

                    {purchase.currentStep === 0 && (
                        <AdvertisingTypeSelectionStep
                            types={purchase.types}
                            selectedTypeId={selectedTypeId}
                            loading={purchase.typesLoading}
                            error={purchase.typesError}
                            onSelect={handleSelectType}
                            onContinue={handleTypeContinue}
                            selectionError={typeSelectionError}
                        />
                    )}

                    {purchase.currentStep === 1 && (
                        <AdvertisingPackageSelectionStep
                            packages={availablePackages}
                            loading={packagesLoading}
                            error={purchase.packagesError}
                            selectedPackageId={selectedPackageId}
                            selectedPackage={selectedPackage}
                            includeSocialMedia={includeSocialMedia}
                            onSelectPackage={handleSelectPackage}
                            onToggleSocialMedia={handleToggleSocialMedia}
                            onBack={handlePackageBack}
                            onContinue={handlePackageContinue}
                            selectionError={packageSelectionError}
                        />
                    )}

                    {purchase.currentStep === 2 && selectedPackage && (
                        <AdvertisingMediaStep
                            selectedPackage={selectedPackage}
                            includeSocialMedia={includeSocialMedia}
                            initialValues={mediaInitialValues}
                            submitting={purchase.submitting}
                            submitError={purchase.submitError}
                            onBack={handleMediaBack}
                            onSubmit={handleMediaSubmit}
                        />
                    )}

                    {purchase.currentStep === 3 && (
                        <AdvertisingPurchaseResultStep
                            needsPayment={purchase.needsPayment}
                            result={purchase.purchaseResult}
                            onStartOver={handleResultStartOver}
                            onViewOrders={handleResultViewOrders}
                        />
                    )}
                </div>
            )}
        </ContentWrapper>
    );
}
