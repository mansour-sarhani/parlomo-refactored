'use client';

import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/common/Button';

/**
 * TagInput Component
 * 
 * An input field with an "Add" button that allows users to add tags.
 * Tags are displayed as removable chips below the input.
 * 
 * @param {object} props
 * @param {string[]} props.tags - Array of current tags
 * @param {function} props.onChange - Callback when tags change
 * @param {string} props.placeholder - Input placeholder text
 * @param {number} props.maxTags - Maximum number of tags allowed (default: 10)
 * @param {string} props.label - Optional label for the input
 * @param {string} props.helperText - Optional helper text
 */
export function TagInput({
    tags = [],
    onChange,
    placeholder = "Enter tag",
    maxTags = 10,
    label,
    helperText
}) {
    const [inputValue, setInputValue] = useState('');

    const handleAddTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
            onChange([...tags, trimmed]);
            setInputValue('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label
                    className="block text-sm font-medium"
                    style={{ color: 'var(--color-text-primary)' }}
                >
                    {label}
                </label>
            )}

            {/* Input with Add Button */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2 rounded border"
                    style={{
                        backgroundColor: 'var(--color-surface-primary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                    }}
                />
                <Button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!inputValue.trim() || tags.length >= maxTags}
                    icon={<Plus className="w-4 h-4" />}
                    size="sm"
                >
                    Add
                </Button>
            </div>

            {helperText && (
                <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    {helperText}
                </p>
            )}

            {/* Tag Chips */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:shadow-sm"
                            style={{
                                backgroundColor: 'var(--color-primary-light)',
                                color: 'var(--color-primary)',
                            }}
                        >
                            <span>{tag}</span>
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:opacity-70 transition-opacity"
                                aria-label={`Remove ${tag}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {tags.length >= maxTags && (
                <p
                    className="text-xs font-medium"
                    style={{ color: 'var(--color-warning)' }}
                >
                    Maximum {maxTags} tags allowed
                </p>
            )}
        </div>
    );
}
