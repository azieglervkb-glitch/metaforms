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

interface Lead {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    quality_status: string;
    form_name: string | null;
    notes: string | null;
    created_at: string;
}

interface MemberAnalytics {
    total: number;
    byStatus: Record<string, number>;
    byQuality: Record<string, number>;
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
    const [showAddForm, setShowAddForm] = useState(false);

    // Modal state
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [memberLeads, setMemberLeads] = useState<Lead[]>([]);
    const [memberAnalytics, setMemberAnalytics] = useState<MemberAnalytics | null>(null);
    const [loadingMemberData, setLoadingMemberData] = useState(false);

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

    const fetchMemberLeads = async (memberId: string) => {
        setLoadingMemberData(true);
        try {
            const res = await fetch(`/api/team/${memberId}/leads`);
            const data = await res.json();
            setMemberLeads(data.leads || []);
            setMemberAnalytics(data.analytics || null);
        } catch (error) {
            console.error('Error fetching member leads:', error);
            toast.error('Fehler beim Laden der Leads');
        }
        setLoadingMemberData(false);
    };

    const handleOpenMemberModal = (member: TeamMember) => {
        setSelectedMember(member);
        fetchMemberLeads(member.id);
    };

    const handleCloseMemberModal = () => {
        setSelectedMember(null);
        setMemberLeads([]);
        setMemberAnalytics(null);
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
                setError(data.error || 'Fehler beim Hinzufugen');
            } else {
                setFirstName('');
                setLastName('');
                setEmail('');
                setShowAddForm(false);
                fetchMembers();
                toast.success('Team-Mitglied hinzugefugt');
            }
        } catch {
            setError('Fehler beim Hinzufugen');
        }
        setAdding(false);
    };

    const handleDeleteMember = async (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        if (!confirm(`${name} wirklich aus dem Team entfernen?`)) return;

        try {
            await fetch(`/api/team/${id}`, { method: 'DELETE' });
            fetchMembers();
            toast.success('Team-Mitglied entfernt');
        } catch (error) {
            console.error('Error deleting member:', error);
        }
    };

    const copyToClipboard = async (text: string): Promise<boolean> => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch {
            return false;
        }
    };

    const handleGeneratePortalLink = async (e: React.MouseEvent, memberId: string) => {
        e.stopPropagation();
        setGeneratingToken(memberId);
        try {
            const res = await fetch(`/api/team/${memberId}/portal-token`, {
                method: 'POST',
            });
            const data = await res.json();

            if (res.ok && data.portalUrl) {
                const copied = await copyToClipboard(data.portalUrl);
                if (copied) {
                    toast.success('Portal-Link in Zwischenablage kopiert!');
                } else {
                    toast.success('Portal-Link erstellt!');
                    console.log('Portal URL:', data.portalUrl);
                }
                fetchMembers();
            } else {
                toast.error(data.error || 'Fehler beim Generieren');
            }
        } catch (err) {
            console.error('Generate portal link error:', err);
            toast.error('Fehler beim Generieren');
        }
        setGeneratingToken(null);
    };

    const handleCopyPortalLink = async (e: React.MouseEvent, memberId: string) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/team/${memberId}/portal-token`);
            const data = await res.json();

            if (res.ok && data.portalUrl) {
                const copied = await copyToClipboard(data.portalUrl);
                if (copied) {
                    toast.success('Portal-Link kopiert!');
                } else {
                    toast.error('Kopieren fehlgeschlagen');
                    console.log('Portal URL:', data.portalUrl);
                }
            } else {
                toast.error(data.error || 'Fehler beim Kopieren');
            }
        } catch (err) {
            console.error('Copy portal link error:', err);
            toast.error('Fehler beim Kopieren');
        }
    };

    const totalLeads = members.reduce((sum, m) => sum + parseInt(m.total_leads || '0'), 0);
    const totalQualified = members.reduce((sum, m) => sum + parseInt(m.qualified_leads || '0'), 0);
    const totalUnqualified = members.reduce((sum, m) => sum + parseInt(m.unqualified_leads || '0'), 0);

    // Status configuration for kanban - simplified
    const statusConfig = [
        { key: 'new', label: 'Neu' },
        { key: 'contacted', label: 'Kontaktiert' },
        { key: 'qualified', label: 'Qualifiziert' },
        { key: 'proposal', label: 'Angebot' },
        { key: 'won', label: 'Gewonnen' },
        { key: 'lost', label: 'Verloren' },
    ];

    const getLeadsByStatus = (status: string) => memberLeads.filter(l => l.status === status);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team</h1>
                    <p className="text-gray-500 text-sm mt-1">Verwalte dein Team und weise Leads zu</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2.5 bg-[#0052FF] text-white rounded-lg font-medium hover:bg-[#0047E1] transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Mitglied hinzufugen
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Team-Mitglieder</p>
                            <p className="text-2xl font-bold text-gray-900">{members.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Zugewiesene Leads</p>
                            <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Qualifiziert</p>
                            <p className="text-2xl font-bold text-green-600">{totalQualified}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Nicht qualifiziert</p>
                            <p className="text-2xl font-bold text-red-600">{totalUnqualified}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Neues Team-Mitglied</h2>
                                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleAddMember} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vorname</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none transition-colors"
                                        placeholder="Max"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nachname</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none transition-colors"
                                        placeholder="Mustermann"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">E-Mail</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none transition-colors"
                                    placeholder="max@firma.de"
                                />
                            </div>
                            {error && (
                                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
                            )}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="flex-1 px-4 py-2.5 bg-[#0052FF] text-white rounded-lg font-medium hover:bg-[#0047E1] disabled:opacity-50 transition-colors"
                                >
                                    {adding ? 'Hinzufugen...' : 'Hinzufugen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Member Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseMemberModal}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0052FF] to-[#0047E1] flex items-center justify-center text-white font-semibold text-xl">
                                        {selectedMember.first_name[0]}{selectedMember.last_name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {selectedMember.first_name} {selectedMember.last_name}
                                        </h2>
                                        <p className="text-gray-500">{selectedMember.email}</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseMemberModal} className="text-gray-400 hover:text-gray-600 p-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingMemberData ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                    <span className="ml-3 text-gray-500">Lade Daten...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Stats Row - Simple */}
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">Gesamt</p>
                                            <p className="text-2xl font-bold text-gray-900">{memberAnalytics?.total || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">Ausstehend</p>
                                            <p className="text-2xl font-bold text-gray-900">{memberAnalytics?.byQuality['pending'] || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">Qualifiziert</p>
                                            <p className="text-2xl font-bold text-gray-900">{memberAnalytics?.byQuality['qualified'] || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-500">Nicht qualifiziert</p>
                                            <p className="text-2xl font-bold text-gray-900">{memberAnalytics?.byQuality['unqualified'] || 0}</p>
                                        </div>
                                    </div>

                                    {/* Leads Table */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Zugewiesene Leads</h3>
                                        {memberLeads.length === 0 ? (
                                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                                <p className="text-gray-500">Noch keine Leads zugewiesen</p>
                                            </div>
                                        ) : (
                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="w-full">
                                                    <thead className="bg-gray-50 border-b border-gray-200">
                                                        <tr>
                                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Formular</th>
                                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Qualitat</th>
                                                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Datum</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {memberLeads.map((lead) => (
                                                            <tr key={lead.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3">
                                                                    <p className="font-medium text-gray-900">{lead.full_name || '-'}</p>
                                                                    <p className="text-sm text-gray-500">{lead.email}</p>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {lead.form_name || '-'}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="text-sm text-gray-700">
                                                                        {statusConfig.find(s => s.key === lead.status)?.label || lead.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {lead.quality_status === 'qualified' && (
                                                                        <span className="inline-flex items-center gap-1 text-sm text-green-700">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                                            Gut
                                                                        </span>
                                                                    )}
                                                                    {lead.quality_status === 'unqualified' && (
                                                                        <span className="inline-flex items-center gap-1 text-sm text-red-700">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                                            Schlecht
                                                                        </span>
                                                                    )}
                                                                    {lead.quality_status === 'pending' && (
                                                                        <span className="text-sm text-gray-400">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                                    {formatDate(lead.created_at)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members Grid */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Ladt...</div>
            ) : members.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Team-Mitglieder</h3>
                    <p className="text-gray-500 mb-6">Fuge Mitglieder hinzu, um ihnen Leads zuzuweisen</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-6 py-2.5 bg-[#0052FF] text-white rounded-lg font-medium hover:bg-[#0047E1] transition-colors"
                    >
                        Erstes Mitglied hinzufugen
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => {
                        const total = parseInt(member.total_leads || '0');
                        const qualified = parseInt(member.qualified_leads || '0');
                        const unqualified = parseInt(member.unqualified_leads || '0');
                        const rated = qualified + unqualified;
                        const rate = rated > 0 ? Math.round((qualified / rated) * 100) : null;

                        return (
                            <div
                                key={member.id}
                                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#0052FF]/30 transition-all cursor-pointer"
                                onClick={() => handleOpenMemberModal(member)}
                            >
                                {/* Header with Avatar */}
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0052FF] to-[#0047E1] flex items-center justify-center text-white font-semibold text-lg">
                                                {member.first_name[0]}{member.last_name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {member.first_name} {member.last_name}
                                                </h3>
                                                <p className="text-sm text-gray-500 truncate max-w-[180px]">{member.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteMember(e, member.id, `${member.first_name} ${member.last_name}`)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                            title="Entfernen"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="p-5 bg-gray-50">
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div>
                                            <p className="text-xl font-bold text-gray-900">{total}</p>
                                            <p className="text-xs text-gray-500">Leads</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-green-600">{qualified}</p>
                                            <p className="text-xs text-gray-500">Gut</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-red-600">{unqualified}</p>
                                            <p className="text-xs text-gray-500">Schlecht</p>
                                        </div>
                                        <div>
                                            <p className={`text-xl font-bold ${rate !== null ? (rate >= 50 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                                                {rate !== null ? `${rate}%` : '-'}
                                            </p>
                                            <p className="text-xs text-gray-500">Rate</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Portal Link Action */}
                                <div className="p-4 border-t border-gray-100">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenMemberModal(member);
                                            }}
                                            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Details
                                        </button>
                                        {member.has_portal_token ? (
                                            <button
                                                onClick={(e) => handleCopyPortalLink(e, member.id)}
                                                className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Link
                                            </button>
                                        ) : (
                                            <button
                                                onClick={(e) => handleGeneratePortalLink(e, member.id)}
                                                disabled={generatingToken === member.id}
                                                className="flex-1 px-3 py-2 bg-[#0052FF]/10 text-[#0052FF] rounded-lg text-sm font-medium hover:bg-[#0052FF]/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                {generatingToken === member.id ? '...' : 'Portal'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Info Box */}
            {members.length > 0 && (
                <div className="bg-[#0052FF]/5 rounded-xl border border-[#0052FF]/10 p-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Wie funktioniert's?</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0052FF] mt-0.5">1.</span>
                                    <span>Im Kanban-Board Leads an Team-Mitglieder zuweisen</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0052FF] mt-0.5">2.</span>
                                    <span>Mitglied erhalt automatisch E-Mail mit Portal-Link</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0052FF] mt-0.5">3.</span>
                                    <span>Klicke auf ein Mitglied um alle zugewiesenen Leads zu sehen</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0052FF] mt-0.5">4.</span>
                                    <span>Statistiken zeigen dir die Performance pro Mitglied</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
