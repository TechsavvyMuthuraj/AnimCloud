import { NextRequest, NextResponse } from "next/server";
import { auth as clerkAuth, clerkClient } from "@clerk/nextjs/server";
import { getUserGoogleToken, getDriveClient } from "@/lib/google-drive";

export async function GET(
    req: NextRequest,
    { params }: { params: { fileId: string } }
) {
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

        const { fileId } = params;

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

        // Get file metadata
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: "id, name, mimeType, size",
        });

        // Download file content
        const fileContent = await drive.files.get(
            { fileId: fileId, alt: "media" },
            { responseType: "arraybuffer" }
        );

        // Return file as downloadable response
        return new NextResponse(fileContent.data as ArrayBuffer, {
            headers: {
                "Content-Type": fileMetadata.data.mimeType || "application/octet-stream",
                "Content-Disposition": `attachment; filename="${fileMetadata.data.name}"`,
                "Content-Length": fileMetadata.data.size || "0",
            },
        });

    } catch (error: any) {
        console.error("Admin Download File API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
