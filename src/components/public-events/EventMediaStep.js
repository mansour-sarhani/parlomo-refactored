"use client";

import { ImageUploader } from "@/components/forms/ImageUploader";
import { Video } from "lucide-react";

export function EventMediaStep({ formData, errors, onChange }) {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg mb-6" style={{ backgroundColor: "var(--color-surface-secondary)" }}>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Add images and video to make your event stand out. High-quality visuals help attract more attendees.
                </p>
            </div>

            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Cover Image
                </label>
                <ImageUploader
                    value={formData.coverImage}
                    onChange={(file) => onChange("coverImage", file)}
                    multiple={false}
                    helpText="Recommended size: 1200x600px (2:1 ratio). This will be the main image for your event."
                />
                {errors.coverImage && (
                    <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>
                        {errors.coverImage}
                    </p>
                )}
            </div>

            {/* Gallery Images */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    Gallery Images (Optional)
                </label>
                <ImageUploader
                    value={formData.galleryImages}
                    onChange={(files) => onChange("galleryImages", files)}
                    multiple={true}
                    maxFiles={5}
                    helpText="Upload up to 5 additional images to showcase your event. These will appear in the event gallery."
                />
            </div>

            {/* Video Link */}
            <div>
                <label htmlFor="videoUrl" className="flex items-center gap-2 text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                    <Video className="w-4 h-4" />
                    Video Link (Optional)
                </label>
                <input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl || ""}
                    onChange={(e) => onChange("videoUrl", e.target.value || null)}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.videoUrl ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Add a YouTube, Vimeo, or other video platform URL to give attendees a preview of your event
                </p>
                {errors.videoUrl && (
                    <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>
                        {errors.videoUrl}
                    </p>
                )}
            </div>
        </div>
    );
}
