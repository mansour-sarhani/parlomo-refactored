'use client';

import dynamic from 'next/dynamic';

export const MapDisplay = dynamic(
    () => import('./MapDisplay').then((mod) => mod.MapDisplay),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-64 rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400">Loading map...</p>
            </div>
        ),
    }
);
