"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export const HomeNewPost = () => {
    return (
        <div className="w-full py-16 bg-[var(--color-background)]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 items-center">
                    {/* Left Side - Illustration */}
                    <div className="w-full lg:w-1/2">
                        <div className="relative max-w-lg mx-auto">
                            <Image
                                src="/assets/images/join-us.svg"
                                alt="Join us and grow your business"
                                width={500}
                                height={400}
                                className="w-full h-auto"
                            />
                        </div>
                    </div>

                    {/* Right Side - Text Content */}
                    <div className="w-full lg:w-1/2 lg:pl-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
                            Join us and grow your business
                        </h2>
                        <p className="text-[var(--color-text-secondary)] text-lg mb-8 leading-relaxed">
                            Promote your Business business connection platform, free account with
                            detailed profile, advanced search, and post updates, user-friendly,
                            powerful marketing tools.
                        </p>
                        <Link href="/panel/dashboard">
                            <Button variant="primary" size="lg">
                                Join Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
