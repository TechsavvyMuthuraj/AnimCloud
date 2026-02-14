"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { FileText, MoreVertical, Share2, Download, Trash2, Image as ImageIcon, Music, Video, ExternalLink, Loader2, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { useSearchParams } from "next/navigation";
import { FileCategory, FILE_CATEGORIES, filterFilesByCategory, getFileCounts, getFileIcon } from "@/lib/file-categories";
import { MagicEmptyState } from "./MagicEmptyState";
import { FilePreviewModal } from "./FilePreviewModal";

interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    webViewLink?: string;
    createdTime?: string;
    isFavorite?: boolean;
    expiryDate?: string; // ISO timestamp
    expiryDuration?: {
        value: number;
        unit: 'hours' | 'days';
    };
}

const getFileGradient = (mimeType: string) => {
    if (mimeType.includes('image')) return "bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600";
    if (mimeType.includes('video')) return "bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600";
    if (mimeType.includes('audio')) return "bg-gradient-to-br from-indigo-100 to-blue-100 text-indigo-600";
    if (mimeType.includes('pdf')) return "bg-gradient-to-br from-red-100 to-orange-100 text-red-600";
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-600";
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return "bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600";
    if (mimeType.includes('word') || mimeType.includes('document')) return "bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600";
    return "bg-gradient-to-br from-slate-100 to-gray-200 text-slate-600";
};

const getIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return <ImageIcon />;
    if (mimeType.includes('video')) return <Video />;
    if (mimeType.includes('audio')) return <Music />;
    if (mimeType.includes('pdf')) return <FileText />;
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return <FileText />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileText />;
    return <FileText />;
};

const formatSize = (bytes?: string) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(parseInt(bytes)) / Math.log(k));
    return parseFloat((parseInt(bytes) / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: "Unknown", time: "", full: "Unknown" };
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        full: date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
};

const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return '';
};

const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;

    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs < 0) {
        return { status: 'expired', text: 'Expired', color: 'bg-red-100 text-red-700' };
    }

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays > 7) {
        return { status: 'safe', text: `Expires in ${diffDays} days`, color: 'bg-green-100 text-green-700' };
    } else if (diffDays > 1) {
        return { status: 'warning', text: `Expires in ${diffDays} days`, color: 'bg-yellow-100 text-yellow-700' };
    } else if (diffHours > 1) {
        return { status: 'urgent', text: `Expires in ${diffHours} hours`, color: 'bg-orange-100 text-orange-700' };
    } else if (diffMins > 0) {
        return { status: 'critical', text: `Expires in ${diffMins} min${diffMins > 1 ? 's' : ''}`, color: 'bg-red-100 text-red-700' };
    }

    return { status: 'expired', text: 'Expiring soon', color: 'bg-red-100 text-red-700' };
};

import { useNotification } from "@/components/providers/NotificationContext";

export function FileGrid({ showOnlyFavorites = false }: { showOnlyFavorites?: boolean }) {
    const searchParams = useSearchParams();
    const search = searchParams.get('search')?.toLowerCase() || '';
    const { addToast } = useToast();
    const { addNotification } = useNotification();
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [needsGoogleAuth, setNeedsGoogleAuth] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [activeCategory, setActiveCategory] = useState<FileCategory | 'all'>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            setFavorites(new Set(JSON.parse(savedFavorites)));
        }
    }, []);

    const fetchFiles = async () => {
        try {
            const res = await fetch("/api/drive/list");
            const data = await res.json();

            if (!res.ok) {
                // Check if it's an OAuth connection issue
                if (res.status === 403 && data.needsGoogleAuth) {
                    setNeedsGoogleAuth(true);
                    addToast("Please connect your Google account in Settings to access Drive files", "error");
                    setFiles([]);
                    return;
                }
                throw new Error(data.error || "Failed to fetch files");
            }

            setNeedsGoogleAuth(false);

            setFiles(data.files || []);
        } catch (error: any) {
            console.error("Fetch files error:", error);
            addToast(error.message || "Failed to load files from Drive", "error");
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(search);
        const isFavorite = favorites.has(file.id);

        if (showOnlyFavorites) {
            return matchesSearch && isFavorite;
        }
        return matchesSearch;
    });

    const toggleFavorite = (fileId: string) => {
        const newFavorites = new Set(favorites);
        const file = files.find(f => f.id === fileId);
        if (newFavorites.has(fileId)) {
            newFavorites.delete(fileId);
            addToast("Removed from favorites", "success");
        } else {
            newFavorites.add(fileId);
            addToast("Added to favorites ⭐", "success");
            if (file) addNotification("Added to Favorites", `"${file.name}" is now in your favorites.`, "success");
        }
        setFavorites(newFavorites);
        localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
    };

    const handleAction = (action: string, file: DriveFile) => {
        switch (action) {
            case 'preview':
                setPreviewFile(file);
                break;
            case 'share':
                if (file.webViewLink) {
                    navigator.clipboard.writeText(file.webViewLink);
                    addToast(`Link copied to clipboard!`, "success");
                    addNotification("Link Copied", `Link for "${file.name}" copied to clipboard.`, "info");
                }
                break;
            case 'open':
                if (file.webViewLink) window.open(file.webViewLink, "_blank");
                break;
            case 'download':
                if (file.webViewLink) {
                    // Drive doesn't give direct download links easily without API key in some cases, 
                    // but webViewLink usually allows download or preview.
                    // For better download, we might need webContentLink if available (add to API fields if needed).
                    window.open(file.webViewLink, "_blank");
                }
                break;
            case 'delete':
                handleDelete(file);
                break;
        }
    };

    const handleDelete = async (file: DriveFile) => {
        if (!confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeletingId(file.id);
        try {
            const res = await fetch('/api/drive/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId: file.id }),
            });

            if (!res.ok) throw new Error('Failed to delete file');

            setFiles(files.filter(f => f.id !== file.id));
            addToast(`Deleted "${file.name}"`, "success");
            addNotification("File Moved to Trash", `"${file.name}" has been moved to trash.`, "warning");

            // Wait a moment for deletion to propagate then refresh
            setTimeout(fetchFiles, 1000);
        } catch (error) {
            console.error('Delete error:', error);
            addToast("Failed to delete file", "error");
            addNotification("Deletion Failed", `Could not delete "${file.name}".`, "error");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 text-slate-400">
                <Loader2 className="animate-spin mr-2" /> Loading your magical files...
            </div>
        );
    }

    if (needsGoogleAuth) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="glass p-8 rounded-2xl max-w-md text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExternalLink className="text-pink-500" size={32} />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Connect Your Google Account
                    </h3>

                    <p className="text-slate-600 mb-6">
                        To access and manage your files, you need to sign in with Google and grant Drive permissions.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.href = '/api/auth/signin'}
                            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            Sign in with Google
                        </button>

                        <p className="text-xs text-slate-500">
                            You'll be redirected to Google to grant Drive access
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Filter files by category and search
    const filteredByCategory = filterFilesByCategory(filteredFiles, activeCategory);
    const fileCounts = getFileCounts(filteredFiles);

    return (
        <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeCategory === 'all'
                        ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg'
                        : 'glass hover:bg-white/70'
                        }`}
                >
                    All <span className="ml-1 text-xs opacity-75">({fileCounts.all})</span>
                </button>
                {Object.entries(FILE_CATEGORIES).filter(([key]) => key !== 'other').map(([key, config]) => (
                    <button
                        key={key}
                        onClick={() => setActiveCategory(key as FileCategory)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${activeCategory === key
                            ? `${config.bgColor} ${config.color} shadow-md`
                            : 'glass hover:bg-white/70'
                            }`}
                    >
                        <span>{config.icon}</span>
                        {config.label}
                        <span className="ml-1 text-xs opacity-75">({fileCounts[key as FileCategory]})</span>
                    </button>
                ))}
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredByCategory.length > 0 ? (
                    filteredByCategory.map((file, i) => (
                        <GlassCard
                            key={file.id}
                            className="relative group cursor-pointer hover:ring-2 ring-pink-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleAction('preview', file)}
                        >

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110 ${getFileGradient(file.mimeType)}`}>
                                    {getIcon(file.mimeType)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Favorite Star Icon */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(file.id);
                                        }}
                                        className="p-1.5 hover:bg-amber-50 rounded-full transition-colors"
                                        title={favorites.has(file.id) ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        <Star
                                            size={18}
                                            className={favorites.has(file.id) ? "text-amber-500 fill-amber-500" : "text-slate-400"}
                                        />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                                            className="p-1 hover:bg-white/50 rounded-full transition-colors opacity-60 group-hover:opacity-100"
                                        >
                                            <MoreVertical size={16} className="text-slate-500" />
                                        </button>

                                        {openMenuId === file.id && (
                                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                                                <button
                                                    onClick={() => {
                                                        handleAction('open', file);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors flex items-center gap-2"
                                                >
                                                    <ExternalLink size={14} className="text-green-600" />
                                                    <span>Open in Drive</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleAction('share', file);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Share2 size={14} className="text-pink-600" />
                                                    <span>Copy Link</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        handleAction('download', file);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Download size={14} className="text-blue-600" />
                                                    <span>Download</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        toggleFavorite(file.id);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-amber-50 transition-colors flex items-center gap-2"
                                                >
                                                    <Star
                                                        size={14}
                                                        className={favorites.has(file.id) ? "text-amber-500 fill-amber-500" : "text-amber-500"}
                                                    />
                                                    <span>{favorites.has(file.id) ? "Remove from Favorites" : "Add to Favorites"}</span>
                                                </button>
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <button
                                                    onClick={() => {
                                                        handleAction('delete', file);
                                                        setOpenMenuId(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                                                >
                                                    <Trash2 size={14} />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h3 className="font-semibold text-slate-800 truncate mb-1" title={file.name}>{file.name}</h3>

                            {/* Expiry Badge */}
                            {(() => {
                                const expiryStatus = getExpiryStatus(file.expiryDate);
                                if (expiryStatus) {
                                    return (
                                        <div className="mb-2">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${expiryStatus.color}`}>
                                                ⏰ {expiryStatus.text}
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium">{formatSize(file.size)}</p>
                                    {(() => {
                                        const dateTime = formatDateTime(file.createdTime);
                                        const relativeTime = getRelativeTime(file.createdTime);
                                        return (
                                            <div className="space-y-0.5">
                                                <p
                                                    className="text-xs text-slate-400 font-medium"
                                                    title={dateTime.full}
                                                >
                                                    📅 {dateTime.date} • {dateTime.time}
                                                </p>
                                                {relativeTime && (
                                                    <p className="text-xs text-slate-400 italic">
                                                        {relativeTime}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                                    <button
                                        onClick={() => handleAction('open', file)}
                                        className="p-1.5 hover:bg-green-100/80 rounded-full text-green-600 transition-colors shadow-sm"
                                        title="Open in Drive"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleAction('share', file)}
                                        className="p-1.5 hover:bg-pink-100/80 rounded-full text-pink-600 transition-colors shadow-sm"
                                        title="Share Link"
                                    >
                                        <Share2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleAction('delete', file)}
                                        className="p-1.5 hover:bg-red-100/80 rounded-full text-red-600 transition-colors shadow-sm disabled:opacity-50"
                                        title="Delete"
                                        disabled={deletingId === file.id}
                                    >
                                        {deletingId === file.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))
                ) : (
                    <div className="col-span-full">
                        <MagicEmptyState
                            onUploadClick={() => document.getElementById('file-upload-input')?.click()}
                        />
                    </div>
                )
                }
            </div >

            {/* File Preview Modal */}
            <FilePreviewModal
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </div>
    );
}
