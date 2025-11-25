"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchPublicBusinessCategories } from "@/features/businesses/businessCategoriesSlice";
import LocationInput from "@/components/common/LocationInput";
import useGeolocation from "@/hooks/useGeolocation";
import { Search, MapPin, X, LayoutGrid, SlidersHorizontal } from "lucide-react";

function ResponsiveMapSearchForm({ setMyLocation }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const directoryCategories = useSelector(state => state.businessCategories.publicList);
    
    const [openFilter, setOpenFilter] = useState(false);
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
        setOpenFilter(false);
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
            setOpenFilter(false);
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
        setOpenFilter(false);
    };

    return (
        <div className="responsive-search-header">
            <div className="map-search-header">
                <div className="container mx-auto px-4">
                    <div className="responsive-map-header-extra">
                        <button 
                            type="button"
                            className="back-grid-btn" 
                            onClick={backToGridView}
                        >
                            <LayoutGrid size={18} />
                            Grid View
                        </button>
                        <div className="search-filter-btn">
                            <button type="button" onClick={() => setOpenFilter(!openFilter)}>
                                <SlidersHorizontal size={18} className="me-1" />
                                Filters
                            </button>
                        </div>
                    </div>
                    
                    <div 
                        className="sliding-filters" 
                        style={{
                            transform: openFilter ? 'translateX(0)' : 'translateX(-100%)'
                        }}
                    >
                        <div className="search-filter-btn">
                            <button type="button" onClick={() => setOpenFilter(!openFilter)}>
                                <X size={18} className="me-1" />
                                Close Filters
                            </button>
                        </div>
                        
                        <form onSubmit={handleSearch}>
                            <div className="map-search-form">
                                <div className="row">
                                    <div className="col-12 mb-3">
                                        <input
                                            name="query"
                                            className="form-control"
                                            placeholder="What are you looking for ..."
                                            value={filters.query}
                                            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-6 mb-3">
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
                                    </div>
                                    <div className="col-6 mb-3">
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
                                    </div>
                                    <div className="col-12 mb-3">
                                        <div className="search-form-categories">
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
                                    </div>
                                    <div className="col-12 mb-3">
                                        <button className="search-btn" type="submit">
                                            <Search size={18} className="me-1"/>
                                            Search
                                        </button>
                                    </div>
                                    <div className="col-12">
                                        <div className="map-search-btns">
                                            <button type="button" onClick={showMyLocation}>
                                                <MapPin size={18} className="me-1" />
                                                My Location
                                            </button>
                                            <button type="button" onClick={resetMap}>
                                                <X size={18} className="me-1" />
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResponsiveMapSearchForm;
