"use client";

import { useState } from "react";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { Tabs } from "@/components/common/Tabs";
import { ReceiptText, Search } from "lucide-react";
import RefundRequestForm from "./RefundRequestForm";
import RefundStatusForm from "./RefundStatusForm";

export default function GuestRefundPage() {
    const [activeTab, setActiveTab] = useState("request");

    const tabs = [
        {
            id: "request",
            label: "Request Refund",
            icon: <ReceiptText className="w-4 h-4" />,
            content: <RefundRequestForm onSwitchToStatus={() => setActiveTab("status")} />,
        },
        {
            id: "status",
            label: "Check Status",
            icon: <Search className="w-4 h-4" />,
            content: <RefundStatusForm onSwitchToRequest={() => setActiveTab("request")} />,
        },
    ];

    return (
        <FrontLayout>
            {/* Hero Section */}
            <div
                className="text-white py-16 md:py-24"
                style={{
                    background:
                        "linear-gradient(to right, var(--color-primary), var(--color-primary-dark, var(--color-primary)))",
                }}
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Refund Request</h1>
                        <p className="text-lg md:text-xl opacity-90">
                            Request a refund or check the status of an existing request. You&apos;ll
                            need your order number and the email address used during purchase.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-2xl mx-auto">
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            backgroundColor: "var(--color-background)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <Tabs
                            tabs={tabs}
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            variant="line"
                            fullWidth
                        />
                    </div>
                </div>
            </div>
        </FrontLayout>
    );
}
