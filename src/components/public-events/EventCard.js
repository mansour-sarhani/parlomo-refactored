"use client";

import Link from "next/link";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { formatEventDateRange, getEventStatusColor, CURRENCIES } from "@/types/public-events-types";

/**
 * EventCard - Public event card for archive/listing pages
 * Displays event cover image, title, date, location, and starting price
 */
export function EventCard({ event }) {
    const startDate = new Date(event.startDate);

    // Get currency symbol
    const currencyInfo = CURRENCIES.find(c => c.code === event.currency) || { symbol: '£' };

    // Format the date for display
    const formattedDate = startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });

    const formattedTime = startDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Get status badge styling
    const getStatusBadge = (status) => {
        const colorMap = {
            published: { bg: 'bg-green-100', text: 'text-green-800' },
            sold_out: { bg: 'bg-orange-100', text: 'text-orange-800' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
            postponed: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
        };
        return colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    };

    const statusBadge = getStatusBadge(event.status);
    const showStatusBadge = event.status && event.status !== 'published';

    return (
        <Link
            href={`/events/${event.slug}`}
            className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
        >
            {/* Image Container */}
            <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                {event.coverImage ? (
                    <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-white/50" />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 bg-primary-600 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                        {event.category?.name || event.category}
                    </span>
                </div>

                {/* Status Badge (if not published) */}
                {showStatusBadge && (
                    <div className="absolute top-3 right-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusBadge.bg} ${statusBadge.text}`}>
                            {event.status.replace('_', ' ')}
                        </span>
                    </div>
                )}

                {/* Date Overlay */}
                <div className="absolute bottom-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                        <div className="text-xs font-semibold text-primary-600 uppercase">
                            {startDate.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-xl font-bold text-gray-900 leading-none">
                            {startDate.getDate()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {event.title}
                </h3>

                {/* Date & Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{formattedDate} • {formattedTime}</span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {event.venue?.name || event.venueName}
                        {(event.location?.city || event.city) && `, ${event.location?.city || event.city}`}
                    </span>
                </div>

                {/* Footer - Price & Organizer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-500">
                        By {event.organizer?.name || event.organizerName}
                    </div>
                    {event.startingPrice !== undefined && event.startingPrice > 0 ? (
                        <div className="text-sm font-semibold text-gray-900">
                            From {currencyInfo.symbol}{(event.startingPrice / 100).toFixed(2)}
                        </div>
                    ) : event.startingPrice === 0 ? (
                        <div className="text-sm font-semibold text-green-600">
                            Free
                        </div>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

export default EventCard;
