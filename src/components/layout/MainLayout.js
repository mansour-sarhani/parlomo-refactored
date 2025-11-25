"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export const MainLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: "var(--color-background)" }}
        >
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                isCollapsed={isCollapsed}
                onToggleCollapse={toggleCollapse}
            />

            {/* Main content area */}
            <div
                className={`transition-all duration-300 ${
                    isCollapsed ? "lg:pl-20" : "lg:pl-64"
                }`}
            >
                {/* Header */}
                <Header onMenuClick={toggleSidebar} />

                {/* Page content */}
                <main
                    className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] pb-20 lg:pb-0"
                    style={{
                        backgroundColor: "var(--color-background-secondary)",
                    }}
                >
                    {children}
                </main>
            </div>

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNav onMenuClick={toggleSidebar} />
        </div>
    );
};

