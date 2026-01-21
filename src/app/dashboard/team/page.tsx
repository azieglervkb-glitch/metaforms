'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface TeamMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    total_leads: string;
    qualified_leads: string;
    unqualified_leads: string;
    pending_leads: string;
    has_portal_token: boolean;
}

export default function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState('');
    const [generatingToken, setGeneratingToken] = useState<string | null>(null);

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
                toast.success('Team-Mitglied hinzugefügt');
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
            toast.success('Team-Mitglied entfernt');
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const handleGeneratePortalLink = async (memberId: string) => {
        setGeneratingToken(memberId);
        try {
            const res = await fetch(`/api/team/${memberId}/portal-token`, {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok && data.portalUrl) {
                await navigator.clipboard.writeText(data.portalUrl);
                toast.success('Portal-Link in Zwischenablage kopiert!');
                fetchMembers();
            } else {
                toast.error(data.error || 'Fehler beim Generieren');
            }
        } catch {
            toast.error('Fehler beim Generieren');
        }
        setGeneratingToken(null);
    };

    const handleCopyPortalLink = async (memberId: string) => {
        try {
            const res = await fetch(`/api/team/${memberId}/portal-token`);
            const data = await res.json();

            if (res.ok && data.portalUrl) {
                await navigator.clipboard.writeText(data.portalUrl);
                toast.success('Portal-Link kopiert!');
            }
        } catch {
            toast.error('Fehler beim Kopieren');
        }
    };

    // Calculate totals
    const totalLeads = members.reduce((sum, m) => sum + parseInt(m.total_leads || '0'), 0);
    const totalQualified = members.reduce((sum, m) => sum + parseInt(m.qualified_leads || '0'), 0);
    const totalUnqualified = members.reduce((sum, m) => sum + parseInt(m.unqualified_leads || '0'), 0);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Team verwalten</h1>

            {/* Stats Overview */}
            {members.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border p-4">
                        <p className="text-sm text-gray-500">Team-Mitglieder</p>
                        <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border p-4">
                        <p className="text-sm text-gray-500">Zugewiesene Leads</p>
                        <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                    </div>
                    <div className="bg-white rounded-xl border p-4">
                        <p className="text-sm text-gray-500">Als Gut bewertet</p>
                        <p className="text-2xl font-bold text-green-600">{totalQualified}</p>
                    </div>
                    <div className="bg-white rounded-xl border p-4">
                        <p className="text-sm text-gray-500">Als Schlecht bewertet</p>
                        <p className="text-2xl font-bold text-red-600">{totalUnqualified}</p>
                    </div>
                </div>
            )}

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

            {/* Team Members List with Stats */}
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
                                <th className="text-center p-4 text-sm font-medium text-gray-600">Leads</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-600">Gut</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-600">Schlecht</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-600">Rate</th>
                                <th className="text-center p-4 text-sm font-medium text-gray-600">Portal</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map((member) => {
                                const total = parseInt(member.total_leads || '0');
                                const qualified = parseInt(member.qualified_leads || '0');
                                const unqualified = parseInt(member.unqualified_leads || '0');
                                const rated = qualified + unqualified;
                                const rate = rated > 0 ? Math.round((qualified / rated) * 100) : null;

                                return (
                                    <tr key={member.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-900">
                                            {member.first_name} {member.last_name}
                                        </td>
                                        <td className="p-4 text-gray-600">{member.email}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                                                {total}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                                                {qualified}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-semibold text-sm">
                                                {unqualified}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            {rate !== null ? (
                                                <span className={`text-sm font-medium ${rate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {rate}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {member.has_portal_token ? (
                                                <button
                                                    onClick={() => handleCopyPortalLink(member.id)}
                                                    className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    title="Link kopieren"
                                                >
                                                    Link kopieren
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleGeneratePortalLink(member.id)}
                                                    disabled={generatingToken === member.id}
                                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                                >
                                                    {generatingToken === member.id ? '...' : 'Erstellen'}
                                                </button>
                                            )}
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
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Wie funktioniert's?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>&#8226; Füge Team-Mitglieder mit Name und E-Mail hinzu</li>
                    <li>&#8226; Im Kanban-Board kannst du Leads an Mitglieder zuweisen</li>
                    <li>&#8226; Das Mitglied erhält automatisch eine E-Mail mit Portal-Link</li>
                    <li>&#8226; Im Portal kann das Mitglied seine Leads sehen und bewerten</li>
                    <li>&#8226; Die Statistiken zeigen dir, wer die besten Leads bearbeitet</li>
                </ul>
            </div>
        </div>
    );
}
