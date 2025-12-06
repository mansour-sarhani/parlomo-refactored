"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SearchX } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

const API_BASE_URL = "https://api.parlomo.co.uk";

export const HomeLatestAds = () => {
    const [activeType, setActiveType] = useState(null); // null means "All Posts"
    const [types, setTypes] = useState([]);
    const [ads, setAds] = useState([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [adsLoading, setAdsLoading] = useState(true);

    // Fetch ad types
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/classified-ad-type?list=all`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        // Limit to max 8 types
                        setTypes(result.data.slice(0, 8));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch ad types:", error);
            } finally {
                setTypesLoading(false);
            }
        };

        fetchTypes();
    }, []);

    // Fetch ads (refetch when activeType changes)
    useEffect(() => {
        const fetchAds = async () => {
            setAdsLoading(true);
            try {
                const url =
                    activeType === null
                        ? `${API_BASE_URL}/api/classified-ad/front/list`
                        : `${API_BASE_URL}/api/classified-ad/front/list?type=${activeType}`;
                const response = await fetch(url);
                if (response.ok) {
                    const result = await response.json();
                    setAds(result.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch ads:", error);
                setAds([]);
            } finally {
                setAdsLoading(false);
            }
        };

        fetchAds();
    }, [activeType]);

    // Display up to 8 ads
    const displayAds = ads.slice(0, 8);

    return (
        <div className="w-full py-12 bg-[var(--color-background-secondary)] relative">
            {/* Decorative top curve */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-[var(--color-surface)] rounded-b-[50%] z-0"></div>

            <div className="container mx-auto px-4 relative z-10 pt-16">
                {/* Intro */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4">
                        Marketplace
                    </h2>
                    <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                        Online marketplace, wide variety of products & services, user-friendly
                        platform, safe & secure buying & selling.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {/* All Posts button */}
                    <button
                        onClick={() => setActiveType(null)}
                        className={`flex flex-col items-center gap-3 p-2 rounded-lg transition-all ${
                            activeType === null ? "transform scale-105" : "hover:scale-105"
                        }`}
                    >
                        <div
                            className={`w-24 h-24 rounded-xl flex items-center justify-center border-2 overflow-hidden ${
                                activeType === null
                                    ? "border-[var(--color-primary)] bg-[var(--color-surface)]"
                                    : "border-transparent bg-[var(--color-surface)]"
                            }`}
                        >
                            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full opacity-30"></div>
                        </div>
                        <span
                            className={`font-medium text-sm ${
                                activeType === null
                                    ? "text-[var(--color-primary)]"
                                    : "text-[var(--color-text-primary)]"
                            }`}
                        >
                            All Posts
                        </span>
                    </button>

                    {typesLoading
                        ? // Loading skeleton for types
                          [...Array(6)].map((_, i) => (
                              <div key={i} className="flex flex-col items-center gap-3 p-2">
                                  <div className="w-24 h-24 rounded-xl bg-[var(--color-border)] animate-pulse" />
                                  <div className="w-16 h-4 bg-[var(--color-border)] rounded animate-pulse" />
                              </div>
                          ))
                        : types.map((type) => (
                              <button
                                  key={type.id}
                                  onClick={() => setActiveType(type.id)}
                                  className={`flex flex-col items-center gap-3 p-2 rounded-lg transition-all ${
                                      activeType === type.id
                                          ? "transform scale-105"
                                          : "hover:scale-105"
                                  }`}
                              >
                                  <div
                                      className={`w-24 h-24 rounded-xl flex items-center justify-center border-2 overflow-hidden ${
                                          activeType === type.id
                                              ? "border-[var(--color-primary)] bg-[var(--color-surface)]"
                                              : "border-transparent bg-[var(--color-surface)]"
                                      }`}
                                  >
                                      {type.image ? (
                                          <Image
                                              src={`${API_BASE_URL}${type.path}/${type.image}`}
                                              alt={type.title}
                                              width={96}
                                              height={96}
                                              className="w-full h-full object-cover"
                                          />
                                      ) : (
                                          <div className="w-12 h-12 bg-[var(--color-border)] rounded opacity-20"></div>
                                      )}
                                  </div>
                                  <span
                                      className={`font-medium text-sm ${
                                          activeType === type.id
                                              ? "text-[var(--color-primary)]"
                                              : "text-[var(--color-text-primary)]"
                                      }`}
                                  >
                                      {type.title}
                                  </span>
                              </button>
                          ))}
                </div>

                {/* Ads Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {adsLoading ? (
                        // Loading skeleton for ads
                        [...Array(8)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <div className="aspect-[4/3] bg-[var(--color-border)] animate-pulse mb-4" />
                                <div className="h-5 w-3/4 bg-[var(--color-border)] rounded animate-pulse mb-2" />
                                <div className="h-4 w-full bg-[var(--color-border)] rounded animate-pulse mb-2" />
                                <div className="h-4 w-2/3 bg-[var(--color-border)] rounded animate-pulse mb-4" />
                                <div className="flex justify-between">
                                    <div className="h-3 w-20 bg-[var(--color-border)] rounded animate-pulse" />
                                    <div className="h-3 w-16 bg-[var(--color-border)] rounded animate-pulse" />
                                </div>
                            </Card>
                        ))
                    ) : displayAds.length > 0 ? (
                        displayAds.map((ad) => (
                            <Link key={ad.id} href={`/ad/${ad.slug}`}>
                                <Card
                                    hoverable
                                    className="group cursor-pointer overflow-hidden h-full"
                                >
                                    <div className="aspect-[4/3] bg-gray-200 relative mb-4 rounded-lg overflow-hidden">
                                        {ad.image && ad.image.length > 0 ? (
                                            <Image
                                                src={`${API_BASE_URL}${ad.path}/${ad.image[0]}`}
                                                alt={ad.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                        {ad.price && parseFloat(ad.price) > 0 && (
                                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-[var(--color-primary)]">
                                                £{parseFloat(ad.price).toLocaleString()}
                                            </div>
                                        )}
                                        {ad.quoteText && parseFloat(ad.price) === 0 && (
                                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-[var(--color-primary)]">
                                                {ad.quoteText}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-[var(--color-text-primary)] mb-2 group-hover:text-[var(--color-primary)] transition-colors truncate">
                                        {ad.title}
                                    </h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                        {ad.categoryName} • {ad.classifiedAdType}
                                    </p>
                                    <div className="flex justify-between items-center text-xs text-[var(--color-text-secondary)]">
                                        <span>{ad.city || "Location N/A"}</span>
                                        <span>{ad.createdAtHuman}</span>
                                    </div>
                                </Card>
                            </Link>
                        ))
                    ) : (
                        // Empty state when no ads found
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="w-20 h-20 rounded-full bg-[var(--color-background-secondary)] flex items-center justify-center mb-4">
                                <SearchX size={40} className="text-[var(--color-text-secondary)]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                                No results found
                            </h3>
                            <p className="text-[var(--color-text-secondary)] text-center max-w-md">
                                There are no ads in this category yet. Try selecting a different
                                category or browse all posts.
                            </p>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href={
                            activeType === null
                                ? "/ad-search/?type=&typeLabel=All&sort=dateNew"
                                : `/ad-search/?type=${activeType}&typeLabel=${encodeURIComponent(types.find((t) => t.id === activeType)?.title || "")}&sort=dateNew`
                        }
                    >
                        <Button variant="primary" size="lg" className="px-8">
                            See More
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
