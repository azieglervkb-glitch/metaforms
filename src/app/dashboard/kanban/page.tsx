'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import InfoIcon from '@/components/InfoIcon';

interface Lead {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    quality_status: string;
    quality_feedback_sent: boolean;
    created_at: string;
    notes: string;
    assigned_to: string | null;
    assigned_name?: string;
    form_name: string | null;
}

interface TeamMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

// Funnel stages with CAPI signal info
const COLUMNS = [
    { id: 'new', title: 'Neu', color: 'bg-yellow-500', emoji: '📥', sendsCAPI: false, info: 'Neue Leads von Meta Lead Forms. Noch nicht kontaktiert.' },
    { id: 'contacted', title: 'Kontaktiert', color: 'bg-blue-500', emoji: '📞', sendsCAPI: false, info: 'Lead wurde angerufen oder per E-Mail kontaktiert.' },
    { id: 'interested', title: 'Interessiert', color: 'bg-purple-500', emoji: '💬', sendsCAPI: true, info: 'Lead zeigt echtes Interesse. CAPI-Signal wird an Meta gesendet!' },
    { id: 'meeting', title: 'Termin', color: 'bg-indigo-500', emoji: '📅', sendsCAPI: true, info: 'Termin wurde vereinbart. CAPI-Signal wird an Meta gesendet!' },
    { id: 'won', title: 'Gewonnen', color: 'bg-green-500', emoji: '🏆', sendsCAPI: true, info: 'Deal abgeschlossen! CAPI-Signal wird an Meta gesendet!' },
    { id: 'lost', title: 'Verloren', color: 'bg-red-500', emoji: '❌', sendsCAPI: false, info: 'Lead nicht qualifiziert oder abgesprungen.' },
];

export default function KanbanPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        await Promise.all([fetchLeads(), fetchTeam()]);
        setLoading(false);
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data.leads || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };

    const fetchTeam = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            setTeamMembers(data.members || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    };

    const updateLeadStatus = async (leadId: string, status: string) => {
        try {
            await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchLeads();
        } catch (error) {
            console.error('Error updating lead:', error);
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

    const getLeadsByStatus = (status: string) => {
        return leads.filter((lead) => lead.status === status);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    const getMemberName = (memberId: string | null) => {
        if (!memberId) return null;
        const member = teamMembers.find(m => m.id === memberId);
        return member ? `${member.first_name} ${member.last_name}` : null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
                    <InfoIcon
                        text="Verschiebe Leads durch die Pipeline. Bei 'Interessiert', 'Termin' und 'Gewonnen' wird automatisch ein Signal an Meta gesendet, das den Algorithmus trainiert."
                        position="right"
                    />
                </div>
                <p className="text-sm text-gray-500">Drag & Drop oder klicken für Details</p>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Lädt...</div>
            ) : (
                <div className="grid grid-cols-6 gap-3 min-h-[600px]">
                    {COLUMNS.map((column) => (
                        <div
                            key={column.id}
                            className="bg-gray-50 rounded-xl p-3"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(column.id)}
                        >
                            <div className="flex items-center gap-1.5 mb-3">
                                <span className="text-lg">{column.emoji}</span>
                                <h2 className="font-semibold text-gray-700 text-sm">{column.title}</h2>
                                <InfoIcon text={column.info} position="bottom" />
                                {column.sendsCAPI && (
                                    <span className="text-xs text-green-600" title="Sendet CAPI-Signal">📤</span>
                                )}
                                <span className="ml-auto bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                    {getLeadsByStatus(column.id).length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {getLeadsByStatus(column.id).map((lead) => (
                                    <div
                                        key={lead.id}
                                        draggable
                                        onDragStart={() => handleDragStart(lead.id)}
                                        onClick={() => setSelectedLead(lead)}
                                        className={`bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow ${dragging === lead.id ? 'opacity-50' : ''
                                            }`}
                                    >
                                        <div className="font-medium text-gray-900 text-sm mb-1">
                                            {lead.full_name || lead.email || 'Unbekannt'}
                                        </div>
                                        {lead.email && (
                                            <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                                        )}
                                        {lead.phone && (
                                            <div className="text-xs text-gray-500">{lead.phone}</div>
                                        )}
                                        {lead.assigned_to && (
                                            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                                                <span>👤</span>
                                                <span>{getMemberName(lead.assigned_to)}</span>
                                            </div>
                                        )}
                                        {lead.form_name && (
                                            <div className="mt-1 text-xs text-purple-600 truncate" title={lead.form_name}>
                                                📋 {lead.form_name}
                                            </div>
                                        )}
                                        {lead.notes && (
                                            <div className="mt-2 text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded p-1.5 line-clamp-2" title={lead.notes}>
                                                📝 {lead.notes}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                            <span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span>
                                            {lead.quality_feedback_sent && (
                                                <span className="text-xs text-green-600">✓ Signal</span>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {getLeadsByStatus(column.id).length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                                        Leads hierher ziehen
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lead Detail Modal */}
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    teamMembers={teamMembers}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={() => { fetchLeads(); setSelectedLead(null); }}
                />
            )}
        </div>
    );
}

function LeadDetailModal({
    lead,
    teamMembers,
    onClose,
    onUpdate
}: {
    lead: Lead;
    teamMembers: TeamMember[];
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [notes, setNotes] = useState(lead.notes || '');
    const [status, setStatus] = useState(lead.status);
    const [assignedTo, setAssignedTo] = useState(lead.assigned_to || '');
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes, status }),
            });
            onUpdate();
        } catch (error) {
            console.error('Error saving:', error);
        }
        setSaving(false);
    };

    const handleAssign = async () => {
        if (!assignedTo) return;
        setAssigning(true);
        try {
            const res = await fetch(`/api/leads/${lead.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamMemberId: assignedTo }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                alert(data.message || 'Lead erfolgreich zugewiesen!');
                onUpdate();
            } else {
                // Translate common API errors to German
                const errorMessages: Record<string, string> = {
                    'Unauthorized': 'Nicht autorisiert. Bitte erneut anmelden.',
                    'Invalid token': 'Sitzung abgelaufen. Bitte erneut anmelden.',
                    'Lead not found': 'Lead nicht gefunden.',
                    'Access denied': 'Zugriff verweigert.',
                    'Team member not found': 'Team-Mitglied nicht gefunden.',
                    'Team member not in same organization': 'Team-Mitglied gehört nicht zur Organisation.',
                    'Failed to assign lead': 'Zuweisung fehlgeschlagen. Bitte erneut versuchen.',
                };
                const errorMsg = data.error ? (errorMessages[data.error] || data.error) : 'Fehler beim Zuweisen';
                alert(errorMsg);
            }
        } catch (error) {
            console.error('Error assigning:', error);
            alert('Netzwerkfehler beim Zuweisen. Bitte erneut versuchen.');
        }
        setAssigning(false);
    };

    const handleSendSignal = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/capi/send-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Signal erfolgreich an Meta gesendet!');
                onUpdate();
            } else {
                alert(data.error || 'Fehler beim Senden');
            }
        } catch (error) {
            console.error('Error sending signal:', error);
        }
        setSending(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b sticky top-0 bg-white">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-500">Name</label>
                            <p className="font-medium text-lg">{lead.full_name || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">E-Mail</label>
                            <p className="font-medium">{lead.email || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Telefon</label>
                            <p className="font-medium">{lead.phone || '-'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Erstellt am</label>
                            <p className="font-medium">
                                {new Date(lead.created_at).toLocaleDateString('de-DE', {
                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                        <div className="flex flex-wrap gap-2">
                            {['new', 'contacted', 'qualified', 'unqualified'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatus(s)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === s
                                        ? s === 'qualified' ? 'bg-green-500 text-white' :
                                            s === 'unqualified' ? 'bg-red-500 text-white' :
                                                s === 'contacted' ? 'bg-blue-500 text-white' :
                                                    'bg-yellow-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {s === 'new' ? 'Neu' :
                                        s === 'contacted' ? 'Kontaktiert' :
                                            s === 'qualified' ? '✓ Qualifiziert' :
                                                '✗ Unqualifiziert'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Team Assignment */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Zuweisen an</label>
                        <div className="flex gap-3">
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">-- Mitarbeiter wählen --</option>
                                {teamMembers.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.first_name} {member.last_name} ({member.email})
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleAssign}
                                disabled={!assignedTo || assigning}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                            >
                                {assigning ? 'Zuweisen...' : 'Zuweisen & Benachrichtigen'}
                            </button>
                        </div>
                        {teamMembers.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                <Link href="/dashboard/team" className="text-blue-500 hover:underline">
                                    Team-Mitglieder hinzufügen →
                                </Link>
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Notizen</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notizen zum Lead..."
                            className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? 'Speichert...' : 'Änderungen speichern'}
                        </button>

                        {status === 'qualified' && !lead.quality_feedback_sent && (
                            <button
                                onClick={handleSendSignal}
                                disabled={sending}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {sending ? 'Sendet...' : 'Signal an Meta'}
                            </button>
                        )}
                    </div>

                    {lead.quality_feedback_sent && (
                        <div className="p-4 bg-green-50 rounded-lg text-green-700 text-sm">
                            ✓ Qualitätssignal wurde bereits an Meta gesendet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
