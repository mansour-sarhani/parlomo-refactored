'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

/**
 * RichTextEditor Component
 * 
 * A rich text editor using React Quill for formatting text content.
 * Supports basic formatting: headers, bold, italic, lists, and links.
 * 
 * @param {object} props
 * @param {string} props.value - Current HTML content
 * @param {function} props.onChange - Callback when content changes
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message to display
 * @param {number} props.minHeight - Minimum editor height in pixels (default: 200)
 */
export function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Enter text...',
    error,
    minHeight = 200
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list',
        'link'
    ];

    if (!mounted) {
        return (
            <div
                className="border rounded-lg p-4"
                style={{
                    minHeight: `${minHeight}px`,
                    backgroundColor: 'var(--color-surface-primary)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <p style={{ color: 'var(--color-text-tertiary)' }}>Loading editor...</p>
            </div>
        );
    }

    return (
        <div className="rich-text-editor-wrapper">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                style={{ minHeight: `${minHeight}px` }}
            />
            {error && (
                <p
                    className="mt-1.5 text-xs font-medium"
                    style={{ color: 'var(--color-error)' }}
                >
                    {error}
                </p>
            )}

            <style jsx global>{`
                .rich-text-editor-wrapper .ql-toolbar {
                    background-color: var(--color-surface-secondary);
                    border-color: var(--color-border);
                    border-radius: 0.5rem 0.5rem 0 0;
                }
                
                .rich-text-editor-wrapper .ql-container {
                    background-color: var(--color-surface-primary);
                    border-color: var(--color-border);
                    border-radius: 0 0 0.5rem 0.5rem;
                    font-family: inherit;
                    font-size: 0.875rem;
                    min-height: ${minHeight}px;
                }
                
                .rich-text-editor-wrapper .ql-editor {
                    color: var(--color-text-primary);
                    min-height: ${minHeight}px;
                }
                
                .rich-text-editor-wrapper .ql-editor.ql-blank::before {
                    color: var(--color-text-tertiary);
                    font-style: normal;
                }
                
                .rich-text-editor-wrapper .ql-stroke {
                    stroke: var(--color-text-secondary);
                }
                
                .rich-text-editor-wrapper .ql-fill {
                    fill: var(--color-text-secondary);
                }
                
                .rich-text-editor-wrapper .ql-picker-label {
                    color: var(--color-text-secondary);
                }
                
                .rich-text-editor-wrapper .ql-toolbar button:hover,
                .rich-text-editor-wrapper .ql-toolbar button.ql-active {
                    color: var(--color-primary);
                }
                
                .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke,
                .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
                    stroke: var(--color-primary);
                }
                
                .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill,
                .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
                    fill: var(--color-primary);
                }
            `}</style>
        </div>
    );
}
