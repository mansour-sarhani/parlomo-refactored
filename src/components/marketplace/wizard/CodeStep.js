"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/common/Button";
import {
    prevStep,
    nextStep,
    verifyListingPhone,
    resendVerificationCode,
} from "@/features/marketplace/adWizardSlice";

const CODE_LENGTH = 4;

export default function CodeStep() {
    const dispatch = useDispatch();
    const { draft, verifyLoading, verificationError, resendStatus } = useSelector(
        (state) => state.marketplaceAdWizard
    );
    const canVerify = Boolean(draft?.id);
    const [segments, setSegments] = useState(Array(CODE_LENGTH).fill(""));
    const inputsRef = useRef([]);

    useEffect(() => {
        inputsRef.current = inputsRef.current.slice(0, CODE_LENGTH);
    }, []);

    const handleChange = (index, value) => {
        const nextSegments = [...segments];
        nextSegments[index] = value.slice(-1);
        setSegments(nextSegments);

        if (value && index < CODE_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        const pasted = event.clipboardData.getData("text").slice(0, CODE_LENGTH).split("");
        setSegments((prev) => prev.map((_, index) => pasted[index] || ""));
        inputsRef.current[pasted.length - 1]?.focus();
    };

    const handleBack = () => {
        dispatch(prevStep());
    };

    const handleSubmit = async () => {
        const code = segments.join("");
        if (code.length !== CODE_LENGTH) return;

        try {
            await dispatch(
                verifyListingPhone({
                    code,
                    adsId: draft.id,
                })
            ).unwrap();
            dispatch(nextStep());
        } catch (err) {
            // handled by slice
        }
    };

    const handleResend = async () => {
        if (!draft.id) return;
        await dispatch(resendVerificationCode(draft.id));
    };

    return (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-sm">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-neutral-800">Verify Code</h2>
                <p className="text-sm text-neutral-500">
                    Enter the 4-digit code sent to {draft.verifyMobile || draft.mobile_to_verify}.
                </p>
            </div>

            <div className="mb-6 flex gap-3">
                {segments.map((value, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputsRef.current[index] = el)}
                        value={value}
                        onChange={(event) => handleChange(index, event.target.value.replace(/\D/g, ""))}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="h-14 w-12 rounded-lg border border-neutral-200 text-center text-lg font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        maxLength={1}
                        type="text"
                    />
                ))}
            </div>

            {verificationError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {verificationError}
                </div>
            )}

            <div className="flex items-center justify-between">
                <Button variant="outline" onClick={handleBack}>
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleResend}
                        loading={resendStatus === "loading"}
                        disabled={!canVerify}
                    >
                        Resend Code
                    </Button>
                    <Button onClick={handleSubmit} loading={verifyLoading} disabled={!canVerify}>
                        Verify
                    </Button>
                </div>
            </div>
        </div>
    );
}

