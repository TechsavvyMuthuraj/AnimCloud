import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserGoogleToken, getDriveClient } from "@/lib/google-drive";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's Google OAuth token
        let accessToken;
        try {
            accessToken = await getUserGoogleToken(userId);
        } catch (error: any) {
            console.error("OAuth Token Error:", error.message);
            return NextResponse.json({
                error: "Please connect your Google account to access Drive files",
                needsGoogleAuth: true
            }, { status: 403 });
        }

        const drive = getDriveClient(accessToken);

        // 1. Get or create AnimDrive Folder in user's Drive
        let folderId = "";
        const folderSearch = await drive.files.list({
            q: "name = 'AnimDrive' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id)",
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
            folderId = folderSearch.data.files[0].id!;
        } else {
            // If folder doesn't exist, user has no files yet
            return NextResponse.json({ files: [] });
        }

        // 2. List files in user's AnimDrive folder
        const query = `'${folderId}' in parents and trashed = false`;

        const files = await drive.files.list({
            q: query,
            fields: "files(id, name, mimeType, size, webViewLink, thumbnailLink, createdTime)",
            pageSize: 100,
        });

        return NextResponse.json({ files: files.data.files });

    } catch (error: any) {
        console.error("List API Error:", {
            message: error.message,
            stack: error.stack,
            code: error.code,
            errors: error.errors,
        });

        // Return a more descriptive error if possible
        const errorMessage = error.errors?.[0]?.message || error.message || "Unknown Drive Error";
        return NextResponse.json({
            error: errorMessage,
            details: error.errors || []
        }, { status: 500 });
    }
}
