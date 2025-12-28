"use client";

/**
 * Seating Configuration Page (Organizer)
 * Configure seating chart for seated events
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import ChartSelector from "@/components/ticketing/ChartSelector";
import CreateChartForm from "@/components/ticketing/CreateChartForm";
import ChartDesigner from "@/components/ticketing/ChartDesigner";
import CategoryMapping from "@/components/ticketing/CategoryMapping";
import { ChevronLeft, Armchair, Loader2, AlertCircle, CheckCircle, Settings } from "lucide-react";
import seatingService from "@/services/seating.service";
import publicEventsService from "@/services/public-events.service";
import { toast } from "sonner";

// Setup flow steps
const STEPS = {
    SELECT_CHART: 'select',
    CREATE_CHART: 'create',
    DESIGN_CHART: 'design',
    MAP_CATEGORIES: 'map',
    COMPLETE: 'complete',
};

export default function SeatingConfigurationPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.id;

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(STEPS.SELECT_CHART);
    const [selectedChart, setSelectedChart] = useState(null);
    const [newChartId, setNewChartId] = useState(null);
    const [assigning, setAssigning] = useState(false);

    // Fetch event data
    useEffect(() => {
        if (eventId) {
            fetchEventData();
        }
    }, [eventId]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await publicEventsService.getEventById(eventId);
            if (response.success) {
                setEvent(response.data);

                // Check if chart is already assigned
                if (response.data.venue_chart_id) {
                    setSelectedChart(response.data.venue_chart);
                    // Check if mappings exist
                    if (response.data.category_mappings?.length > 0) {
                        setCurrentStep(STEPS.COMPLETE);
                    } else {
                        setCurrentStep(STEPS.MAP_CATEGORIES);
                    }
                }
            } else {
                setError(response.message || 'Failed to load event');
            }
        } catch (err) {
            setError('Failed to load event data');
            console.error('Error fetching event:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle chart selection
    const handleChartSelect = async (chart) => {
        setSelectedChart(chart);
        setAssigning(true);

        try {
            const response = await seatingService.assignChartToEvent(eventId, chart.id);
            if (response.success) {
                toast.success('Chart assigned to event');
                setCurrentStep(STEPS.MAP_CATEGORIES);
            } else {
                toast.error(response.message || 'Failed to assign chart');
                setSelectedChart(null);
            }
        } catch (err) {
            toast.error('Failed to assign chart');
            console.error('Error assigning chart:', err);
            setSelectedChart(null);
        } finally {
            setAssigning(false);
        }
    };

    // Handle create new chart
    const handleCreateNew = () => {
        setCurrentStep(STEPS.CREATE_CHART);
    };

    // Handle chart creation
    const handleChartCreated = (chartId) => {
        setNewChartId(chartId);
        setCurrentStep(STEPS.DESIGN_CHART);
    };

    // Handle design complete
    const handleDesignComplete = useCallback(async () => {
        if (!newChartId) return;

        setAssigning(true);

        try {
            // Fetch the updated chart data
            const chartResponse = await seatingService.getChart(newChartId);
            if (chartResponse.success) {
                setSelectedChart(chartResponse.data);

                // Assign to event
                const assignResponse = await seatingService.assignChartToEvent(eventId, newChartId);
                if (assignResponse.success) {
                    toast.success('Chart designed and assigned successfully');
                    setCurrentStep(STEPS.MAP_CATEGORIES);
                } else {
                    toast.error(assignResponse.message || 'Failed to assign chart');
                }
            }
        } catch (err) {
            toast.error('Failed to complete setup');
            console.error('Error completing design:', err);
        } finally {
            setAssigning(false);
        }
    }, [newChartId, eventId]);

    // Handle mapping complete
    const handleMappingComplete = () => {
        setCurrentStep(STEPS.COMPLETE);
        toast.success('Seating configuration complete!');
    };

    // Handle back navigation within steps
    const handleBack = () => {
        switch (currentStep) {
            case STEPS.CREATE_CHART:
                setCurrentStep(STEPS.SELECT_CHART);
                break;
            case STEPS.DESIGN_CHART:
                setCurrentStep(STEPS.CREATE_CHART);
                break;
            case STEPS.MAP_CATEGORIES:
                setCurrentStep(STEPS.SELECT_CHART);
                break;
            default:
                break;
        }
    };

    // Go back to event page
    const handleGoBack = () => {
        router.push(`/panel/my-events/${eventId}`);
    };

    if (loading) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-gray-600">Loading event...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-lg mx-auto">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-red-700 font-semibold text-lg mb-2">Unable to Load Event</h2>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <div className="flex items-center justify-center gap-3">
                        <Button onClick={handleGoBack} variant="secondary">
                            Go Back
                        </Button>
                        <Button onClick={fetchEventData} variant="outline">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if event is seated
    if (event?.eventType !== 'seated' && event?.event_type !== 'seated') {
        return (
            <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-lg mx-auto">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-amber-900 font-semibold text-lg mb-2">Not a Seated Event</h2>
                    <p className="text-amber-700 text-sm mb-4">
                        This event is configured for general admission. Seating configuration is only available for seated events.
                    </p>
                    <Button onClick={handleGoBack} variant="primary">
                        Back to Event
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGoBack}
                        icon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        <Armchair className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-bold text-gray-900">Seating Configuration</h1>
                    </div>
                </div>
                <p className="text-gray-600 ml-[72px]">
                    Configure the seating chart for "{event?.title || 'Event'}"
                </p>
            </div>

            {/* Progress Indicator */}
            {currentStep !== STEPS.COMPLETE && (
                <div className="mb-6 ml-[72px]">
                    <div className="flex items-center gap-3">
                        <StepIndicator
                            number={1}
                            label="Select Chart"
                            active={currentStep === STEPS.SELECT_CHART || currentStep === STEPS.CREATE_CHART || currentStep === STEPS.DESIGN_CHART}
                            completed={currentStep === STEPS.MAP_CATEGORIES || currentStep === STEPS.COMPLETE}
                        />
                        <div className="w-8 h-0.5 bg-gray-200" />
                        <StepIndicator
                            number={2}
                            label="Map Categories"
                            active={currentStep === STEPS.MAP_CATEGORIES}
                            completed={currentStep === STEPS.COMPLETE}
                        />
                        <div className="w-8 h-0.5 bg-gray-200" />
                        <StepIndicator
                            number={3}
                            label="Complete"
                            active={currentStep === STEPS.COMPLETE}
                            completed={false}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 ml-[72px]">
                {/* Loading overlay */}
                {assigning && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                            <p className="text-gray-600">Assigning chart...</p>
                        </div>
                    </div>
                )}

                {/* Step: Select Chart */}
                {currentStep === STEPS.SELECT_CHART && (
                    <ChartSelector
                        onSelect={handleChartSelect}
                        onCreateNew={handleCreateNew}
                        selectedChartId={selectedChart?.id}
                    />
                )}

                {/* Step: Create Chart Form */}
                {currentStep === STEPS.CREATE_CHART && (
                    <CreateChartForm
                        onCreated={handleChartCreated}
                        onCancel={handleBack}
                    />
                )}

                {/* Step: Design Chart */}
                {currentStep === STEPS.DESIGN_CHART && newChartId && (
                    <ChartDesigner
                        chartId={newChartId}
                        onSave={handleDesignComplete}
                        onCancel={handleBack}
                    />
                )}

                {/* Step: Map Categories */}
                {currentStep === STEPS.MAP_CATEGORIES && selectedChart && (
                    <>
                        {/* Debug: Show if categories are empty */}
                        {(!selectedChart.categories || selectedChart.categories.length === 0) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <p className="text-amber-800 text-sm">
                                    <strong>Debug:</strong> No categories found in chart.
                                    Chart ID: {selectedChart.id},
                                    Chart Key: {selectedChart.seatsio_chart_key || selectedChart.chart_key}
                                </p>
                                <p className="text-amber-700 text-xs mt-1">
                                    Categories should be created in the seats.io designer and synced.
                                </p>
                            </div>
                        )}
                        <CategoryMapping
                            eventId={eventId}
                            categories={selectedChart.categories || []}
                            onComplete={handleMappingComplete}
                            onBack={handleBack}
                        />
                    </>
                )}

                {/* Step: Complete */}
                {currentStep === STEPS.COMPLETE && (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Seating Configuration Complete!</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Your seating chart is set up and ready. Attendees will be able to select seats when purchasing tickets.
                        </p>

                        {selectedChart && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-sm mx-auto mb-6">
                                <p className="text-sm text-gray-600 mb-1">Selected Chart</p>
                                <p className="font-semibold text-gray-900">{selectedChart.name}</p>
                                <p className="text-sm text-gray-500">{selectedChart.venue_name}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3">
                            <Button
                                onClick={() => setCurrentStep(STEPS.SELECT_CHART)}
                                variant="secondary"
                                className="gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Reconfigure
                            </Button>
                            <Button onClick={handleGoBack} variant="primary">
                                Back to Event
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * Step Indicator Component
 */
function StepIndicator({ number, label, active, completed }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    completed
                        ? 'bg-green-500 text-white'
                        : active
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-500'
                }`}
            >
                {completed ? <CheckCircle className="w-5 h-5" /> : number}
            </div>
            <span
                className={`text-sm font-medium ${
                    completed || active ? 'text-gray-900' : 'text-gray-500'
                }`}
            >
                {label}
            </span>
        </div>
    );
}
