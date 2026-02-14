// Admin utility functions

export interface User {
    id: string;
    fullName: string;
    email: string;
    password?: string; // Optional: only for display/edit purposes
    role: 'User' | 'Pro' | 'Admin' | 'Elite';
    storageLimit: number; // in GB
    storageUsed: number; // in GB
    status: 'Active' | 'Inactive';
    createdAt: string;
    avatar: string; // initials
}

// Generate avatar initials from full name
export function generateInitials(fullName: string): string {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
        return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check if email is unique
export function isEmailUnique(email: string, users: User[], excludeId?: string): boolean {
    return !users.some(user =>
        user.email.toLowerCase() === email.toLowerCase() && user.id !== excludeId
    );
}

// Format storage display
export function formatStorage(gb: number): string {
    if (gb >= 1024) {
        return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${gb} GB`;
}

// Get role badge color
export function getRoleBadgeColor(role: User['role']): string {
    switch (role) {
        case 'Admin':
            return 'bg-rose-100 text-rose-600';
        case 'Elite':
            return 'bg-purple-100 text-purple-600';
        case 'Pro':
            return 'bg-violet-100 text-violet-600';
        case 'User':
            return 'bg-sky-100 text-sky-600';
        default:
            return 'bg-slate-100 text-slate-600';
    }
}

// Get status badge color
export function getStatusBadgeColor(status: User['status']): string {
    return status === 'Active'
        ? 'bg-green-100 text-green-600'
        : 'bg-slate-100 text-slate-400';
}

// Generate unique ID
export function generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get mock users for initial state
export function getMockUsers(): User[] {
    return [
        {
            id: generateId(),
            fullName: 'John Doe',
            email: 'john@example.com',
            role: 'Admin',
            storageLimit: 100,
            storageUsed: 45.2,
            status: 'Active',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: 'JD'
        },
        {
            id: generateId(),
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            role: 'Pro',
            storageLimit: 50,
            storageUsed: 28.7,
            status: 'Active',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: 'JS'
        },
        {
            id: generateId(),
            fullName: 'Bob Wilson',
            email: 'bob@example.com',
            role: 'User',
            storageLimit: 10,
            storageUsed: 3.5,
            status: 'Active',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: 'BW'
        },
        {
            id: generateId(),
            fullName: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'User',
            storageLimit: 10,
            storageUsed: 8.2,
            status: 'Inactive',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            avatar: 'AJ'
        }
    ];
}
