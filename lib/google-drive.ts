import { google } from "googleapis";
import { clerkClient } from "@clerk/nextjs/server";

export const getDriveClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    return google.drive({ version: "v3", auth });
};

// Get user's Google OAuth token from Clerk
export async function getUserGoogleToken(userId: string): Promise<string> {
    const clerk = await clerkClient();

    try {
        // Use Clerk's official method to get OAuth access token
        const tokenResponse = await clerk.users.getUserOauthAccessToken(userId, "oauth_google");

        // Access the data array from the paginated response
        const tokens = (tokenResponse as any).data || tokenResponse;

        if (!tokens || tokens.length === 0) {
            throw new Error("No Google OAuth token found");
        }

        const token = tokens[0]?.token;

        if (!token) {
            throw new Error("Google OAuth token is empty");
        }

        return token;
    } catch (error: any) {
        console.error("Error getting Google OAuth token:", error);
        throw new Error("User has not connected Google Drive. Please sign in with Google and grant Drive permissions.");
    }
}

// Legacy Service Account functions (keeping for reference, but not used for uploads)
export const getServiceDriveAuth = () => {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
};

export const getServiceDriveClient = () => {
    const auth = getServiceDriveAuth();
    return google.drive({ version: "v3", auth });
};
