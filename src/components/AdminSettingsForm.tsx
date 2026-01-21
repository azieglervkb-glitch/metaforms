'use client';

import { useState, useEffect } from 'react';

export default function AdminSettingsForm() {
    const [settings, setSettings] = useState({
        app_url: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [envStatus, setEnvStatus] = useState<{
        resend: boolean;
        envAppUrl: string | null;
        savedAppUrl: string | null;
        metaToken: boolean;
    } | null>(null);

    const fetchData = () => {
        // Fetch settings
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(prev => ({ ...prev, ...data.settings }));
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch env status
        fetch('/api/admin/env-status')
            .then(res => res.json())
            .then(data => setEnvStatus(data))
            .catch(() => {});
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (res.ok) {
                setMessage('✅ Einstellungen erfolgreich gespeichert');
                // Refresh data
                fetchData();
            } else {
                setMessage('❌ Fehler beim Speichern');
            }
        } catch {
            setMessage('❌ Netzwerkfehler');
        }
        setSaving(false);
    };

    if (loading) return <div>Laden...</div>;

    // Determine active app URL
    const activeAppUrl = envStatus?.savedAppUrl || envStatus?.envAppUrl || 'Nicht gesetzt';

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Environment Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-700">E-Mail (Resend)</span>
                        {envStatus?.resend ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                Konfiguriert
                            </span>
                        ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                Nicht konfiguriert
                            </span>
                        )}
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-gray-700">Meta API Token</span>
                        {envStatus?.metaToken ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                Konfiguriert
                            </span>
                        ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                Pro Organisation
                            </span>
                        )}
                    </div>
                    <div className="py-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700">Aktive App URL</span>
                            {envStatus?.savedAppUrl ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                                    Gespeichert
                                </span>
                            ) : envStatus?.envAppUrl ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                    Aus ENV
                                </span>
                            ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                                    Auto-Detect
                                </span>
                            )}
                        </div>
                        <div className="text-sm font-mono bg-gray-50 p-2 rounded border break-all">
                            {activeAppUrl}
                        </div>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    Portal-Links nutzen: 1. Gespeicherte URL, 2. ENV Variable, 3. Request-Domain
                </p>
            </div>

            {/* App URL Setting */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">App URL konfigurieren</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            App URL (für Portal Links)
                        </label>
                        <input
                            type="url"
                            name="app_url"
                            value={settings.app_url}
                            onChange={handleChange}
                            placeholder="https://leads.outrnk.io"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            z.B. https://leads.outrnk.io - wird für Portal-Links in E-Mails verwendet
                        </p>
                    </div>

                    <div className="pt-4 border-t">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Speichern...' : 'Speichern'}
                        </button>
                        {message && (
                            <p className={`mt-4 text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
