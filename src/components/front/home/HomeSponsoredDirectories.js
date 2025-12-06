"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";

const API_BASE_URL = "https://api.parlomo.co.uk";

export const HomeSponsoredDirectories = () => {
    const [directories, setDirectories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDirectories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/directory/list/sponsored`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        // Get up to 4 directories for the grid
                        setDirectories(result.data.slice(0, 4));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch directories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDirectories();
    }, []);

    return (
        <div className="w-full py-16 bg-[var(--color-surface)]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Left Side - Directories Grid */}
                    <div className="w-full lg:w-1/2">
                        <div className="bg-[var(--color-background)] rounded-3xl p-6 border border-[var(--color-border)] border-dashed">
                            <div className="grid grid-cols-2 gap-4">
                                {loading ? (
                                    // Loading skeleton
                                    [...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-[4/3] rounded-xl bg-[var(--color-border)] animate-pulse"
                                        />
                                    ))
                                ) : directories.length > 0 ? (
                                    // Real directories
                                    directories.map((directory) => (
                                        <Link
                                            key={directory.id}
                                            href={`/directory/${directory.slug}`}
                                            className="relative aspect-[4/3] rounded-xl overflow-hidden group"
                                        >
                                            <Image
                                                src={`${API_BASE_URL}${directory.path}/${directory.image}`}
                                                alt={directory.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
                                                <div className="absolute bottom-3 left-3 right-3">
                                                    <p className="text-white text-sm font-medium truncate">{directory.title}</p>
                                                    {directory.categoryName && (
                                                        <p className="text-white/80 text-xs">{directory.categoryName}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    // Placeholder when no directories
                                    [...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-[4/3] rounded-xl bg-gray-200 flex items-center justify-center"
                                        >
                                            <span className="text-gray-400 text-sm">Directory {i + 1}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Text Content */}
                    <div className="w-full lg:w-1/2 lg:pl-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                            The top and most popular business in your area
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                            Promote your Business business connection platform, free account with detailed profile, advanced search, and post updates, user-friendly, powerful marketing tools.
                        </p>
                        <Link href="/directory/">
                            <Button variant="primary" size="lg">
                                View All Directories
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
