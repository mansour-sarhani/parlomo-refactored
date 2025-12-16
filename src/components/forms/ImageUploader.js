'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';

/**
 * ImageUploader Component
 *
 * A standalone image uploader with drag-and-drop support.
 * Stores File objects directly for form submission as multipart/form-data.
 *
 * @param {object} props
 * @param {File|File[]|null} props.value - Current file(s)
 * @param {function} props.onChange - Callback when files change
 * @param {boolean} props.multiple - Allow multiple files (default: false)
 * @param {number} props.maxFiles - Maximum number of files (default: 1)
 * @param {string} props.helpText - Helper text below the field
 */
export function ImageUploader({
    value,
    onChange,
    multiple = false,
    maxFiles = 1,
    helpText
}) {
    const [dragError, setDragError] = useState(null);

    // Normalize value to array for consistent handling
    const files = multiple
        ? (Array.isArray(value) ? value : (value ? [value] : []))
        : (value ? [value] : []);

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const error = rejectedFiles[0].errors[0];
            setDragError(error.message || 'File not accepted');
            return;
        }

        if (acceptedFiles.length === 0) return;

        setDragError(null);

        // Store File objects directly
        if (multiple) {
            const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
            onChange(newFiles);
        } else {
            onChange(acceptedFiles[0]);
        }
    }, [files, multiple, maxFiles, onChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple,
    });

    const removeFile = (indexToRemove) => {
        if (multiple) {
            const newFiles = files.filter((_, index) => index !== indexToRemove);
            onChange(newFiles.length > 0 ? newFiles : null);
        } else {
            onChange(null);
        }
    };

    // Check if file is an image
    const isImage = (file) => {
        if (!file) return false;
        if (file instanceof File) {
            return file.type && file.type.startsWith('image/');
        }
        if (typeof file === 'string') {
            return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(file) || file.startsWith('data:image/');
        }
        return false;
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Render file preview
    const renderFilePreview = (file, index) => {
        const fileURL = file instanceof File ? URL.createObjectURL(file) : file;
        const fileName = file instanceof File ? file.name : 'Uploaded file';
        const fileSize = file instanceof File ? file.size : null;

        return (
            <div
                key={index}
                className="relative group rounded-lg border p-3 flex items-center gap-3 transition-all"
                style={{
                    backgroundColor: 'var(--color-background-elevated)',
                    borderColor: 'var(--color-border)',
                }}
            >
                {/* Preview thumbnail */}
                {isImage(file) ? (
                    <img
                        src={fileURL}
                        alt={fileName}
                        className="w-16 h-16 rounded object-cover"
                    />
                ) : (
                    <div
                        className="w-16 h-16 rounded flex items-center justify-center"
                        style={{
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-secondary)',
                        }}
                    >
                        <ImageIcon className="w-8 h-8" />
                    </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                    <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        {fileName}
                    </p>
                    {fileSize && (
                        <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {formatFileSize(fileSize)}
                        </p>
                    )}
                </div>

                {/* Remove button */}
                <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                        backgroundColor: 'var(--color-error)',
                        color: '#ffffff',
                    }}
                    aria-label="Remove file"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-3">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    relative rounded-lg border-2 border-dashed p-6
                    transition-all duration-200 cursor-pointer
                    ${isDragActive ? 'scale-[1.02]' : 'scale-100'}
                    hover:border-opacity-70
                `}
                style={{
                    backgroundColor: isDragActive
                        ? 'var(--color-primary-light)'
                        : 'var(--color-background)',
                    borderColor: isDragActive
                        ? 'var(--color-primary)'
                        : 'var(--color-border)',
                }}
            >
                <input {...getInputProps()} />

                {/* Upload prompt */}
                {files.length === 0 && (
                    <div className="text-center">
                        <div
                            className="mx-auto w-12 h-12 mb-3 rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: 'var(--color-background-elevated)',
                                color: 'var(--color-primary)',
                            }}
                        >
                            {isDragActive ? (
                                <Upload className="w-6 h-6 animate-bounce" />
                            ) : (
                                <ImageIcon className="w-6 h-6" />
                            )}
                        </div>

                        <p
                            className="text-sm font-medium mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            {isDragActive ? (
                                'Drop the file here'
                            ) : (
                                <>
                                    <span style={{ color: 'var(--color-primary)' }}>
                                        Click to upload
                                    </span>
                                    {' or drag and drop'}
                                </>
                            )}
                        </p>

                        <p
                            className="text-xs"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            PNG, JPG, GIF, WebP up to 5MB
                        </p>
                    </div>
                )}

                {/* File previews */}
                {files.length > 0 && (
                    <div className="space-y-2">
                        {files.map((file, index) => renderFilePreview(file, index))}
                    </div>
                )}
            </div>

            {/* Error message */}
            {dragError && (
                <p
                    className="text-sm font-medium"
                    style={{ color: 'var(--color-error)' }}
                >
                    {dragError}
                </p>
            )}

            {/* Helper text */}
            {helpText && (
                <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    {helpText}
                </p>
            )}

            {multiple && files.length > 0 && files.length < maxFiles && (
                <p
                    className="text-xs"
                    style={{ color: 'var(--color-text-tertiary)' }}
                >
                    You can upload {maxFiles - files.length} more {maxFiles - files.length === 1 ? 'image' : 'images'}
                </p>
            )}
        </div>
    );
}
