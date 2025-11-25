"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetBusinessWizard } from "@/features/businesses/businessWizardSlice";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export default function BusinessSuccessStep() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { listingId, isEditing } = useAppSelector((state) => state.businessWizard);

    return (
        <Card className="space-y-4">
            <div className="space-y-4 text-center">
                <h2
                    className="text-2xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {isEditing ? "Business Updated!" : "Thank You!"}
                </h2>
                <h3 className="text-lg font-medium" style={{ color: "var(--color-text-primary)" }}>
                    {isEditing
                        ? "Your business listing has been updated successfully."
                        : "Your Directory has been submitted successfully."}
                </h3>
                <p className="text-base" style={{ color: "var(--color-text-secondary)" }}>
                    {isEditing
                        ? "Your changes have been saved and will be reflected once reviewed."
                        : "We will review it and publish it as soon as we can!"}
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
                {listingId && (
                    <Button
                        variant="primary"
                        onClick={() => {
                            dispatch(resetBusinessWizard());
                            router.push(`/panel/businesses/${listingId}`);
                        }}
                    >
                        View business
                    </Button>
                )}
                <Button
                    variant="secondary"
                    onClick={() => {
                        dispatch(resetBusinessWizard());
                        router.push("/panel/businesses/my-business");
                    }}
                >
                    Go to my business
                </Button>
                {!isEditing && (
                    <Button
                        onClick={() => {
                            dispatch(resetBusinessWizard());
                            router.push("/panel/businesses/new-business");
                        }}
                    >
                        Create another
                    </Button>
                )}
            </div>
        </Card>
    );
}
