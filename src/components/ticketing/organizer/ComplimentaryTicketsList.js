'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, Download, Search } from 'lucide-react';
import { Button } from '@/components/common/Button';
import {
    fetchComplimentaryTickets,
    selectComplimentaryTickets,
    selectComplimentaryTicketsLoading,
} from '@/features/ticketing/ticketingSlice';

export default function ComplimentaryTicketsList({ eventId, onViewDetails }) {
    const dispatch = useDispatch();
    const complimentaryTickets = useSelector(selectComplimentaryTickets);
    const loading = useSelector(selectComplimentaryTicketsLoading);

    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    useEffect(() => {
        if (eventId) {
            dispatch(fetchComplimentaryTickets(eventId));
        }
    }, [eventId, dispatch]);

    // Filter and search
    const filteredTickets = useMemo(() => {
        let filtered = [...complimentaryTickets];

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (ct) =>
                    ct.customer_name?.toLowerCase().includes(term) ||
                    ct.customer_email?.toLowerCase().includes(term) ||
                    ct.order_number?.toLowerCase().includes(term)
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            if (dateFilter === 'today') {
                filterDate.setHours(0, 0, 0, 0);
            } else if (dateFilter === 'week') {
                filterDate.setDate(now.getDate() - 7);
            } else if (dateFilter === 'month') {
                filterDate.setMonth(now.getMonth() - 1);
            }

            filtered = filtered.filter((ct) => new Date(ct.created_at) >= filterDate);
        }

        return filtered;
    }, [complimentaryTickets, searchTerm, dateFilter]);

    const handleExportCSV = () => {
        // CSV export logic
        const csvContent = [
            ['Order Number', 'Recipient Name', 'Email', 'Tickets', 'Reason', 'Date'],
            ...filteredTickets.map((ct) => [
                ct.order_number,
                ct.customer_name,
                ct.customer_email,
                ct.ticket_count,
                ct.reason,
                new Date(ct.created_at).toLocaleString('en-GB'),
            ]),
        ]
            .map((row) => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `complimentary-tickets-${eventId}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or order number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                    </div>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last Month</option>
                    </select>
                </div>
                <Button variant="outline" onClick={handleExportCSV} disabled={filteredTickets.length === 0}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            {/* Table */}
            {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                        No complimentary tickets found
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm || dateFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Issue your first complimentary tickets using the form in the "Issue Tickets" tab'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recipient
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tickets
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-gray-900">
                                                {ticket.order_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {ticket.customer_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {ticket.customer_email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {ticket.ticket_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {ticket.reason}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(ticket.created_at).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => onViewDetails(ticket.id)}
                                                className="text-purple-600 hover:text-purple-900 inline-flex items-center"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
