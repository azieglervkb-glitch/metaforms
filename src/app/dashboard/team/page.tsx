'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TeamMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            setMembers(data.members || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        }
        setLoading(false);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdding(true);
        setError('');

        try {
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Fehler beim Hinzufügen');
            } else {
                setFirstName('');
                setLastName('');
                setEmail('');
                fetchMembers();
            }
        } catch {
            setError('Fehler beim Hinzufügen');
        }
        setAdding(false);
    };

    const handleDeleteMember = async (id: string) => {
        if (!confirm('Team-Mitglied wirklich entfernen?')) return;

        try {
            await fetch(`/api/team/${id}`, { method: 'DELETE' });
            fetchMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
                <Link href="/dashboard" className="px-6 py-2 rounded-full bg-white border text-gray-600 text-sm font-medium hover:bg-gray-50">
                    Übersicht
                </Link>
                <Link href="/dashboard/leads" className="px-6 py-2 rounded-full bg-white border text-gray-600 text-sm font-medium hover:bg-gray-50">
                    Leads
                </Link>
                <Link href="/dashboard/kanban" className="px-6 py-2 rounded-full bg-white border text-gray-600 text-sm font-medium hover:bg-gray-50">
                    Kanban
                </Link>
                <Link href="/dashboard/team" className="px-6 py-2 rounded-full bg-blue-500 text-white text-sm font-medium">
                    Team
                </Link>
                <Link href="/dashboard/settings" className="px-6 py-2 rounded-full bg-white border text-gray-600 text-sm font-medium hover:bg-gray-50">
                    Einstellungen
                </Link>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Team verwalten</h1>

            {/* Add Member Form */}
            <div className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Neues Team-Mitglied hinzufügen</h2>
                <form onSubmit={handleAddMember} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Vorname</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Max"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Nachname</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Mustermann"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">E-Mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="max@firma.de"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={adding}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
                    >
                        {adding ? 'Hinzufügen...' : 'Hinzufügen'}
                    </button>
                </form>
                {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
            </div>

            {/* Team Members List */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-900">Team-Mitglieder ({members.length})</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Lädt...</div>
                ) : members.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>Noch keine Team-Mitglieder</p>
                        <p className="text-sm text-gray-400 mt-1">Füge Mitglieder hinzu, um Leads zuzuweisen</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">E-Mail</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Hinzugefügt</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => (
                                <tr key={member.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">
                                        {member.first_name} {member.last_name}
                                    </td>
                                    <td className="p-4 text-gray-600">{member.email}</td>
                                    <td className="p-4 text-gray-500 text-sm">
                                        {new Date(member.created_at).toLocaleDateString('de-DE')}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Entfernen
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Wie funktioniert's?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Füge Team-Mitglieder mit Name und E-Mail hinzu</li>
                    <li>• Im Kanban-Board kannst du Leads an Mitglieder zuweisen</li>
                    <li>• Das Mitglied erhält automatisch eine E-Mail-Benachrichtigung</li>
                </ul>
            </div>
        </div>
    );
}
