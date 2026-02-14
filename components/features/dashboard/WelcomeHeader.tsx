"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function WelcomeHeader() {
    const { user, isLoaded } = useUser();
    const [fileCount, setFileCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchFileCount = async () => {
            try {
                const res = await fetch("/api/drive/list");
                const data = await res.json();
                if (res.ok && data.files) {
                    setFileCount(data.files.length);
                }
            } catch (error) {
                console.error("Failed to fetch file count", error);
            }
        };

        fetchFileCount();
    }, []);

    return (
        <div className="flex justify-between items-end px-6 mb-4 relative z-10">
            <div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-slate-800 flex items-center gap-2"
                >
                    Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">{isLoaded ? user?.firstName || 'Wizard' : '...'}</span> 👋
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 mt-1 flex items-center gap-2"
                >
                    {fileCount !== null ? (
                        <>You have <span className="font-bold text-pink-500">{fileCount}</span> magical files stored.</>
                    ) : (
                        "Loading your magical vault..."
                    )}
                    <Sparkles size={14} className="text-yellow-400" />
                </motion.p>
            </div>
            <button className="text-sm font-medium text-pink-500 flex items-center gap-1 hover:underline transition-all hover:translate-x-1">
                View Policy <ArrowUpRight size={14} />
            </button>
        </div>
    );
}
