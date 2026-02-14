import { FileGrid } from "@/components/features/file-manager/FileGrid";
import { Star } from "lucide-react";
import { Suspense } from "react";
import { BackButton } from "@/components/ui/BackButton";

export default function FavoritesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Star className="text-amber-500" fill="currentColor" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">Favorites</h1>
                </div>
                <BackButton href="/dashboard" />
            </div>
            <Suspense fallback={<div className="h-64 flex items-center justify-center text-slate-400">Loading favorites...</div>}>
                <FileGrid showOnlyFavorites={true} />
            </Suspense>
        </div>
    );
}
