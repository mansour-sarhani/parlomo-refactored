import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { StoreProvider } from "@/lib/StoreProvider";
import { Toaster } from "sonner";
import { FirebaseMessagingProvider } from "@/contexts/FirebaseMessagingProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: {
        default: "Parlomo",
        template: "%s | Parlomo",
    },
    description: "Parlomo Trade platform",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
                <ThemeProvider>
                    <AuthProvider>
                        <StoreProvider>
                            <FirebaseMessagingProvider>
                                {children}
                                <Toaster position="top-right" richColors />
                            </FirebaseMessagingProvider>
                        </StoreProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
