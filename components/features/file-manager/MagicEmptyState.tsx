"use client";

import { motion } from "framer-motion";
import { UploadCloud, Sparkles } from "lucide-react";

interface MagicEmptyStateProps {
    onUploadClick?: () => void;
}

export function MagicEmptyState({ onUploadClick }: MagicEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-8"
            >
                <div className="absolute inset-0 bg-pink-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                <div className="relative bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-full shadow-xl">
                    <UploadCloud size={64} className="text-pink-500" />
                    <motion.div
                        animate={{
                            rotate: [0, 15, -15, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatDelay: 2
                        }}
                        className="absolute -top-2 -right-2 text-yellow-400"
                    >
                        <Sparkles size={32} fill="currentColor" />
                    </motion.div>
                </div>
            </motion.div>

            <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600 mb-2"
            >
                Your magical vault is empty
            </motion.h3>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 max-w-sm mb-8"
            >
                Ready to make some magic? Upload your first file to start your journey.
            </motion.p>

            {onUploadClick && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: 0.4 }}
                    onClick={onUploadClick}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-bold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 transition-all flex items-center gap-2"
                >
                    <UploadCloud size={20} />
                    Upload Files
                </motion.button>
            )}
        </div>
    );
}
