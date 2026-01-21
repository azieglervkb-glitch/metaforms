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
        appUrl: string | null;
        metaToken: boolean;
    } | null>(null);

    useEffect(() => {
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
            } else {
                setMessage('❌ Fehler beim Speichern');
            }
        } catch {
            setMessage('❌ Netzwerkfehler');
        }
        setSaving(false);
    };

    if (loading) return <div>Laden...</div>;

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
                    <div className="flex items-center justify-between py-2">
                        <span className="text-gray-700">App URL</span>
                        <span className="text-sm text-gray-500 font-mono">
                            {envStatus?.appUrl || 'Nicht gesetzt'}
                        </span>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                    E-Mail wird über Resend gesendet (RESEND_API_KEY in ENV). SMTP wird nicht verwendet.
                </p>
            </div>

            {/* App URL Setting */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">App Konfiguration</h3>
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
                            placeholder="https://your-domain.com"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Wird für Portal-Links verwendet. Falls leer, wird NEXT_PUBLIC_APP_URL aus ENV genutzt.
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
