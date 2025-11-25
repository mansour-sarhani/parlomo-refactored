"use client";

import { useState } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

export const HomeLatestAds = () => {
    const [activeType, setActiveType] = useState(0);

    // Placeholder data for types
    const types = [
        { id: 0, title: "All Posts" },
        { id: 1, title: "Vehicles" },
        { id: 2, title: "Property" },
        { id: 3, title: "Jobs" },
        { id: 4, title: "Services" },
        { id: 5, title: "Community" },
        { id: 6, title: "Pets" },
        { id: 7, title: "For Sale" },
    ];

    // Placeholder data for ads
    const ads = [1, 2, 3, 4, 5, 6, 7, 8];

    return (
        <div className="w-full py-12 bg-[var(--color-background-secondary)] relative">
            {/* Decorative top curve */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-[var(--color-surface)] rounded-b-[50%] z-0"></div>
            
            {/* Chevron Icon */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 w-24 h-12 bg-[var(--color-background-secondary)] rounded-full flex items-center justify-center text-[var(--color-primary)] shadow-sm">
                <ChevronDown size={32} />
            </div>

            <div className="container mx-auto px-4 relative z-10 pt-16">
                {/* Intro */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">Marketplace</h2>
                    <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                        Online marketplace, wide variety of products & services, user-friendly platform, safe & secure buying & selling.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {types.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setActiveType(type.id)}
                            className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                                activeType === type.id ? "transform scale-110" : "hover:scale-105"
                            }`}
                        >
                            <div className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 ${
                                activeType === type.id 
                                    ? "border-[var(--color-primary)] bg-[var(--color-surface)]" 
                                    : "border-transparent bg-[var(--color-surface)]"
                            }`}>
                                <div className="w-10 h-10 bg-[var(--color-border)] rounded opacity-20"></div>
                            </div>
                            <span className={`font-medium text-sm ${
                                activeType === type.id ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"
                            }`}>
                                {type.title}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Ads Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {ads.map((ad) => (
                        <Card key={ad} hoverable className="group cursor-pointer overflow-hidden">
                            <div className="aspect-[4/3] bg-gray-200 relative mb-4">
                                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-[var(--color-primary)]">
                                    $1,200
                                </div>
                            </div>
                            <h3 className="font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                                Item Title {ad}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
                                Brief description of the item goes here. It is a very good item.
                            </p>
                            <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)]">
                                <span>London, UK</span>
                                <span>2 days ago</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Button variant="primary" size="lg" className="px-8">
                        See More
                    </Button>
                </div>
            </div>
        </div>
    );
};
