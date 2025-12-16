'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
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

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

/**
 * LocationMarker Component
 * Handles map click events and marker placement
 */
function LocationMarker({ position, onChange }) {
    const map = useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return position === null ? null : <Marker position={position} />;
}

/**
 * MapLocationPicker Component
 * 
 * Interactive map for selecting event location by clicking.
 * Uses Leaflet and OpenStreetMap tiles.
 * 
 * @param {object} props
 * @param {number|null} props.latitude - Current latitude
 * @param {number|null} props.longitude - Current longitude
 * @param {function} props.onChange - Callback when location changes (lat, lng)
 */
export function MapLocationPicker({ latitude, longitude, onChange }) {
    const [mounted, setMounted] = useState(false);

    // Derive position directly from props, ensuring values are numbers
    const lat = latitude != null ? parseFloat(latitude) : null;
    const lng = longitude != null ? parseFloat(longitude) : null;
    const position = lat != null && lng != null && !isNaN(lat) && !isNaN(lng) ? { lat, lng } : null;

    const defaultCenter = [51.5074, -0.1278]; // London

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div
                className="h-96 rounded-lg border flex items-center justify-center"
                style={{
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--color-surface-secondary)'
                }}
            >
                <p style={{ color: 'var(--color-text-tertiary)' }}>Loading map...</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div
                className="h-96 rounded-lg overflow-hidden border"
                style={{ borderColor: 'var(--color-border)' }}
            >
                <MapContainer
                    center={position || defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} onChange={onChange} />
                </MapContainer>
            </div>

            {/* Location Info */}
            <div
                className="flex items-start gap-2 p-3 rounded-lg text-sm"
                style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-secondary)'
                }}
            >
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                <div>
                    {position ? (
                        <p>
                            <strong>Selected Location:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                        </p>
                    ) : (
                        <p>Click on the map to set the event location</p>
                    )}
                </div>
            </div>
        </div>
    );
}
