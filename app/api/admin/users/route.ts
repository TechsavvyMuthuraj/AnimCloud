import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function GET(req: NextRequest) {
    try {
        // Verify admin authentication
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the requesting user's metadata to verify admin role
        const requestingUser = await clerkClient.users.getUser(userId);

        if (requestingUser.publicMetadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Fetch all users from Clerk
        const { data: clerkUsers } = await clerkClient.users.getUserList({
            limit: 500, // Adjust as needed
        });

        // Transform Clerk users to our User format
        const users = clerkUsers.map(user => {
            const metadata = user.publicMetadata || {};
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
            const email = user.emailAddresses[0]?.emailAddress || 'No email';

            // Generate initials for avatar
            const initials = fullName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            return {
                id: user.id,
                fullName: fullName,
                email: email,
                role: capitalizeRole(metadata.role as string || 'user'),
                storageLimit: (metadata.storageLimit as number) || 10,
                storageUsed: (metadata.storageUsed as number) || 0,
                status: capitalizeStatus(metadata.status as string || 'active'),
                createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
                avatar: initials,
                plan: metadata.plan as string || 'novice'
            };
        });

        return NextResponse.json({
            success: true,
            users: users,
            total: users.length
        });

    } catch (error: any) {
        console.error('Error fetching users:', error);

        return NextResponse.json({
            error: 'Failed to fetch users',
            details: error.message
        }, { status: 500 });
    }
}

// Helper function to capitalize role
function capitalizeRole(role: string): 'User' | 'Pro' | 'Admin' | 'Elite' {
    const normalized = role.toLowerCase();
    if (normalized === 'admin') return 'Admin';
    if (normalized === 'pro') return 'Pro';
    if (normalized === 'elite') return 'Elite';
    return 'User';
}

// Helper function to capitalize status
function capitalizeStatus(status: string): 'Active' | 'Inactive' {
    return status.toLowerCase() === 'active' ? 'Active' : 'Inactive';
}
