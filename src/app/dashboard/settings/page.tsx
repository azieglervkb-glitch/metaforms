'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmailTemplateEditor from '@/components/EmailTemplateEditor';

interface MetaConnection {
    connected: boolean;
    page_name?: string;
    pixel_id?: string;
    connected_at?: string;
}

export default function SettingsPage() {
    const [connection, setConnection] = useState<MetaConnection>({ connected: false });
    const [loading, setLoading] = useState(true);
    const [webhookUrl, setWebhookUrl] = useState('');
    const [activeTab, setActiveTab] = useState<'general' | 'email'>('general');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWebhookUrl(`${window.location.origin}/api/webhooks/meta`);
        }
        fetchConnection();
    }, []);

    const fetchConnection = async () => {
        try {
            const res = await fetch('/api/meta/status');
            const data = await res.json();
            setConnection(data);
        } catch (error) {
            console.error('Error fetching connection:', error);
        }
        setLoading(false);
    };

    const handleConnectMeta = () => {
        const appId = process.env.NEXT_PUBLIC_META_APP_ID || '';
        if (!appId) {
            alert('Meta App ID ist nicht konfiguriert. Bitte in Coolify Umgebungsvariablen setzen.');
            return;
        }

        const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/meta/callback`);
        const scope = encodeURIComponent('leads_retrieval,pages_show_list,pages_read_engagement,ads_management,ads_read');

        window.location.href = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    };

    const handleDisconnect = async () => {
        if (!confirm('Meta Verbindung wirklich trennen?')) return;

        try {
            await fetch('/api/meta/disconnect', { method: 'POST' });
            setConnection({ connected: false });
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
                <p className="text-gray-500 text-sm mt-1">Meta-Verbindung und Benachrichtigungen konfigurieren</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 p-1 inline-flex">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'general'
                            ? 'bg-[#0052FF] text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    Allgemein
                </button>
                <button
                    onClick={() => setActiveTab('email')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'email'
                            ? 'bg-[#0052FF] text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    E-Mail Template
                </button>
            </div>

            {activeTab === 'general' ? (
                <>
                    {/* Meta Connection Card */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Meta Business Account</h3>
                                    {loading ? (
                                        <p className="text-sm text-gray-500">Ladt...</p>
                                    ) : connection.connected ? (
                                        <p className="text-sm text-gray-500">{connection.page_name || 'Verbunden'}</p>
                                    ) : (
                                        <p className="text-sm text-gray-500">Nicht verbunden</p>
                                    )}
                                </div>
                                {!loading && (
                                    connection.connected ? (
                                        <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                            Aktiv
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                            Setup erforderlich
                                        </span>
                                    )
                                )}
                            </div>
                        </div>

                        {!loading && (
                            <div className="px-6 pb-6">
                                {connection.connected ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide">Pixel ID</span>
                                                <p className="font-mono text-sm text-gray-900 mt-1">{connection.pixel_id || 'Automatisch'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 uppercase tracking-wide">Verbunden seit</span>
                                                <p className="text-sm text-gray-900 mt-1">
                                                    {connection.connected_at ? new Date(connection.connected_at).toLocaleDateString('de-DE') : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDisconnect}
                                            className="px-4 py-2.5 rounded-lg border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Verbindung trennen
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600">
                                            Verbinde dein Meta Business Account um Lead Forms zu empfangen und Qualitatssignale zu senden.
                                        </p>
                                        <button
                                            onClick={handleConnectMeta}
                                            className="px-6 py-2.5 rounded-lg bg-[#0052FF] text-white text-sm font-medium hover:bg-[#0047E1] transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                                            </svg>
                                            Mit Meta verbinden
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notifications Section */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Benachrichtigungen</h3>
                            <p className="text-sm text-gray-500 mt-1">Wie mochtest du uber neue Leads informiert werden?</p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {/* Browser Push */}
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Browser Push</h4>
                                        <p className="text-sm text-gray-500">Sofort-Benachrichtigung bei neuem Lead</p>
                                    </div>
                                </div>
                                <PushNotificationToggle />
                            </div>

                            {/* Email */}
                            <div className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">E-Mail Benachrichtigungen</h4>
                                        <p className="text-sm text-gray-500">Bei Lead-Zuweisung mit Bewertungs-Buttons</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                        Aktiv
                                    </span>
                                    <button
                                        onClick={() => setActiveTab('email')}
                                        className="text-sm text-[#0052FF] font-medium hover:underline"
                                    >
                                        Anpassen
                                    </button>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="flex items-center justify-between p-6 opacity-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">WhatsApp</h4>
                                        <p className="text-sm text-gray-500">Sofortige Benachrichtigung per WhatsApp</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                                    Coming Soon
                                </span>
                            </div>

                            {/* Slack */}
                            <div className="flex items-center justify-between p-6 opacity-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">Slack Integration</h4>
                                        <p className="text-sm text-gray-500">Leads direkt in deinem Slack Channel</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Webhook Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Webhook URL</h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    Konfiguriere diese URL in deiner Meta App unter Webhooks → leadgen
                                </p>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        readOnly
                                        value={webhookUrl}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(webhookUrl);
                                            alert('URL kopiert!');
                                        }}
                                        className="px-4 py-2.5 rounded-lg bg-[#0052FF] text-white text-sm font-medium hover:bg-[#0047E1] transition-colors"
                                    >
                                        Kopieren
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Help Link */}
                    <div className="bg-[#0052FF]/5 rounded-xl border border-[#0052FF]/10 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Hilfe benotigt?</h3>
                                    <p className="text-sm text-gray-600">Erfahre wie outrnk Leads funktioniert</p>
                                </div>
                            </div>
                            <Link
                                href="/faq"
                                className="px-4 py-2.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                FAQ lesen
                            </Link>
                        </div>
                    </div>
                </>
            ) : (
                /* Email Template Tab */
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <EmailTemplateEditor />
                </div>
            )}
        </div>
    );
}

function PushNotificationToggle() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [supported, setSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!supported) return;
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result === 'granted') {
            new Notification('outrnk Leads', {
                body: 'Push-Benachrichtigungen aktiviert!',
            });
        }
    };

    if (!supported) {
        return <span className="text-xs text-gray-400">Nicht unterstutzt</span>;
    }

    if (permission === 'granted') {
        return (
            <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                Aktiv
            </span>
        );
    }

    if (permission === 'denied') {
        return (
            <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                Blockiert
            </span>
        );
    }

    return (
        <button
            onClick={requestPermission}
            className="px-4 py-2 rounded-lg bg-[#0052FF] text-white text-xs font-medium hover:bg-[#0047E1] transition-colors"
        >
            Aktivieren
        </button>
    );
}
