import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export async function POST(req: NextRequest) {
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

        // Parse request body
        const { clerkUserId, fullName, email, password, role, storageLimit, status } = await req.json();

        if (!clerkUserId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Prepare update data
        const updateData: any = {
            publicMetadata: {
                role: role.toLowerCase(),
                plan: role === 'Elite' ? 'sorcerer' : role === 'Pro' ? 'wizard' : 'novice',
                storageLimit: storageLimit,
                status: status,
                updatedAt: new Date().toISOString()
            }
        };

        // Update name if provided
        if (fullName) {
            updateData.firstName = fullName.split(' ')[0];
            updateData.lastName = fullName.split(' ').slice(1).join(' ') || undefined;
        }

        // Update email if provided and changed
        if (email) {
            const currentUser = await clerkClient.users.getUser(clerkUserId);
            const currentEmail = currentUser.emailAddresses[0]?.emailAddress;

            if (email !== currentEmail) {
                updateData.emailAddress = [email];
            }
        }

        // Update password if provided
        if (password && password.trim()) {
            updateData.password = password;
        }

        // Update user in Clerk
        const updatedUser = await clerkClient.users.updateUser(clerkUserId, updateData);

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                email: updatedUser.emailAddresses[0]?.emailAddress,
                fullName: `${updatedUser.firstName} ${updatedUser.lastName || ''}`.trim(),
                role: role,
                storageLimit: storageLimit,
                status: status
            }
        });

    } catch (error: any) {
        console.error('Error updating user:', error);

        return NextResponse.json({
            error: 'Failed to update user',
            details: error.message
        }, { status: 500 });
    }
}
