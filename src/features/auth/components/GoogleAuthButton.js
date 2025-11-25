"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/common/Button";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M19.6 10.2303C19.6 9.55026 19.5401 8.86641 19.4129 8.19739H10V12.0489H15.3922C15.1688 13.2929 14.4355 14.3891 13.3651 15.0876V17.5864H16.476C18.3475 15.8552 19.6 13.2727 19.6 10.2303Z"
            fill="#4285F4"
        />
        <path
            d="M10 20.0003C12.7 20.0003 14.9648 19.1156 16.476 17.5865L13.3651 15.0877C12.5477 15.6397 11.4352 15.958 10 15.958C7.38604 15.958 5.16964 14.2078 4.37764 11.8328H1.16376V14.4036C2.70756 17.7783 6.11644 20.0003 10 20.0003Z"
            fill="#34A853"
        />
        <path
            d="M4.37764 11.8326C4.16664 11.2806 4.04711 10.6935 4.04711 10.0002C4.04711 9.30687 4.16664 8.71978 4.37764 8.16778V5.59698H1.16376C0.422182 7.0821 0 8.74787 0 10.0002C0 11.2526 0.422182 12.9183 1.16376 14.4034L4.37764 11.8326Z"
            fill="#FBBC05"
        />
        <path
            d="M10 4.04243C11.5415 4.04243 12.9392 4.57403 14.0325 5.61526L16.5549 3.09289C14.9595 1.49605 12.7 0.480225 10 0.480225C6.11644 0.480225 2.70756 2.70218 1.16376 6.07682L4.37764 8.64762C5.16964 6.27262 7.38604 4.04243 10 4.04243Z"
            fill="#EA4335"
        />
    </svg>
);

export const GoogleAuthButton = () => {
    const [authUrl, setAuthUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadAuthUrl = async () => {
            try {
                const data = await authService.fetchGoogleAuthUrl();

                if (!isMounted) return;

                setAuthUrl(data?.url || null);
            } catch (error) {
                console.error("Failed to fetch Google auth URL", error);
                toast.error("Unable to load Google login. Please try again later.");
            } finally {
                if (isMounted) {
                    setInitializing(false);
                }
            }
        };

        loadAuthUrl();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleGoogleLogin = useCallback(() => {
        if (!authUrl) {
            toast.error("Google login is not available right now.");
            return;
        }

        setLoading(true);
        window.location.href = authUrl;
    }, [authUrl]);

    return (
        <Button
            type="button"
            variant="outline"
            fullWidth
            loading={loading || initializing}
            onClick={handleGoogleLogin}
            icon={<GoogleIcon />}
        >
            Continue with Google
        </Button>
    );
};

export default GoogleAuthButton;

