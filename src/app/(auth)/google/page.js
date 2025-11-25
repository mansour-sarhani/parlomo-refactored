"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function GoogleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loginWithGoogle } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const queryString = searchParams?.toString();

        if (!queryString) {
            setLoading(false);
            setError("Missing Google authentication parameters.");
            return;
        }

        const authenticate = async () => {
            try {
                const result = await loginWithGoogle(queryString);

                if (!result.success) {
                    const message = result.message || "Google authentication failed.";
                    setError(message);
                    toast.error(message);
                    return;
                }

                toast.success("Signed in with Google");

                if (result.data?.needToVerify) {
                    router.push("/auth/code-verification?redirect=google");
                    return;
                }

                router.push("/panel/dashboard");
            } catch (err) {
                console.error("Google login error", err);
                const message = err?.message || "Google authentication failed.";
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        authenticate();
    }, [loginWithGoogle, router, searchParams]);

    return (
        <div
            className="flex flex-col items-center gap-4 text-center"
            style={{ color: "var(--color-text-primary)" }}
        >
            {loading ? (
                <>
                    <Loader2 className="animate-spin" size={32} />
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                        Signing you in with Google...
                    </p>
                </>
            ) : error ? (
                <div
                    className="space-y-2 max-w-md"
                    style={{
                        backgroundColor: "var(--color-error-light)",
                        color: "var(--color-error)",
                        borderRadius: "1rem",
                        padding: "1.5rem",
                    }}
                >
                    <p className="font-semibold">Google authentication failed</p>
                    <p className="text-sm">{error}</p>
                </div>
            ) : (
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Redirecting...
                </p>
            )}
        </div>
    );
}

