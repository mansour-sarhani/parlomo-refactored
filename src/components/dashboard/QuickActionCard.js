"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

export const QuickActionCard = ({ href, icon: Icon, title, description, className = "" }) => {
    return (
        <Link
            href={href}
            className={`group flex flex-col gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 transition-all hover:border-[var(--color-primary)] hover:shadow-md ${className}`}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-transform group-hover:scale-110">
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
                )}
            </div>
        </Link>
    );
};

