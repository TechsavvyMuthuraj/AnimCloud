import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function GET(req: NextRequest) {
    try {
        // Get authenticated user
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch user from Clerk
        const user = await clerkClient.users.getUser(userId);

        // Get storage info from metadata
        const storageLimit = (user.publicMetadata?.storageLimit as number) || 10; // Default 10GB
        const storageUsed = (user.publicMetadata?.storageUsed as number) || 0;
        const plan = (user.publicMetadata?.plan as string) || 'novice';
        const role = (user.publicMetadata?.role as string) || 'user';

        // Calculate storage percentage
        const storagePercentage = storageLimit > 0 ? (storageUsed / storageLimit) * 100 : 0;

        return NextResponse.json({
            success: true,
            storage: {
                used: storageUsed,
                limit: storageLimit,
                percentage: Math.round(storagePercentage),
                plan: plan,
                role: role,
                available: Math.max(0, storageLimit - storageUsed)
            }
        });

    } catch (error: any) {
        console.error('Error fetching storage:', error);

        return NextResponse.json({
            error: 'Failed to fetch storage information',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body
        const { storageUsed } = await req.json();

        if (typeof storageUsed !== 'number') {
            return NextResponse.json({ error: 'Invalid storage value' }, { status: 400 });
        }

        // Update user's storage usage in Clerk metadata
        const user = await clerkClient.users.getUser(userId);

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                storageUsed: storageUsed,
                lastUpdated: new Date().toISOString()
            }
        });

        return NextResponse.json({
            success: true,
            storageUsed: storageUsed
        });

    } catch (error: any) {
        console.error('Error updating storage:', error);

        return NextResponse.json({
            error: 'Failed to update storage',
            details: error.message
        }, { status: 500 });
    }
}
