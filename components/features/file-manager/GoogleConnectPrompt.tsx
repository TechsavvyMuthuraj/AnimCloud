"use client";

import { motion } from "framer-motion";
import { AlertCircle, ExternalLink } from "lucide-react";
import { MagicButton } from "@/components/ui/MagicButton";

export function GoogleConnectPrompt() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6"
        >
            <div className="glass p-8 rounded-2xl max-w-md text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="text-pink-500" size={32} />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    Connect Your Google Account
                </h3>

                <p className="text-slate-600 mb-6">
                    To access and manage your files, you need to connect your Google Drive account.
                </p>

                <div className="space-y-3">
                    <MagicButton
                        onClick={() => window.location.href = '/dashboard/settings'}
                        className="w-full"
                    >
                        Go to Settings
                    </MagicButton>

                    <p className="text-xs text-slate-500">
                        In Settings, sign in with Google to grant Drive access
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
