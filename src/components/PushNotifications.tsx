'use client';

import { useEffect, useState } from 'react';

interface PushNotificationManagerProps {
    onNewLead?: (lead: { full_name?: string; email?: string }) => void;
}

export default function PushNotificationManager({ onNewLead }: PushNotificationManagerProps) {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if ('Notification' in window) {
            setSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!supported) return;

        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === 'granted') {
            // Show test notification
            new Notification('outrnk Leads Benachrichtigungen aktiviert! 🔔', {
                body: 'Du wirst jetzt bei neuen Leads benachrichtigt.',
                icon: '/icon.png',
            });
        }
    };

    if (!supported) {
        return null;
    }

    if (permission === 'granted') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 text-green-700 text-sm">
                <span>🔔</span>
                <span>Push-Benachrichtigungen aktiv</span>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 text-sm">
                <span>🔕</span>
                <span>Benachrichtigungen blockiert</span>
            </div>
        );
    }

    return (
        <button
            onClick={requestPermission}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
        >
            <span>🔔</span>
            <span>Push-Benachrichtigungen aktivieren</span>
        </button>
    );
}

/**
 * Show browser notification for new lead
 */
export function showNewLeadNotification(lead: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    form_name?: string | null;
}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const name = lead.full_name || lead.email || 'Neuer Kontakt';
    const body = [
        lead.email,
        lead.phone,
        lead.form_name ? `📋 ${lead.form_name}` : null
    ].filter(Boolean).join(' • ');

    new Notification(`📥 Neuer Lead: ${name}`, {
        body: body || 'Jetzt im Dashboard ansehen',
        icon: '/icon.png',
        tag: 'new-lead', // Prevents duplicate notifications
        requireInteraction: true, // Keep notification visible
    });
}
