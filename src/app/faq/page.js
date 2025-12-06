import { FrontLayout } from "@/components/layout/FrontLayout";
import FAQPageContent from "@/components/front/faq/FAQPageContent";

export const metadata = {
    title: "FAQ",
};

export default function FAQPage() {
    return (
        <FrontLayout>
            <FAQPageContent />
        </FrontLayout>
    );
}
