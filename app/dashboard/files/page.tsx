import { FileGrid } from "@/components/features/file-manager/FileGrid";
import { Suspense } from "react";

export default function FilesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">My Files</h1>
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading files...</div>}>
                <FileGrid />
            </Suspense>
        </div>
    );
}
