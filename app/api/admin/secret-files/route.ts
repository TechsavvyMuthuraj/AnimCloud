import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth, clerkClient } from "@clerk/nextjs/server";
import { getUserGoogleToken, getDriveClient } from "@/lib/google-drive";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await clerkAuth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user has admin role
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        const role = user.publicMetadata?.role as string;

        if (role !== 'admin') {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        // Get user's Google OAuth token
        let accessToken;
        try {
            accessToken = await getUserGoogleToken(userId);
        } catch (error: any) {
            console.error("OAuth Token Error:", error.message);
            return NextResponse.json({
                error: "Please connect your Google account",
                needsGoogleAuth: true
            }, { status: 403 });
        }

        const drive = getDriveClient(accessToken);

        // 1. Find "Admin-Secret-Files" folder
        const folderSearch = await drive.files.list({
            q: "name = 'Admin-Secret-Files' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id)",
        });

        if (!folderSearch.data.files || folderSearch.data.files.length === 0) {
            // Folder doesn't exist yet, return empty array
            return NextResponse.json({ files: [] });
        }

        const folderId = folderSearch.data.files[0].id!;

        // 2. List all files in the admin folder
        const filesResponse = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: "files(id, name, mimeType, size, createdTime, webViewLink, webContentLink)",
            orderBy: "createdTime desc",
        });

        const files = filesResponse.data.files || [];

        return NextResponse.json({ files });

    } catch (error: any) {
        console.error("Admin List Files API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
