import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { getUserGoogleToken, getDriveClient } from "@/lib/google-drive";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await clerkAuth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        // Fetch storage quota
        const about = await drive.about.get({
            fields: "storageQuota",
        });

        const quota = about.data.storageQuota;

        return NextResponse.json({
            usage: parseInt(quota?.usage || "0"),
            limit: parseInt(quota?.limit || "0"),
            usageInDrive: parseInt(quota?.usageInDrive || "0"),
            usageInTrash: parseInt(quota?.usageInTrash || "0"),
        });

    } catch (error: any) {
        console.error("Storage API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
