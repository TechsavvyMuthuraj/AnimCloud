import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Get current path
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';

    // Skip auth check for login page
    const isLoginPage = pathname.includes('/admin/login');

    if (!isLoginPage) {
        // Check if user is admin, redirect to login if not
        try {
            await requireAdmin();
        } catch {
            redirect('/admin/login');
        }
    }

    // Don't show sidebar/navbar on login page
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[url('/bg-mesh.svg')] bg-cover bg-fixed font-sans">
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
