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
        const { fullName, email, password, role, storageLimit, status } = await req.json();

        // Validate required fields
        if (!fullName || !email || !password || !role || !storageLimit) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create user in Clerk
        const newUser = await clerkClient.users.createUser({
            emailAddress: [email],
            password: password,
            firstName: fullName.split(' ')[0],
            lastName: fullName.split(' ').slice(1).join(' ') || undefined,
            publicMetadata: {
                role: role.toLowerCase(),
                plan: role === 'Elite' ? 'sorcerer' : role === 'Pro' ? 'wizard' : 'novice',
                storageLimit: storageLimit,
                storageUsed: 0,
                status: status || 'Active',
                createdBy: 'admin',
                createdAt: new Date().toISOString()
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                email: newUser.emailAddresses[0]?.emailAddress,
                fullName: `${newUser.firstName} ${newUser.lastName || ''}`.trim(),
                role: role,
                storageLimit: storageLimit,
                status: status || 'Active'
            }
        });

    } catch (error: any) {
        console.error('Error creating user:', error);

        // Handle specific Clerk errors
        if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Failed to create user',
            details: error.message
        }, { status: 500 });
    }
}
