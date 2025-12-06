import { FrontLayout } from "@/components/layout/FrontLayout";
import PrivacyPolicyPageContent from "@/components/front/privacy/PrivacyPolicyPageContent";

export const metadata = {
    title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
    return (
        <FrontLayout>
            <PrivacyPolicyPageContent />
        </FrontLayout>
    );
}
