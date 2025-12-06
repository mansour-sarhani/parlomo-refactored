"use client";

import Image from "next/image";
import Link from "next/link";

export const DownloadApp = () => {
    return (
        <div className="w-full relative">
            {/* Decorative top curve - lowered to pass through middle of phones */}
            <div className="absolute top-0 left-0 right-0 h-48 bg-[var(--color-background)] rounded-b-[50%] z-10"></div>

            {/* Main content area */}
            <div className="bg-[var(--color-primary)] pt-56 pb-24 relative">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        {/* Left Side - Text and Buttons */}
                        <div className="w-full lg:w-1/2 text-white">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Parlomo App</h2>
                            <p className="text-white/80 text-lg mb-8">
                                Download Parlomo App for Android and iOS
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="#"
                                    className="inline-block transition-transform hover:scale-105"
                                >
                                    <Image
                                        src="/assets/images/app-btn.avif"
                                        alt="Download on the App Store"
                                        width={150}
                                        height={50}
                                        className="h-12 w-auto"
                                    />
                                </Link>
                                <Link
                                    href="#"
                                    className="inline-block transition-transform hover:scale-105"
                                >
                                    <Image
                                        src="/assets/images/gplay-btn.avif"
                                        alt="Get it on Google Play"
                                        width={150}
                                        height={50}
                                        className="h-12 w-auto"
                                    />
                                </Link>
                            </div>
                        </div>

                        {/* Right Side - Phone Mockups */}
                        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                            <div className="relative w-80 h-80">
                                <Image
                                    src="/assets/images/iphones.avif"
                                    alt="Parlomo App on mobile devices"
                                    width={400}
                                    height={400}
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
