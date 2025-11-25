import { MainLayout } from "@/components/layout/MainLayout";

/**
 * Panel Layout
 * Wraps all panel pages with MainLayout (Sidebar + Header + BottomNav)
 */
export default function PanelLayout({ children }) {
    return <MainLayout>{children}</MainLayout>;
}
