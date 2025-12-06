import { FrontLayout } from "@/components/layout/FrontLayout";
import { HomePage } from "@/components/front/home/HomePage";

export const metadata = {
    title: "Home",
};

export default function Home() {
    return (
        <FrontLayout>
            <HomePage />
        </FrontLayout>
    );
}
