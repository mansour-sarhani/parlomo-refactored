"use client";

import { Header } from "./front/Header";
import { Footer } from "./front/Footer";

export const FrontLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};
