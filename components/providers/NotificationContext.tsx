"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
    id: number;
    title: string;
    text: string;
    time: string;
    type: NotificationType;
    read: boolean;
    link?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (title: string, text: string, type?: NotificationType, link?: string) => void;
    markAsRead: (id: number) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('animdrive_notifications');
        if (saved) {
            try {
                setNotifications(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse notifications", e);
            }
        } else {
            // Add a welcome notification if empty
            addNotification("Welcome to AnimDrive!", "Your magical journey begins here.", "info");
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('animdrive_notifications', JSON.stringify(notifications));
    }, [notifications]);

    const addNotification = (title: string, text: string, type: NotificationType = 'info', link?: string) => {
        const newNotification: Notification = {
            id: Date.now(),
            title,
            text,
            time: 'Just now',
            type,
            read: false,
            link
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
