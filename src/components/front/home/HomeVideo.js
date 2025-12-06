"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { Play } from "lucide-react";

const API_BASE_URL = "https://api.parlomo.co.uk";

export const HomeVideo = () => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/omid-advertising-order/front?placeType=Video`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        setVideoData(result.data[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch video:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, []);

    const hasVideo = videoData !== null;

    return (
        <div className="w-full py-16 bg-[var(--color-surface)]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Left Side - Text Content */}
                    <div className="w-full lg:w-1/2 lg:pr-8">
                        {loading ? (
                            // Loading skeleton for text
                            <div className="space-y-4">
                                <div className="h-10 w-3/4 bg-[var(--color-border)] rounded animate-pulse" />
                                <div className="h-4 w-full bg-[var(--color-border)] rounded animate-pulse" />
                                <div className="h-4 w-5/6 bg-[var(--color-border)] rounded animate-pulse" />
                                <div className="h-4 w-4/6 bg-[var(--color-border)] rounded animate-pulse" />
                                <div className="h-12 w-40 bg-[var(--color-border)] rounded animate-pulse mt-6" />
                            </div>
                        ) : hasVideo ? (
                            // Real content from API
                            <>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                                    {videoData.title}
                                </h2>
                                <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                                    {videoData.description || "Watch our featured video content and discover more about what we have to offer."}
                                </p>
                                {videoData.link && (
                                    <a href={videoData.link} target="_blank" rel="noopener noreferrer">
                                        <Button variant="primary" size="lg">
                                            More Details
                                        </Button>
                                    </a>
                                )}
                            </>
                        ) : (
                            // Placeholder content
                            <>
                                <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                                    Featured Video Title
                                </h2>
                                <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                                    This is a placeholder for the featured video description. When video content is available, it will display here with all the relevant details and information.
                                </p>
                                <Button variant="primary" size="lg" disabled>
                                    More Details
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Right Side - Video */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-[var(--color-background)] rounded-3xl p-4 border border-[var(--color-border)] border-dashed">
                            {loading ? (
                                // Loading skeleton for video
                                <div className="aspect-video rounded-xl bg-[var(--color-border)] animate-pulse" />
                            ) : hasVideo ? (
                                // Real video from API
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                                    {videoData.video ? (
                                        <video
                                            src={`${API_BASE_URL}${videoData.path}/${videoData.video}`}
                                            poster={videoData.image ? `${API_BASE_URL}${videoData.path}/${videoData.image}` : undefined}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    ) : videoData.videoUrl ? (
                                        <iframe
                                            src={videoData.videoUrl}
                                            title={videoData.title}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <Play size={48} className="text-white/50" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Placeholder video
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-3">
                                            <Play size={32} className="text-gray-400 ml-1" />
                                        </div>
                                        <span className="text-gray-400 text-sm">Video Placeholder</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
