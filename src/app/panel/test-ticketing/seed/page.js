'use client';

/**
 * Seed Ticketing Data Test Page
 * Allows manual seeding of ticketing test data
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import { Database, CheckCircle, XCircle, Loader2, RefreshCw, Ticket } from 'lucide-react';

export default function SeedTicketingDataPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [resetResult, setResetResult] = useState(null);

    const fetchTickets = async () => {
        setLoadingTickets(true);
        try {
            const response = await fetch('/api/test-ticketing/tickets');
            const data = await response.json();
            if (response.ok) {
                setTickets(data.tickets || []);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
        } finally {
            setLoadingTickets(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all public events data? This action cannot be undone.')) {
            return;
        }

        setResetting(true);
        setResetResult(null);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/reset-public-events', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setResetResult(data);
                // Refresh tickets list after reset
                await fetchTickets();
            } else {
                setError(data.error || 'Failed to reset data');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setResetting(false);
        }
    };

    const handleSeed = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        setResetResult(null);

        try {
            const response = await fetch('/api/seed-ticketing', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                setResult(data);
                // Refresh tickets list after seeding
                await fetchTickets();
            } else {
                setError(data.error || 'Failed to seed data');
            }
        } catch (err) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Seed Ticketing Data
                    </h1>
                    <p className="text-gray-600">
                        Initialize the mock database with sample ticketing data for testing
                    </p>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary/10 rounded-full p-4">
                            <Database className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Manage Test Data
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Reset or populate the database with sample events, tickets, and orders
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={handleReset}
                            disabled={resetting || loading}
                            variant="danger"
                            fullWidth
                            loading={resetting}
                            icon={!resetting && <RefreshCw className="w-5 h-5" />}
                        >
                            {resetting ? 'Resetting...' : 'Reset All Data'}
                        </Button>

                        <Button
                            onClick={handleSeed}
                            disabled={loading || resetting}
                            fullWidth
                            loading={loading}
                            icon={!loading && <Database className="w-5 h-5" />}
                        >
                            {loading ? 'Seeding Data...' : 'Seed Database'}
                        </Button>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                        Warning: Resetting will permanently delete all existing events and tickets.
                    </p>
                </div>

                {/* Reset Success Result */}
                {resetResult && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-blue-900 mb-2">
                                    Data Reset Successfully!
                                </h3>
                                <p className="text-blue-700 text-sm">
                                    {resetResult.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seed Success Result */}
                {result && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-green-900 mb-2">
                                    Data Seeded Successfully!
                                </h3>
                                <p className="text-green-700 text-sm mb-4">
                                    {result.message}
                                </p>

                                {result.stats && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Ticket Types</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {result.stats.ticketTypes}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Promo Codes</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {result.stats.promoCodes}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Fees</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {result.stats.fees}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Orders</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {result.stats.orders}
                                            </p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3">
                                            <p className="text-xs text-gray-600 mb-1">Tickets</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {result.stats.tickets}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-red-900 mb-2">
                                    Operation Failed
                                </h3>
                                <p className="text-red-700 text-sm">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tickets List */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 rounded-full p-4">
                                <Ticket className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Seeded Tickets
                                </h2>
                                <p className="text-gray-600 text-sm">
                                    All ticket codes currently in the system
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={fetchTickets}
                            disabled={loadingTickets}
                            variant="secondary"
                            size="sm"
                            icon={loadingTickets ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        >
                            Refresh
                        </Button>
                    </div>

                    {loadingTickets ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No tickets found. Seed the database to create tickets.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm font-bold text-gray-900">
                                                    {ticket.code}
                                                </code>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${ticket.status === 'valid' ? 'bg-green-100 text-green-700' :
                                                    ticket.status === 'used' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="text-gray-500">Attendee:</span>{' '}
                                                    <span className="font-medium">{ticket.attendeeName}</span>
                                                </div>
                                                {ticket.ticketType && (
                                                    <div>
                                                        <span className="text-gray-500">Type:</span>{' '}
                                                        <span className="font-medium">{ticket.ticketType.name}</span>
                                                    </div>
                                                )}
                                                {ticket.order && (
                                                    <div>
                                                        <span className="text-gray-500">Order:</span>{' '}
                                                        <span className="font-medium">{ticket.order.orderNumber}</span>
                                                    </div>
                                                )}
                                                {ticket.usedAt && (
                                                    <div className="col-span-full">
                                                        <span className="text-gray-500">Used At:</span>{' '}
                                                        <span className="font-medium">
                                                            {new Date(ticket.usedAt).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6">
                    <h3 className="font-bold text-blue-900 mb-3">What gets seeded?</h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>10 Sample Events</strong> - Including Festivals, Conferences, Workshops, and Online Events</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>Rich Data</strong> - Events with HTML descriptions, social links, deadlines, and service charges</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>6 Ticket Types</strong> - Across 3 sample events (Tech Conference, Music Festival, Workshop)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>4 Promo Codes</strong> - Including active, expired, and type-specific codes</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>3 Platform Fees</strong> - Service fee, processing fee, and platform commission</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span><strong>2 Sample Orders</strong> - With associated tickets and QR codes</span>
                        </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                        <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Ticket codes are randomly generated each time you seed.
                            Use the ticket codes shown above in the scanner page to test scanning functionality.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
