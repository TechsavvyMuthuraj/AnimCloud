import { motion } from "framer-motion";
import { ShieldAlert, X, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface SystemLockdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function SystemLockdownModal({ isOpen, onClose, onConfirm }: SystemLockdownModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md"
            >
                <GlassCard className="border-red-500/30 shadow-2xl shadow-red-500/10">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-red-100/50 rounded-lg text-red-600">
                                <ShieldAlert size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-red-600">System Lockdown</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex gap-3">
                            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-red-700">Warning: Critical Action</p>
                                <p className="text-xs text-red-600">
                                    Initiating a system lockdown will immediately suspend all user access, disable file uploads, and terminate active sessions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 hover:bg-slate-100 rounded-lg text-slate-600 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg font-semibold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                        >
                            <ShieldAlert size={18} />
                            Confirm Lockdown
                        </button>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
