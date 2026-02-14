import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

import { MagicParticles } from "@/components/ui/MagicParticles";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-[url('/bg-mesh.svg')] bg-cover bg-fixed font-sans relative">
            <MagicParticles />
            {/* Sidebar - Fixed */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 relative z-0">
                <Suspense fallback={<div className="h-20 bg-white/30 backdrop-blur-xl border-b border-white/20" />}>
                    <Navbar />
                </Suspense>
                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto mb-20">
                    {children}
                </main>
            </div>
        </div>
    );
}
