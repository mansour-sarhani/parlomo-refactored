"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const API_BASE_URL = "https://api.parlomo.co.uk";

// Placeholder data for when API returns empty
const placeholderBanners = [
    { id: 1, image: "/temp/banner1.jpg", link: "#" },
    { id: 2, image: "/temp/banner2.jpg", link: "#" },
];

export const HomeTopBanners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/omid-advertising-order/front?placeType=Home`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        setBanners(result.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // Use placeholders if no banners from API
    const displayBanners = banners.length > 0 ? banners : placeholderBanners;
    const hasRealBanners = banners.length > 0;

    return (
        <div className="w-full py-12 bg-[var(--color-surface)]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {loading ? (
                        // Loading skeleton
                        [...Array(2)].map((_, i) => (
                            <div key={i} className="relative w-full h-[200px] md:h-[350px] rounded-2xl overflow-hidden shadow-lg">
                                <div className="absolute inset-0 bg-[var(--color-border)] animate-pulse" />
                            </div>
                        ))
                    ) : hasRealBanners ? (
                        // Real banners from API
                        displayBanners.map((banner) => (
                            <Link
                                key={banner.id}
                                href={banner.link || "#"}
                                target={banner.link ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="relative w-full h-[200px] md:h-[350px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
                            >
                                <Image
                                    src={`${API_BASE_URL}${banner.path}/${banner.image}`}
                                    alt={banner.title || "Advertisement"}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </Link>
                        ))
                    ) : (
                        // Placeholder banners
                        displayBanners.map((banner) => (
                            <div key={banner.id} className="relative w-full h-[200px] md:h-[350px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-xl group-hover:bg-gray-300 transition-colors">
                                    Banner {banner.id}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
