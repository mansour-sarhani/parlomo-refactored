'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

import { MapContainer, TileLayer, Marker } from 'react-leaflet';

/**
 * MapDisplay Component
 * 
 * Read-only map display showing a location with a marker.
 * Uses Leaflet and OpenStreetMap tiles.
 * 
 * @param {object} props
 * @param {number} props.latitude - Latitude of the location
 * @param {number} props.longitude - Longitude of the location
 * @param {number} props.zoom - Zoom level (default: 15)
 * @param {string} props.className - Additional CSS classes
 */
export function MapDisplay({ latitude, longitude, zoom = 15, className = '' }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={`h-64 rounded-lg bg-gray-100 flex items-center justify-center ${className}`}>
                <p className="text-gray-400">Loading map...</p>
            </div>
        );
    }

    if (!latitude || !longitude) {
        return (
            <div className={`h-64 rounded-lg bg-gray-100 flex items-center justify-center ${className}`}>
                <p className="text-gray-400">Location not available</p>
            </div>
        );
    }

    const position = [latitude, longitude];

    return (
        <div className={`rounded-lg overflow-hidden ${className}`}>
            <MapContainer
                center={position}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
                dragging={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
            </MapContainer>
        </div>
    );
}
