"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search, PlusCircle, Diamond, Rocket, Home } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { STORAGE_KEYS } from "@/constants/config";

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Initialize from localStorage on client side
        if (typeof window !== "undefined") {
            return !!localStorage.getItem(STORAGE_KEYS.USER);
        }
        return false;
    });

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
        setIsLoggedIn(false);
        // Optional: Redirect to home or login page
        window.location.href = "/login";
    };

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMenuOpen]);

    return (
        <header className="w-full bg-[var(--color-background)] border-b border-[var(--color-border)] sticky top-0 z-50">
            {/* Top Bar */}
            <div className="bg-[var(--color-primary)] text-white py-2 px-4 text-sm hidden md:block">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Left Side: Navigation Links */}
                    <div className="flex gap-6 font-medium">
                        <Link
                            href="/panel/marketplace/new-listing"
                            className="hover:text-white/80 transition-colors flex items-center gap-1"
                        >
                            <PlusCircle size={16} />
                            Marketplace
                        </Link>
                        <Link
                            href="/panel/businesses/new-business"
                            className="hover:text-white/80 transition-colors flex items-center gap-1"
                        >
                            <PlusCircle size={16} />
                            Business
                        </Link>
                        <Link
                            href="/panel/businesses/buy-badges"
                            className="hover:text-white/80 transition-colors flex items-center gap-1"
                        >
                            <Diamond size={16} />
                            Buy Badge
                        </Link>
                        <Link
                            href="/panel/businesses/buy-advertising"
                            className="hover:text-white/80 transition-colors flex items-center gap-1"
                        >
                            <Rocket size={16} />
                            Advertising Package
                        </Link>
                    </div>

                    {/* Right Side: Auth & Theme */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        <div className="h-4 w-px bg-white/20"></div>

                        {isLoggedIn ? (
                            <div className="flex gap-4">
                                <Link href="/panel/dashboard" className="hover:underline">
                                    Dashboard
                                </Link>
                                <button onClick={handleLogout} className="hover:underline">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <Link href="/login" className="hover:underline">
                                    Log in
                                </Link>
                                <Link href="/register" className="hover:underline">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    {/* Left Side: Logo & Main Menu */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="text-2xl font-bold text-[var(--color-primary)]">
                            Parlomo
                        </Link>

                        {/* Main Menu - Desktop */}
                        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-[var(--color-text-secondary)]">
                            <Link
                                href="/"
                                className="hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
                            >
                                <Home size={18} />
                                Home
                            </Link>
                            <Link
                                href="/events"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                Events
                            </Link>
                            <Link
                                href="/directory-search"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                Business
                            </Link>
                            <Link
                                href="/ad-search/?type=7"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                Jobs
                            </Link>
                            <Link
                                href="/ad-search/?type=8"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                Property
                            </Link>
                            <Link
                                href="/ad-search/?type=6"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                Pets
                            </Link>
                            <Link
                                href="/ad-search/?type=5"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                Service
                            </Link>
                            <Link
                                href="/ad-search/?type=3"
                                className="hover:text-[var(--color-primary)] transition-colors"
                            >
                                For Sale
                            </Link>
                        </nav>
                    </div>

                    {/* Right Side: Community Care & Search */}
                    <div className="flex items-center gap-4 flex-1 justify-end">
                        {/* Search Bar - Desktop */}
                        <div className="hidden md:flex max-w-xs relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-4 pr-10 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                                <Search size={18} />
                            </button>
                        </div>

                        {/* Community Care - Desktop */}
                        <Link
                            href="/ad-search/?type=1"
                            className="hidden xl:flex items-center justify-center px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                            Community Care
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="xl:hidden p-2 text-[var(--color-text-primary)]"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-[var(--color-background)] overflow-y-auto xl:hidden">
                    <div className="flex flex-col min-h-screen">
                        {/* Overlay Header */}
                        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-background)] z-10">
                            <span className="text-lg font-bold text-[var(--color-primary)]">
                                Menu
                            </span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 flex flex-col gap-6">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-4 pr-10 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                                <Search
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                                    size={20}
                                />
                            </div>

                            {/* Main Navigation */}
                            <nav className="flex flex-col gap-2">
                                <Link
                                    href="/"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] flex items-center gap-3 transition-colors"
                                >
                                    <Home size={20} />
                                    <span className="font-medium">Home</span>
                                </Link>
                                <Link
                                    href="/events"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Events
                                </Link>
                                <Link
                                    href="/directory"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Business
                                </Link>
                                <Link
                                    href="/ad-search/?type=7"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Jobs
                                </Link>
                                <Link
                                    href="/ad-search/?type=8"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Property
                                </Link>
                                <Link
                                    href="/ad-search/?type=6"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Pets
                                </Link>
                                <Link
                                    href="/ad-search/?type=5"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Service
                                </Link>
                                <Link
                                    href="/ad-search/?type=3"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    For Sale
                                </Link>
                                <Link
                                    href="/ad-search/?type=1"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] font-medium transition-colors"
                                >
                                    Community Care
                                </Link>
                            </nav>

                            <div className="h-px bg-[var(--color-border)]"></div>

                            {/* Panel Shortcuts */}
                            <nav className="flex flex-col gap-2">
                                <Link
                                    href="/panel/marketplace/new"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] flex items-center gap-3 transition-colors"
                                >
                                    <PlusCircle size={20} />
                                    <span className="font-medium">Marketplace</span>
                                </Link>
                                <Link
                                    href="/panel/businesses/new"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] flex items-center gap-3 transition-colors"
                                >
                                    <PlusCircle size={20} />
                                    <span className="font-medium">Business</span>
                                </Link>
                                <Link
                                    href="/panel/businesses/buy-badge"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] flex items-center gap-3 transition-colors"
                                >
                                    <Diamond size={20} />
                                    <span className="font-medium">Buy Badge</span>
                                </Link>
                                <Link
                                    href="/panel/advertising/buy"
                                    className="p-3 rounded-lg hover:bg-[var(--color-background-secondary)] text-[var(--color-text-primary)] hover:text-[var(--color-primary)] flex items-center gap-3 transition-colors"
                                >
                                    <Rocket size={20} />
                                    <span className="font-medium">Advertising Package</span>
                                </Link>
                            </nav>

                            {/* Footer Actions */}
                            <div className="mt-auto pt-4 border-t border-[var(--color-border)] flex flex-col gap-4">
                                <div className="flex justify-between items-center p-2">
                                    <span className="font-medium text-[var(--color-text-primary)]">
                                        Dark Mode
                                    </span>
                                    <ThemeToggle />
                                </div>

                                {isLoggedIn ? (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/panel/dashboard">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-center py-6"
                                            >
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-center py-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                            onClick={handleLogout}
                                        >
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href="/login">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-center py-6"
                                            >
                                                Log in
                                            </Button>
                                        </Link>
                                        <Link href="/register">
                                            <Button
                                                variant="primary"
                                                className="w-full justify-center py-6"
                                            >
                                                Register
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
