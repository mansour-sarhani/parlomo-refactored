import { useState } from "react";
import { useRouter } from "next/navigation";
import useGeolocation from "@/hooks/useGeolocation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/common/Button";

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

    const {
        data: coords,
        error: geoError,
        loading: geoLoading
    } = useGeolocation({
        enableHighAccuracy: false,
        timeout: 5000,
    });

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
                    {/* Placeholder for categories - will be dynamic later */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-24 h-24 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex items-center justify-center group-hover:border-[var(--color-primary)] transition-colors">
                                <div className="w-12 h-12 bg-[var(--color-border)] rounded-full opacity-20"></div>
                            </div>
                            <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">Category {i}</span>
                        </div>
                    ))}
                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-24 h-24 rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] flex flex-wrap p-2 gap-1 group-hover:border-[var(--color-primary)] transition-colors overflow-hidden">
                            {[1, 2, 3, 4].map(j => (
                                <div key={j} className="w-[calc(50%-2px)] h-[calc(50%-2px)] bg-[var(--color-border)] rounded-sm opacity-20"></div>
                            ))}
                        </div>
                        <span className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">View All</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
