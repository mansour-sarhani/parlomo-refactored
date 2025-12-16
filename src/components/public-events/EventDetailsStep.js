"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchCategories, selectCategories } from "@/features/public-events/publicEventsSlice";
import { RichTextEditor } from "@/components/forms/RichTextEditor";
import { TagInput } from "@/components/forms/TagInput";

export function EventDetailsStep({ formData, errors, onChange }) {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchCategories());
        }
    }, [dispatch, categories.length]);

    return (
        <div className="space-y-6">
            {/* Title */}
            <div>
                <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Event Title *
                </label>
                <input
                    id="title"
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="Enter event title"
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.title ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                {errors.title && (
                    <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>
                        {errors.title}
                    </p>
                )}
            </div>

            {/* Description - Rich Text Editor */}
            <div>
                <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Description *
                </label>
                <RichTextEditor
                    value={formData.description || ""}
                    onChange={(value) => onChange("description", value)}
                    placeholder="Describe your event..."
                    error={errors.description}
                    minHeight={200}
                />
            </div>

            {/* Category */}
            <div>
                <label
                    htmlFor="category"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Category *
                </label>
                <select
                    id="category"
                    value={typeof formData.category_id === 'object' ? formData.category_id?.id : (formData.category_id || "")}
                    onChange={(e) => onChange("category_id", e.target.value)}
                    className="w-full px-4 py-2 rounded border"
                    style={{
                        backgroundColor: "var(--color-surface-primary)",
                        borderColor: errors.category_id ? "var(--color-error)" : "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {errors.category_id && (
                    <p className="text-sm mt-1" style={{ color: "var(--color-error)" }}>
                        {errors.category_id}
                    </p>
                )}
            </div>

            {/* Tags - Tag Input Component */}
            <div>
                <TagInput
                    label="Tags"
                    tags={formData.tags || []}
                    onChange={(tags) => onChange("tags", tags)}
                    placeholder="Enter a tag (e.g., music, outdoor, summer)"
                    helperText="Add tags to help people find your event. Press Enter or click Add."
                    maxTags={10}
                />
            </div>
        </div>
    );
}
