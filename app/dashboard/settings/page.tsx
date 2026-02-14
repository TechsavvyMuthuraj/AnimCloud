"use client";

import { useUser, UserProfile } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Bell, Shield, HardDrive, LogOut, Smartphone, Mail, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { MagicButton } from "@/components/ui/MagicButton";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { BackButton } from "@/components/ui/BackButton";

export default function SettingsPage() {
    const { user, isLoaded } = useUser();
    const { addToast } = useToast();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showUserProfile, setShowUserProfile] = useState(false);

    if (!isLoaded) return <div className="p-10 text-center">Loading settings...</div>;

    const plan = (user?.publicMetadata?.plan as string) || "novice";
    const isSorcerer = plan === "sorcerer";

    const handleSavePreferences = () => {
        addToast("Preferences saved successfully!", "success");
    };

    const handleManageAccount = () => {
        // Open Clerk's account management
        window.open('https://accounts.clerk.com/user', '_blank');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
                <BackButton href="/dashboard" />
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                        <Shield className="text-pink-500" size={20} /> Profile & Account
                    </h2>
                    <div className="glass p-6 rounded-2xl flex items-center gap-6">
                        <img
                            src={user?.imageUrl}
                            alt="Profile"
                            className="w-20 h-20 rounded-full border-4 border-white shadow-md"
                        />
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{user?.fullName}</h3>
                            <p className="text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
                            <span className={cn(
                                "inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                                isSorcerer ? "bg-amber-100 text-amber-600" : "bg-pink-100 text-pink-600"
                            )}>
                                {plan} Plan
                            </span>
                        </div>
                        <div className="ml-auto">
                            <MagicButton variant="secondary" onClick={handleManageAccount}>
                                Manage Account
                            </MagicButton>
                        </div>
                    </div>
                </section>

                {/* Storage Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                        <HardDrive className="text-violet-500" size={20} /> Storage Usage
                    </h2>
                    <div className="glass p-6 rounded-2xl space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-black text-slate-800">
                                    {isSorcerer ? "Unlimited" : "1.5 GB"}
                                    <span className="text-sm font-normal text-slate-400 ml-2">used of {isSorcerer ? "∞" : "2 GB"}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-violet-600">{isSorcerer ? "Infinite" : "75%"}</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-pink-500 w-[40%]" title="Images" />
                            <div className="h-full bg-violet-500 w-[20%]" title="Videos" />
                            <div className="h-full bg-sky-500 w-[15%]" title="Documents" />
                        </div>

                        <div className="flex gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500" /> Images</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-500" /> Videos</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-sky-500" /> Documents</div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                        <Smartphone className="text-sky-500" size={20} /> App Preferences
                    </h2>
                    <div className="glass p-6 rounded-2xl divide-y divide-slate-100">

                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between py-4 first:pt-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Mail size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Email Notifications</h4>
                                    <p className="text-sm text-slate-400">Receive updates about your account activity.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                            </label>
                        </div>

                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><Volume2 size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-slate-700">Magical Sounds</h4>
                                    <p className="text-sm text-slate-400">Play sound effects on interactions.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                            </label>
                        </div>

                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <MagicButton variant="primary" onClick={handleSavePreferences}>
                        Save Preferences
                    </MagicButton>
                </div>
            </div>
        </div>
    );
}
