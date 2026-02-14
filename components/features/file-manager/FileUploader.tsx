"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Check, Laptop, HardDrive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MagicButton } from "@/components/ui/MagicButton";
import { ExpirySelector } from "@/components/ui/ExpirySelector";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/Toast";
import { useNotification } from "@/components/providers/NotificationContext";

export function FileUploader() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const { user } = useUser();
    const { addToast } = useToast();
    const { addNotification } = useNotification();

    // Determine plan theme
    const plan = (user?.publicMetadata?.plan as string) || "novice";
    const isSorcerer = plan === "sorcerer";
    const themeColor = isSorcerer ? "text-amber-500" : "text-pink-500";
    const themeBorder = isSorcerer ? "border-amber-400" : "border-pink-400";
    const themeGradient = isSorcerer ? "from-amber-400 to-yellow-600" : "from-pink-500 to-violet-500";

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true // Disable click on container, we have specific buttons
    });

    const handleUpload = async () => {
        setUploading(true);
        setUploadProgress(0);

        try {
            for (const file of files) {
                const contentType = file.type || "application/octet-stream";

                // 1. Get Upload URL
                const initRes = await fetch("/api/drive/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: file.name,
                        mimeType: contentType,
                        size: file.size,
                    }),
                });

                if (!initRes.ok) {
                    const errorData = await initRes.json();
                    if (initRes.status === 403 && errorData.needsGoogleAuth) {
                        throw new Error("Google account not connected. Please sign in with Google through Clerk to upload files.");
                    }
                    throw new Error(errorData.error || "Failed to initiate upload");
                }
                const { uploadUrl } = await initRes.json();

                // 2. Perform Direct Upload (Wrapped in Promise)
                await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open("PUT", uploadUrl, true);
                    xhr.setRequestHeader("Content-Type", contentType);

                    xhr.upload.onprogress = (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            setUploadProgress(Math.round(percentComplete));
                        }
                    };

                    xhr.onload = async () => {
                        if (xhr.status === 200 || xhr.status === 201) {
                            console.log("Upload complete");
                            try {
                                const driveFile = JSON.parse(xhr.responseText);
                                await fetch("/api/drive/sync", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(driveFile),
                                });
                                resolve(true);
                            } catch (e) {
                                console.error("Failed to sync metadata", e);
                                resolve(true);
                            }
                        } else {
                            console.error("XHR Upload Failed:", xhr.status, xhr.responseText);
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => {
                        console.error("XHR Network Error");
                        reject(new Error("Network Error during upload"));
                    };

                    xhr.send(file);
                });
            }

            // Show success toast
            const fileCount = files.length;
            addToast(
                `${fileCount} file${fileCount > 1 ? 's' : ''} uploaded successfully! ☁️✨`,
                "success"
            );
            addNotification("Upload Successful", `Successfully uploaded ${fileCount} file${fileCount > 1 ? 's' : ''}.`, "success");
            setFiles([]);
        } catch (error: any) {
            console.error("Upload error:", error);

            const isAuthError = error.message && error.message.includes("Google");
            const errorMessage = isAuthError
                ? "Google account not connected. Please sign in with Google through Clerk to upload files."
                : `Upload failed: ${error.message || "Please check your console for details."}`;

            addToast(errorMessage, "error");
            addNotification("Upload Failed", errorMessage, "error");

        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const removeFile = (name: string) => {
        setFiles(files.filter(f => f.name !== name));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 overflow-hidden group outline-none",
                    isDragActive ? "shadow-2xl scale-[1.02]" : "hover:border-slate-300 hover:shadow-lg",
                    isDragActive ? (isSorcerer ? "border-amber-400 bg-[#fffbeb]" : "border-pink-500 bg-pink-50/50") : "border-slate-200 bg-white/40"
                )}
            >
                <input {...getInputProps()} />

                {/* Upload Progress Overlay */}
                {uploading && (
                    <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full max-w-md space-y-4 p-6"
                        >
                            <div className="flex justify-between items-center text-slate-700 font-bold">
                                <span>Uploading Magic...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    className={cn("h-full bg-gradient-to-r", themeGradient)}
                                />
                            </div>
                            <p className="text-slate-400 text-sm">Please do not close this window.</p>
                        </motion.div>
                    </div>
                )}

                <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Icon */}
                    <div className={cn(
                        "p-6 rounded-full shadow-xl mb-2 transition-transform duration-300 group-hover:scale-110 bg-white",
                        isDragActive ? themeColor : "text-slate-400"
                    )}>
                        <Upload size={48} className={cn(isDragActive && "animate-bounce")} />
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h3 className={cn("text-2xl font-bold", isDragActive ? themeColor : "text-slate-700")}>
                            {isDragActive ? "Drop to Upload!" : "Drag & Drop files here"}
                        </h3>
                        <p className="text-slate-500">
                            {isSorcerer ? "Unlimited file size allowed (Sorcerer Plan)" : "Max file size: 2GB (Pro Plan)"}
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 w-full max-w-xs opacity-50">
                        <div className="h-px bg-slate-300 flex-1" />
                        <span className="text-slate-400 text-sm font-medium uppercase">or</span>
                        <div className="h-px bg-slate-300 flex-1" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-4 w-full">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={open}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-bold rounded-xl shadow-md border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            <Laptop size={20} className="text-sky-500" />
                            Upload from Device
                        </motion.button>
                    </div>
                </div>

                {/* Decorative background animation */}
                <div className={cn(
                    "absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700",
                    "bg-gradient-to-br from-transparent",
                    isSorcerer ? "via-amber-100/30" : "via-pink-100/30",
                    "to-transparent"
                )} />
            </div>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2">
                                <span className={cn("inline-block w-2 h-2 rounded-full", isSorcerer ? "bg-amber-500" : "bg-pink-500")}></span>
                                Ready to Upload ({files.length})
                            </h4>
                            <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-500 font-medium">Clear All</button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {files.map((file, idx) => (
                                <motion.div
                                    key={`${file.name}-${idx}`}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 10, opacity: 0 }}
                                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={cn("p-2 rounded-lg bg-slate-100", themeColor)}>
                                            <File size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                            <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.name)}
                                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        {/* Expiry Selector */}
                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <ExpirySelector
                                value={expiryDate}
                                onChange={setExpiryDate}
                                showNeverOption={true}
                            />
                        </div>

                        <div className="mt-6">
                            <MagicButton
                                variant={isSorcerer ? "secondary" : "primary"}
                                onClick={handleUpload}
                                className="w-full justify-center py-4 text-lg shadow-xl shadow-pink-500/20"
                                disabled={uploading}
                            >
                                Start Upload
                            </MagicButton>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
