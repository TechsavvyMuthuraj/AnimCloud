import { FileUploader } from "@/components/features/file-manager/FileUploader";
import { BackButton } from "@/components/ui/BackButton";

export default function UploadPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-violet-600">Cloud Upload</h1>
                <BackButton href="/dashboard" />
            </div>
            <FileUploader />
        </div>
    );
}
