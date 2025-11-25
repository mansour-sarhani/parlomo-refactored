"use client";

import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common/Button";
import { resetWizard } from "@/features/marketplace/adWizardSlice";

export default function SuccessStep() {
    const dispatch = useDispatch();
    const { paymentData } = useSelector((state) => state.marketplaceAdWizard);

    const needPayment = Boolean(paymentData?.needToPay);

    const handleStartOver = () => {
        dispatch(resetWizard());
    };

    return (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-neutral-800">All set!</h2>
            <p className="mt-3 text-sm text-neutral-500">
                The listing draft has been saved and the phone number verified.
            </p>

            {needPayment ? (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                    This listing requires payment before it can go live. Proceed to the payments
                    section to complete the transaction.
                </div>
            ) : (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    You’re ready to review and publish the listing.
                </div>
            )}

            <div className="mt-8 flex justify-center gap-3">
                <Button variant="outline" onClick={handleStartOver}>
                    Create another listing
                </Button>
            </div>
        </div>
    );
}

