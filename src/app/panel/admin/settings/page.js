"use client";

import { useMemo } from "react";

import { Tabs } from "@/components/common/Tabs";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { AdminSettingEditorCard } from "@/features/adminSettings";

const SETTINGS_SECTIONS = [
    {
        id: "privacy",
        label: "Privacy Policy",
        key: "Policy",
        title: "Privacy Policy Page",
        description: "Edit the privacy policy shown on the public privacy page.",
        helperText: "Supports HTML. Keep content compliant with current regulations.",
    },
    {
        id: "about",
        label: "About Us",
        key: "About",
        title: "About Us Page",
        description: "Tell customers about Parlomo’s story, mission, and values.",
        helperText: "Use headings, paragraphs, and links to create a rich narrative.",
    },
    {
        id: "contact",
        label: "Contact",
        key: "Contact",
        title: "Contact Page",
        description: "Provide contact information, support hours, and escalation paths.",
        helperText: "Include email addresses, phone numbers, or embedded forms as needed.",
    },
    {
        id: "faq",
        label: "FAQs",
        key: "FAQ",
        title: "Frequently Asked Questions",
        description: "Maintain the FAQ section that helps customers self-serve.",
        helperText: "Use headings for categories and ordered lists for common questions.",
    },
    {
        id: "buy-badge",
        label: "Buy Badge",
        key: "Badge",
        title: "Buy Badge Intro",
        description: "Configure the copy users see when purchasing directory badges.",
        helperText: "This content appears before purchasing badge packages.",
        previewTitle: "Customer Preview",
    },
    {
        id: "buy-advertising",
        label: "Buy Advertising",
        key: "Advertising",
        title: "Buy Advertising Intro",
        description: "Outline package benefits and process for purchasing advertising.",
        helperText: "Displayed to businesses in the advertising purchase funnel.",
        previewTitle: "Business Preview",
    },
    {
        id: "new-ad",
        label: "New Ad",
        key: "Ad",
        title: "New Advertisement Guide",
        description: "Provide guidance for admins when creating new advertisements.",
        helperText: "Used internally when admins publish new ads.",
        previewTitle: "Admin Preview",
    },
    {
        id: "new-business",
        label: "New Business",
        key: "Bussiness",
        title: "New Business Guide",
        description: "Explain the process for onboarding new businesses onto Parlomo.",
        helperText: "Displayed in the business creation flows.",
        previewTitle: "Admin Preview",
    },
];

const DEFAULT_TAB = SETTINGS_SECTIONS[0]?.id;

export default function AdminSettingsPage() {
    const tabs = useMemo(
        () =>
            SETTINGS_SECTIONS.map(
                ({
                    id,
                    label,
                    key,
                    title,
                    description,
                    helperText,
                    previewTitle,
                }) => ({
                    id,
                    label,
                    content: (
                        <AdminSettingEditorCard
                            settingKey={key}
                            title={title}
                            description={description}
                            helperText={helperText}
                            previewTitle={previewTitle}
                        />
                    ),
                })
            ),
        []
    );

    return (
        <ContentWrapper className="space-y-8">
            <div className="space-y-2">
                <h1
                    className="text-3xl font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Admin Settings
                </h1>
                <p
                    className="text-sm md:text-base"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Manage the static content shown across the Parlomo platform. Your changes
                    go live immediately, so review the live preview before saving.
                </p>
            </div>

            <Tabs
                tabs={tabs}
                defaultTab={DEFAULT_TAB}
                variant="enclosed"
                size="md"
                fullWidth={false}
            />
        </ContentWrapper>
    );
}


