"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, Music, Video, HardDrive, TrendingUp } from "lucide-react";

interface UsageStats {
    totalFiles: number;
    storageUsed: number;
    storageLimit: number;
    fileCounts: {
        images: number;
        videos: number;
        docs: number;
        audio: number;
        other: number;
    };
    monthlyUsage: number[]; // Array of usage percentages for last 6 months
}

export function UsageAnalytics() {
    const [stats, setStats] = useState<UsageStats>({
        totalFiles: 0,
        storageUsed: 0,
        storageLimit: 100,
        fileCounts: { images: 0, videos: 0, docs: 0, audio: 0, other: 0 },
        monthlyUsage: [20, 35, 45, 30, 60, 75]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch Storage Quota
                const storageRes = await fetch("/api/drive/storage");
                const storageData = await storageRes.json();

                // Fetch File List for Distribution
                const fileRes = await fetch("/api/drive/list");
                const fileData = await fileRes.json();
                const files = fileData.files || [];

                // Calculate File Counts
                // We'll use a local helper or import if possible, but for now let's reproduce the logic to be safe and self-contained
                // or dynamic import. 
                // Actually, let's use the simple logic matching the categories.
                const counts = {
                    images: 0, videos: 0, docs: 0, audio: 0, other: 0
                };

                files.forEach((file: any) => {
                    const mime = file.mimeType || '';
                    if (mime.includes('image')) counts.images++;
                    else if (mime.includes('video')) counts.videos++;
                    else if (mime.includes('audio')) counts.audio++;
                    else if (mime.includes('pdf') || mime.includes('document') || mime.includes('text') || mime.includes('spreadsheet') || mime.includes('presentation')) counts.docs++;
                    else counts.other++;
                });

                setStats(prev => ({
                    ...prev,
                    totalFiles: files.length,
                    storageUsed: storageData.usage ? parseFloat((storageData.usage / (1024 * 1024 * 1024)).toFixed(2)) : 0,
                    storageLimit: storageData.limit ? parseFloat((storageData.limit / (1024 * 1024 * 1024)).toFixed(0)) : 15, // Default to 15GB if 0/missing
                    fileCounts: counts
                }));

            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        // Generate particles only on client-side to avoid hydration mismatch
        const newParticles = [...Array(5)].map(() => ({
            initial: {
                x: Math.random() * 200,
                y: Math.random() * 100 + 50,
                scale: Math.random() * 0.5 + 0.5
            },
            animate: {
                y: -20,
                opacity: 0
            },
            transition: {
                duration: Math.random() * 2 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                repeatType: "loop" as const
            },
            style: {
                width: Math.random() * 10 + 5,
                height: Math.random() * 10 + 5,
            }
        }));
        setParticles(newParticles);
    }, []);

    const formatSize = (gb: number) => `${gb.toFixed(1)} GB`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
            {/* Total Storage Card */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/20 p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HardDrive size={80} />
                </div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Total Storage</h3>
                <div className="flex items-end gap-2">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-bold text-slate-800"
                    >
                        {stats.storageUsed}
                    </motion.span>
                    <span className="text-sm text-slate-500 mb-1">/ {stats.storageLimit} GB</span>
                </div>

                {/* Magical Progress Bar */}
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.storageUsed / stats.storageLimit) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 relative"
                    >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
            </div>

            {/* File Distribution */}
            <div className="bg-white/40 backdrop-blur-xl border border-white/20 p-6 rounded-2xl lg:col-span-2">
                <h3 className="text-sm font-medium text-slate-500 mb-4">File Distribution</h3>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <ImageIcon size={16} className="text-pink-500" />
                        <div className="flex-1 h-2 bg-pink-100/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.fileCounts.images / (stats.totalFiles || 1)) * 100}%` }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="h-full bg-pink-500"
                            />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{stats.fileCounts.images}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Video size={16} className="text-violet-500" />
                        <div className="flex-1 h-2 bg-violet-100/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.fileCounts.videos / (stats.totalFiles || 1)) * 100}%` }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="h-full bg-violet-500"
                            />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{stats.fileCounts.videos}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText size={16} className="text-blue-500" />
                        <div className="flex-1 h-2 bg-blue-100/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.fileCounts.docs / (stats.totalFiles || 1)) * 100}%` }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="h-full bg-blue-500"
                            />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{stats.fileCounts.docs}</span>
                    </div>
                </div>
            </div>

            {/* Growth Trend */}
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white p-6 rounded-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-white/80 text-sm font-medium mb-1">Growth</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold">+24%</span>
                        <TrendingUp size={20} className="text-white/80" />
                    </div>
                    <p className="text-white/60 text-xs mt-1">This month</p>
                </div>

                {/* Decorative Chart Line */}
                <svg className="absolute bottom-0 left-0 w-full h-16 opacity-30" preserveAspectRatio="none">
                    <path
                        d="M0,50 Q30,40 60,45 T120,30 T180,20 T240,10 V60 H0 Z"
                        fill="white"
                    />
                </svg>

                {/* Floating Particles Effect for specific magic feel */}
                {particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full opacity-20"
                        initial={p.initial}
                        animate={p.animate}
                        transition={p.transition}
                        style={p.style}
                    />
                ))}
            </div>
        </motion.div>
    );
}
