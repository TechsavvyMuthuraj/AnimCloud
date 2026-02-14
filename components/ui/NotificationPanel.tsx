"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Check, Clock, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

import { Notification } from "@/components/providers/NotificationContext";

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAllRead: () => void;
    onMarkRead: (id: number) => void;
}

export function NotificationPanel({ isOpen, onClose, notifications, onMarkAllRead, onMarkRead }: NotificationPanelProps) {
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <Check size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error': return <AlertTriangle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const getBgColor = (type: string) => {
        switch (type) {
            case 'success': return "bg-green-100 dark:bg-green-900/30";
            case 'warning': return "bg-amber-100 dark:bg-amber-900/30";
            case 'error': return "bg-red-100 dark:bg-red-900/30";
            default: return "bg-blue-100 dark:bg-blue-900/30";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-50 border-l border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Bell className="text-slate-600 dark:text-slate-300" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white dark:border-slate-900" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Notifications</h2>
                                        <p className="text-xs text-slate-400">You have {unreadCount} unread messages</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group relative overflow-hidden",
                                                n.read
                                                    ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-70"
                                                    : "bg-white dark:bg-slate-800 border-pink-100 dark:border-pink-900/30 shadow-sm"
                                            )}
                                            onClick={() => onMarkRead(n.id)}
                                        >
                                            {!n.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-violet-500" />
                                            )}

                                            <div className="flex gap-4">
                                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", getBgColor(n.type))}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className={cn("text-sm font-semibold mb-1", n.read ? "text-slate-600 dark:text-slate-400" : "text-slate-800 dark:text-slate-200")}>
                                                        {n.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                        {n.text}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                                        <Clock size={10} />
                                                        {n.time}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-8">
                                        <Bell size={48} className="mb-4 opacity-20" />
                                        <p>All caught up! No new notifications.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                                <button
                                    onClick={onMarkAllRead}
                                    className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                >
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
