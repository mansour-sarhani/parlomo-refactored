'use client';

/**
 * SeatBlockingManager Component
 * Complete seat blocking management interface with list, block, and unblock functionality
 */

import { useState, useCallback } from 'react';
import { Lock, Plus } from 'lucide-react';
import { Button } from '@/components/common/Button';
import BlockedSeatsList from '@/components/ticketing/BlockedSeatsList';
import BlockSeatsModal from '@/components/ticketing/BlockSeatsModal';
import UnblockSeatsModal from '@/components/ticketing/UnblockSeatsModal';

/**
 * SeatBlockingManager component
 * @param {Object} props
 * @param {string} props.eventId - Event ID
 * @param {string} [props.className] - Additional CSS classes
 */
export default function SeatBlockingManager({ eventId, className = '' }) {
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showUnblockModal, setShowUnblockModal] = useState(false);
    const [selectedBlockRecord, setSelectedBlockRecord] = useState(null);
    const [selectedSeatLabels, setSelectedSeatLabels] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Handle block button click - open modal with manual seat input
    const handleBlockClick = () => {
        setSelectedSeatLabels([]);
        setShowBlockModal(true);
    };

    // Handle unblock button click from list
    const handleUnblockClick = useCallback((blockRecord) => {
        setSelectedBlockRecord(blockRecord);
        setShowUnblockModal(true);
    }, []);

    // Handle successful block
    const handleBlockSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setShowBlockModal(false);
        setSelectedSeatLabels([]);
    };

    // Handle successful unblock
    const handleUnblockSuccess = () => {
        setRefreshKey(prev => prev + 1);
        setShowUnblockModal(false);
        setSelectedBlockRecord(null);
    };

    // Handle block with seat labels (from external source like seating chart)
    const handleBlockSeats = (seatLabels) => {
        setSelectedSeatLabels(seatLabels);
        setShowBlockModal(true);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header with Block Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Blocked Seats</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage seats that are reserved and unavailable for public purchase
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleBlockClick}
                    icon={<Lock className="w-4 h-4" />}
                    className="gap-2"
                >
                    Block Seats
                </Button>
            </div>

            {/* Blocked Seats List */}
            <BlockedSeatsList
                eventId={eventId}
                onUnblock={handleUnblockClick}
                onRefresh={refreshKey}
                className="mt-4"
            />

            {/* Block Seats Modal */}
            {showBlockModal && (
                <BlockSeatsModal
                    eventId={eventId}
                    seatLabels={selectedSeatLabels}
                    onClose={() => {
                        setShowBlockModal(false);
                        setSelectedSeatLabels([]);
                    }}
                    onSuccess={handleBlockSuccess}
                />
            )}

            {/* Unblock Seats Modal */}
            {showUnblockModal && selectedBlockRecord && (
                <UnblockSeatsModal
                    eventId={eventId}
                    blockedRecord={selectedBlockRecord}
                    onClose={() => {
                        setShowUnblockModal(false);
                        setSelectedBlockRecord(null);
                    }}
                    onSuccess={handleUnblockSuccess}
                />
            )}
        </div>
    );
}

