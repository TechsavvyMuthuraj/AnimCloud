import { FileUploader } from "@/components/features/file-manager/FileUploader";
import { FileGrid } from "@/components/features/file-manager/FileGrid";
import { StorageUsageWidget } from "@/components/features/dashboard/StorageUsageWidget";
import { UsageAnalytics } from "@/components/features/dashboard/UsageAnalytics";
import { WelcomeHeader } from "@/components/features/dashboard/WelcomeHeader";
import { ArrowUpRight } from "lucide-react";
import { Suspense } from "react";

export default function Dashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <section>
                <WelcomeHeader />
                <div className="grid lg:grid-cols-[1fr_300px] gap-8">
                    <div className="space-y-8">
                        <UsageAnalytics />
                        <FileUploader />
                    </div>
                    <div className="hidden lg:block space-y-6">
                        <StorageUsageWidget />
                    </div>
                </div>
            </section>

            <section>
                <div className="lg:hidden mb-6">
                    <StorageUsageWidget />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 mb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Your Files</h2>
                        <p className="text-sm text-slate-400">Manage your uploaded content</p>
                    </div>


                </div>

                <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading files...</div>}>
                    <FileGrid />
                </Suspense>
            </section>
        </div>
    );
}
