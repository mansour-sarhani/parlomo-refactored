"use client";

import { AuthShell, RegisterForm } from "@/features/auth";

export default function RegisterPage() {
    return (
        <AuthShell
            title="Join Parlomo"
            subtitle="Create your seller account to publish listings, manage orders, and collaborate with the community."
            showAside={false}
        >
            <RegisterForm />
        </AuthShell>
    );
}
