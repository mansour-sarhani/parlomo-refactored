"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/common/Modal";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/lib/hooks";
import {
    fetchEventById,
    fetchEventStats,
    updateEvent,
    publishEvent,
    unpublishEvent,
    cancelEvent,
    duplicateEvent,
    deleteEvent,
    normalizeEventData
} from "@/features/public-events/publicEventsSlice";
import {
    ChevronLeft, Ticket, Copy, Trash2,
    Calendar, MapPin, Users, Globe, DollarSign,
    BarChart3, ExternalLink, AlertTriangle, PlayCircle,
    Facebook, Instagram, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatEventDateRange, getEventStatusColor } from "@/types/public-events-types";
import { use } from "react";
import { MapDisplay } from "@/components/common/map/LazyMapDisplay";

export default function ViewEventPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [event, setEvent] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            try {
                const [eventResult, statsResult] = await Promise.all([
                    dispatch(fetchEventById(id)).unwrap(),
                    dispatch(fetchEventStats(id)).unwrap()
                ]);
                const eventData = eventResult.data || eventResult.event;
                setEvent(normalizeEventData(eventData));
                setStats(statsResult.stats || statsResult.data);
            } catch (err) {
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, dispatch]);

    const handleUpdateStatus = async () => {
        if (!pendingStatus || pendingStatus === event.status) return;

        setActionLoading(true);
        try {
            const result = await dispatch(updateEvent({
                id,
                updates: { status: pendingStatus }
            })).unwrap();

            const eventData = result.data || result.event;
            setEvent(normalizeEventData(eventData));
            setPendingStatus(null);
            toast.success(`Event status updated to ${pendingStatus.replace('_', ' ')}`);
        } catch (error) {
            toast.error(error.error || 'Failed to update event status');
            setPendingStatus(event.status);
        } finally {
            setActionLoading(false);
        }
    };

    const openConfirmModal = (action) => {
        setConfirmModal({ isOpen: true, action });
    };

    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, action: null });
    };

    const handleConfirmAction = async () => {
        const action = confirmModal.action;
        closeConfirmModal();

        if (action === 'delete') {
            await executeDelete();
        } else {
            await executeStatusChange(action);
        }
    };

    const executeStatusChange = async (action) => {
        setActionLoading(true);
        try {
            let result;
            if (action === 'publish') {
                result = await dispatch(publishEvent(id)).unwrap();
                toast.success("Event published successfully");
            } else if (action === 'unpublish') {
                result = await dispatch(unpublishEvent(id)).unwrap();
                toast.success("Event unpublished successfully");
            } else if (action === 'cancel') {
                result = await dispatch(cancelEvent(id)).unwrap();
                toast.success("Event cancelled successfully");
            }
            const eventData = result.data || result.event;
            setEvent(normalizeEventData(eventData));
        } catch (error) {
            toast.error(error.error || `Failed to ${action} event`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDuplicate = async () => {
        setActionLoading(true);
        try {
            const result = await dispatch(duplicateEvent(id)).unwrap();
            const eventData = result.data || result.event;
            toast.success("Event duplicated successfully");
            router.push(`/panel/my-events/${eventData.id}/edit/details`);
        } catch (error) {
            toast.error(error.error || "Failed to duplicate event");
        } finally {
            setActionLoading(false);
        }
    };

    const executeDelete = async () => {
        setActionLoading(true);
        try {
            await dispatch(deleteEvent(id)).unwrap();
            toast.success("Event deleted successfully");
            router.push("/panel/my-events");
        } catch (error) {
            toast.error(error.error || "Failed to delete event");
            setActionLoading(false);
        }
    };

    const getConfirmModalConfig = () => {
        const configs = {
            publish: {
                title: 'Publish Event',
                message: 'Are you sure you want to publish this event? It will be visible to the public.',
                confirmText: 'Publish',
                variant: 'primary'
            },
            unpublish: {
                title: 'Unpublish Event',
                message: 'Are you sure you want to unpublish this event? It will no longer be visible to the public.',
                confirmText: 'Unpublish',
                variant: 'secondary'
            },
            cancel: {
                title: 'Cancel Event',
                message: 'Are you sure you want to cancel this event? This will notify all attendees.',
                confirmText: 'Cancel Event',
                variant: 'danger'
            },
            delete: {
                title: 'Delete Event',
                message: 'Are you sure you want to delete this event? This action cannot be undone.',
                confirmText: 'Delete',
                variant: 'danger'
            }
        };
        return configs[confirmModal.action] || {};
    };

    if (loading) {
        return (
            <ContentWrapper>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </ContentWrapper>
        );
    }

    if (!event) {
        return (
            <ContentWrapper>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold mb-2">Event Not Found</h2>
                    <Button onClick={() => router.push("/panel/my-events")}>Back to My Events</Button>
                </div>
            </ContentWrapper>
        );
    }

    const statusColor = getEventStatusColor(event.status);

    return (
        <ContentWrapper className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/panel/my-events")}
                        icon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                                {event.title}
                            </h1>
                            <span
                                className="px-2 py-1 rounded text-xs font-medium capitalize"
                                style={{
                                    backgroundColor: `${statusColor}20`,
                                    color: statusColor
                                }}
                            >
                                {event.status}
                            </span>
                        </div>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                            {formatEventDateRange(event)} • {event.venue?.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {event.status === 'draft' && (
                        <Button
                            onClick={() => openConfirmModal('publish')}
                            loading={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Publish Event
                        </Button>
                    )}
                    {event.status === 'published' && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                                icon={<ExternalLink className="w-4 h-4" />}
                            >
                                View Public Page
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => openConfirmModal('unpublish')}
                                loading={actionLoading}
                            >
                                Unpublish
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-50 text-blue-600">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tickets Sold</p>
                            <p className="text-xl font-bold">{stats?.ticketsSold || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-green-50 text-green-600">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Revenue</p>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: event.currency }).format((stats?.revenue || 0) / 100)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-purple-50 text-purple-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Attendees</p>
                            <p className="text-xl font-bold">{stats?.attendees || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-orange-50 text-orange-600">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Conversion</p>
                            <p className="text-xl font-bold">0%</p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {event.coverImage && (
                        <Card header={<CardHeader title="Cover Image" />}>
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                                <img
                                    src={event.coverImage}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </Card>
                    )}

                    <Card header={<CardHeader title="Event Details" />}>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <div
                                    className="mt-1 ql-editor"
                                    style={{ padding: 0 }}
                                    dangerouslySetInnerHTML={{ __html: event.description }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                    <p className="mt-1 capitalize">{event.category?.name || event.category}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                                    <p className="mt-1 capitalize">{event.eventType.replace('_', ' ')}</p>
                                </div>
                            </div>

                            {event.tags && event.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Tags</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {event.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>



                    <Card header={<CardHeader title="Location" />}>
                        <div className="flex items-start gap-3 mb-6">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium">{event.venue?.name}</p>
                                <p className="text-gray-600">{event.location?.address}</p>
                                <p className="text-gray-600">{event.location?.city}, {event.location?.state} {event.location?.postcode}</p>
                                <p className="text-gray-600">{event.location?.country}</p>
                                {event.isOnline && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                        Online Event
                                    </span>
                                )}
                            </div>
                        </div>
                        <MapDisplay
                            latitude={event.location?.coordinates?.lat}
                            longitude={event.location?.coordinates?.lng}
                            zoom={15}
                            className="w-full h-64 rounded-lg"
                        />
                    </Card>

                    {/* Gallery Section */}
                    {event.galleryImages && event.galleryImages.length > 0 && (
                        <Card header={<CardHeader title="Gallery" />}>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {event.galleryImages.map((img, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                                        <img
                                            src={img}
                                            alt={`Gallery image ${index + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Video Section */}
                    {event.videoUrl && (
                        <Card header={<CardHeader title="Event Video" />}>
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                                {(() => {
                                    const getEmbedUrl = (url) => {
                                        if (!url) return null;
                                        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                        const match = url.match(regExp);
                                        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
                                    };
                                    const embedUrl = getEmbedUrl(event.videoUrl);

                                    if (embedUrl) {
                                        return (
                                            <iframe
                                                src={embedUrl}
                                                title="Event Video"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        );
                                    }

                                    return (
                                        <div className="flex items-center justify-center h-full">
                                            <a
                                                href={event.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-2 font-medium"
                                            >
                                                <PlayCircle className="w-8 h-8" />
                                                Watch Video on External Site
                                            </a>
                                        </div>
                                    );
                                })()}
                            </div>
                        </Card>
                    )}

                    <Card header={<CardHeader title="Organizer Info" />}>
                        <div className="space-y-2">
                            <p><span className="font-medium">Name:</span> {event.organizer?.name}</p>
                            <p><span className="font-medium">Email:</span> {event.organizer?.email}</p>
                            {event.organizer?.phone && <p><span className="font-medium">Phone:</span> {event.organizer?.phone}</p>}
                            {event.organizer?.website && (
                                <p>
                                    <span className="font-medium">Website:</span>{' '}
                                    <a href={event.organizer?.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        {event.organizer?.website}
                                    </a>
                                </p>
                            )}

                            {(event.organizer?.facebook || event.organizer?.instagram || event.organizer?.whatsApp) && (
                                <div className="flex gap-4 mt-4 pt-4 border-t">
                                    {event.organizer?.facebook && (
                                        <a href={event.organizer?.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors" title="Facebook">
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                    )}
                                    {event.organizer?.instagram && (
                                        <a href={event.organizer?.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 transition-colors" title="Instagram">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    )}
                                    {event.organizer?.whatsApp && (
                                        <a href={`https://wa.me/${event.organizer?.whatsApp}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 transition-colors" title="WhatsApp">
                                            <MessageCircle className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>

                    {event.refundPolicy && (
                        <Card header={<CardHeader title="Refund Policy" />}>
                            <div
                                className="ql-editor text-gray-600"
                                style={{ padding: 0 }}
                                dangerouslySetInnerHTML={{ __html: event.refundPolicy }}
                            />
                        </Card>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-6">
                    <Card header={<CardHeader title="Management" />}>
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push(`/panel/my-events/${event.id}/ticketing`)}
                                icon={<Ticket className="w-4 h-4" />}
                            >
                                Manage Tickets
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push(`/panel/my-events/${event.id}/financials`)}
                                icon={<DollarSign className="w-4 h-4" />}
                            >
                                Financials & Settlements
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={handleDuplicate}
                                loading={actionLoading}
                                icon={<Copy className="w-4 h-4" />}
                            >
                                Duplicate Event
                            </Button>
                            {event.status !== 'cancelled' && (
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-200"
                                    onClick={() => openConfirmModal('cancel')}
                                    loading={actionLoading}
                                    icon={<AlertTriangle className="w-4 h-4" />}
                                >
                                    Cancel Event
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:bg-red-50 hover:border-red-200"
                                onClick={() => openConfirmModal('delete')}
                                loading={actionLoading}
                                icon={<Trash2 className="w-4 h-4" />}
                            >
                                Delete Event
                            </Button>
                        </div>
                    </Card>

                    <Card header={<CardHeader title="Visibility" />}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 block mb-2">Event Status</label>
                                <select
                                    value={pendingStatus || event.status}
                                    onChange={(e) => setPendingStatus(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    style={{
                                        backgroundColor: `${getEventStatusColor(pendingStatus || event.status)}10`,
                                        borderColor: getEventStatusColor(pendingStatus || event.status),
                                        color: getEventStatusColor(pendingStatus || event.status)
                                    }}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="sold_out">Sold Out</option>
                                    <option value="postponed">Postponed</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="completed">Completed</option>
                                    <option value="archived">Archived</option>
                                </select>
                                
                                {pendingStatus && pendingStatus !== event.status && (
                                    <div className="flex gap-2 mt-2">
                                        <Button 
                                            onClick={handleUpdateStatus}
                                            loading={actionLoading}
                                            className="flex-1"
                                            size="sm"
                                        >
                                            Update
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            onClick={() => setPendingStatus(null)}
                                            size="sm"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Visibility</span>
                                <span className="text-sm font-medium">{event.isPublic ? 'Public' : 'Private'}</span>
                            </div>
                            {event.slug && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Event URL</p>
                                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border text-xs break-all">
                                        <Globe className="w-3 h-3 flex-shrink-0" />
                                        <span>/events/{event.slug}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                loading={actionLoading}
                {...getConfirmModalConfig()}
            />
        </ContentWrapper >
    );
}
