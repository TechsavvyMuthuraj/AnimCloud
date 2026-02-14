"use client";

import { useState } from "react";
import { Clock, Calendar, X } from "lucide-react";
import { motion } from "framer-motion";

interface ExpirySelectorProps {
    value: string | null; // ISO timestamp or null
    onChange: (expiryDate: string | null) => void;
    showNeverOption?: boolean;
}

interface ExpiryPreset {
    label: string;
    hours: number | null; // null = never
    icon?: string;
}

const presetOptions: ExpiryPreset[] = [
    { label: "1 Hour", hours: 1, icon: "⏱️" },
    { label: "6 Hours", hours: 6, icon: "🕐" },
    { label: "1 Day", hours: 24, icon: "📅" },
    { label: "7 Days", hours: 168, icon: "📆" },
    { label: "30 Days", hours: 720, icon: "🗓️" },
    { label: "Never", hours: null, icon: "♾️" },
];

export function ExpirySelector({ value, onChange, showNeverOption = true }: ExpirySelectorProps) {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customDate, setCustomDate] = useState("");

    // Calculate expiry date from hours
    const calculateExpiryDate = (hours: number | null): string | null => {
        if (hours === null) return null;
        const now = new Date();
        const expiryDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return expiryDate.toISOString();
    };

    // Handle preset selection
    const handlePresetClick = (hours: number | null) => {
        const expiryDate = calculateExpiryDate(hours);
        onChange(expiryDate);
        setShowCustomPicker(false);
    };

    // Handle custom date selection
    const handleCustomDateChange = (dateString: string) => {
        setCustomDate(dateString);
        if (dateString) {
            const expiryDate = new Date(dateString).toISOString();
            onChange(expiryDate);
        }
    };

    // Format display date
    const formatDisplayDate = (isoString: string | null): string => {
        if (!isoString) return "Never expires";

        const date = new Date(isoString);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 1) {
            return `Expires in ${diffDays} days (${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        } else if (diffHours > 1) {
            return `Expires in ${diffHours} hours (${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        } else {
            return `Expires on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    };

    // Get minimum datetime for picker (current time)
    const getMinDateTime = () => {
        const now = new Date();
        return now.toISOString().slice(0, 16);
    };

    // Get maximum datetime for picker (1 year from now)
    const getMaxDateTime = () => {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return oneYearFromNow.toISOString().slice(0, 16);
    };

    const filteredPresets = showNeverOption ? presetOptions : presetOptions.filter(p => p.hours !== null);

    return (
        <div className="space-y-4">
            {/* Preset Options */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    <Clock className="inline mr-2" size={16} />
                    Set File Expiry (Optional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {filteredPresets.map((preset) => {
                        const isSelected = value === calculateExpiryDate(preset.hours);
                        return (
                            <motion.button
                                key={preset.label}
                                type="button"
                                onClick={() => handlePresetClick(preset.hours)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center justify-center px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${isSelected
                                    ? "border-pink-500 bg-pink-50 text-pink-700"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-pink-300 hover:bg-pink-50/50"
                                    }`}
                            >
                                <span className="mr-1">{preset.icon}</span>
                                {preset.label}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Custom Date Picker */}
            <div>
                <button
                    type="button"
                    onClick={() => setShowCustomPicker(!showCustomPicker)}
                    className="flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 transition-colors"
                >
                    <Calendar size={16} />
                    {showCustomPicker ? "Hide" : "Choose"} Custom Date & Time
                </button>

                {showCustomPicker && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                    >
                        <input
                            type="datetime-local"
                            value={customDate}
                            onChange={(e) => handleCustomDateChange(e.target.value)}
                            min={getMinDateTime()}
                            max={getMaxDateTime()}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </motion.div>
                )}
            </div>

            {/* Selected Expiry Display */}
            {value && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <Clock className="text-pink-600" size={18} />
                        <span className="text-sm font-medium text-slate-700">
                            {formatDisplayDate(value)}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            onChange(null);
                            setCustomDate("");
                            setShowCustomPicker(false);
                        }}
                        className="p-1 hover:bg-pink-100 rounded transition-colors"
                        title="Clear expiry"
                    >
                        <X size={16} className="text-pink-600" />
                    </button>
                </motion.div>
            )}
        </div>
    );
}
