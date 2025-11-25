"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchPublicBusinessListings } from "@/features/businesses/businessListingsSlice";
import { fetchPublicBusinessCategories } from "@/features/businesses/businessCategoriesSlice";
import DirectoryLoopItem from "../../loops/DirectoryLoopItem";
import { Pagination } from "@/components/common/Pagination";
import { Skeleton } from "@/components/common/Skeleton";
import LocationInput from "@/components/common/LocationInput";
import useGeolocation from "@/hooks/useGeolocation";
import Image from "next/image";
import {
    Search,
    MapPin,
    SlidersHorizontal,
    X,
    Map,
    LayoutGrid,
    ArrowDownWideNarrow,
    Filter,
    SearchX
} from "lucide-react";

function NoPost() {
    return (
        <div className="directory-search-no-results">
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '24px' 
            }}>
                <SearchX 
                    size={120} 
                    strokeWidth={1} 
                    style={{ color: 'var(--color-text-tertiary)' }} 
                />
            </div>
            <h3>No Results Found</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px' }}>
                Try adjusting your search criteria or filters
            </p>
        </div>
    );
}

function DirectorySearchPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const { publicList: posts, publicLoading: loading, publicError: error, pagination } = useSelector(state => state.businessListings);
    const directoryCategories = useSelector(state => state.businessCategories.publicList);
    
    const [showFilters, setShowFilters] = useState(false);
    const [myLocation, setMyLocation] = useState(false);
    const [currentInputValue, setCurrentInputValue] = useState('');
    const [filters, setFilters] = useState({
        query: '',
        category: '',
        latitude: '',
        longitude: '',
        radius: '',
        postcode: '',
        location: '',
        sort: '',
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
        const params = Object.fromEntries(searchParams.entries());
        dispatch(fetchPublicBusinessListings(params));
        
        // Initialize filters from URL params
        setFilters({
            query: searchParams.get("query") || "",
            category: searchParams.get("category") || "",
            latitude: searchParams.get("latitude") || "",
            longitude: searchParams.get("longitude") || "",
            radius: searchParams.get("radius") || "",
            postcode: searchParams.get("postcode") || "",
            location: searchParams.get("location") || "",
            sort: searchParams.get("sort") || "",
        });
        
        if (searchParams.get("latitude")) {
            setMyLocation(true);
        }
    }, [searchParams, dispatch]);

    useEffect(() => {
        dispatch(fetchPublicBusinessCategories({ list: 'all' }));
    }, [dispatch]);

    const handlePageChange = (page) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("page", page);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`/directory-search${query}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        
        const data = {
            ...filters,
            postcode: myLocation ? "" : (filters.postcode ? (currentInputValue === filters.postcode ? filters.postcode : currentInputValue) : currentInputValue),
        };
        
        // Filter out empty values
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v != null && v !== "")
        );
        
        const params = new URLSearchParams(filteredData);
        router.push(`/directory-search?${params.toString()}`);
        setShowFilters(false);
    };

    const toggleLocation = () => {
        const newLocationState = !myLocation;
        setMyLocation(newLocationState);
        setFilters(prev => ({
            ...prev,
            latitude: newLocationState ? coords?.coords?.latitude || "" : "",
            longitude: newLocationState ? coords?.coords?.longitude || "" : "",
            postcode: newLocationState ? "" : prev.postcode,
            location: newLocationState ? "" : prev.location,
        }));
    };

    const showOnMap = () => {
        const params = new URLSearchParams({
            ...filters,
            list: "showmap"
        });
        router.push(`/directory-search-map?${params.toString()}`);
    };

    const getCategoryName = (categoryId) => {
        const category = directoryCategories?.find(cat => cat.id === categoryId);
        return category?.title || 'All';
    };

    const getSortName = (sortValue) => {
        switch (sortValue) {
            case 'dateOld': return 'Date (Old to New)';
            case 'dateNew': return 'Date (New to Old)';
            default: return '';
        }
    };

    return (
        <div className="directory-search-page">
            <div className="container mx-auto px-4">
                <div className="directory-search-header">
                    <h1 className="directory-search-title">Discover Businesses</h1>
                </div>

                <form onSubmit={handleSearch} className="directory-search-form-wrapper">
                    <div className="directory-search-bar">
                        <input
                            type="text"
                            className="directory-search-input"
                            placeholder="What are you looking for..."
                            value={filters.query}
                            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                        />
                        
                        <div className="directory-search-location-group">
                            <button
                                type="button"
                                className={`directory-search-location-btn ${myLocation ? 'active' : ''}`}
                                onClick={toggleLocation}
                            >
                                <MapPin size={18} />
                                {myLocation && filters.latitude ? 'Your Location' : 'Get My Location'}
                            </button>
                            
                            {!myLocation && (
                                <LocationInput 
                                    setCurrentInput={setCurrentInputValue} 
                                    reset={myLocation}
                                    onLocationSelect={(data) => {
                                        setFilters(prev => ({
                                            ...prev,
                                            location: data.location || '',
                                            postcode: data.postcode || ''
                                        }));
                                    }}
                                />
                            )}

                            
                            <select
                                className="directory-search-select"
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

                        <button type="submit" className="directory-search-submit-btn">
                            <Search size={18} />
                            Search
                        </button>
                        
                        <button
                            type="button"
                            className="directory-search-filters-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
                            {showFilters ? 'Close' : 'Filters'}
                        </button>
                        
                        <button
                            type="button"
                            className="directory-search-map-btn"
                            onClick={showOnMap}
                        >
                            <Map size={18} />
                            Show Map
                        </button>
                    </div>

                    {showFilters && (
                        <div className="directory-search-filters-panel">
                            <div className="directory-search-filters-grid">
                                <div className="directory-search-filter-section">
                                    <h5>
                                        <ArrowDownWideNarrow size={18} />
                                        Sort By
                                    </h5>
                                    <ul className="directory-search-filter-list">
                                        <li
                                            className={`directory-search-filter-item ${filters.sort === 'dateNew' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, sort: 'dateNew' }))}
                                        >
                                            Date (New to Old)
                                        </li>
                                        <li
                                            className={`directory-search-filter-item ${filters.sort === 'dateOld' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, sort: 'dateOld' }))}
                                        >
                                            Date (Old to New)
                                        </li>
                                    </ul>
                                </div>

                                <div className="directory-search-filter-section">
                                    <h5>
                                        <LayoutGrid size={18} />
                                        Categories
                                    </h5>
                                    <ul className="directory-search-filter-list">
                                        <li
                                            className={`directory-search-filter-item ${filters.category === '' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                                        >
                                            All
                                        </li>
                                        {directoryCategories && directoryCategories.map(cat => (
                                            <li
                                                key={cat.id}
                                                className={`directory-search-filter-item ${filters.category == cat.id ? 'active' : ''}`}
                                                onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                                            >
                                                {cat.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="directory-search-filter-section">
                                    <h5>
                                        <Filter size={18} />
                                        Active Filters
                                    </h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {filters.category && (
                                            <div style={{
                                                padding: '8px 12px',
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '14px'
                                            }}>
                                                <span>Category: {getCategoryName(filters.category)}</span>
                                                <X
                                                    size={16}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                                                />
                                            </div>
                                        )}
                                        {filters.sort && (
                                            <div style={{
                                                padding: '8px 12px',
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                fontSize: '14px'
                                            }}>
                                                <span>Sort: {getSortName(filters.sort)}</span>
                                                <X
                                                    size={16}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setFilters(prev => ({ ...prev, sort: '' }))}
                                                />
                                            </div>
                                        )}
                                        {!filters.category && !filters.sort && (
                                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                                                No active filters
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {loading ? (
                    <div className="directory-search-results-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <div key={n}>
                                <Skeleton variant="card" />
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div style={{
                        background: 'var(--color-error-surface)',
                        color: 'var(--color-error-foreground)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-error)'
                    }}>
                        {error}
                    </div>
                ) : posts && posts.length > 0 ? (
                    <>
                        <div className="directory-search-results-grid">
                            {posts.map((post) => (
                                <DirectoryLoopItem key={post.id} post={post} />
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.pages}
                                onPageChange={handlePageChange}
                                totalItems={pagination.total}
                                itemsPerPage={pagination.limit}
                                showItemsPerPage={false}
                            />
                        </div>
                    </>
                ) : (
                    <NoPost />
                )}
            </div>
        </div>
    );
}

export default DirectorySearchPage;
