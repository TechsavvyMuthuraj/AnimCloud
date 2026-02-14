"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserPlan(plan: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    const client = await clerkClient();

    try {
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                plan: plan,
            },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to update user plan:", error);
        return { success: false, error: "Failed to update plan" };
    }
}
