'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import LeadDetailModal from '@/components/LeadDetailModal';

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
    quality_feedback_sent: boolean;
    capi_sent_stages: string[];
    form_name: string | null;
    notes: string | null;
    assigned_to: string | null;
    assigned_name?: string;
    created_at: string;
    raw_data?: Record<string, unknown>;
}

interface MemberAnalytics {
    total: number;
    byStatus: Record<string, number>;
    byQuality: Record<string, number>;
}

const KANBAN_COLUMNS = [
    { id: 'new', title: 'Neu', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
    { id: 'contacted', title: 'Kontaktiert', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
    { id: 'interested', title: 'Interessiert', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
    { id: 'meeting', title: 'Termin', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgLight: 'bg-indigo-50' },
    { id: 'won', title: 'Gewonnen', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    { id: 'lost', title: 'Verloren', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
];

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
    const [memberFormFilter, setMemberFormFilter] = useState<string>('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);
    const [allTeamMembers, setAllTeamMembers] = useState<{ id: string; first_name: string; last_name: string; email: string }[]>([]);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            const membersData = data.members || [];
            setMembers(membersData);
            setAllTeamMembers(membersData.map((m: TeamMember) => ({
                id: m.id,
                first_name: m.first_name,
                last_name: m.last_name,
                email: m.email,
            })));
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
        setSelectedLead(null);
        setMemberLeads([]);
        setMemberAnalytics(null);
        setMemberFormFilter('');
        setDragging(null);
    };

    // Get unique forms from member leads
    const memberForms = memberLeads.reduce((acc, lead) => {
        if (lead.form_name && !acc.find(f => f.name === lead.form_name)) {
            acc.push({ name: lead.form_name });
        }
        return acc;
    }, [] as { name: string }[]);

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

    const getLeadsByStatus = (status: string) => {
        const filtered = memberFormFilter
            ? memberLeads.filter(l => l.form_name === memberFormFilter)
            : memberLeads;
        return filtered.filter(l => l.status === status);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    const updateLeadStatus = async (leadId: string, newStatus: string) => {
        const previousLeads = memberLeads;
        setMemberLeads(memberLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                setMemberLeads(previousLeads);
            }
        } catch (error) {
            console.error('Error updating lead:', error);
            setMemberLeads(previousLeads);
        }
    };

    const handleDragStart = (leadId: string) => {
        setDragging(leadId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (columnId: string) => {
        if (dragging) {
            updateLeadStatus(dragging, columnId);
            setDragging(null);
        }
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

                                    {/* Kanban Board */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pipeline</h3>
                                            {memberForms.length > 1 && (
                                                <select
                                                    value={memberFormFilter}
                                                    onChange={(e) => setMemberFormFilter(e.target.value)}
                                                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none bg-white"
                                                >
                                                    <option value="">Alle Formulare</option>
                                                    {memberForms.map((form) => (
                                                        <option key={form.name} value={form.name}>
                                                            {form.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        {memberLeads.length === 0 ? (
                                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                                <p className="text-gray-500">Noch keine Leads zugewiesen</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-6 gap-3 min-h-[400px]">
                                                {KANBAN_COLUMNS.map((column) => {
                                                    const columnLeads = getLeadsByStatus(column.id);
                                                    return (
                                                        <div
                                                            key={column.id}
                                                            className="bg-gray-50 rounded-xl border border-gray-200 flex flex-col"
                                                            onDragOver={handleDragOver}
                                                            onDrop={() => handleDrop(column.id)}
                                                        >
                                                            {/* Column Header */}
                                                            <div className="p-2.5 border-b border-gray-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                                                                        <h4 className="font-semibold text-gray-900 text-xs">{column.title}</h4>
                                                                    </div>
                                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${column.bgLight} ${column.textColor}`}>
                                                                        {columnLeads.length}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Column Content */}
                                                            <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-[350px]">
                                                                {columnLeads.map((lead) => (
                                                                    <div
                                                                        key={lead.id}
                                                                        draggable
                                                                        onDragStart={() => handleDragStart(lead.id)}
                                                                        onClick={() => setSelectedLead(lead)}
                                                                        className={`bg-white hover:bg-blue-50 rounded-lg p-2.5 cursor-pointer transition-all border border-transparent hover:border-[#0052FF]/20 hover:shadow-sm ${dragging === lead.id ? 'opacity-50 scale-95' : ''}`}
                                                                    >
                                                                        {lead.form_name && (
                                                                            <div className="text-[9px] font-medium text-[#0052FF] bg-[#0052FF]/10 px-1.5 py-0.5 rounded inline-block mb-1">
                                                                                {lead.form_name}
                                                                            </div>
                                                                        )}
                                                                        <div className="font-medium text-gray-900 text-xs mb-0.5 truncate">
                                                                            {lead.full_name || lead.email || 'Unbekannt'}
                                                                        </div>
                                                                        {lead.email && (
                                                                            <div className="text-[10px] text-gray-500 truncate">{lead.email}</div>
                                                                        )}
                                                                        {lead.phone && (
                                                                            <div className="text-[10px] text-gray-500">{lead.phone}</div>
                                                                        )}
                                                                        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100">
                                                                            <span className="text-[10px] text-gray-400">{formatDate(lead.created_at)}</span>
                                                                            {lead.quality_status === 'qualified' && (
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Qualifiziert"></span>
                                                                            )}
                                                                            {lead.quality_status === 'unqualified' && (
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Nicht qualifiziert"></span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {columnLeads.length === 0 && (
                                                                    <div className="text-center py-6 text-gray-400 text-[10px] border border-dashed border-gray-200 rounded-lg">
                                                                        Leads hierher ziehen
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Detail Modal */}
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    teamMembers={allTeamMembers}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={() => {
                        if (selectedMember) {
                            fetchMemberLeads(selectedMember.id);
                        }
                        setSelectedLead(null);
                    }}
                />
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
