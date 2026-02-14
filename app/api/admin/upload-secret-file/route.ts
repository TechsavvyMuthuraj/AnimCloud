import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth, clerkClient } from "@clerk/nextjs/server";
import { getUserGoogleToken, getDriveClient } from "@/lib/google-drive";

export async function POST(req: NextRequest) {
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

        // 1. Ensure "Admin-Secret-Files" folder exists in user's Drive
        let folderId = "";
        const folderSearch = await drive.files.list({
            q: "name = 'Admin-Secret-Files' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields: "files(id)",
        });

        if (folderSearch.data.files && folderSearch.data.files.length > 0) {
            folderId = folderSearch.data.files[0].id!;
        } else {
            // Create the folder if it doesn't exist
            const folder = await drive.files.create({
                requestBody: {
                    name: "Admin-Secret-Files",
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
        console.error("Admin Upload API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
