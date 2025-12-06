"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/common/Loader";
import { getPublicSetting } from "@/services/settings.service";
import { AlertCircle } from "lucide-react";

export default function PrivacyPolicyPageContent() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const response = await getPublicSetting("Policy");
                setContent(response.data?.value || "");
            } catch (err) {
                console.error("Error fetching privacy policy content:", err);
                setError("Failed to load content. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <div
                className="text-white py-16 md:py-24"
                style={{
                    background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-dark, var(--color-primary)))'
                }}
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg md:text-xl opacity-90">
                            Our terms, conditions, and privacy practices
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-16">
                        <Loader />
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">{error}</p>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && (
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-10">
                        <div
                            className="cms-content"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
