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
    Clock,
    Star,
    Share2,
    CheckCircle,
    Award,
    ChevronDown,
    ChevronUp,
    Youtube,
    Instagram,
    X,
    Calendar,
} from "lucide-react";

const API_BASE = "https://api.parlomo.co.uk";

const getImageUrl = (path, filename) => {
    if (!path || !filename) return null;
    return `${API_BASE}/${path}/${filename}`;
};

// Star Rating Component
const StarRating = ({ rating, size = "default" }) => {
    const starSize = size === "small" ? "w-4 h-4" : "w-5 h-5";
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${starSize} ${
                        star <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }`}
                />
            ))}
        </div>
    );
};

// FAQ Accordion Item
const FAQItem = ({ question, answer, isOpen, onToggle }) => {
    return (
        <div className="border-b border-gray-100 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 transition-colors"
            >
                <span className="font-medium text-gray-900 pr-4">{question}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600 leading-relaxed">{answer}</div>
            )}
        </div>
    );
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

export default function DirectoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [directory, setDirectory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`${API_BASE}/api/directory/${params.slug}`);
                if (!res.ok) throw new Error("Directory not found");
                const data = await res.json();
                setDirectory(data);
            } catch (err) {
                console.error("Error fetching directory:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) fetchDirectory();
    }, [params.slug]);

    const handleShare = async () => {
        const shareData = {
            title: directory?.title,
            text: directory?.shortDescription || directory?.title,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled or share failed
                console.log("Share cancelled");
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    const getCurrentDay = () => {
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        return days[new Date().getDay()];
    };

    // Loading State
    if (loading) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading directory...</p>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    // Error State
    if (error || !directory) {
        return (
            <FrontLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Directory Not Found
                        </h1>
                        <p className="text-gray-600 mb-4">
                            The directory you are looking for does not exist.
                        </p>
                        <Button onClick={() => router.push("/")}>Go Home</Button>
                    </div>
                </div>
            </FrontLayout>
        );
    }

    const heroImage = directory.image?.[0]
        ? getImageUrl(directory.path, directory.image[0])
        : null;
    const logoImage = directory.logo
        ? getImageUrl(directory.path, directory.logo)
        : null;

    return (
        <FrontLayout>
            <div className="bg-gray-50 min-h-screen pb-24 lg:pb-12">
                {/* Hero Section */}
                <div className="relative h-[300px] md:h-[400px] w-full bg-gray-900 overflow-hidden">
                    {heroImage ? (
                        <img
                            src={heroImage}
                            alt={directory.title}
                            className="w-full h-full object-cover opacity-70"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-900 to-primary-700 opacity-90" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                    {/* Hero Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white container mx-auto">
                        <div className="flex items-end gap-6">
                            {/* Logo */}
                            {logoImage && (
                                <div className="hidden md:block w-24 h-24 rounded-xl overflow-hidden bg-white shadow-lg flex-shrink-0">
                                    <img
                                        src={logoImage}
                                        alt={`${directory.title} logo`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                {/* Category & Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="inline-block px-3 py-1 bg-primary-600 rounded-full text-xs font-semibold uppercase tracking-wider">
                                        {directory.categoryName}
                                    </span>
                                    {directory.isVerifiedBusiness && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 rounded-full text-xs font-semibold">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                    {directory.isSponsored && (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-xs font-semibold">
                                            <Award className="w-3 h-3" />
                                            Sponsored
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl md:text-4xl font-bold mb-3 truncate">
                                    {directory.title}
                                </h1>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-gray-200">
                                    {directory.city && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{directory.city}</span>
                                        </div>
                                    )}
                                    {directory.rate > 0 && (
                                        <div className="flex items-center gap-2">
                                            <StarRating rating={directory.rate} size="small" />
                                            <span className="font-medium">{directory.rate}/5</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{directory.createdAtHuman}</span>
                                    </div>
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
                            {/* About Section */}
                            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                                    About
                                </h2>
                                {directory.shortDescription && (
                                    <p className="text-gray-600 font-medium mb-4">
                                        {directory.shortDescription}
                                    </p>
                                )}
                                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {directory.description}
                                </div>

                                {/* Address in main content for mobile */}
                                <div className="mt-6 pt-6 border-t border-gray-100 lg:hidden">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-900 font-medium">
                                                {directory.fullAddress}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {directory.postcode}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Section */}
                            {directory.image && directory.image.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Gallery
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {directory.image.map((img, index) => {
                                            const imgUrl = getImageUrl(directory.path, img);
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => setLightboxImage(imgUrl)}
                                                    className="aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                                                >
                                                    <img
                                                        src={imgUrl}
                                                        alt={`${directory.title} - Image ${index + 1}`}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Certificates Section */}
                            {directory.certificates && directory.certificates.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Certificates & Awards
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {directory.certificates.map((cert, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                                            >
                                                {cert.image && (
                                                    <button
                                                        onClick={() =>
                                                            setLightboxImage(
                                                                getImageUrl(
                                                                    directory.certificatesPath,
                                                                    cert.image
                                                                )
                                                            )
                                                        }
                                                        className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 cursor-pointer"
                                                    >
                                                        <img
                                                            src={getImageUrl(
                                                                directory.certificatesPath,
                                                                cert.image
                                                            )}
                                                            alt={cert.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 mb-1">
                                                        {cert.title}
                                                    </h3>
                                                    {cert.description && (
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {cert.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FAQs Section */}
                            {directory.FAQS && directory.FAQS.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                                        Frequently Asked Questions
                                    </h2>
                                    <div className="divide-y divide-gray-100">
                                        {directory.FAQS.map((faq, index) => (
                                            <FAQItem
                                                key={index}
                                                question={faq.question}
                                                answer={faq.answer}
                                                isOpen={openFaqIndex === index}
                                                onToggle={() =>
                                                    setOpenFaqIndex(
                                                        openFaqIndex === index ? null : index
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                {/* Contact Card */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-bold mb-4 text-gray-900">
                                        Contact Information
                                    </h3>
                                    <div className="space-y-4">
                                        {directory.contactNumber && (
                                            <a
                                                href={`tel:${directory.contactNumber}`}
                                                className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                                            >
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Phone className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium">
                                                    {directory.contactNumber}
                                                </span>
                                            </a>
                                        )}
                                        {directory.email && (
                                            <a
                                                href={`mailto:${directory.email}`}
                                                className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-colors"
                                            >
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium truncate">
                                                    {directory.email}
                                                </span>
                                            </a>
                                        )}
                                        {directory.siteLink && (
                                            <a
                                                href={directory.siteLink}
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
                                        {directory.youtubeLink && (
                                            <a
                                                href={directory.youtubeLink}
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
                                        {directory.socialMediaLink && (
                                            <a
                                                href={directory.socialMediaLink}
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

                                {/* Business Hours */}
                                {directory.businessHours && directory.businessHours.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">
                                                Business Hours
                                            </h3>
                                            {directory.is24h && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                    24 Hours
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {directory.businessHours.map((hours, index) => {
                                                const isToday = hours.day === getCurrentDay();
                                                const isClosed = hours.isClosed === "true";
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                                            isToday
                                                                ? "bg-primary-50 border border-primary-200"
                                                                : ""
                                                        }`}
                                                    >
                                                        <span
                                                            className={`font-medium ${
                                                                isToday
                                                                    ? "text-primary-700"
                                                                    : "text-gray-700"
                                                            }`}
                                                        >
                                                            {hours.day}
                                                            {isToday && (
                                                                <span className="ml-2 text-xs text-primary-600">
                                                                    (Today)
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span
                                                            className={`text-sm ${
                                                                isClosed
                                                                    ? "text-red-500 font-medium"
                                                                    : "text-gray-600"
                                                            }`}
                                                        >
                                                            {isClosed
                                                                ? "Closed"
                                                                : hours.from && hours.to
                                                                ? `${hours.from} - ${hours.to}`
                                                                : "Open"}
                                                        </span>
                                                    </div>
                                                );
                                            })}
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
                                                {directory.fullAddress}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {directory.postcode}
                                                {directory.country && `, ${directory.country}`}
                                            </p>
                                        </div>
                                    </div>
                                    {directory.showMap && directory.lat && directory.lng && (
                                        <MapDisplay
                                            latitude={directory.lat}
                                            longitude={directory.lng}
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
                                        Share This Business
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Action Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
                    <div className="flex gap-3">
                        {directory.contactNumber && (
                            <a
                                href={`tel:${directory.contactNumber}`}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                Call
                            </a>
                        )}
                        {directory.email && (
                            <a
                                href={`mailto:${directory.email}`}
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
                        alt={directory.title}
                        onClose={() => setLightboxImage(null)}
                    />
                )}
            </div>
        </FrontLayout>
    );
}
