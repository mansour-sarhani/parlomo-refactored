"use client";

/**
 * Ticket Scanner Page (Organizer)
 * Scan and validate tickets for organizer's events
 * Supports both camera QR scanning and manual code entry
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ScanLine, CheckCircle, XCircle, Loader2, Search,
    ChevronLeft, Calendar, Camera, CameraOff, Keyboard
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function TicketScannerPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [ticketCode, setTicketCode] = useState("");
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const [scanMode, setScanMode] = useState("camera"); // "camera" or "manual"
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    // Initialize camera scanner
    const startCamera = useCallback(async () => {
        if (typeof window === "undefined") return;

        try {
            setCameraError(null);

            // Dynamically import html5-qrcode (client-side only)
            const { Html5Qrcode } = await import("html5-qrcode");

            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop().catch(() => { });
            }

            html5QrCodeRef.current = new Html5Qrcode("qr-reader");

            await html5QrCodeRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    // Success callback - QR code scanned
                    handleQrCodeScanned(decodedText);
                },
                () => {
                    // Error callback - ignore scan errors (no QR found)
                }
            );

            setCameraActive(true);
        } catch (err) {
            console.error("Camera error:", err);
            setCameraError(
                err.name === "NotAllowedError"
                    ? "Camera access denied. Please allow camera permissions."
                    : err.name === "NotFoundError"
                        ? "No camera found on this device."
                        : "Failed to start camera. Try manual entry."
            );
            setCameraActive(false);
        }
    }, []);

    // Stop camera
    const stopCamera = useCallback(async () => {
        if (html5QrCodeRef.current) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (err) {
                // Ignore stop errors
            }
            html5QrCodeRef.current = null;
        }
        setCameraActive(false);
    }, []);

    // Handle QR code scanned
    const handleQrCodeScanned = async (decodedText) => {
        // Pause camera while processing
        await stopCamera();

        // Extract ticket code from QR payload
        let code = decodedText;

        // If it's JSON, try to extract the code
        try {
            const payload = JSON.parse(decodedText);
            code = payload.code || payload.ticketCode || decodedText;
        } catch {
            // Not JSON, use as-is
        }

        setTicketCode(code.toUpperCase());

        // Auto-scan the ticket
        await handleScanWithCode(code);
    };

    // Handle scan with specific code
    const handleScanWithCode = async (code) => {
        if (!code?.trim()) return;

        setScanning(true);
        setResult(null);

        try {
            const response = await fetch("/api/ticketing/scanner/scan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ticketCode: code.trim(),
                    organizerId: user?.id,
                }),
            });

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setResult({
                valid: false,
                error: "Network error",
                message: err.message,
            });
        } finally {
            setScanning(false);
        }
    };

    // Handle manual scan
    const handleScan = async () => {
        await handleScanWithCode(ticketCode);
    };

    // Handle check status
    const handleCheckStatus = async () => {
        if (!ticketCode.trim()) return;

        setScanning(true);
        setResult(null);

        try {
            const response = await fetch(
                `/api/ticketing/scanner/scan?code=${encodeURIComponent(ticketCode.trim())}&organizerId=${user?.id}`
            );
            const data = await response.json();
            setResult({ ...data, checkOnly: true });
        } catch (err) {
            setResult({
                found: false,
                error: "Network error",
                message: err.message,
            });
        } finally {
            setScanning(false);
        }
    };

    // Clear result and prepare for next scan
    const clearResult = () => {
        setResult(null);
        setTicketCode("");
        // Restart camera if in camera mode
        if (scanMode === "camera") {
            startCamera();
        }
    };

    // Handle mode switch
    const switchMode = (mode) => {
        setScanMode(mode);
        setResult(null);
        setTicketCode("");
        if (mode === "camera") {
            startCamera();
        } else {
            stopCamera();
        }
    };

    // Start camera on mount if in camera mode
    useEffect(() => {
        if (scanMode === "camera" && !result) {
            startCamera();
        }

        // Cleanup on unmount
        return () => {
            stopCamera();
        };
    }, []);

    // Stop camera when result is shown
    useEffect(() => {
        if (result && cameraActive) {
            stopCamera();
        }
    }, [result, cameraActive, stopCamera]);

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/panel/my-events")}
                            icon={<ChevronLeft className="w-4 h-4" />}
                        >
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Ticket Scanner
                        </h1>
                    </div>
                    <p className="text-gray-600 ml-[72px]">
                        Scan QR codes or enter ticket codes to check-in attendees
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6">
                    <Button
                        onClick={() => switchMode("camera")}
                        variant={scanMode === "camera" ? "primary" : "secondary"}
                        icon={<Camera className="w-4 h-4" />}
                    >
                        Camera Scan
                    </Button>
                    <Button
                        onClick={() => switchMode("manual")}
                        variant={scanMode === "manual" ? "primary" : "secondary"}
                        icon={<Keyboard className="w-4 h-4" />}
                    >
                        Manual Entry
                    </Button>
                </div>

                {/* Scanner Section */}
                {!result && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                        {scanMode === "camera" ? (
                            <>
                                {/* Camera Scanner */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-primary/10 rounded-full p-4">
                                        <Camera className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            QR Code Scanner
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Point your camera at the ticket QR code
                                        </p>
                                    </div>
                                </div>

                                {cameraError ? (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <CameraOff className="w-5 h-5" />
                                            <span>{cameraError}</span>
                                        </div>
                                        <Button
                                            onClick={startCamera}
                                            variant="outline"
                                            className="mt-3"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div
                                            id="qr-reader"
                                            ref={scannerRef}
                                            className="w-full max-w-md mx-auto rounded-lg overflow-hidden"
                                            style={{ minHeight: "300px" }}
                                        />
                                        {!cameraActive && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                                                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-center text-sm text-gray-500 mt-4">
                                    Or switch to manual entry to type the ticket code
                                </p>
                            </>
                        ) : (
                            <>
                                {/* Manual Entry */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="bg-primary/10 rounded-full p-4">
                                        <ScanLine className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Manual Entry
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            Enter the ticket code to validate
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ticket Code
                                        </label>
                                        <input
                                            type="text"
                                            value={ticketCode}
                                            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                                            onKeyPress={(e) => e.key === "Enter" && handleScan()}
                                            placeholder="TKT-XXXXXXXXX"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-lg"
                                            disabled={scanning}
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleScan}
                                            disabled={scanning || !ticketCode.trim()}
                                            variant="primary"
                                            className="flex-1 py-3 px-6 flex items-center justify-center gap-2 text-base"
                                        >
                                            {scanning ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Scanning...
                                                </>
                                            ) : (
                                                <>
                                                    <ScanLine className="w-5 h-5" />
                                                    Scan & Check In
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            onClick={handleCheckStatus}
                                            disabled={scanning || !ticketCode.trim()}
                                            variant="secondary"
                                            className="flex-1 py-3 px-6 flex items-center justify-center gap-2 text-base"
                                        >
                                            {scanning ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Checking...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="w-5 h-5" />
                                                    Check Status Only
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Result Display */}
                {result && (
                    <>
                        {/* Valid Ticket - Successfully checked in */}
                        {result.valid && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-green-900 mb-2">
                                            Valid Ticket - Checked In
                                        </h3>
                                        <p className="text-green-700 mb-4">
                                            {result.message}
                                        </p>

                                        {result.ticket && (
                                            <div className="bg-white rounded-lg p-4 space-y-3">
                                                {result.ticket.event && (
                                                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="font-semibold text-gray-900">
                                                            {result.ticket.event.title}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Ticket Code</p>
                                                        <p className="font-mono font-bold text-gray-900">
                                                            {result.ticket.code}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Status</p>
                                                        <p className="font-semibold text-green-600">
                                                            {result.ticket.status}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Attendee</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {result.ticket.attendeeName}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Email</p>
                                                        <p className="text-sm text-gray-700">
                                                            {result.ticket.attendeeEmail}
                                                        </p>
                                                    </div>
                                                    {result.ticket.ticketType && (
                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-600 mb-1">Ticket Type</p>
                                                            <p className="font-semibold text-gray-900">
                                                                {result.ticket.ticketType.name}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {result.ticket.usedAt && (
                                                        <div className="col-span-2">
                                                            <p className="text-xs text-gray-600 mb-1">Checked In At</p>
                                                            <p className="text-sm text-gray-700">
                                                                {new Date(result.ticket.usedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button onClick={clearResult} variant="primary" className="w-full">
                                    Scan Next Ticket
                                </Button>
                            </div>
                        )}

                        {/* Invalid Ticket */}
                        {!result.valid && !result.found && !result.checkOnly && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-red-900 mb-2">
                                            Invalid Ticket
                                        </h3>
                                        <p className="text-red-700 mb-2">
                                            {result.error}
                                        </p>
                                        {result.message && (
                                            <p className="text-red-600 text-sm">
                                                {result.message}
                                            </p>
                                        )}
                                        {result.ticket && (
                                            <div className="bg-white rounded-lg p-4 mt-4">
                                                {result.ticket.event && (
                                                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="font-semibold text-gray-900">
                                                            {result.ticket.event.title}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-xs text-gray-600 mb-2">Ticket Details:</p>
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Code:</strong> {result.ticket.code}</p>
                                                    <p><strong>Status:</strong> {result.ticket.status}</p>
                                                    {result.ticket.usedAt && (
                                                        <p><strong>Used At:</strong> {new Date(result.ticket.usedAt).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button onClick={clearResult} variant="outline" className="w-full mt-4">
                                    Try Another Ticket
                                </Button>
                            </div>
                        )}

                        {/* Status Check Result */}
                        {result.checkOnly && result.found && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
                                <div className="flex items-start gap-3">
                                    <Search className="w-8 h-8 text-blue-600 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-blue-900 mb-2">
                                            Ticket Found
                                        </h3>
                                        <p className="text-blue-700 mb-4">
                                            {result.message || "Ticket found in system (not checked in)"}
                                        </p>

                                        {result.ticket && (
                                            <div className="bg-white rounded-lg p-4 space-y-2">
                                                {result.ticket.event && (
                                                    <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="font-semibold text-gray-900">
                                                            {result.ticket.event}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Code</p>
                                                        <p className="font-mono font-bold text-gray-900">
                                                            {result.ticket.code}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Status</p>
                                                        <p className={`font-semibold ${result.ticket.status === "valid" ? "text-green-600" :
                                                                result.ticket.status === "used" ? "text-gray-600" :
                                                                    "text-red-600"
                                                            }`}>
                                                            {result.ticket.status}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600 mb-1">Attendee</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {result.ticket.attendeeName}
                                                        </p>
                                                    </div>
                                                    {result.ticket.ticketType && (
                                                        <div>
                                                            <p className="text-xs text-gray-600 mb-1">Type</p>
                                                            <p className="font-semibold text-gray-900">
                                                                {result.ticket.ticketType}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-4">
                                    {result.ticket?.status === "valid" && (
                                        <Button onClick={handleScan} variant="primary" className="flex-1">
                                            Check In This Ticket
                                        </Button>
                                    )}
                                    <Button onClick={clearResult} variant="outline" className="flex-1">
                                        Scan Another
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Status Check - Not Found */}
                        {result.checkOnly && !result.found && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-4">
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-yellow-900 mb-2">
                                            Ticket Not Found
                                        </h3>
                                        <p className="text-yellow-700">
                                            {result.message || "This ticket code was not found in your events"}
                                        </p>
                                    </div>
                                </div>
                                <Button onClick={clearResult} variant="outline" className="w-full mt-4">
                                    Try Another Code
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Tips */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Quick Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
                        <li>You can only scan tickets for events you organize</li>
                        <li>Use <strong>Camera Scan</strong> to scan QR codes from attendee tickets</li>
                        <li>Use <strong>Manual Entry</strong> if the QR code is damaged or unreadable</li>
                        <li>After a successful scan, click <strong>Scan Next Ticket</strong> to continue</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
