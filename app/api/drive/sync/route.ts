import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { getDriveClient, getUserGoogleToken } from "@/lib/google-drive";

// Initialize Supabase Client (Service Role for admin writes, or standard client if RLS is set)
// Ideally use a service role key for backend operations if bypassing RLS, or just standard key if RLS allows authenticated users.
// For now, using standard client as we don't have service role in env (usually).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Only create client if env vars exist
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user details for metadata
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const email = user.primaryEmailAddress?.emailAddress;

        const body = await req.json();
        const { id, name, mimeType, size, webViewLink, iconLink } = body;

        if (!id || !name) {
            return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
        }

        // 1. Sync to Supabase (if configured)
        if (supabase) {
            const { data, error } = await supabase
                .from('files')
                .upsert({
                    id: id,
                    name: name,
                    type: mimeType,
                    size: size,
                    url: webViewLink,
                    owner_id: userId,
                    owner_email: email,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' })
                .select();

            if (error) {
                console.error("Supabase Error:", error);
            }
        }

        // 2. Update Clerk Metadata with Storage Usage
        try {
            // Get user's Google OAuth token to fetch fresh quota
            const accessToken = await getUserGoogleToken(userId);
            const drive = getDriveClient(accessToken);

            const about = await drive.about.get({
                fields: "storageQuota",
            });
            const quota = about.data.storageQuota;
            const usage = parseInt(quota?.usage || "0");
            const limit = parseInt(quota?.limit || "0");

            await client.users.updateUserMetadata(userId, {
                publicMetadata: {
                    storageUsed: usage,
                    storageLimit: limit > 0 ? limit : 15 * 1024 * 1024 * 1024, // Fallback to 15GB
                },
            });
        } catch (err) {
            console.error("Failed to sync storage quota to Clerk:", err);
            // Non-critical error, don't fail the upload sync
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
