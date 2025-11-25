"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPublicBusinessCategories } from "@/features/businesses/businessCategoriesSlice";
import LocationInput from "@/components/common/LocationInput";
import useGeolocation from "@/hooks/useGeolocation";
import { Search, MapPin, X, LayoutGrid } from "lucide-react";

function DirectorySearchMapHeader({ setMyLocation }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const directoryCategories = useSelector(state => state.businessCategories.publicList);
    
    const [currentInputValue, setCurrentInputValue] = useState('');
    const [resetCount, setResetCount] = useState(0);
    const [filters, setFilters] = useState({
        query: '',
        category: '',
        latitude: '',
        longitude: '',
        radius: '',
        postcode: '',
        location: '',
    });

    const {
        data: coords,
        error: geoError,
        loading: geoLoading
    } = useGeolocation({
        enableHighAccuracy: false,
        timeout: 5000,
    });

    useEffect(() => {
        dispatch(fetchPublicBusinessCategories({ list: 'all' }));
    }, [dispatch]);

    useEffect(() => {
        setFilters({
            query: searchParams.get("query") || "",
            category: searchParams.get("category") || "",
            latitude: searchParams.get("latitude") || "",
            longitude: searchParams.get("longitude") || "",
            radius: searchParams.get("radius") || "",
            postcode: searchParams.get("postcode") || "",
            location: searchParams.get("location") || "",
        });
    }, [searchParams]);

    const backToGridView = () => {
        const params = new URLSearchParams({
            query: filters.query,
            category: filters.category,
            latitude: filters.latitude,
            longitude: filters.longitude,
            radius: filters.radius,
            postcode: filters.postcode,
            location: filters.location,
        });
        
        // Filter out empty values
        const filteredParams = new URLSearchParams();
        for (const [key, value] of params.entries()) {
            if (value) filteredParams.set(key, value);
        }
        
        router.push(`/directory-search?${filteredParams.toString()}`);
    };

    const resetMap = () => {
        setResetCount(prev => prev + 1);
        setCurrentInputValue("");
        setMyLocation({ lat: "", lng: "" });
        router.push('/directory-search-map');
    };

    const showMyLocation = () => {
        if (coords?.coords) {
            setResetCount(prev => prev + 1);
            setCurrentInputValue("");
            setMyLocation({
                lat: coords.coords.latitude,
                lng: coords.coords.longitude
            });
            
            const params = new URLSearchParams({
                query: filters.query,
                category: filters.category,
                latitude: coords.coords.latitude,
                longitude: coords.coords.longitude,
                radius: filters.radius,
                list: "showmap",
            });
            
            // Filter out empty values
            const filteredParams = new URLSearchParams();
            for (const [key, value] of params.entries()) {
                if (value) filteredParams.set(key, value);
            }
            
            router.push(`/directory-search-map?${filteredParams.toString()}`);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        const data = {
            query: filters.query,
            category: filters.category,
            latitude: filters.latitude,
            longitude: filters.longitude,
            radius: filters.radius,
            postcode: filters.postcode ? (currentInputValue === filters.postcode ? filters.postcode : currentInputValue) : currentInputValue,
            location: filters.location,
            list: "showmap"
        };
        
        // Filter out empty values
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v != null && v !== "")
        );
        
        const params = new URLSearchParams(filteredData);
        router.push(`/directory-search-map?${params.toString()}`);
    };

    return (
        <div className="map-search-header">
            <div className="container mx-auto px-4">
                <form onSubmit={handleSearch}>
                    <button 
                        type="button"
                        className="back-grid-btn" 
                        onClick={backToGridView}
                    >
                        <LayoutGrid size={18} />
                        Grid View
                    </button>
                    
                    <div className="map-search-form">
                        <div className="single-row-search-field">
                            <input
                                name="query"
                                className="form-control"
                                placeholder="What are you looking for ..."
                                value={filters.query}
                                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                            />
                            <LocationInput 
                                setCurrentInput={setCurrentInputValue} 
                                reset={resetCount}
                                onLocationSelect={(data) => {
                                    setFilters(prev => ({
                                        ...prev,
                                        location: data.location || '',
                                        postcode: data.postcode || ''
                                    }));
                                }}
                            />
                            <select
                                name="radius"
                                className="form-select"
                                value={filters.radius}
                                onChange={(e) => setFilters(prev => ({ ...prev, radius: e.target.value }))}
                            >
                                <option value="">Radius</option>
                                <option value="5">5 mile</option>
                                <option value="10">10 mile</option>
                                <option value="15">15 mile</option>
                                <option value="20">20 mile</option>
                            </select>
                            <div className="search-form-categories">
                                <LayoutGrid size={18} />
                                <select
                                    name="category"
                                    className="form-select"
                                    value={filters.category}
                                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                >
                                    <option value="">Categories</option>
                                    {directoryCategories && directoryCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                            <button className="search-btn" type="submit">
                                <Search size={18} className="me-1"/>
                                Search
                            </button>
                        </div>
                    </div>
                    
                    <div className="map-search-btns">
                        <button type="button" onClick={showMyLocation}>
                            <MapPin size={18} />
                        </button>
                        <button type="button" onClick={resetMap}>
                            <X size={18} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DirectorySearchMapHeader;
