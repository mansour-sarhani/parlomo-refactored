"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FrontLayout } from "@/components/layout/FrontLayout";
import { MapDisplay } from "@/components/common/map/LazyMapDisplay";
import { Button } from "@/components/common/Button";
import {
    Phone,
    Mail,
    Globe,
    MapPin,
    Share2,
    Youtube,
    Instagram,
    X,
    Calendar,
    Tag,
    PoundSterling,
} from "lucide-react";

const API_BASE = "https://api.parlomo.co.uk";

const getImageUrl = (path, filename) => {
    if (!path || !filename) return null;
    return `${API_BASE}${path}/${filename}`;
};

// Image Modal/Lightbox
const ImageModal = ({ src, alt, onClose }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
                <X className="w-8 h-8" />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

// Price Display Component
const PriceDisplay = ({ price, quoteText, isShowPrice, currency = "GBP" }) => {
    const isQuotePrice = !price || parseFloat(price) === 0;
    const currencySymbol = currency === "GBP" ? "£" : currency;

    if (!isShowPrice) {
        return null;
    }

    if (isQuotePrice) {
        return (
            <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-semibold">
                    {quoteText || "Get Quote"}
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <PoundSterling className="w-6 h-6 text-gray-700" />
            <span className="text-3xl font-bold text-gray-900">
                {parseFloat(price).toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </span>
        </div>
    );
};

export default function AdDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/api/classified-ad/${params.slug}`);
                if (!res.ok) throw new Error("Ad not found");
                const data = await res.json();
                setAd(data);
            } catch (err) {
                console.error("Error fetching ad:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchAd();
    }, [params.slug]);

    const handleShare = async () => {
        const shareData = {
            title: ad?.title,
            text: ad?.description?.substring(0, 100) || ad?.title,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share cancelled");
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    // Loading State
    if (loading) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading ad...</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    // Error State
    if (error || !ad) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Ad Not Found
                        </h1>
                        <p className="text-gray-600 mb-4">
                            The classified ad you are looking for does not exist.
                        </p>
                        <Button onClick={() => router.push("/")}>Go Home</Button>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    const heroImage = ad.image?.[0] ? getImageUrl(ad.path, ad.image[0]) : null;
    const hasContactInfo = ad.contactNumber || ad.email || ad.siteLink || ad.youtubeLink || ad.socialMediaLink;

    return (
        <FrontLayout>
            <div className="bg-gray-50 min-h-screen pb-24 lg:pb-12">
                {/* Hero Section */}
                <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900 overflow-hidden">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={ad.title}
                            className="w-full h-full object-cover opacity-70"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-900 to-primary-700 opacity-90" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white container mx-auto">
                        <div className="max-w-4xl">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                {ad.classifiedAdType && (
                                    <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                                        {ad.classifiedAdType}
                                    </span>
                                )}
                                <span className="inline-block px-3 py-1 bg-primary-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {ad.categoryName}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                {ad.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-gray-200">
                                {ad.city && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{ad.city}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{ad.createdAtHuman}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Price Card */}
                            {ad.isShowPrice && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <div className="flex items-center justify-between">
                                        <PriceDisplay
                                            price={ad.price}
                                            quoteText={ad.quoteText}
                                            isShowPrice={ad.isShowPrice}
                                            currency={ad.currency}
                                        />
                                        {ad.status && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                ad.status === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {ad.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* About Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                    Description
                                </h2>
                                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {ad.description}
                                </div>

                                {/* Location info for mobile */}
                                <div className="mt-6 pt-6 border-t border-gray-100 lg:hidden">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-900 font-medium">
                                                {ad.city}
                                                {ad.country && `, ${ad.country}`}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {ad.postcode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Section */}
                            {ad.image && ad.image.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Photos
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {ad.image.map((img, index) => {
                                            const imgUrl = getImageUrl(ad.path, img);
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setLightboxImage(imgUrl)}
                                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                                                >
                                                    <img
                                                        src={imgUrl}
                                                        alt={`${ad.title} - Image ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Attributes Section */}
                            {ad.classifiedAdAttributes && ad.classifiedAdAttributes.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {ad.classifiedAdAttributes.map((attr, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <span className="text-gray-600 flex items-center gap-2">
                                                    <Tag className="w-4 h-4" />
                                                    {attr.key || attr.name}
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {attr.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Event Date/Time (if applicable) */}
                            {(ad.eventDate || ad.eventTime) && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                        Event Information
                                    </h2>
                                    <div className="flex flex-wrap gap-6">
                                        {ad.eventDate && (
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-50 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Date</p>
                                                    <p className="font-medium text-gray-900">
                                                        {new Date(ad.eventDate).toLocaleDateString("en-GB", {
                                                            weekday: "long",
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {ad.eventTime && (
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary-50 rounded-lg">
                                                    <Calendar className="w-5 h-5 text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Time</p>
                                                    <p className="font-medium text-gray-900">{ad.eventTime}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                {/* Contact Card */}
                                {hasContactInfo && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h3 className="text-lg font-bold mb-4 text-gray-900">
                                            Contact Seller
                                        </h3>
                                        <div className="space-y-4">
                                            {ad.contactNumber && (
                                                <a
                                                    href={`tel:${ad.contactNumber}`}
                                                    className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium">
                                                        {ad.contactNumber}
                                                    </span>
                                                </a>
                                            )}
                                            {ad.email && (
                                                <a
                                                    href={`mailto:${ad.email}`}
                                                    className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Mail className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium truncate">
                                                        {ad.email}
                                                    </span>
                                                </a>
                                            )}
                                            {ad.siteLink && (
                                                <a
                                                    href={ad.siteLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium">Website</span>
                                                </a>
                                            )}
                                            {ad.youtubeLink && (
                                                <a
                                                    href={ad.youtubeLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Youtube className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium">YouTube</span>
                                                </a>
                                            )}
                                            {ad.socialMediaLink && (
                                                <a
                                                    href={ad.socialMediaLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 text-gray-600 hover:text-pink-600 transition-colors"
                                                >
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        <Instagram className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium">Social Media</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Location & Map */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                                        Location
                                    </h3>
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {ad.city}
                                                {ad.country && `, ${ad.country}`}
                                            </p>
                                            <p className="text-sm text-gray-500">{ad.postcode}</p>
                                        </div>
                                    </div>
                                    {ad.lat && ad.lng && (
                                        <MapDisplay
                                            latitude={ad.lat}
                                            longitude={ad.lng}
                                            zoom={15}
                                            className="w-full h-48 rounded-lg"
                                        />
                                    )}
                                </div>

                                {/* Share Button */}
                                <div className="bg-white rounded-xl shadow-sm p-4">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleShare}
                                        icon={<Share2 className="w-4 h-4" />}
                                    >
                                        Share This Ad
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Action Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
                    <div className="flex gap-3">
                        {ad.contactNumber ? (
                            <a
                                href={`tel:${ad.contactNumber}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                Call
                            </a>
                        ) : ad.email ? (
                            <a
                                href={`mailto:${ad.email}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                Email
                            </a>
                        ) : (
                            <button
                                onClick={handleShare}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                                Share
                            </button>
                        )}
                        {ad.contactNumber && ad.email && (
                            <a
                                href={`mailto:${ad.email}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                Email
                            </a>
                        )}
                        <button
                            onClick={handleShare}
                            className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Image Lightbox */}
                {lightboxImage && (
                    <ImageModal
                        src={lightboxImage}
                        alt={ad.title}
                        onClose={() => setLightboxImage(null)}
                    />
                )}
            </div>
        </FrontLayout>
    );
}
