'use client';

import { useState, useEffect, use } from 'react';
import { toast, Toaster } from 'sonner';

interface Lead {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    form_name: string;
    quality_status: string;
    status: string;
    notes: string;
    raw_data: Record<string, unknown>;
    created_at: string;
    assigned_at: string;
}

interface TeamMember {
    firstName: string;
    lastName: string;
}

// Simplified columns for team member portal
const COLUMNS = [
    { id: 'new', title: 'Neu', color: 'bg-yellow-500', emoji: '📥', info: 'Neue Leads - noch nicht bearbeitet' },
    { id: 'contacted', title: 'Kontaktiert', color: 'bg-blue-500', emoji: '📞', info: 'Lead wurde kontaktiert' },
    { id: 'interested', title: 'Interessiert', color: 'bg-purple-500', emoji: '💬', info: 'Lead zeigt Interesse' },
    { id: 'meeting', title: 'Termin', color: 'bg-indigo-500', emoji: '📅', info: 'Termin vereinbart' },
    { id: 'won', title: 'Gewonnen', color: 'bg-green-500', emoji: '🏆', info: 'Abgeschlossen' },
    { id: 'lost', title: 'Verloren', color: 'bg-red-500', emoji: '❌', info: 'Nicht qualifiziert' },
];

export default function PortalPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [dragging, setDragging] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, [token]);

    const fetchLeads = async () => {
        try {
            const res = await fetch(`/api/portal/leads?token=${token}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Ungültiger oder abgelaufener Link');
                setLoading(false);
                return;
            }

            setTeamMember(data.teamMember);
            setLeads(data.leads || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError('Fehler beim Laden');
        }
        setLoading(false);
    };

    const updateLeadStatus = async (leadId: string, status: string) => {
        try {
            const res = await fetch(`/api/portal/leads/${leadId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                setLeads(leads.map(l =>
                    l.id === leadId ? { ...l, status } : l
                ));
                toast.success('Status aktualisiert');
            } else {
                toast.error('Fehler beim Aktualisieren');
            }
        } catch (err) {
            console.error('Error updating lead:', err);
            toast.error('Fehler beim Aktualisieren');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-gray-500">Lädt...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 text-center shadow-lg max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Zugriff verweigert</h1>
                    <p className="text-gray-600">{error}</p>
                    <p className="text-sm text-gray-400 mt-4">
                        Bitte kontaktieren Sie Ihren Administrator für einen neuen Link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-[1800px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Meine Leads
                            </h1>
                            <p className="text-sm text-gray-500">
                                Willkommen, {teamMember?.firstName} {teamMember?.lastName}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500">
                                {leads.length} Lead{leads.length !== 1 ? 's' : ''} zugewiesen
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Kanban Board */}
            <main className="max-w-[1800px] mx-auto p-6">
                <div className="bg-white rounded-xl border p-4 mb-6">
                    <p className="text-sm text-gray-600">
                        <strong>Tipp:</strong> Ziehe Leads zwischen den Spalten, um den Status zu ändern.
                        Klicke auf einen Lead für Details und Bewertung.
                    </p>
                </div>

                {leads.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center">
                        <div className="text-4xl mb-4">📭</div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Noch keine Leads zugewiesen
                        </h2>
                        <p className="text-gray-500">
                            Sobald Ihnen Leads zugewiesen werden, erscheinen sie hier.
                        </p>
                    </div>
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
                                                {lead.quality_status !== 'pending' && (
                                                    <span className={`text-xs ${lead.quality_status === 'qualified' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {lead.quality_status === 'qualified' ? '✓ Gut' : '✗ Schlecht'}
                                                    </span>
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
            </main>

            {/* Lead Detail Modal */}
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    token={token}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={(updatedLead) => {
                        setLeads(leads.map(l => l.id === updatedLead.id ? updatedLead : l));
                        setSelectedLead(null);
                    }}
                />
            )}
        </div>
    );
}

function LeadDetailModal({
    lead,
    token,
    onClose,
    onUpdate
}: {
    lead: Lead;
    token: string;
    onClose: () => void;
    onUpdate: (lead: Lead) => void;
}) {
    const [notes, setNotes] = useState(lead.notes || '');
    const [qualityStatus, setQualityStatus] = useState(lead.quality_status);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/portal/leads/${lead.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ notes, qualityStatus }),
            });

            if (res.ok) {
                toast.success('Änderungen gespeichert');
                onUpdate({ ...lead, notes, quality_status: qualityStatus });
            } else {
                toast.error('Fehler beim Speichern');
            }
        } catch (err) {
            console.error('Error saving:', err);
            toast.error('Fehler beim Speichern');
        }
        setSaving(false);
    };

    // Parse raw_data for additional fields
    const additionalFields = lead.raw_data ? Object.entries(lead.raw_data)
        .filter(([key]) => !['email', 'phone', 'full_name'].includes(key))
        .map(([key, value]) => ({ key, value: String(value) })) : [];

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
                            <p className="font-medium">
                                {lead.email ? (
                                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                                        {lead.email}
                                    </a>
                                ) : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Telefon</label>
                            <p className="font-medium">
                                {lead.phone ? (
                                    <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
                                        {lead.phone}
                                    </a>
                                ) : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Zugewiesen am</label>
                            <p className="font-medium">
                                {new Date(lead.assigned_at).toLocaleDateString('de-DE', {
                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Additional Form Fields */}
                    {additionalFields.length > 0 && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Weitere Angaben</label>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                {additionalFields.map(({ key, value }) => (
                                    <div key={key} className="flex">
                                        <span className="text-gray-500 text-sm w-1/3">{key}:</span>
                                        <span className="text-gray-900 text-sm">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quality Rating */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Lead-Qualität bewerten</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setQualityStatus('qualified')}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${qualityStatus === 'qualified'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                👍 Gut / Qualifiziert
                            </button>
                            <button
                                onClick={() => setQualityStatus('unqualified')}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${qualityStatus === 'unqualified'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                👎 Schlecht / Unqualifiziert
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Diese Bewertung hilft, die Lead-Qualität zu verbessern.
                        </p>
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
                            className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {saving ? 'Speichert...' : 'Änderungen speichern'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
