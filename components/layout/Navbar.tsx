"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Bell, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { getUserTypeDisplay } from "@/lib/plan-utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { NotificationPanel } from "@/components/ui/NotificationPanel";

import { useNotification } from "@/components/providers/NotificationContext";

export function Navbar() {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addToast } = useToast();
    const { user } = useUser();

    // Use global notification context
    const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotification();

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="h-20 w-full flex items-center justify-between px-6 md:px-10 glass border-b border-white/20 sticky top-0 z-40 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl"
            >
                {/* Mobile menu trigger */}
                <div className="md:hidden p-2 glass rounded-lg text-pink-600">
                    <Menu size={24} />
                </div>

                {/* Search Bar - Animated */}
                <motion.div
                    layout
                    className={cn(
                        "hidden md:flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
                        isSearchFocused
                            ? "w-[500px] bg-white dark:bg-slate-800 shadow-lg border-pink-300 ring-2 ring-pink-100 dark:ring-pink-900"
                            : "w-96 bg-white/40 dark:bg-slate-800/40 border-white/20 hover:bg-white/60 dark:hover:bg-slate-800/60"
                    )}
                >
                    <Search size={20} className={cn("transition-colors", isSearchFocused ? "text-pink-500" : "text-slate-400")} />
                    <input
                        type="text"
                        placeholder="Search your magical files..."
                        className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700 dark:text-slate-200 font-medium"
                        defaultValue={searchParams.get('search')?.toString()}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            if (e.target.value) {
                                params.set('search', e.target.value);
                            } else {
                                params.delete('search');
                            }
                            router.replace(`?${params.toString()}`);
                        }}
                    />
                    {isSearchFocused && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs text-pink-400 font-semibold px-2 py-1 bg-pink-50 dark:bg-pink-900/30 rounded-md border border-pink-100 dark:border-pink-900/50"
                        >
                            ESC
                        </motion.span>
                    )}
                </motion.div>

                <div className="flex items-center gap-6 ml-auto">
                    <ThemeToggle />

                    {/* Notification Bell */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowNotifications(true)}
                            className="p-3 rounded-full hover:bg-white/50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 relative transition-colors group"
                        >
                            <Bell size={22} className={cn("group-hover:text-pink-500 transition-colors")} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-white dark:border-slate-900" />
                            )}
                        </motion.button>
                    </div>

                    <div className="flex items-center gap-3 pl-6 border-l border-white/20 dark:border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Welcome Back!</p>
                            <p className="text-xs text-pink-500 font-medium">{getUserTypeDisplay(user?.publicMetadata?.plan as string)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-violet-500 p-[2px] rounded-full shadow-lg shadow-pink-500/20">
                            <div className="bg-white dark:bg-slate-900 rounded-full p-[2px]">
                                <UserButton />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notifications}
                onMarkAllRead={markAllAsRead}
                onMarkRead={markAsRead}
            />
        </>
    );
}
