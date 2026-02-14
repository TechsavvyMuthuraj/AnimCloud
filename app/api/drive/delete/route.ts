import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { getDriveClient, getUserGoogleToken } from "@/lib/google-drive";

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { fileId } = await req.json();
        if (!fileId) {
            return NextResponse.json({ error: "File ID required" }, { status: 400 });
        }

        // Get user's Google OAuth token
        let accessToken;
        try {
            accessToken = await getUserGoogleToken(userId);
        } catch (error: any) {
            return NextResponse.json({
                error: "Google Drive not connected",
                needsGoogleAuth: true
            }, { status: 403 });
        }

        const drive = getDriveClient(accessToken);

        // 1. Delete file from Google Drive
        try {
            await drive.files.delete({
                fileId: fileId,
            });
        } catch (error: any) {
            console.error("Drive Delete Error:", error);
            return NextResponse.json({ error: "Failed to delete file from Drive" }, { status: 500 });
        }

        // 2. Fetch updated storage quota
        try {
            const about = await drive.about.get({
                fields: "storageQuota",
            });
            const quota = about.data.storageQuota;
            const usage = parseInt(quota?.usage || "0");
            const limit = parseInt(quota?.limit || "0");

            // 3. Update Clerk User Metadata
            const client = await clerkClient();
            await client.users.updateUserMetadata(userId, {
                publicMetadata: {
                    storageUsed: usage,
                    storageLimit: limit > 0 ? limit : 15 * 1024 * 1024 * 1024, // Fallback to 15GB if unlimited/unknown
                },
            });
        } catch (error) {
            console.error("Failed to sync storage quota:", error);
            // Don't fail the deletion if sync fails, but log it
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Delete API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
