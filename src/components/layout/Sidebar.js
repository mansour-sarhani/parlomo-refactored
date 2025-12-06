"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import { navigation, adminNavigation, devNavigation } from "@/constants/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { checkMenuPermission } from "@/utils/permissions";
import { api } from "@/lib/axios";

const ADMIN_ROLES = ["admin", "manager", "super-admin"];

/**
 * Filter navigation items based on permissions
 */
function filterNavigationItems(items, role, permissions, additionalChecks = {}) {
    return items
        .map((item) => {
            // Check if parent item should be visible
            const parentVisible =
                !item.permission ||
                checkMenuPermission(item.permission, role, permissions, additionalChecks);

            if (!parentVisible) {
                return null;
            }

            // If item has children, filter them
            if (Array.isArray(item.children) && item.children.length > 0) {
                const filteredChildren = item.children.filter((child) => {
                    if (!child.permission) {
                        return true; // No permission check means always visible
                    }
                    return checkMenuPermission(
                        child.permission,
                        role,
                        permissions,
                        additionalChecks
                    );
                });

                // Only return parent if it has at least one visible child
                if (filteredChildren.length === 0) {
                    return null;
                }

                return {
                    ...item,
                    children: filteredChildren,
                };
            }

            return item;
        })
        .filter(Boolean);
}

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
    const pathname = usePathname();
    const { user } = useAuth();
    const { permissions, role, loading: permissionsLoading } = usePermissions();
    const [hasDirectory, setHasDirectory] = useState(false);
    const [openMenus, setOpenMenus] = useState({});

    // Check if user has directory
    useEffect(() => {
        if (!user || permissionsLoading) {
            return;
        }

        const checkDirectory = async () => {
            try {
                const response = await api.get("/api/directory/own/my-directory");
                if (response.data?.data && response.data.data.length > 0) {
                    setHasDirectory(true);
                } else {
                    setHasDirectory(false);
                }
            } catch (error) {
                // User might not have directory, which is fine
                setHasDirectory(false);
            }
        };

        checkDirectory();
    }, [user, permissionsLoading]);

    // Expand menus if active child
    useEffect(() => {
        const expandIfActive = (items) => {
            items.forEach((item) => {
                if (Array.isArray(item.children)) {
                    const isChildActive = item.children.some((child) => child.href === pathname);
                    if (isChildActive) {
                        setOpenMenus((prev) => ({ ...prev, [item.name]: true }));
                    }
                }
            });
        };

        if (!permissionsLoading) {
            const filteredNav = filterNavigationItems(navigation, role, permissions, {
                hasDirectory,
            });
            const filteredAdminNav = filterNavigationItems(adminNavigation, role, permissions, {
                hasDirectory,
            });
            expandIfActive(filteredNav);
            expandIfActive(filteredAdminNav);
        }
    }, [pathname, role, permissions, permissionsLoading, hasDirectory]);

    const handleParentToggle = (itemName, isOpen) => {
        setOpenMenus((prev) => ({
            ...prev,
            [itemName]: !isOpen,
        }));
    };

    // Don't render until permissions are loaded
    if (permissionsLoading) {
        return null;
    }

    // Filter navigation items based on permissions
    const filteredNavigation = filterNavigationItems(navigation, role, permissions, {
        hasDirectory,
    });
    // Use role from usePermissions hook (decrypted from userData) instead of user.role
    const filteredAdminNavigation =
        role && ADMIN_ROLES.includes(role)
            ? filterNavigationItems(adminNavigation, role, permissions, { hasDirectory })
            : [];

    const renderMenuItem = (item) => {
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;

        if (hasChildren) {
            const Icon = item.icon;
            const isChildActive = item.children.some((child) => child.href === pathname);
            const isOpen = openMenus[item.name] ?? (isChildActive && !isCollapsed);

            const handleClick = () => {
                if (isCollapsed) {
                    onToggleCollapse();
                    setTimeout(() => handleParentToggle(item.name, isOpen), 150);
                } else {
                    handleParentToggle(item.name, isOpen);
                }
            };

            return (
                <div key={item.name} className="space-y-1">
                    <button
                        type="button"
                        onClick={handleClick}
                        className={`
                            group relative flex items-center gap-3 px-3 rounded-lg w-full text-left
                            transition-all duration-200
                            ${isCollapsed ? "justify-center py-3" : "py-2.5"}
                            ${isChildActive ? "shadow-sm" : "hover:translate-x-0.5"}
                        `}
                        style={{
                            backgroundColor: isChildActive ? "var(--color-primary)" : "transparent",
                            color: isChildActive ? "#ffffff" : "var(--color-text-secondary)",
                        }}
                        title={isCollapsed ? item.name : undefined}
                    >
                        {isChildActive && !isCollapsed && (
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                                style={{ backgroundColor: "#ffffff" }}
                            />
                        )}

                        <Icon
                            className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                                isCollapsed ? "w-6 h-6" : "w-5 h-5"
                            }`}
                        />
                        {!isCollapsed && (
                            <>
                                <span className="font-medium text-sm flex-1">{item.name}</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                                />
                            </>
                        )}

                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                                {item.name}
                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                            </div>
                        )}
                    </button>

                    {!isCollapsed && isOpen && (
                        <div className="mt-1 space-y-1 pl-7">
                            {item.children.map((child) => {
                                const childActive = pathname === child.href;
                                const ChildIcon = child.icon;

                                return (
                                    <Link
                                        key={child.name}
                                        href={child.href}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) {
                                                onClose();
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            childActive
                                                ? "bg-[var(--color-primary)] text-white"
                                                : "hover:bg-[var(--color-secondary)]"
                                        }`}
                                        style={{
                                            color: childActive
                                                ? "#ffffff"
                                                : "var(--color-text-secondary)",
                                        }}
                                    >
                                        {ChildIcon && (
                                            <ChildIcon size={16} className="flex-shrink-0" />
                                        )}
                                        <span>{child.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
            <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                    if (window.innerWidth < 1024) {
                        onClose();
                    }
                }}
                className={`
                    group relative flex items-center gap-3 px-3 rounded-lg
                    transition-all duration-200
                    ${isCollapsed ? "justify-center py-3" : "py-2.5"}
                    ${isActive ? "shadow-sm" : "hover:translate-x-0.5"}
                `}
                style={{
                    backgroundColor: isActive ? "var(--color-primary)" : "transparent",
                    color: isActive ? "#ffffff" : "var(--color-text-secondary)",
                }}
                title={isCollapsed ? item.name : undefined}
            >
                {isActive && !isCollapsed && (
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                        style={{ backgroundColor: "#ffffff" }}
                    />
                )}

                <Icon
                    className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isCollapsed ? "w-6 h-6" : "w-5 h-5"
                    }`}
                />
                {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}

                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                    </div>
                )}
            </Link>
        );
    };

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? "w-20" : "w-64"}
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                    shadow-xl lg:shadow-none
                `}
                style={{
                    backgroundColor: "var(--color-background-elevated)",
                    borderRight: "1px solid var(--color-border)",
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between h-16 px-5 flex-shrink-0"
                    style={{
                        borderBottom: "1px solid var(--color-border)",
                    }}
                >
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 flex-1">
                            <Image
                                src="/assets/images/logo.avif"
                                alt="Parlomo Logo"
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-lg flex-shrink-0 object-contain"
                            />
                            <h1
                                className="text-lg font-bold tracking-tight"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Parlomo
                            </h1>
                        </div>
                    ) : (
                        <button
                            onClick={onToggleCollapse}
                            className="w-full flex justify-center"
                            aria-label="Expand sidebar"
                        >
                            <Image
                                src="/assets/images/logo.avif"
                                alt="Parlomo Logo"
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-lg transition-transform hover:scale-110 object-contain"
                            />
                        </button>
                    )}

                    {/* Close button (mobile) */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        style={{
                            color: "var(--color-text-secondary)",
                        }}
                        aria-label="Close menu"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Collapse button (desktop) */}
                    {!isCollapsed && (
                        <button
                            onClick={onToggleCollapse}
                            className="hidden lg:flex items-center justify-center p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-2 custom-scrollbar">
                    {filteredNavigation.map(renderMenuItem)}

                    {/* Admin Navigation */}
                    {filteredAdminNavigation.length > 0 && (
                        <>
                            {!isCollapsed && (
                                <div className="px-3 pt-4 pb-2">
                                    <p
                                        className="text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        Admin Tools
                                    </p>
                                </div>
                            )}
                            {filteredAdminNavigation.map(renderMenuItem)}
                        </>
                    )}

                    {/* Dev Navigation */}
                    {devNavigation && devNavigation.length > 0 && (
                        <>
                            {!isCollapsed && (
                                <div className="px-3 pt-4 pb-2">
                                    <p
                                        className="text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    >
                                        Dev Tools
                                    </p>
                                </div>
                            )}
                            {devNavigation.map(renderMenuItem)}
                        </>
                    )}
                </nav>

                {/* Expand button when collapsed */}
                {isCollapsed && (
                    <div className="p-4 flex-shrink-0">
                        <button
                            onClick={onToggleCollapse}
                            className="w-full p-3 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-background-secondary)",
                                color: "var(--color-text-secondary)",
                            }}
                            aria-label="Expand sidebar"
                            title="Expand sidebar"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div
                    className="flex-shrink-0 p-5"
                    style={{
                        borderTop: "1px solid var(--color-border)",
                    }}
                >
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <Image
                                src="/assets/images/logo.avif"
                                alt="Parlomo Logo"
                                width={36}
                                height={36}
                                className="w-9 h-9 rounded-full flex-shrink-0 object-contain"
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-xs font-semibold truncate leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Parlomo Trade
                                </p>
                                <p
                                    className="text-xs truncate mt-0.5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Admin Panel v1.0
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Image
                            src="/assets/images/logo.avif"
                            alt="Parlomo Logo"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full mx-auto object-contain"
                        />
                    )}
                </div>
            </aside>
        </>
    );
};
