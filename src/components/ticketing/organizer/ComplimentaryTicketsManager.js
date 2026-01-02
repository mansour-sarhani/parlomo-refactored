'use client';

import { useState } from 'react';
import ComplimentaryTicketForm from './ComplimentaryTicketForm';
import ComplimentaryTicketsList from './ComplimentaryTicketsList';
import ComplimentaryTicketDetailsModal from './ComplimentaryTicketDetailsModal';

export default function ComplimentaryTicketsManager({ eventId, ticketTypes, isSeatedEvent }) {
    const [activeTab, setActiveTab] = useState('issue');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const handleIssueSuccess = (result) => {
        // Switch to issued tickets tab after successful issuance
        setActiveTab('issued');
    };

    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedOrderId(null);
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('issue')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'issue'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        Issue Tickets
                    </button>
                    <button
                        onClick={() => setActiveTab('issued')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === 'issued'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                        `}
                    >
                        Issued Tickets
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'issue' && (
                    <ComplimentaryTicketForm
                        eventId={eventId}
                        ticketTypes={ticketTypes}
                        isSeatedEvent={isSeatedEvent}
                        onSuccess={handleIssueSuccess}
                    />
                )}

                {activeTab === 'issued' && (
                    <ComplimentaryTicketsList
                        eventId={eventId}
                        onViewDetails={handleViewDetails}
                    />
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && (
                <ComplimentaryTicketDetailsModal
                    orderId={selectedOrderId}
                    isOpen={showDetailsModal}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
