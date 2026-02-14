"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Plus, Eye, Trash2, Edit, HardDrive, CreditCard, Lock, Download, ShieldAlert, Share2, FileText, Filter, Calendar } from "lucide-react";
import { User, getMockUsers, formatStorage, getRoleBadgeColor, getStatusBadgeColor } from "@/lib/admin-utils";
import { useToast } from "@/components/ui/Toast";
import { AddUserModal } from "@/components/admin/AddUserModal";
import { EditUserModal } from "@/components/admin/EditUserModal";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { SystemLockdownModal } from "@/components/admin/SystemLockdownModal";
import { MagicButton } from "@/components/ui/MagicButton";
import { GlassCard } from "@/components/ui/GlassCard";
import jsPDF from "jspdf";

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function AdminPanel() {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [accessLogs, setAccessLogs] = useState<Array<{
        id: string;
        admin: string;
        action: 'Uploaded' | 'Downloaded' | 'Viewed' | 'Shared' | 'Deleted' | 'User Created' | 'User Updated' | 'User Deleted' | 'System Lockdown' | 'Exported Logs';
        fileName: string;
        timestamp: string;
    }>>([]);
    const [showLockdownModal, setShowLockdownModal] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Debounce search query
    const debouncedSearch = useDebounce(searchQuery, 300);

    const tabs = [
        { id: "users", label: "User Management", icon: Users },
        { id: "storage", label: "Storage Quotas", icon: HardDrive },
        { id: "payments", label: "Payment Approvals", icon: CreditCard },
        { id: "logs", label: "Activity Logs", icon: FileText },
    ];

    // Load sound and notification preferences from localStorage
    useEffect(() => {
        const savedSound = localStorage.getItem('magicalSoundsEnabled');
        if (savedSound !== null) {
            setSoundEnabled(JSON.parse(savedSound));
        }
        const savedNotif = localStorage.getItem('notificationsEnabled');
        if (savedNotif !== null) {
            setNotificationsEnabled(JSON.parse(savedNotif));
        }
    }, []);

    // Play sound effect
    const playSound = (type: 'success' | 'error' | 'click') => {
        if (!soundEnabled) return;

        const audio = new Audio();
        if (type === 'success') {
            // Success sound (higher pitch beep)
            audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        } else if (type === 'error') {
            // Error sound (lower pitch beep)
            audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        } else {
            // Click sound
            audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
        }
        audio.volume = 0.3;
        audio.play().catch(() => { }); // Ignore errors if audio fails
    };

    // Export Logs as PDF
    const handleExportLogs = () => {
        playSound('click');
        try {
            const doc = new jsPDF();

            // Title
            doc.setFontSize(20);
            doc.text('Admin Access Logs', 20, 20);

            // Metadata
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
            doc.text(`Total Logs: ${accessLogs.length}`, 20, 36);

            // Table headers
            doc.setFontSize(12);
            doc.text('Action', 20, 50);
            doc.text('File', 70, 50);
            doc.text('Timestamp', 140, 50);

            // Draw line
            doc.line(20, 52, 190, 52);

            // Table content
            doc.setFontSize(10);
            let yPos = 60;
            accessLogs.slice(0, 30).forEach((log) => { // Limit to 30 logs to fit on page
                if (yPos > 270) { // New page if needed
                    doc.addPage();
                    yPos = 20;
                }
                doc.text(log.action, 20, yPos);
                doc.text(log.fileName.substring(0, 25), 70, yPos); // Truncate long filenames
                doc.text(log.timestamp, 140, yPos);
                yPos += 8;
            });

            // Footer
            doc.setFontSize(8);
            doc.text('AnimDrive - Admin Control Center', 20, 285);

            // Save
            doc.save(`admin-logs-${new Date().toISOString().split('T')[0]}.pdf`);

            playSound('success');
            addToast('Logs exported successfully! 📄', 'success');
            addAccessLog('Exported Logs', `Generated PDF report`);
        } catch (error) {
            playSound('error');
            addToast('Failed to export logs', 'error');
        }
    };

    const handleSystemLockdown = () => {
        playSound('click');
        setShowLockdownModal(true);
    };

    const confirmLockdown = () => {
        playSound('error');
        addToast('🔒 System Lockdown Activated! All user access suspended.', 'error');
        setShowLockdownModal(false);
        addAccessLog('System Lockdown', 'Initiated by Admin');
        // In production, this would call an API to lock the system
    };

    // Load users from Clerk API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/users');

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();

                if (data.success) {
                    setUsers(data.users);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
                // Fallback to empty array on error
                setUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);



    // Load access logs from localStorage
    useEffect(() => {
        const savedLogs = localStorage.getItem('admin_access_logs');
        if (savedLogs) {
            setAccessLogs(JSON.parse(savedLogs));
        }
    }, []);

    // Save access logs to localStorage whenever they change
    useEffect(() => {
        if (accessLogs.length > 0) {
            localStorage.setItem('admin_access_logs', JSON.stringify(accessLogs));
        }
    }, [accessLogs]);

    // Helper function to add access log
    const addAccessLog = (action: 'Uploaded' | 'Downloaded' | 'Viewed' | 'Shared' | 'Deleted' | 'User Created' | 'User Updated' | 'User Deleted' | 'System Lockdown' | 'Exported Logs', fileName: string) => {
        const newLog = {
            id: Date.now().toString(),
            admin: 'Admin User',
            action: action,
            fileName: fileName,
            timestamp: new Date().toISOString()
        };
        setAccessLogs([newLog, ...accessLogs]); // Add to beginning for recent-first order
    };

    // Refetch users function
    const refetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setUsers(data.users);
                }
            }
        } catch (error) {
            console.error('Error refetching users:', error);
        }
    };

    // Filter users based on debounced search query
    const filteredUsers = useMemo(() => {
        if (!debouncedSearch.trim()) return users;

        const query = debouncedSearch.toLowerCase();
        return users.filter(user =>
            user.fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }, [users, debouncedSearch]);

    const handleAddUser = async (newUser: User) => {
        setUsers([...users, newUser]);
        addToast("User created successfully! ✨", "success");
        addAccessLog('User Created', `Created user: ${newUser.fullName}`);
        // Refetch to get latest data from Clerk
        await refetchUsers();
    };

    const handleUpdateUser = async (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        addToast("User updated successfully! 🎉", "success");
        addAccessLog('User Updated', `Updated user: ${updatedUser.fullName}`);
        // Refetch to get latest data from Clerk
        await refetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        const userToDelete = users.find(u => u.id === userId);
        setUsers(users.filter(u => u.id !== userId));
        addToast("User deleted successfully", "success");
        addAccessLog('User Deleted', `Deleted user: ${userToDelete?.fullName || userId}`);
        // Refetch to get latest data from Clerk
        await refetchUsers();
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
                        Admin Control Center
                    </h1>
                    <p className="text-slate-500 text-sm">Manage users, files, and secrets.</p>
                </div>
                <div className="flex gap-2">
                    <MagicButton variant="secondary" size="sm" className="hidden sm:flex">
                        <Download size={16} className="mr-2" /> Export Logs
                    </MagicButton>
                    <MagicButton variant="danger" size="sm" onClick={handleSystemLockdown}>
                        <ShieldAlert size={16} className="mr-2" /> System Lockdown
                    </MagicButton>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id
                            ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30"
                            : "bg-white/40 text-slate-600 hover:bg-white/60 hover:text-pink-600"
                            }`}
                    >
                        <tab.icon size={18} />
                        <span className="font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <GlassCard className="min-h-[500px]">
                {activeTab === "users" && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="glass p-4 rounded-xl border border-white/20">
                                <p className="text-sm text-slate-500 font-medium">Total Users</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{users.length}</p>
                            </div>
                            <div className="glass p-4 rounded-xl border border-white/20">
                                <p className="text-sm text-slate-500 font-medium">Active Users</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {users.filter(u => u.status === 'Active').length}
                                </p>
                            </div>
                            <div className="glass p-4 rounded-xl border border-white/20">
                                <p className="text-sm text-slate-500 font-medium">Pro Users</p>
                                <p className="text-2xl font-bold text-violet-600 mt-1">
                                    {users.filter(u => u.role === 'Pro').length}
                                </p>
                            </div>
                            <div className="glass p-4 rounded-xl border border-white/20">
                                <p className="text-sm text-slate-500 font-medium">Admins</p>
                                <p className="text-2xl font-bold text-rose-600 mt-1">
                                    {users.filter(u => u.role === 'Admin').length}
                                </p>
                            </div>
                        </div>

                        {/* Search and Add User */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/30 p-4 rounded-xl border border-white/20">
                            <div className="relative w-full sm:w-auto">
                                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 rounded-lg bg-white/50 border-none outline-none focus:ring-2 ring-pink-300 w-full sm:w-80 text-sm"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add New User
                                </button>
                                <button
                                    onClick={() => window.location.href = '/admin/all-users'}
                                    className="flex-1 sm:flex-none px-4 py-2 glass border border-white/20 text-slate-700 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} />
                                    <span className="hidden sm:inline">View All</span>
                                </button>
                            </div>
                        </div>

                        {/* User Table */}
                        <div className="overflow-x-auto rounded-xl border border-white/20">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-pink-50/50">
                                    <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-white/20">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Storage</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    <AnimatePresence mode="popLayout">
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -100 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-pink-50/30 transition-colors group"
                                                >
                                                    <td className="p-4 font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm">
                                                                {user.avatar}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{user.fullName}</p>
                                                                <p className="text-sm text-slate-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 min-w-[150px]">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {formatStorage(user.storageUsed)} / {formatStorage(user.storageLimit)}
                                                            </p>
                                                            <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
                                                                    style={{ width: `${Math.min((user.storageUsed / user.storageLimit) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <button
                                                                onClick={() => setEditUser(user)}
                                                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                                                                title="Edit User"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteUser(user)}
                                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <p className="text-slate-400 text-lg">No users found</p>
                                                    <p className="text-slate-500 text-sm mt-1">
                                                        {searchQuery ? 'Try adjusting your search query' : 'Add your first user to get started'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "storage" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Storage Quotas Management</h3>
                                <p className="text-sm text-slate-500">Monitor and manage user storage allocations</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-pink-600">
                                    {formatStorage(users.reduce((sum, u) => sum + u.storageUsed, 0))}
                                </p>
                                <p className="text-xs text-slate-500">Total Used</p>
                            </div>
                        </div>

                        {/* Storage Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <HardDrive className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {formatStorage(users.reduce((sum, u) => sum + u.storageLimit, 0))}
                                        </p>
                                        <p className="text-xs text-slate-500">Total Allocated</p>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <Users className="text-green-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{users.length}</p>
                                        <p className="text-xs text-slate-500">Total Users</p>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <ShieldAlert className="text-orange-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">
                                            {users.filter(u => (u.storageUsed / u.storageLimit) > 0.8).length}
                                        </p>
                                        <p className="text-xs text-slate-500">Near Limit (&gt;80%)</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* User Storage List */}
                        <div className="overflow-x-auto rounded-xl border border-white/20">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-pink-50/50">
                                    <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-white/20">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Storage Used</th>
                                        <th className="p-4">Limit</th>
                                        <th className="p-4">Usage %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.map((user) => {
                                        const usagePercent = (user.storageUsed / user.storageLimit) * 100;
                                        return (
                                            <tr key={user.id} className="hover:bg-pink-50/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                                                            {user.avatar}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                                                            <p className="text-xs text-slate-500">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-slate-700">{formatStorage(user.storageUsed)}</td>
                                                <td className="p-4 font-medium text-slate-700">{formatStorage(user.storageLimit)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[100px]">
                                                            <div
                                                                className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' :
                                                                    usagePercent > 80 ? 'bg-orange-500' :
                                                                        'bg-gradient-to-r from-pink-500 to-rose-500'
                                                                    }`}
                                                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className={`text-xs font-semibold ${usagePercent > 90 ? 'text-red-600' :
                                                            usagePercent > 80 ? 'text-orange-600' :
                                                                'text-slate-600'
                                                            }`}>
                                                            {Math.round(usagePercent)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "payments" && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">Payment & Subscription Management</h3>
                            <p className="text-sm text-slate-500">Monitor user subscriptions and payment history</p>
                        </div>

                        {/* Payment Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-100 rounded-lg">
                                        <CreditCard className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-800">
                                            {users.filter(u => u.role === 'Pro' || u.role === 'Elite').length}
                                        </p>
                                        <p className="text-xs text-slate-500">Active Subscriptions</p>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-100 rounded-lg">
                                        <Users className="text-blue-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-800">
                                            {users.filter(u => u.role === 'User').length}
                                        </p>
                                        <p className="text-xs text-slate-500">Free Users</p>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-violet-100 rounded-lg">
                                        <CreditCard className="text-violet-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-800">
                                            {users.filter(u => u.role === 'Pro').length}
                                        </p>
                                        <p className="text-xs text-slate-500">Pro Plans</p>
                                    </div>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-100 rounded-lg">
                                        <CreditCard className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-slate-800">
                                            {users.filter(u => u.role === 'Elite').length}
                                        </p>
                                        <p className="text-xs text-slate-500">Elite Plans</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </div>

                        {/* Subscription List */}
                        <div className="overflow-x-auto rounded-xl border border-white/20">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-pink-50/50">
                                    <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-white/20">
                                        <th className="p-4">User</th>
                                        <th className="p-4">Plan</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {users.filter(u => u.role !== 'Admin').map((user) => (
                                        <tr key={user.id} className="hover:bg-pink-50/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-xs">
                                                        {user.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm">{user.fullName}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role === 'User' ? 'Free Plan' : user.role === 'Pro' ? 'Pro Plan' : 'Elite Plan'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "logs" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">System Activity Logs</h3>
                                <p className="text-sm text-slate-500">Monitor all admin and system activities</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportLogs}
                                    className="px-4 py-2 bg-white/50 border border-white/20 hover:bg-white/80 rounded-lg text-slate-600 font-medium transition-all flex items-center gap-2"
                                >
                                    <Download size={16} />
                                    Export CSV/PDF
                                </button>
                            </div>
                        </div>

                        {/* Logs Table */}
                        <div className="overflow-hidden rounded-xl border border-white/20 bg-white/30 backdrop-blur-md">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-pink-50/50">
                                        <tr className="text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-white/20">
                                            <th className="p-4">Action</th>
                                            <th className="p-4">Performed By</th>
                                            <th className="p-4">Details / Target</th>
                                            <th className="p-4">Date & Time</th>
                                            <th className="p-4">ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {accessLogs.length > 0 ? (
                                            accessLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-pink-50/30 transition-colors">
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                            ${log.action === 'Deleted' || log.action === 'System Lockdown' ? 'bg-red-100 text-red-600' :
                                                                log.action === 'Uploaded' ? 'bg-blue-100 text-blue-600' :
                                                                    log.action === 'Shared' ? 'bg-purple-100 text-purple-600' :
                                                                        'bg-slate-100 text-slate-600'
                                                            }`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                                {log.admin.charAt(0)}
                                                            </div>
                                                            <span className="text-sm font-medium text-slate-700">{log.admin}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-slate-600 font-mono bg-white/50 px-2 py-0.5 rounded">
                                                            {log.fileName || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-700">
                                                                {new Date(log.timestamp).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {new Date(log.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-xs text-slate-400 font-mono">
                                                        {log.id.substring(log.id.length - 8)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="p-3 bg-slate-100 rounded-full">
                                                            <FileText size={24} className="text-slate-400" />
                                                        </div>
                                                        <p>No activity logs found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals */}
                <AddUserModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onAdd={handleAddUser}
                    existingUsers={users}
                />

                <EditUserModal
                    isOpen={editUser !== null}
                    onClose={() => setEditUser(null)}
                    onUpdate={handleUpdateUser}
                    user={editUser}
                    existingUsers={users}
                />

                <DeleteConfirmModal
                    isOpen={deleteUser !== null}
                    onClose={() => setDeleteUser(null)}
                    onConfirm={() => deleteUser && handleDeleteUser(deleteUser.id)}
                    userName={deleteUser?.fullName || ''}
                />

                <SystemLockdownModal
                    isOpen={showLockdownModal}
                    onClose={() => setShowLockdownModal(false)}
                    onConfirm={confirmLockdown}
                />
            </GlassCard>
        </div>
    );
}
