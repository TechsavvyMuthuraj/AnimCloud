"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HardDrive, Cloud, Database, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatStorage } from "@/lib/admin-utils"; // Can reuse utility or create local

export function StorageUsageWidget() {
    const [usage, setUsage] = useState<{ used: number; total: number; limit: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStorage = async () => {
            try {
                const res = await fetch("/api/drive/storage");
                const data = await res.json();

                if (!res.ok) {
                    if (data.needsGoogleAuth) {
                        setError("Connect Drive");
                    } else {
                        throw new Error(data.error);
                    }
                    return;
                }

                // If limit is 0 or undefined, it usually means unlimited (or not reported correctly for some accounts)
                // Default to 15GB (free tier) if unknown, but better to handle 'unlimited' case visually
                setUsage({
                    used: data.usage,
                    total: data.limit > 0 ? data.limit : 15 * 1024 * 1024 * 1024, // Fallback to 15GB if 0
                    limit: data.limit
                });
            } catch (err) {
                console.error("Failed to fetch storage:", err);
                setError("Failed to load");
            } finally {
                setLoading(false);
            }
        };

        fetchStorage();
    }, []);

    if (loading) return (
        <GlassCard className="p-6 flex items-center justify-center min-h-[160px]">
            <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-2 w-20 bg-slate-200 rounded"></div>
            </div>
        </GlassCard>
    );

    if (error === "Connect Drive") {
        return (
            <GlassCard className="p-6 relative overflow-hidden group">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700">Storage</h3>
                        <p className="text-xs text-slate-400">Google Drive</p>
                    </div>
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <Cloud size={20} />
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center py-2 text-center">
                    <p className="text-sm text-slate-500 mb-2">Connect Google Drive to see storage usage</p>
                </div>
            </GlassCard>
        );
    }

    if (!usage) return null;

    const percentage = Math.min(100, (usage.used / usage.total) * 100);
    const isUnlimited = usage.limit === 0; // Check if limit reported as 0 (often enterprise/unlimited)

    // Helper for formatting bytes (local version if import fails or to keep self-contained)
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <GlassCard className={`p-6 relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${percentage > 80 ? "border-red-200 shadow-red-100" : ""}`}>
            {/* Background Gradient Animation */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${percentage > 80 ? "from-red-50/50 to-orange-50/50" : "from-pink-50/50 to-violet-50/50"}`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700">Storage Usage</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Cloud size={10} /> Google Drive System
                        </p>
                    </div>
                    <div className={`p-2 rounded-xl transition-colors duration-300 ${percentage > 80 ? "bg-red-100 text-red-500 animate-pulse" : percentage > 60 ? "bg-orange-100 text-orange-500" : "bg-violet-100 text-violet-500"}`}>
                        <HardDrive size={20} />
                    </div>
                </div>

                <div className="mb-2 flex items-end justify-between">
                    <span className="text-2xl font-bold text-slate-800">
                        {formatBytes(usage.used)}
                    </span>
                    <div className="text-right">
                        <span className="text-sm font-medium text-slate-500 block">
                            of {isUnlimited ? "Unlimited" : formatBytes(usage.total)}
                        </span>
                        {percentage > 80 && (
                            <span className="text-xs font-bold text-red-500 flex items-center gap-1 justify-end animate-bounce">
                                <AlertCircle size={10} /> Almost Full
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isUnlimited ? "10%" : `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full rounded-full relative overflow-hidden ${percentage > 80
                            ? "bg-gradient-to-r from-red-500 to-orange-500"
                            : percentage > 60
                                ? "bg-gradient-to-r from-orange-400 to-amber-400"
                                : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                            }`}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-white/30 skew-x-12 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>

                <div className="mt-4 flex justify-between text-xs text-slate-400 font-medium">
                    <span>{percentage.toFixed(1)}% Used</span>
                    <span>{isUnlimited ? "∞ Free" : formatBytes(Math.max(0, usage.total - usage.used))} Free</span>
                </div>

                {percentage > 80 && (
                    <button className="w-full mt-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-200/50 hover:shadow-red-300/50 transition-all transform hover:scale-[1.02]">
                        ⚡ Upgrade Storage
                    </button>
                )}
            </div>
        </GlassCard>
    );
}
