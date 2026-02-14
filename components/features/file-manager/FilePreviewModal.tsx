"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ExternalLink, FileText, Music, Video, Image as ImageIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface FilePreviewModalProps {
    file: {
        id: string;
        name: string;
        mimeType: string;
        size?: string;
        webViewLink?: string;
        thumbnailLink?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function FilePreviewModal({ file, isOpen, onClose }: FilePreviewModalProps) {
    if (!file) return null;

    const isImage = file.mimeType.includes("image");
    const isVideo = file.mimeType.includes("video");
    const isAudio = file.mimeType.includes("audio");
    const isPDF = file.mimeType.includes("pdf");

    // Construct a direct view link if possible, or use webViewLink
    // For Google Drive, webViewLink often opens in a new tab viewer.
    // We might need a direct link for <img> tags.
    // Assuming thumbnailLink can be manipulated for high-res images or we use a proxy.
    // For this mock/demo, we'll use webViewLink inside an iframe for non-images if possible,
    // or just display the high-res thumbnail for images.

    // Safe thumbnail getter
    const getThumbnail = () => {
        if (!file.thumbnailLink) return null;
        // Try to get high-res, fallback to original
        return file.thumbnailLink.replace("s220", "s1200");
    };

    const renderContent = () => {
        const thumbnail = getThumbnail();

        if (isImage) {
            return (
                <div className="relative w-full h-full flex items-center justify-center bg-black/5 rounded-xl overflow-hidden min-h-[300px]">
                    {thumbnail ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={thumbnail}
                            alt={file.name}
                            className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-lg"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                // Fallback UI could be triggered here
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-10 text-slate-400">
                            <ImageIcon size={64} className="mb-4 text-slate-300" />
                            <p>Preview not available</p>
                        </div>
                    )}
                </div>
            );
        }

        if (isVideo) {
            return (
                <div className="flex flex-col items-center justify-center p-10 text-slate-500">
                    <Video size={64} className="mb-4 text-pink-500 animate-pulse" />
                    <p className="mb-4 font-medium">Video Preview</p>
                    {file.webViewLink && (
                        <div className="flex gap-3">
                            <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors shadow-lg shadow-pink-500/20"
                            >
                                Watch in Drive
                            </a>
                        </div>
                    )}
                </div>
            );
        }

        if (file.webViewLink && (isPDF || file.mimeType.includes('document') || file.mimeType.includes('presentation') || file.mimeType.includes('spreadsheet'))) {
            return (
                <iframe
                    src={file.webViewLink.replace("view?usp=drivesdk", "preview")}
                    className="w-full h-[70vh] rounded-xl border border-slate-200 bg-white"
                    title={file.name}
                />
            );
        }

        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                <FileText size={80} className="mb-6 text-slate-300" />
                <p className="text-lg font-medium text-slate-700 mb-2">{file.name}</p>
                <p className="text-sm text-slate-400 mb-6">Preview not available for this file type</p>
                {file.webViewLink && (
                    <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors"
                    >
                        Open in Google Drive
                    </a>
                )}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GlassCard className="flex flex-col overflow-hidden shadow-2xl ring-1 ring-white/20">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                                        {file.size}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={file.webViewLink || "#"}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                                        title="Open in New Tab"
                                    >
                                        <ExternalLink size={20} />
                                    </a>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-slate-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-center min-h-[300px]">
                                {renderContent()}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex justify-end">
                                <a
                                    href={file.webViewLink || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-lg font-medium shadow-lg shadow-pink-500/20 hover:shadow-pink-500/30 transition-shadow flex items-center gap-2"
                                >
                                    <Download size={16} /> Download / Open
                                </a>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
