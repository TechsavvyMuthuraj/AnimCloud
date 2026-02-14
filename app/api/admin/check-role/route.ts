import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ isAdmin: false, error: 'Not authenticated' }, { status: 401 });
        }

        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        const userRole = user.publicMetadata?.role as string;
        const isAdmin = userRole === 'admin';

        return NextResponse.json({
            isAdmin,
            role: userRole || 'user',
            userId: user.id,
            email: user.emailAddresses[0]?.emailAddress
        });
    } catch (error) {
        console.error('Error checking admin role:', error);
        return NextResponse.json({ isAdmin: false, error: 'Server error' }, { status: 500 });
    }
}
