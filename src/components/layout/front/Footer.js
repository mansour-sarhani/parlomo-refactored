"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] pt-12 pb-6">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-4">Parlomo</h3>
                        <p className="text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                            The leading marketplace for finding the best local businesses and services. Connect with professionals in your area.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Categories</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/category/restaurants" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Restaurants
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/shopping" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Shopping
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/services" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/category/health" className="text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    Health & Beauty
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-[var(--color-text-secondary)]">
                                <MapPin size={20} className="shrink-0 mt-1" />
                                <span>123 Business Street, Suite 100<br />London, UK SW1A 1AA</span>
                            </li>
                            <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                <Phone size={20} className="shrink-0" />
                                <span>+44 20 1234 5678</span>
                            </li>
                            <li className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                                <Mail size={20} className="shrink-0" />
                                <span>support@parlomo.co.uk</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[var(--color-border)] pt-6 text-center text-[var(--color-text-secondary)] text-sm">
                    <p>&copy; {new Date().getFullYear()} Parlomo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
