import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useGeolocation from "@/hooks/useGeolocation";
import { Search, MapPin, Grid3X3 } from "lucide-react";
import { Button } from "@/components/common/Button";

const API_BASE_URL = "https://api.parlomo.co.uk";

export const HomeHero = () => {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [radius, setRadius] = useState("");
    const [locationData, setLocationData] = useState({
        latitude: "",
        longitude: "",
        location: "",
        postcode: ""
    });
    const [usingLocation, setUsingLocation] = useState(false);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const {
        data: coords,
        error: geoError,
        loading: geoLoading
    } = useGeolocation({
        enableHighAccuracy: false,
        timeout: 5000,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/directory-category?list=all`);
                if (response.ok) {
                    const data = await response.json();
                    // Get only top-level categories (depth: 0) and limit to 5
                    const topLevelCategories = data.filter(cat => cat.depth === 0).slice(0, 5);
                    setCategories(topLevelCategories);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query) params.append("query", query);
        if (radius) params.append("radius", radius);
        
        if (usingLocation && coords) {
            params.append("latitude", coords.coords.latitude);
            params.append("longitude", coords.coords.longitude);
        }

        router.push(`/directory-search?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const toggleLocation = () => {
        setUsingLocation(!usingLocation);
    };

    return (
        <div className="w-full bg-[var(--color-surface)] pb-12">
            {/* Hero Content */}
            <div className="container mx-auto px-4 pt-16 pb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text-primary)]">
                    Search Faster & Find<br />Everything You Need
                </h1>
                <p className="text-lg text-[var(--color-text-secondary)] mb-12 max-w-2xl mx-auto">
                    Discover thousands of event announcements, directory listings, jobs, properties, pets, services and many more...
                </p>

                {/* Search Form */}
                <div className="max-w-4xl mx-auto bg-[var(--color-background)] p-4 rounded-xl shadow-lg border border-[var(--color-border)]">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="What are you looking for..."
                                className="w-full pl-4 pr-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        
                        <div className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <button 
                                    className={`w-full h-full px-4 py-3 rounded-lg border border-[var(--color-border)] flex items-center justify-center gap-2 hover:bg-[var(--color-background-hover)] ${usingLocation ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)]'}`}
                                    onClick={toggleLocation}
                                >
                                    <MapPin size={20} />
                                    <span>{usingLocation ? 'Using My Location' : 'Get My Location'}</span>
                                </button>
                            </div>
                            <div className="w-32">
                                <select 
                                    className="w-full h-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
                                    value={radius}
                                    onChange={(e) => setRadius(e.target.value)}
                                >
                                    <option value="">Radius</option>
                                    <option value="5">5 mile</option>
                                    <option value="10">10 mile</option>
                                    <option value="15">15 mile</option>
                                    <option value="20">20 mile</option>
                                </select>
                            </div>
                        </div>

                        <Button variant="primary" size="lg" className="w-full md:w-auto" onClick={handleSearch}>
                            <Search size={20} className="mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </div>

            {/* Categories Quick Access */}
            <div className="container mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-6">
                    {categoriesLoading ? (
                        // Loading skeleton
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="w-24 h-24 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] animate-pulse"></div>
                                <div className="w-16 h-4 bg-[var(--color-border)] rounded animate-pulse"></div>
                            </div>
                        ))
                    ) : (
                        // Actual categories
                        categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/directory-search?category=${category.slug}`}
                                className="flex flex-col items-center gap-2 group cursor-pointer"
                            >
                                <div className="w-24 h-24 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary)] transition-colors overflow-hidden">
                                    {category.image ? (
                                        <Image
                                            src={`${API_BASE_URL}${category.path}/${category.image}`}
                                            alt={category.title}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 bg-[var(--color-border)] rounded-full opacity-20"></div>
                                    )}
                                </div>
                                <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] text-sm text-center max-w-24">
                                    {category.title}
                                </span>
                            </Link>
                        ))
                    )}
                    <Link
                        href="/directory-categories"
                        className="flex flex-col items-center gap-2 group cursor-pointer"
                    >
                        <div className="w-24 h-24 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary)] transition-colors">
                            <Grid3X3 size={32} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]" />
                        </div>
                        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">View All</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
