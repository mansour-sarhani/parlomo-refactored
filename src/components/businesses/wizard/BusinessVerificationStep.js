"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    prevBusinessWizardStep,
    nextBusinessWizardStep,
    verifyBusinessPhone,
    resendBusinessVerificationCode,
    clearBusinessWizardErrors,
} from "@/features/businesses/businessWizardSlice";

const CODE_LENGTH = 4;

export default function BusinessVerificationStep() {
    const dispatch = useAppDispatch();
    const { draft, listingId, verifyLoading, verificationError, resendStatus } = useAppSelector(
        (state) => state.businessWizard
    );

    const [segments, setSegments] = useState(Array(CODE_LENGTH).fill(""));
    const inputsRef = useRef([]);

    useEffect(() => {
        inputsRef.current = inputsRef.current.slice(0, CODE_LENGTH);
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        const nextSegments = [...segments];
        nextSegments[index] = value.replace(/\D/g, "").slice(-1);
        setSegments(nextSegments);

        if (value && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH).split("");
        setSegments((prev) => prev.map((_, index) => pasted[index] || ""));
        inputsRef.current[Math.min(pasted.length, CODE_LENGTH) - 1]?.focus();
    };

    const handleSubmit = async () => {
        const code = segments.join("");
        const businessId = listingId || draft.id;
        if (code.length !== CODE_LENGTH || !businessId) return;

        try {
            await dispatch(
                verifyBusinessPhone({
                    code,
                    directoryId: businessId, // API expects directoryId for directories (not adsId)
                })
            ).unwrap();
            dispatch(nextBusinessWizardStep());
        } catch (err) {
            // handled by slice
        }
    };

    const handleResend = async () => {
        const businessId = listingId || draft.id;
        if (!businessId) return;
        await dispatch(resendBusinessVerificationCode(businessId));
    };

    const handleBack = () => {
        dispatch(clearBusinessWizardErrors());
        dispatch(prevBusinessWizardStep());
    };

    const code = segments.join("");
    const isCodeComplete = code.length === CODE_LENGTH;
    // Use listingId from state, or fallback to draft.id if available
    const businessId = listingId || draft.id;
    const canVerify = Boolean(businessId);
    const canSubmit = canVerify && isCodeComplete && !verifyLoading;

    return (
        <div className="space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
            <div>
                <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Enter verification code
                </h2>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    We’ve sent a 4-digit code to {draft.verifyMobile || draft.mobile_to_verify}. Please enter it below.
                </p>
            </div>

            <div className="flex gap-3">
                {segments.map((value, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        value={value}
                        onChange={(event) => handleChange(index, event.target.value)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="h-14 w-12 rounded-lg border text-center text-lg font-semibold"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-background)",
                            color: "var(--color-text-primary)",
                        }}
                        maxLength={1}
                    />
                ))}
            </div>

            {verificationError && (
                <div className="rounded-md border border-[var(--color-error)] bg-red-50 px-4 py-2 text-sm"
                    style={{ color: "var(--color-error)" }}
                >
                    {verificationError}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <Button variant="secondary" onClick={handleBack}>
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleResend}
                        disabled={!canVerify || resendStatus === "loading"}
                        loading={resendStatus === "loading"}
                    >
                        Resend code
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit} loading={verifyLoading}>
                        Verify
                    </Button>
                </div>
            </div>
        </div>
    );
}


