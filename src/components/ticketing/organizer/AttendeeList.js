'use client';

/**
 * Attendee List Component
 * Display and manage event attendees
 */

import { useEffect, useState } from 'react';
import ticketingService from '@/services/ticketing.service';
import { Download, Search, Filter, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function AttendeeList({ eventId }) {
    const [attendees, setAttendees] = useState([]);
    const [filteredAttendees, setFilteredAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'checked-in' | 'not-checked-in'

    useEffect(() => {
        fetchAttendees();
    }, [eventId]);

    useEffect(() => {
        filterAttendees();
    }, [searchTerm, filterStatus, attendees]);

    const fetchAttendees = async () => {
        try {
            setLoading(true);

            const response = await ticketingService.getEventAttendees(eventId);
            setAttendees(response.attendees || []);
        } catch (error) {
            console.error('Error fetching attendees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAttendees = () => {
        let filtered = [...attendees];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (attendee) =>
                    attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendee.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    attendee.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (filterStatus === 'checked-in') {
            filtered = filtered.filter((attendee) => attendee.checkedIn);
        } else if (filterStatus === 'not-checked-in') {
            filtered = filtered.filter((attendee) => !attendee.checkedIn);
        }

        setFilteredAttendees(filtered);
    };

    const handleExportCSV = () => {
        // Create CSV content
        const headers = ['Name', 'Email', 'Ticket Type', 'Ticket Code', 'Order Number', 'Checked In', 'Checked In At'];
        const rows = filteredAttendees.map((attendee) => [
            attendee.name,
            attendee.email,
            attendee.ticketType,
            attendee.ticketCode,
            attendee.orderNumber,
            attendee.checkedIn ? 'Yes' : 'No',
            attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : '-',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendees-event-${eventId}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const checkedInCount = attendees.filter((a) => a.checkedIn).length;
    const totalCount = attendees.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Attendees</div>
                    <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Checked In</div>
                    <div className="text-3xl font-bold text-green-600">{checkedInCount}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-1">Not Checked In</div>
                    <div className="text-3xl font-bold text-orange-600">
                        {totalCount - checkedInCount}
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="flex-1 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, email, ticket code..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="all">All Attendees</option>
                            <option value="checked-in">Checked In</option>
                            <option value="not-checked-in">Not Checked In</option>
                        </select>

                        {/* Export Button */}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors whitespace-nowrap"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendees Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {filteredAttendees.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        {searchTerm || filterStatus !== 'all'
                            ? 'No attendees match your filters'
                            : 'No attendees yet'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Ticket Type
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Ticket Code
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Order #
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                        Checked In
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAttendees.map((attendee) => (
                                    <tr
                                        key={attendee.id}
                                        className="border-b border-gray-100 hover:bg-gray-50"
                                    >
                                        <td className="py-3 px-4">
                                            {attendee.checkedIn ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {attendee.name}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {attendee.email}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {attendee.ticketType}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-mono text-gray-600">
                                            {attendee.ticketCode}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {attendee.orderNumber}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {attendee.checkedInAt
                                                ? new Date(attendee.checkedInAt).toLocaleString()
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Results Count */}
            {filteredAttendees.length > 0 && (
                <div className="text-sm text-gray-600 text-center">
                    Showing {filteredAttendees.length} of {totalCount} attendees
                </div>
            )}
        </div>
    );
}
