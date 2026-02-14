// Admin authentication utilities

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Check if the current user is an admin
 * Admins are identified by having 'admin' role in their publicMetadata
 */
export async function isAdmin(): Promise<boolean> {
    const { userId } = await auth();

    if (!userId) {
        return false;
    }

    try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        // Check if user has admin role in publicMetadata
        const userRole = user.publicMetadata?.role as string;
        return userRole === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * Require admin access - redirects to admin login if not admin
 * Use this in server components or server actions
 */
export async function requireAdmin() {
    const adminStatus = await isAdmin();

    if (!adminStatus) {
        redirect('/admin/login');
    }
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<string | null> {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        return (user.publicMetadata?.role as string) || 'user';
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Set user role (admin only operation)
 * This should be called from a secure server action
 */
export async function setUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
    try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                role: role
            }
        });
        return true;
    } catch (error) {
        console.error('Error setting user role:', error);
        return false;
    }
}
