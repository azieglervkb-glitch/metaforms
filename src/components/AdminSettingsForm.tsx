'use client';

import { useState, useEffect } from 'react';

export default function AdminSettingsForm() {
    const [settings, setSettings] = useState({
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_pass: '',
        smtp_from: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) {
                    setSettings(prev => ({ ...prev, ...data.settings }));
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-6">SMTP E-Mail Konfiguration</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                        <input
                            type="text"
                            name="smtp_host"
                            value={settings.smtp_host}
                            onChange={handleChange}
                            placeholder="smtp.example.com"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                        <input
                            type="text"
                            name="smtp_port"
                            value={settings.smtp_port}
                            onChange={handleChange}
                            placeholder="587"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Benutzername</label>
                        <input
                            type="text"
                            name="smtp_user"
                            value={settings.smtp_user}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
                        <input
                            type="password"
                            name="smtp_pass"
                            value={settings.smtp_pass}
                            onChange={handleChange}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Absender E-Mail (From)</label>
                    <input
                        type="email"
                        name="smtp_from"
                        value={settings.smtp_from}
                        onChange={handleChange}
                        placeholder="noreply@mycompany.com"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors w-full md:w-auto"
                    >
                        {saving ? 'Speichern...' : 'Einstellungen speichern'}
                    </button>
                    {message && (
                        <p className={`mt-4 text-sm font-medium ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}
