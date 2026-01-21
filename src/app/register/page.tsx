'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwörter stimmen nicht überein');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Passwort muss mindestens 6 Zeichen lang sein');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fullName }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registrierung fehlgeschlagen');
                setLoading(false);
                return;
            }

            window.location.href = '/dashboard';
        } catch {
            setError('Ein Fehler ist aufgetreten');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">LeadSignal</h1>
                    <p className="text-gray-500 mt-1">Lead Management System</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-xl border p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Konto erstellen</h2>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                placeholder="Max Mustermann"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                E-Mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="deine@email.de"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Passwort
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Passwort bestätigen
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Wird erstellt...' : 'Konto erstellen'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-500">Bereits ein Konto? </span>
                        <Link href="/login" className="text-blue-500 hover:underline font-medium">
                            Jetzt anmelden
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
