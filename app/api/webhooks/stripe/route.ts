import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';
import { getPlanFromPriceId } from '@/lib/plan-utils';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            // Get the user ID from metadata
            const userId = session.metadata?.userId;
            const priceId = session.line_items?.data[0]?.price?.id;

            if (!userId) {
                console.error('No userId in session metadata');
                return NextResponse.json({ error: 'No userId' }, { status: 400 });
            }

            if (!priceId) {
                console.error('No priceId in session');
                return NextResponse.json({ error: 'No priceId' }, { status: 400 });
            }

            // Get plan from price ID
            const plan = getPlanFromPriceId(priceId);

            if (!plan) {
                console.error('Unknown price ID:', priceId);
                return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
            }

            try {
                // Update user's plan in Clerk metadata
                await clerkClient.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        plan: plan,
                        stripeCustomerId: session.customer as string,
                        subscriptionId: session.subscription as string,
                        subscriptionStatus: 'active',
                        updatedAt: new Date().toISOString()
                    }
                });

                console.log(`✅ Updated user ${userId} to ${plan} plan`);
            } catch (error) {
                console.error('Failed to update user metadata:', error);
                return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
            }

            break;
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;

            // Get user by Stripe customer ID
            const customerId = subscription.customer as string;
            const priceId = subscription.items.data[0]?.price.id;

            if (!priceId) {
                console.error('No priceId in subscription');
                return NextResponse.json({ error: 'No priceId' }, { status: 400 });
            }

            const plan = getPlanFromPriceId(priceId);

            if (!plan) {
                console.error('Unknown price ID:', priceId);
                return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });
            }

            try {
                // Find user by Stripe customer ID
                const users = await clerkClient.users.getUserList({
                    limit: 1,
                });

                const user = users.data.find(
                    (u) => u.publicMetadata.stripeCustomerId === customerId
                );

                if (!user) {
                    console.error('User not found for customer:', customerId);
                    return NextResponse.json({ error: 'User not found' }, { status: 404 });
                }

                // Update subscription status
                await clerkClient.users.updateUserMetadata(user.id, {
                    publicMetadata: {
                        ...user.publicMetadata,
                        plan: plan,
                        subscriptionStatus: subscription.status,
                        updatedAt: new Date().toISOString()
                    }
                });

                console.log(`✅ Updated subscription for user ${user.id} to ${plan} plan`);
            } catch (error) {
                console.error('Failed to update subscription:', error);
                return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
            }

            break;
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            try {
                // Find user by Stripe customer ID
                const users = await clerkClient.users.getUserList({
                    limit: 1,
                });

                const user = users.data.find(
                    (u) => u.publicMetadata.stripeCustomerId === customerId
                );

                if (!user) {
                    console.error('User not found for customer:', customerId);
                    return NextResponse.json({ error: 'User not found' }, { status: 404 });
                }

                // Downgrade to free plan
                await clerkClient.users.updateUserMetadata(user.id, {
                    publicMetadata: {
                        ...user.publicMetadata,
                        plan: 'novice',
                        subscriptionStatus: 'canceled',
                        updatedAt: new Date().toISOString()
                    }
                });

                console.log(`✅ Downgraded user ${user.id} to free plan`);
            } catch (error) {
                console.error('Failed to downgrade user:', error);
                return NextResponse.json({ error: 'Failed to downgrade user' }, { status: 500 });
            }

            break;
        }

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
