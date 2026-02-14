"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface BackButtonProps {
    label?: string;
    href?: string;
    className?: string;
}

export function BackButton({ label = "Back", href, className = "" }: BackButtonProps) {
    const router = useRouter();

    const handleClick = () => {
        if (href) {
            router.push(href);
        } else {
            router.back();
        }
    };

    return (
        <motion.button
            onClick={handleClick}
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-all ${className}`}
        >
            <ArrowLeft size={18} />
            <span>{label}</span>
        </motion.button>
    );
}
