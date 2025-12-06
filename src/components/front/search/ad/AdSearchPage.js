"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchPublicAdListings } from "@/features/marketplace/adListingsSlice";
import { fetchAllAdTypes } from "@/features/marketplace/adTypesSlice";
import { fetchAllAdCategories } from "@/features/marketplace/adCategoriesSlice";
import AdLoopItem from "../../loops/AdLoopItem";
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
    LayoutGrid,
    ArrowDownWideNarrow,
    Filter,
    SearchX,
    Tag
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_URL_KEY || "https://api.parlomo.co.uk";

function NoPost() {
    return (
        <div className="ad-search-no-results">
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

function AdSearchPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { publicList: posts, publicLoading: loading, publicError: error, publicPagination: pagination } = useSelector(state => state.marketplaceAdListings);
    const adTypes = useSelector(state => state.marketplaceAdTypes.allOptions);
    const adCategories = useSelector(state => state.marketplaceAdCategories.allOptions);

    const [showFilters, setShowFilters] = useState(false);
    const [myLocation, setMyLocation] = useState(false);
    const [currentInputValue, setCurrentInputValue] = useState('');
    const [banners, setBanners] = useState([]);
    const [bannersLoading, setBannersLoading] = useState(true);
    const [filters, setFilters] = useState({
        query: '',
        category: '',
        type: '',
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

    // Fetch banners for Archive page type
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/omid-advertising-order/front?placeType=Archive`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        setBanners(result.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setBannersLoading(false);
            }
        };

        fetchBanners();
    }, []);

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        dispatch(fetchPublicAdListings(params));

        // Initialize filters from URL params
        setFilters({
            query: searchParams.get("query") || "",
            category: searchParams.get("category") || "",
            type: searchParams.get("type") || "",
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
        dispatch(fetchAllAdTypes());
        dispatch(fetchAllAdCategories());
    }, [dispatch]);

    const handlePageChange = (page) => {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("page", page);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.push(`/ad-search${query}`);
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
        router.push(`/ad-search?${params.toString()}`);
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

    const getTypeName = (typeId) => {
        const type = adTypes?.find(t => t.id == typeId);
        return type?.title || 'All';
    };

    const getCategoryName = (categoryId) => {
        const category = adCategories?.find(cat => cat.id == categoryId);
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
        <div className="ad-search-page">
            <div className="container mx-auto px-4">
                <div className="ad-search-header">
                    <h1 className="ad-search-title">Discover Classified Ads</h1>
                </div>

                <form onSubmit={handleSearch} className="ad-search-form-wrapper">
                    <div className="ad-search-bar">
                        <input
                            type="text"
                            className="ad-search-input"
                            placeholder="What are you looking for..."
                            value={filters.query}
                            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                        />

                        <div className="ad-search-location-group">
                            <button
                                type="button"
                                className={`ad-search-location-btn ${myLocation ? 'active' : ''}`}
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
                                className="ad-search-select"
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

                        <button type="submit" className="ad-search-submit-btn">
                            <Search size={18} />
                            Search
                        </button>

                        <button
                            type="button"
                            className="ad-search-filters-toggle"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? <X size={18} /> : <SlidersHorizontal size={18} />}
                            {showFilters ? 'Close' : 'Filters'}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="ad-search-filters-panel">
                            <div className="ad-search-filters-grid">
                                <div className="ad-search-filter-section">
                                    <h5>
                                        <ArrowDownWideNarrow size={18} />
                                        Sort By
                                    </h5>
                                    <ul className="ad-search-filter-list">
                                        <li
                                            className={`ad-search-filter-item ${filters.sort === 'dateNew' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, sort: 'dateNew' }))}
                                        >
                                            Date (New to Old)
                                        </li>
                                        <li
                                            className={`ad-search-filter-item ${filters.sort === 'dateOld' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, sort: 'dateOld' }))}
                                        >
                                            Date (Old to New)
                                        </li>
                                    </ul>
                                </div>

                                <div className="ad-search-filter-section">
                                    <h5>
                                        <Tag size={18} />
                                        Ad Types
                                    </h5>
                                    <ul className="ad-search-filter-list">
                                        <li
                                            className={`ad-search-filter-item ${filters.type === '' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
                                        >
                                            All
                                        </li>
                                        {adTypes && adTypes.map(type => (
                                            <li
                                                key={type.id}
                                                className={`ad-search-filter-item ${filters.type == type.id ? 'active' : ''}`}
                                                onClick={() => setFilters(prev => ({ ...prev, type: type.id }))}
                                            >
                                                {type.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="ad-search-filter-section">
                                    <h5>
                                        <LayoutGrid size={18} />
                                        Categories
                                    </h5>
                                    <ul className="ad-search-filter-list">
                                        <li
                                            className={`ad-search-filter-item ${filters.category === '' ? 'active' : ''}`}
                                            onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                                        >
                                            All
                                        </li>
                                        {adCategories && adCategories.map(cat => (
                                            <li
                                                key={cat.id}
                                                className={`ad-search-filter-item ${filters.category == cat.id ? 'active' : ''}`}
                                                onClick={() => setFilters(prev => ({ ...prev, category: cat.id }))}
                                            >
                                                {cat.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="ad-search-filter-section">
                                    <h5>
                                        <Filter size={18} />
                                        Active Filters
                                    </h5>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {filters.type && (
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
                                                <span>Type: {getTypeName(filters.type)}</span>
                                                <X
                                                    size={16}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => setFilters(prev => ({ ...prev, type: '' }))}
                                                />
                                            </div>
                                        )}
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
                                        {!filters.type && !filters.category && !filters.sort && (
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

                {/* Advertising Banners */}
                {banners.length > 0 && (
                    <div className="ad-search-banners">
                        <div className="ad-search-banners-grid">
                            {banners.slice(0, 2).map((banner) => (
                                <a
                                    key={banner.id}
                                    href={banner.link || "#"}
                                    target={banner.link ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className="ad-search-banner-item"
                                >
                                    <Image
                                        src={`${API_BASE_URL}${banner.path}/${banner.image}`}
                                        alt={banner.title || "Advertisement"}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="ad-search-results-grid">
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
                        <div className="ad-search-results-grid">
                            {posts.map((post) => (
                                <AdLoopItem key={post.id} post={post} />
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

export default AdSearchPage;
