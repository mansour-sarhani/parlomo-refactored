import { Header } from "@/components/layout/front/Header";

/**
 * Auth Layout
 * Special layout for authentication pages (login, register, etc.)
 * Includes the main header for navigation
 */
export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header />
            <div className="flex-1 flex items-center justify-center p-4">
                {children}
            </div>
        </div>
    );
}

