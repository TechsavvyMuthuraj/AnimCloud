// Plan utility functions

export type PlanType = 'novice' | 'wizard' | 'sorcerer';

export interface PlanConfig {
    id: PlanType;
    displayName: string;
    userType: string;
    storageLimit: number; // in GB
    price: number;
    priceId: string; // Stripe Price ID
    features: string[];
    color: {
        primary: string;
        gradient: string;
        border: string;
        bg: string;
    };
}

export const PLAN_CONFIGS: Record<PlanType, PlanConfig> = {
    novice: {
        id: 'novice',
        displayName: 'Free Plan',
        userType: 'Basic User',
        storageLimit: 10,
        price: 0,
        priceId: '', // No Stripe price for free plan
        features: [
            '10 GB Storage',
            'Basic file management',
            'Standard upload speed',
            'Community support'
        ],
        color: {
            primary: 'text-green-500',
            gradient: 'from-green-400 to-emerald-500',
            border: 'border-green-400',
            bg: 'bg-green-50'
        }
    },
    wizard: {
        id: 'wizard',
        displayName: 'Wizard Plan',
        userType: 'Pro User',
        storageLimit: 100,
        price: 9.99,
        priceId: process.env.NEXT_PUBLIC_STRIPE_WIZARD_PRICE_ID || '',
        features: [
            '100 GB Storage',
            'Priority upload speed',
            'Advanced file sharing',
            'Priority support',
            'Version history'
        ],
        color: {
            primary: 'text-blue-500',
            gradient: 'from-blue-400 to-indigo-500',
            border: 'border-blue-400',
            bg: 'bg-blue-50'
        }
    },
    sorcerer: {
        id: 'sorcerer',
        displayName: 'Sorcerer Plan',
        userType: 'Elite User',
        storageLimit: 1000,
        price: 29.99,
        priceId: process.env.NEXT_PUBLIC_STRIPE_SORCERER_PRICE_ID || '',
        features: [
            '1 TB Storage',
            'Lightning fast uploads',
            'Team collaboration',
            'Dedicated support',
            'Advanced security',
            'Custom branding'
        ],
        color: {
            primary: 'text-purple-500',
            gradient: 'from-purple-400 to-pink-500',
            border: 'border-purple-400',
            bg: 'bg-purple-50'
        }
    }
};

// Get plan configuration
export function getPlanConfig(planId: string | undefined): PlanConfig {
    const plan = (planId as PlanType) || 'novice';
    return PLAN_CONFIGS[plan] || PLAN_CONFIGS.novice;
}

// Get user type display name based on plan
export function getUserTypeDisplay(planId: string | undefined): string {
    return getPlanConfig(planId).userType;
}

// Get plan display name
export function getPlanDisplayName(planId: string | undefined): string {
    return getPlanConfig(planId).displayName;
}

// Get plan from Stripe Price ID
export function getPlanFromPriceId(priceId: string): PlanType | null {
    for (const [key, config] of Object.entries(PLAN_CONFIGS)) {
        if (config.priceId === priceId) {
            return key as PlanType;
        }
    }
    return null;
}

// Format storage display
export function formatStorageDisplay(gb: number): string {
    if (gb >= 1000) {
        return `${(gb / 1000).toFixed(0)} TB`;
    }
    return `${gb} GB`;
}
