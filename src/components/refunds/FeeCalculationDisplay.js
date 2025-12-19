'use client';

import { useState } from 'react';
import { CurrencyDisplay } from './CurrencyDisplay';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * FeeCalculationDisplay Component
 *
 * Displays fee loss breakdown with expand/collapse functionality
 *
 * @param {Object} props
 * @param {Object} props.feesLost - Fee loss data
 * @param {number} props.feesLost.total_refund_amount - Total refund amount in cents
 * @param {number} props.feesLost.total_stripe_fees_lost - Stripe fees lost in cents
 * @param {number} props.feesLost.total_application_fees_lost - Application fees lost in cents
 * @param {number} props.feesLost.net_loss - Net loss in cents
 * @param {string} props.feesLost.currency - Currency code
 * @param {boolean} props.defaultExpanded - Whether to start expanded
 */
export const FeeCalculationDisplay = ({ feesLost, defaultExpanded = false }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    if (!feesLost) {
        return null;
    }

    return (
        <div className="border rounded-lg overflow-hidden">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <span className="text-sm font-medium text-gray-700">Fee Impact Analysis</span>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {expanded && (
                <div className="p-4 space-y-2 text-sm font-mono bg-white">
                    <div className="flex justify-between text-gray-600">
                        <span>Total Refund:</span>
                        <span className="font-semibold">
                            <CurrencyDisplay
                                amount={feesLost.total_refund_amount}
                                currency={feesLost.currency}
                            />
                        </span>
                    </div>

                    <div className="flex justify-between text-red-600">
                        <span>Stripe Fees Lost:</span>
                        <span className="font-semibold">
                            <CurrencyDisplay
                                amount={feesLost.total_stripe_fees_lost}
                                currency={feesLost.currency}
                            />
                        </span>
                    </div>

                    <div className="flex justify-between text-red-600">
                        <span>Platform Fees Lost:</span>
                        <span className="font-semibold">
                            <CurrencyDisplay
                                amount={feesLost.total_application_fees_lost}
                                currency={feesLost.currency}
                            />
                        </span>
                    </div>

                    <hr className="border-gray-300 my-2" />

                    <div className="flex justify-between font-bold text-red-700">
                        <span>Net Loss:</span>
                        <span className="text-base">
                            <CurrencyDisplay
                                amount={feesLost.net_loss}
                                currency={feesLost.currency}
                            />
                        </span>
                    </div>

                    {/* Percentage breakdown */}
                    <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        <div className="flex justify-between">
                            <span>Stripe Fee Rate:</span>
                            <span>
                                {((feesLost.total_stripe_fees_lost / feesLost.total_refund_amount) * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Platform Fee Rate:</span>
                            <span>
                                {((feesLost.total_application_fees_lost / feesLost.total_refund_amount) * 100).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
