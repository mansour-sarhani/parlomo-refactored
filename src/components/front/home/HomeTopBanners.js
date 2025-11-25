"use client";

import Image from "next/image";

export const HomeTopBanners = () => {
    // Placeholder data
    const banners = [
        { id: 1, image: "/temp/banner1.jpg", link: "#" },
        { id: 2, image: "/temp/banner2.jpg", link: "#" },
    ];

    return (
        <div className="w-full py-12 bg-[var(--color-surface)]">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {banners.map((banner) => (
                        <div key={banner.id} className="relative w-full h-[200px] md:h-[350px] rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                            <div className="absolute inset-0 bg-[var(--color-border)] animate-pulse" />
                            {/* 
                                In a real implementation, we would use Next.js Image component with actual paths.
                                For now, we use a colored placeholder if image fails or just a div.
                            */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-xl group-hover:bg-gray-300 transition-colors">
                                Banner {banner.id}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
