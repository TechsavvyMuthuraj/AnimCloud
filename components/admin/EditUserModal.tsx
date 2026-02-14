"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { User, isValidEmail, isEmailUnique, generateInitials } from "@/lib/admin-utils";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (user: User) => void;
    user: User | null;
    existingUsers: User[];
}

export function EditUserModal({ isOpen, onClose, onUpdate, user, existingUsers }: EditUserModalProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "User" as User['role'],
        storageLimit: 10,
        status: "Active" as User['status']
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load user data when modal opens
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName,
                email: user.email,
                password: user.password || "",
                role: user.role,
                storageLimit: user.storageLimit,
                status: user.status
            });
        }
    }, [user]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
            newErrors.fullName = "Name must be at least 2 characters";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = "Invalid email format";
        } else if (user && formData.email !== user.email && !isEmailUnique(formData.email, existingUsers)) {
            newErrors.email = "Email already exists";
        }

        // Password is optional for edit, but if provided must be at least 6 characters
        if (formData.password.trim() && formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (formData.storageLimit < 1) {
            newErrors.storageLimit = "Storage must be at least 1GB";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm() || !user) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        const updatedUser: User = {
            ...user,
            fullName: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password || user.password,
            role: formData.role,
            storageLimit: formData.storageLimit,
            status: formData.status,
            avatar: generateInitials(formData.fullName)
        };

        onUpdate(updatedUser);

        setErrors({});
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative glass rounded-2xl border border-white/20 p-6 w-full max-w-md shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                            Edit User
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className={`w-full px-4 py-2 bg-white/50 border rounded-lg focus:outline-none focus:ring-2 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                                    }`}
                                placeholder="John Doe"
                            />
                            {errors.fullName && (
                                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={`w-full px-4 py-2 bg-white/50 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                                    }`}
                                placeholder="john@example.com"
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Password <span className="text-slate-400 text-xs">(Optional - leave blank to keep current)</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={`w-full px-4 py-2 bg-white/50 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                                    }`}
                                placeholder="Enter new password (min 6 characters)"
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                className="w-full px-4 py-2 bg-white/50 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="User">User</option>
                                <option value="Pro">Pro</option>
                                <option value="Elite">Elite</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {/* Storage Limit */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Storage Limit (GB) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.storageLimit}
                                onChange={(e) => setFormData({ ...formData, storageLimit: parseInt(e.target.value) || 1 })}
                                className={`w-full px-4 py-2 bg-white/50 border rounded-lg focus:outline-none focus:ring-2 ${errors.storageLimit ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'
                                    }`}
                            />
                            {errors.storageLimit && (
                                <p className="text-xs text-red-500 mt-1">{errors.storageLimit}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Status
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="Active"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        value="Inactive"
                                        checked={formData.status === 'Inactive'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                                        className="text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">Inactive</span>
                                </label>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 bg-white/50 border border-white/20 text-slate-700 rounded-lg font-semibold hover:bg-white/70 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update User'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
