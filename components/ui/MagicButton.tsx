"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagicButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "magic";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children?: React.ReactNode;
}

export const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
        const baseStyles = "relative inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden cursor-pointer";

        const variants = {
            primary: "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:brightness-110",
            secondary: "bg-white/80 backdrop-blur-sm text-pink-900 border border-pink-200 hover:bg-white shadow-sm",
            danger: "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30 hover:brightness-110",
            ghost: "text-pink-700 hover:bg-pink-100/50 hover:text-pink-900",
            magic: "bg-slate-950 text-white relative z-10 group overflow-hidden border border-white/10",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm",
            md: "h-11 px-6 text-base",
            lg: "h-14 px-8 text-lg",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {variant === 'magic' && (
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <span className={cn("relative z-10 flex items-center justify-center gap-2 w-full h-full", variant === 'magic' && "bg-slate-950/90 rounded-lg px-3 py-1 group-hover:bg-slate-950/80 transition-colors")}>
                    {isLoading && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="mr-2"
                        >
                            ✨
                        </motion.div>
                    )}
                    {children}
                </span>
            </motion.button>
        );
    }
);

MagicButton.displayName = "MagicButton";
