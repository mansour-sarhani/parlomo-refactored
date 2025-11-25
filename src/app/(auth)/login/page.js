"use client";

import { AuthShell, LoginForm } from "@/features/auth";

export default function LoginPage() {
    return (
        <AuthShell
            title="Parlomo Admin Platform"
            subtitle="Sign in to manage marketplace content, review submissions, and monitor activity."
            showAside={false}
        >
            <LoginForm />
        </AuthShell>
    );
}
