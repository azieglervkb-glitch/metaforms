'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';

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
        // Meta OAuth URL
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
            {/* Navigation */}
            <DashboardNav />

            <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>

            {/* Meta Connection Card */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Meta Business Account</h3>
                        {loading ? (
                            <p className="text-sm text-gray-500">Lädt...</p>
                        ) : connection.connected ? (
                            <p className="text-sm text-gray-500">{connection.page_name || 'Verbunden'}</p>
                        ) : (
                            <p className="text-sm text-gray-500">Nicht verbunden</p>
                        )}
                    </div>
                    {!loading && (
                        connection.connected ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                ✓ Aktiv
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                Setup erforderlich
                            </span>
                        )
                    )}
                </div>

                {!loading && (
                    connection.connected ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Pixel ID:</span>
                                    <span className="ml-2 font-mono text-gray-900">{connection.pixel_id || 'Wird geladen...'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Verbunden seit:</span>
                                    <span className="ml-2 text-gray-900">
                                        {connection.connected_at ? new Date(connection.connected_at).toLocaleDateString('de-DE') : '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleDisconnect}
                                    className="px-4 py-2 rounded-lg border text-sm text-red-600 hover:bg-red-50"
                                >
                                    Verbindung trennen
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Verbinde dein Meta Business Account um Lead Forms zu empfangen und Qualitätssignale automatisch zu senden.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-1">
                                <li>✓ Access Token wird automatisch gespeichert</li>
                                <li>✓ Pixel ID wird automatisch erkannt</li>
                                <li>✓ Leads aus allen Kampagnen werden empfangen</li>
                            </ul>
                            <button
                                onClick={handleConnectMeta}
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                                </svg>
                                Mit Meta verbinden
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* Webhook Info */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Webhook Konfiguration</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Konfiguriere diese URL in deiner Meta App unter Webhooks → leadgen:
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        readOnly
                        value={webhookUrl}
                        className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(webhookUrl);
                            alert('URL kopiert!');
                        }}
                        className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Kopieren
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    <strong>Verify Token:</strong> <code className="bg-gray-100 px-2 py-1 rounded">leadsignal_webhook_secret_123</code>
                </p>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h3 className="font-semibold text-blue-900 mb-3">So funktioniert's</h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Verbinde dein Meta Business Account oben</li>
                    <li>Konfiguriere den Webhook in deiner Meta App</li>
                    <li>Leads werden automatisch empfangen</li>
                    <li>Markiere Leads als "qualifiziert" oder "unqualifiziert"</li>
                    <li>Qualitätssignale werden automatisch an Meta gesendet</li>
                </ol>
            </div>
        </div>
    );
}
