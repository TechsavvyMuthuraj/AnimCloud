import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        // Check external accounts
        const googleAccount = user.externalAccounts.find(
            (acc: any) => acc.provider === "oauth_google"
        );

        const diagnostics: any = {
            userId,
            hasGoogleAccount: !!googleAccount,
            googleAccountId: googleAccount?.id || null,
            externalAccounts: user.externalAccounts.map((acc: any) => ({
                provider: acc.provider,
                id: acc.id,
            })),
        };

        // Try to get OAuth token
        try {
            const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "oauth_google");
            const tokens = (tokenResponse as any).data || tokenResponse;

            diagnostics.hasToken = !!tokens && tokens.length > 0;
            diagnostics.tokenInfo = tokens?.[0] ? {
                provider: tokens[0].provider,
                hasToken: !!tokens[0].token,
            } : null;
        } catch (tokenError: any) {
            diagnostics.tokenError = tokenError.message;
        }

        return NextResponse.json(diagnostics);

    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
