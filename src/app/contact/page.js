import { FrontLayout } from "@/components/layout/FrontLayout";
import ContactPageContent from "@/components/front/contact/ContactPageContent";

export const metadata = {
    title: "Contact Us",
};

export default function ContactPage() {
    return (
        <FrontLayout>
            <ContactPageContent />
        </FrontLayout>
    );
}
