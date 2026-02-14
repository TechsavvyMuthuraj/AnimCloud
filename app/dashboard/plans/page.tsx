"use client";

import { MagicButton } from "@/components/ui/MagicButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { Check, Star, Zap, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { updateUserPlan } from "@/app/actions/user";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";

export default function PlansPage() {
    const { user, isLoaded } = useUser();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const router = useRouter();

    const currentPlan = (user?.publicMetadata?.plan as string) || "novice";

    const handleUpgrade = async (plan: string) => {
        setLoadingPlan(plan);
        try {
            await updateUserPlan(plan);
            router.refresh(); // Refresh to update server components/metadata
        } catch (error) {
            console.error(error);
            alert("Failed to upgrade plan. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    const PlanButton = ({ plan, label, variant }: { plan: string, label: string, variant: "primary" | "secondary" | "danger" | "ghost" | "magic" }) => {
        const isCurrent = currentPlan === plan;
        const isLoading = loadingPlan === plan;

        if (isCurrent) {
            return (
                <button disabled className="w-full mt-auto py-2.5 rounded-xl border border-pink-200 bg-pink-50 text-pink-400 font-semibold cursor-default">
                    Current Plan
                </button>
            );
        }

        return (
            <MagicButton
                variant={variant}
                className="w-full mt-auto shadow-pink-500/20"
                onClick={() => handleUpgrade(plan)}
                isLoading={isLoading}
            >
                {label}
            </MagicButton>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 text-center animate-in zoom-in duration-500 pb-12">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">
                Unlock Your Magic Potential
            </h1>
            <p className="text-slate-500 text-lg">Choose a plan that fits your magical needs.</p>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
                {/* Basic Plan */}
                <GlassCard className="flex flex-col items-center p-8 hover:scale-105 transition-transform duration-300 border-t-4 border-slate-300">
                    <h3 className="text-xl font-bold text-slate-700">Novice</h3>
                    <div className="text-4xl font-black text-slate-800 my-4">$0 <span className="text-sm font-normal text-slate-400">/mo</span></div>
                    <ul className="space-y-3 text-left w-full mb-8">
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 2 GB Storage</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Basic Animations</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Standard Support</li>
                    </ul>
                    <PlanButton plan="novice" label="Downgrade" variant="secondary" />
                </GlassCard>

                {/* Pro Plan */}
                <div className="relative transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-violet-500 rounded-2xl blur opacity-30 animate-pulse" />
                    <GlassCard className="flex flex-col items-center p-8 relative bg-white/60 border-t-4 border-pink-500 h-full">
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <h3 className="text-xl font-bold text-pink-600 flex items-center gap-2"><Star size={20} fill="currentColor" /> Wizard</h3>
                        <div className="text-4xl font-black text-slate-800 my-4">$9 <span className="text-sm font-normal text-slate-400">/mo</span></div>
                        <ul className="space-y-3 text-left w-full mb-8">
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 2 TB Storage</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> All Magic Animations</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Priority Support</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Secret Files Access</li>
                        </ul>
                        <PlanButton plan="wizard" label="Upgrade Now" variant="primary" />
                    </GlassCard>
                </div>

                {/* Enterprise */}
                <GlassCard className="flex flex-col items-center p-8 hover:scale-105 transition-transform duration-300 border-t-4 border-violet-500">
                    <h3 className="text-xl font-bold text-violet-600 flex items-center gap-2"><Zap size={20} fill="currentColor" /> Sorcerer</h3>
                    <div className="text-4xl font-black text-slate-800 my-4">$29 <span className="text-sm font-normal text-slate-400">/mo</span></div>
                    <ul className="space-y-3 text-left w-full mb-8">
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Unlimited Storage</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Custom Branding</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 24/7 Dedicated Support</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Admin Controls</li>
                    </ul>
                    <PlanButton plan="sorcerer" label="Contact Sales" variant="ghost" />
                </GlassCard>
            </div>
        </div>
    );
}
