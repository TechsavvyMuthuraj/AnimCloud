"use client";

import { useEffect } from "react";
import useDrivePicker, { PickerData } from "react-google-drive-picker";
import { MagicButton } from "@/components/ui/MagicButton";
// @ts-ignore
import { GoogleDrive } from 'lucide-react'; // Mock icon import for now, will replace with real one or custom SVG

export interface GoogleDriveButtonProps {
    onSelect: (data: any) => void;
}

export function GoogleDriveButton({ onSelect }: GoogleDriveButtonProps) {
    const [openPicker, authResponse] = useDrivePicker();

    // Custom handling for the picker open
    const handleOpenPicker = () => {
        openPicker({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
            developerKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "",
            viewId: "DOCS",
            // token: token, // pass oauth token in case you already have one
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            // customViews: customViews, // custom view
            callbackFunction: (data: PickerData) => {
                if (data.action === 'picked') {
                    console.log("User picked file(s):", data);
                    onSelect(data);
                }
            },
        });
    };

    return (
        <MagicButton
            variant="secondary"
            onClick={handleOpenPicker}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" className="mr-1">
                <path fill="#FFC107" d="M17 6L31 6L45 30L31 30z"></path>
                <path fill="#4CAF50" d="M9.4 39L17 6L31 30L23.5 45z"></path>
                <path fill="#2196F3" d="M31 6L45 6L31 30L17 30z"></path> {/* Adjusted for simpler triangle representation if needed but using standardized below */}
                <path fill="#2196F3" d="M45 30L31 30L9.4 39L23.5 39z"></path>
            </svg>
            Upload from Drive
        </MagicButton>
    );
}

// Better SVG for Drive
const DriveIcon = () => (
    <svg width="18" height="18" viewBox="0 0 87.3 78" className="mr-2">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.9 2.5 3.2 3.2l2.5 1.45 18.8-32.55-9.5-16.5H6.6v37.75z" fill="#0066da" />
        <path d="M43.65 25l13.9-24.1c-1.3-.75-2.85-1.15-4.4-1.15H25.35c-1.55 0-3.1 .4-4.4 1.15l-3.85 6.65L23 20l20.65 5z" fill="#00ac47" />
        <path d="M73.55 76.7c1.55 0 3.1-.4 4.4-1.15l3.85-6.65c.8-1.4 1.15-2.95 1.15-4.55V25l-12.7 22.05-9.35 16.2 12.65 13.45z" fill="#ea4335" />
        <path d="M43.65 25L24.85 57.55l9.35 16.2 26.5-6.65V25H43.65z" fill="#00832d" />
        <path d="M24.85 57.55H6.6L23 29.15l20.65 35.8-18.8-7.4z" fill="#2684fc" />
        <path d="M57.65 76.7H24.85v-5.9h32.8z" fill="#00ac47" />
        <path d="M25.35 .9h32.8l-9.3 16.2H16.05z" fill="#00ac47" />
    </svg>
)
