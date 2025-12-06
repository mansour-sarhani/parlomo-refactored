import { FrontLayout } from "@/components/layout/FrontLayout";
import AboutPageContent from "@/components/front/about/AboutPageContent";

export const metadata = {
    title: "About Us",
};

export default function AboutPage() {
    return (
        <FrontLayout>
            <AboutPageContent />
        </FrontLayout>
    );
}
