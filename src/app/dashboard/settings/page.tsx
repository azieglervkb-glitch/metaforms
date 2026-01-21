'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
    const [metaConnected, setMetaConnected] = useState(false);
    const [pixelId, setPixelId] = useState('');
    const [saving, setSaving] = useState(false);

    const handleConnectMeta = () => {
        // Meta OAuth URL - will be configured with actual app ID
        const appId = process.env.NEXT_PUBLIC_META_APP_ID || 'YOUR_META_APP_ID';
        const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/meta/callback`);
        const scope = encodeURIComponent('leads_retrieval,pages_show_list,pages_read_engagement,ads_management');

        window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    };

    const handleSavePixel = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/pixel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pixelId }),
            });
            if (res.ok) {
                alert('Pixel ID gespeichert!');
            }
        } catch {
            alert('Fehler beim Speichern');
        }
        setSaving(false);
    };

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-2">
                <Link
                    href="/dashboard"
                    className="px-6 py-2 rounded-full bg-white border text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                    Leads
                </Link>
                <Link
                    href="/dashboard/settings"
                    className="px-6 py-2 rounded-full bg-blue-500 text-white text-sm font-medium"
                >
                    Einstellungen
                </Link>
            </div>

            {/* Meta Connection Card */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Meta Business Account</h3>
                        <p className="text-sm text-gray-500">
                            {metaConnected ? 'Verbunden' : 'Nicht verbunden'}
                        </p>
                    </div>
                    {metaConnected ? (
                        <span className="ml-auto px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Aktiv
                        </span>
                    ) : (
                        <span className="ml-auto px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            Setup erforderlich
                        </span>
                    )}
                </div>

                {!metaConnected ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Verbinde dein Meta Business Account um Lead Forms zu empfangen und Qualitätssignale zu senden.
                        </p>
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
                ) : (
                    <div className="text-sm text-gray-600">
                        ✓ Lead Forms werden automatisch empfangen
                    </div>
                )}
            </div>

            {/* Pixel Configuration */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Meta Pixel Konfiguration</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Gib deine Pixel ID ein, um Qualitätssignale über die Conversions API zu senden.
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Pixel ID (z.B. 123456789012345)"
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <button
                        onClick={handleSavePixel}
                        disabled={saving || !pixelId}
                        className="px-6 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                    >
                        {saving ? 'Speichern...' : 'Speichern'}
                    </button>
                </div>
            </div>

            {/* Webhook Info */}
            <div className="bg-white rounded-xl border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Webhook URL</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Konfiguriere diese URL in deiner Meta App unter Webhooks → leadgen:
                </p>
                <div className="flex gap-3">
                    <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/meta`}
                        className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                    />
                    <button
                        onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/meta`)}
                        className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Kopieren
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Verify Token: <code className="bg-gray-100 px-2 py-1 rounded">leadsignal_webhook_secret_123</code>
                </p>
            </div>
        </div>
    );
}
