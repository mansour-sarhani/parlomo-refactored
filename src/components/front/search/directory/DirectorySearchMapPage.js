"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { fetchPublicBusinessListings } from "@/features/businesses/businessListingsSlice";
import GoogleMapReact from 'google-map-react';
import MapMarker from "@/components/common/map/MapMarker";
import MyLocationMarker from "@/components/common/map/MyLocationMarker";
import DirectorySearchMapHeader from "./DirectorySearchMapHeader";
import ResponsiveMapSearchForm from "./ResponsiveMapSearchForm";

function DirectorySearchMapPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const { publicList: posts, publicLoading: loading, publicError: error } = useSelector(state => state.businessListings);
    
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [isShowBusiness, setIsShowBusiness] = useState(false);
    const [center, setCenter] = useState({
        lat: 51.5007,
        lng: -0.1246
    });
    const [currentCenter, setCurrentCenter] = useState({
        lat: 51.5007,
        lng: -0.1246
    });
    const [myLocation, setMyLocation] = useState({
        lat: 0,
        lng: 0
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1221);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const params = Object.fromEntries(searchParams.entries());
        
        if (Object.keys(params).length !== 0) {
            const data = {
                ...params,
                list: "showmap",
            };
            
            dispatch(fetchPublicBusinessListings(data))
                .unwrap()
                .then(res => {
                    // Check if we have businesses with coordinates
                    if (res.data && res.data.length > 0) {
                        // Find first business with valid coordinates
                        const firstBusiness = res.data.find(b => b.lat && b.lng);
                        if (firstBusiness) {
                            setCenter({
                                lat: Number(firstBusiness.lat),
                                lng: Number(firstBusiness.lng)
                            });
                            setCurrentCenter({
                                lat: Number(firstBusiness.lat),
                                lng: Number(firstBusiness.lng)
                            });
                        }
                    }
                    
                    // If we have latitude/longitude in params, use those
                    if (params.latitude && params.longitude) {
                        setCenter({
                            lat: Number(params.latitude),
                            lng: Number(params.longitude)
                        });
                        setCurrentCenter({
                            lat: Number(params.latitude),
                            lng: Number(params.longitude)
                        });
                    }
                })
                .catch(err => {
                    console.error("Error fetching businesses:", err);
                });
        }
    }, [searchParams, dispatch]);

    const handleMapChange = ({ center }) => {
        setCurrentCenter(center);
    };

    const searchThisArea = () => {
        const params = new URLSearchParams({
            query: searchParams.get("query") || "",
            category: searchParams.get("category") || "",
            latitude: currentCenter.lat,
            longitude: currentCenter.lng,
            radius: searchParams.get("radius") || "",
            list: "showmap",
        });
        
        // Filter out empty values
        const filteredParams = new URLSearchParams();
        for (const [key, value] of params.entries()) {
            if (value) filteredParams.set(key, value);
        }
        
        router.push(`/directory-search-map?${filteredParams.toString()}`);
    };

    return (
        <div className="map-search-page">
            {isMobile ? (
                <ResponsiveMapSearchForm setMyLocation={setMyLocation} />
            ) : (
                <DirectorySearchMapHeader setMyLocation={setMyLocation} />
            )}
            
            {center.lat && center.lng && (
                <div className="map-container">
                    <button
                        className="sticky-map-btn"
                        onClick={searchThisArea}
                    >
                        Search This Area
                    </button>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API }}
                        defaultCenter={{
                            lat: 51.5007,
                            lng: -0.1246,
                        }}
                        center={center}
                        onChange={handleMapChange}
                        defaultZoom={15}
                    >
                        {myLocation.lat !== 0 && myLocation.lng !== 0 && (
                            <MyLocationMarker
                                lat={myLocation.lat}
                                lng={myLocation.lng}
                            />
                        )}
                        {posts && posts.map((business) => (
                            business.lat && business.lng && (
                                <MapMarker
                                    key={business.id}
                                    lat={Number(business.lat)}
                                    lng={Number(business.lng)}
                                    business={business}
                                    selectedBusiness={selectedBusiness}
                                    isShowBusiness={isShowBusiness}
                                    onClick={() => {
                                        setSelectedBusiness(business.id);
                                        setIsShowBusiness(!isShowBusiness);
                                    }}
                                />
                            )
                        ))}
                    </GoogleMapReact>
                </div>
            )}
            
            {error && (
                <div className="container mx-auto px-4 py-4">
                    <div style={{
                        background: 'var(--color-error-surface)',
                        color: 'var(--color-error-foreground)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-error)'
                    }}>
                        {error}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DirectorySearchMapPage;
