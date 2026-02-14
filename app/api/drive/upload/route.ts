import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { getUserGoogleToken, getDriveClient } from "@/lib/google-drive";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await clerkAuth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { filename, mimeType, size } = await req.json();

        // Get user's Google OAuth token
        let accessToken;
        try {
            accessToken = await getUserGoogleToken(userId);
        } catch (error: any) {
            console.error("OAuth Token Error:", error.message);
            return NextResponse.json({
                error: "Please connect your Google account to upload files",
                needsGoogleAuth: true
            }, { status: 403 });
        }

        const drive = getDriveClient(accessToken);

        // 1. Ensure "AnimDrive" folder exists in user's Drive
        let folderId = "";
        const folderSearch = await drive.files.list({
            q: "name = 'AnimDrive' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id)",
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
            folderId = folderSearch.data.files[0].id!;
        } else {
            // Create the folder if it doesn't exist
            const folder = await drive.files.create({
                requestBody: {
                    name: "AnimDrive",
                    mimeType: "application/vnd.google-apps.folder",
                },
                fields: "id",
            });
            folderId = folder.data.id!;
        }

        // 2. Create Resumable Upload Session
        const meta = {
            name: filename,
            mimeType: mimeType,
            parents: [folderId],
        };

        const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "X-Upload-Content-Type": mimeType,
                "X-Upload-Content-Length": size.toString(),
            },
            body: JSON.stringify(meta),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to initiate upload: ${errorText}`);
        }

        const uploadUrl = res.headers.get("Location");

        return NextResponse.json({ uploadUrl });

    } catch (error: any) {
        console.error("Upload API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
