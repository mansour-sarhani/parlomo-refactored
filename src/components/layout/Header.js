"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, User, ChevronDown, LogOut, Settings, Home } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export const Header = ({ onMenuClick, sidebarCollapsed }) => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        setShowUserMenu(false);
        await logout();
    };

    return (
        <header
            className="sticky top-0 z-30 h-16 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80"
            style={{
                borderBottom: "1px solid var(--color-border)",
            }}
        >
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left section */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg transition-all hover:scale-105"
                        style={{
                            color: "var(--color-text-secondary)",
                            backgroundColor: "var(--color-background-secondary)",
                        }}
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Website Homepage button */}
                    <Link
                        href="/"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-[1.02] font-medium text-sm"
                        style={{
                            color: "var(--color-text-primary)",
                            backgroundColor: "var(--color-background-secondary)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <Home className="w-4 h-4" />
                        <span>Website Homepage</span>
                    </Link>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-2">
                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                            style={{
                                backgroundColor: showUserMenu ? "var(--color-hover)" : "transparent",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "var(--color-hover)";
                            }}
                            onMouseLeave={(e) => {
                                if (!showUserMenu) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }
                            }}
                            aria-label="User menu"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/20">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden md:flex items-center gap-1">
                                <span
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {user?.name || user?.email || "Admin"}
                                </span>
                                <ChevronDown
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                />
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <>
                                {/* Backdrop to close menu */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />

                                {/* Menu */}
                                <div
                                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50"
                                    style={{
                                        backgroundColor: "var(--color-card-bg)",
                                        border: "1px solid var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="p-3 border-b"
                                        style={{ borderColor: "var(--color-border)" }}
                                    >
                                        <p
                                            className="text-sm font-semibold"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            {user?.name || "Admin User"}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: "var(--color-text-secondary)" }}
                                        >
                                            {user?.email || "admin@parlomo.com"}
                                        </p>
                                    </div>

                                    <div className="p-2">
                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                router.push("/panel/profile");
                                            }}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                            style={{
                                                color: "var(--color-text-primary)",
                                                backgroundColor: "transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--color-hover)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }}
                                        >
                                            <Settings size={16} />
                                            <span className="text-sm">Profile</span>
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                                            style={{
                                                color: "var(--color-error)",
                                                backgroundColor: "transparent",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = "var(--color-hover)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }}
                                        >
                                            <LogOut size={16} />
                                            <span className="text-sm">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
