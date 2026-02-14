"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, FileText, Star, Settings, ShieldCheck, Cloud, HardDrive, Film, Music, Gamepad2, Laptop, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", color: "text-sky-500" },
    { icon: FileText, label: "My Files", href: "/dashboard/files", color: "text-pink-500" },
    { icon: Star, label: "Favorites", href: "/dashboard/favorites", color: "text-amber-500" },
    { icon: Cloud, label: "Cloud Upload", href: "/dashboard/upload", color: "text-violet-500" },
    { icon: ShieldCheck, label: "Admin Panel", href: "/admin", color: "text-rose-600" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings", color: "text-slate-500" },
];

const magicHubItems = [
    { icon: Film, label: "Movies", href: "https://net22.cc/home", color: "text-rose-500" },
    { icon: Music, label: "Music", href: "https://muffon.netlify.app/", color: "text-violet-500" },
    { icon: Gamepad2, label: "Games", href: "https://steamrip.com/", color: "text-emerald-500" },
    { icon: Laptop, label: "PC Tools", href: "https://getintopc.com/", color: "text-blue-500" },
    { icon: Zap, label: "Optimization", href: "https://discord.gg/vwMQscMZrY", color: "text-amber-500" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const plan = (user?.publicMetadata?.plan as string) || "novice";

    return (
        <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-white/20 z-50 p-4"
        >
            <div className="flex items-center gap-2 px-2 py-6 mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2 rounded-xl text-white shadow-lg shadow-pink-500/20">
                    <Cloud size={24} fill="currentColor" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-rose-600 to-violet-600">
                    AnimDrive
                </h1>
            </div>

            <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {sidebarItems
                    .filter((item) => {
                        // Hide Admin Panel for non-admin users
                        if (item.href === "/admin") {
                            return user?.publicMetadata?.role === "admin";
                        }
                        return true;
                    })
                    .map((item) => (
                        <Link key={item.href} href={item.href}>
                            <span className={cn(
                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                pathname === item.href
                                    ? "bg-white/50 text-pink-700 shadow-sm"
                                    : "hover:bg-white/30 text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400"
                            )}>
                                {pathname === item.href && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white/40 border-l-4 border-pink-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                                <item.icon className={cn("relative z-10 transition-transform group-hover:scale-110", item.color)} size={18} />
                                <span className="relative z-10 font-medium text-sm">{item.label}</span>
                            </span>
                        </Link>
                    ))}

                <div className="mt-6 mb-2 px-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-4" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={10} className="text-yellow-400" /> Magic Hub
                    </p>
                </div>

                {magicHubItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                        <span className={cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                            pathname === item.href
                                ? "bg-white/50 text-pink-700 shadow-sm"
                                : "hover:bg-white/30 text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400"
                        )}>
                            {pathname === item.href && (
                                <motion.div
                                    layoutId="activeTabHub"
                                    className="absolute inset-0 bg-white/40 border-l-4 border-violet-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <item.icon className={cn("relative z-10 transition-transform group-hover:scale-110", item.color)} size={18} />
                            <span className="relative z-10 font-medium text-sm">{item.label}</span>
                        </span>
                    </Link>
                ))}
            </nav>

            {/* Storage Usage Widget */}
            <div className="mt-auto p-4 glass rounded-2xl bg-white/40 border border-white/30">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <HardDrive size={12} /> Storage
                    </span>
                    <span className="text-xs font-semibold text-pink-600">
                        {plan === "sorcerer" ? "Unlimited" : "75%"}
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: plan === "sorcerer" ? "100%" : "75%" }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        className={cn(
                            "h-full shadow-[0_0_10px_rgba(236,72,153,0.5)]",
                            plan === "sorcerer"
                                ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                : "bg-gradient-to-r from-pink-500 to-violet-500"
                        )}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    {plan === "sorcerer" ? "Infinite Space" : plan === "wizard" ? "1.5 TB of 2 TB used" : "1.5 GB of 2 GB used"}
                </p>

                {plan !== "sorcerer" && (
                    <Link href="/dashboard/plans">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            Upgrade Plan
                        </motion.button>
                    </Link>
                )}
            </div>
        </motion.aside>
    );
}
