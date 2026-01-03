"use client";

import Link from "next/link";
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    MapPin,
    ChevronUp,
} from "lucide-react";

export const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="bg-[#051522] relative pt-16 pb-6">
            {/* Scroll to top button */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50">
                <button
                    onClick={scrollToTop}
                    className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white hover:bg-[var(--color-primary-dark)] transition-colors shadow-lg"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">
                            Parlomo
                        </h3>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                            Promote your business platform by using Parlomo free account with
                            detailed profile, advanced search and post updates, user-friendly and
                            powerful marketing tools.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                            >
                                <Facebook size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                            >
                                <Instagram size={20} />
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                            >
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Categories</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/events"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    Events
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/directory-search"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    Business
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/ad-search/?type=7"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    Jobs
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/ad-search/?type=3"
                                    className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"
                                >
                                    For Sale
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-white mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400">
                                <MapPin size={20} className="shrink-0 mt-1" />
                                <span>
                                    123 Business Street, Suite 100
                                    <br />
                                    London, UK SW1A 1AA
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone size={20} className="shrink-0" />
                                <span>+44 20 1234 5678</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail size={20} className="shrink-0" />
                                <span>support@parlomo.co.uk</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
                    <p>&copy; 2023-{new Date().getFullYear()} Parlomo. All rights reserved.</p>
                    <p className="mt-2 text-xs text-gray-600">Version {process.env.NEXT_PUBLIC_LAST_VERSION || '2.2.2'}</p>
                </div>
            </div>
        </footer>
    );
};
