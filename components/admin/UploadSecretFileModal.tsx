"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, File, Lock, AlertCircle } from "lucide-react";
import { ExpirySelector } from "@/components/ui/ExpirySelector";

interface UploadSecretFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (file: File, description: string) => void;
}

export function UploadSecretFileModal({ isOpen, onClose, onUpload }: UploadSecretFileModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [description, setDescription] = useState("");
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        // Validate file size (max 100MB for admin files)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            setError("File size exceeds 100MB limit");
            return;
        }

        setSelectedFile(file);
        setError("");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setError("Please select a file");
            return;
        }

        if (!description.trim()) {
            setError("Please provide a description");
            return;
        }

        setIsUploading(true);

        try {
            await onUpload(selectedFile, description.trim());

            // Reset form
            setSelectedFile(null);
            setDescription("");
            setExpiryDate(null);
            setError("");
            onClose();
        } catch (err: any) {
            setError(err.message || "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-rose-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Upload Secret File</h2>
                                    <p className="text-sm text-white/80">Admin-only secure file storage</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Security Warning */}
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-semibold text-red-800 text-sm">Restricted Access</h4>
                                <p className="text-xs text-red-600 mt-1">
                                    Files uploaded here are only accessible to administrators. All access is logged.
                                </p>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Select File
                            </label>
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                                    ? 'border-red-500 bg-red-50'
                                    : selectedFile
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-red-50/50'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileSelect(file);
                                    }}
                                    className="hidden"
                                />

                                {selectedFile ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <File className="text-green-600" size={32} />
                                        <div className="text-left">
                                            <p className="font-semibold text-slate-800">{selectedFile.name}</p>
                                            <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Upload className="mx-auto text-slate-400" size={48} />
                                        <p className="text-slate-600 font-medium">
                                            Drop file here or click to browse
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Maximum file size: 100MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this file..."
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            />
                        </div>

                        {/* Expiry Selector */}
                        <div>
                            <ExpirySelector
                                value={expiryDate}
                                onChange={setExpiryDate}
                                showNeverOption={true}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="text-red-500" size={16} />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isUploading}
                                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading || !selectedFile}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </span>
                                ) : (
                                    'Upload File'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
