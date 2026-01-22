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

const COLUMNS = [
    { id: 'new', title: 'Neu', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
    { id: 'contacted', title: 'Kontaktiert', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
    { id: 'interested', title: 'Interessiert', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
    { id: 'meeting', title: 'Termin', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgLight: 'bg-indigo-50' },
    { id: 'won', title: 'Gewonnen', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    { id: 'lost', title: 'Verloren', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
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
                setError(data.error || 'Ungultiger oder abgelaufener Link');
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
        // Optimistic update
        const previousLeads = leads;
        setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));

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
                toast.success('Status aktualisiert');
            } else {
                setLeads(previousLeads);
                toast.error('Fehler beim Aktualisieren');
            }
        } catch (err) {
            console.error('Error updating lead:', err);
            setLeads(previousLeads);
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

    // Calculate stats
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(l => l.quality_status === 'qualified').length;
    const unqualifiedLeads = leads.filter(l => l.quality_status === 'unqualified').length;
    const pendingLeads = leads.filter(l => l.quality_status === 'pending').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Ladt...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md border border-gray-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Zugriff verweigert</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-400">
                        Bitte kontaktiere deinen Administrator fur einen neuen Link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-[1800px] mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div className="flex items-center gap-1">
                                <span className="text-xl font-bold text-gray-900">outrnk</span>
                                <span className="text-xl font-bold text-[#0052FF]">.</span>
                            </div>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Meine Leads</h1>
                                <p className="text-sm text-gray-500">
                                    Willkommen, {teamMember?.firstName} {teamMember?.lastName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchLeads()}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Aktualisieren
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1800px] mx-auto p-6">
                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Zugewiesen</p>
                                <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Qualifiziert</p>
                                <p className="text-2xl font-bold text-green-600">{qualifiedLeads}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Nicht qualifiziert</p>
                                <p className="text-2xl font-bold text-red-600">{unqualifiedLeads}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Zu bewerten</p>
                                <p className="text-2xl font-bold text-amber-600">{pendingLeads}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="bg-[#0052FF]/5 border border-[#0052FF]/10 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm text-gray-700">
                        <strong>Tipp:</strong> Ziehe Leads zwischen Spalten um den Status zu andern. Klicke auf einen Lead fur Details und Bewertung.
                    </p>
                </div>

                {/* Kanban Board */}
                {leads.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Noch keine Leads</h2>
                        <p className="text-gray-500">Sobald dir Leads zugewiesen werden, erscheinen sie hier.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-6 gap-4 min-h-[600px]">
                        {COLUMNS.map((column) => {
                            const columnLeads = getLeadsByStatus(column.id);
                            return (
                                <div
                                    key={column.id}
                                    className="bg-white rounded-xl border border-gray-200 flex flex-col"
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(column.id)}
                                >
                                    {/* Column Header */}
                                    <div className="p-3 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${column.color}`}></div>
                                                <h2 className="font-semibold text-gray-900 text-sm">{column.title}</h2>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${column.bgLight} ${column.textColor}`}>
                                                {columnLeads.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Column Content */}
                                    <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                        {columnLeads.map((lead) => (
                                            <div
                                                key={lead.id}
                                                draggable
                                                onDragStart={() => handleDragStart(lead.id)}
                                                onClick={() => setSelectedLead(lead)}
                                                className={`bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition-all border border-transparent hover:border-gray-200 hover:shadow-sm ${dragging === lead.id ? 'opacity-50 scale-95' : ''}`}
                                            >
                                                {/* Form Name Tag */}
                                                {lead.form_name && (
                                                    <div className="text-[10px] font-medium text-[#0052FF] bg-[#0052FF]/10 px-1.5 py-0.5 rounded inline-block mb-1.5">
                                                        {lead.form_name}
                                                    </div>
                                                )}
                                                <div className="font-medium text-gray-900 text-sm mb-1">
                                                    {lead.full_name || lead.email || 'Unbekannt'}
                                                </div>
                                                {lead.email && (
                                                    <div className="text-xs text-gray-500 truncate">{lead.email}</div>
                                                )}
                                                {lead.phone && (
                                                    <div className="text-xs text-gray-500">{lead.phone}</div>
                                                )}
                                                {lead.notes && (
                                                    <div className="mt-2 text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded p-1.5 line-clamp-2">
                                                        {lead.notes}
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                                    <span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span>
                                                    {lead.quality_status !== 'pending' && (
                                                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${lead.quality_status === 'qualified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {lead.quality_status === 'qualified' ? 'Gut' : 'Schlecht'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {columnLeads.length === 0 && (
                                            <div className="text-center py-8 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-lg">
                                                Leads hierher ziehen
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
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
                toast.success('Anderungen gespeichert');
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

    const additionalFields = lead.raw_data ? Object.entries(lead.raw_data)
        .filter(([key]) => !['email', 'phone', 'full_name'].includes(key))
        .map(([key, value]) => ({ key, value: String(value) })) : [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div>
                            {lead.form_name && (
                                <span className="text-xs font-medium text-[#0052FF] bg-[#0052FF]/10 px-2 py-1 rounded inline-block mb-2">
                                    {lead.form_name}
                                </span>
                            )}
                            <h2 className="text-xl font-bold text-gray-900">{lead.full_name || 'Lead Details'}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Zugewiesen am {new Date(lead.assigned_at).toLocaleDateString('de-DE')}</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">E-Mail</label>
                            <p className="font-medium text-gray-900 mt-1">
                                {lead.email ? (
                                    <a href={`mailto:${lead.email}`} className="text-[#0052FF] hover:underline">
                                        {lead.email}
                                    </a>
                                ) : '-'}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefon</label>
                            <p className="font-medium text-gray-900 mt-1">
                                {lead.phone ? (
                                    <a href={`tel:${lead.phone}`} className="text-[#0052FF] hover:underline">
                                        {lead.phone}
                                    </a>
                                ) : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Additional Form Fields */}
                    {additionalFields.length > 0 && (
                        <div>
                            <label className="text-sm font-semibold text-gray-900 block mb-3">Weitere Angaben</label>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                {additionalFields.map(({ key, value }) => (
                                    <div key={key} className="flex">
                                        <span className="text-gray-500 text-sm w-1/3 font-medium">{key}</span>
                                        <span className="text-gray-900 text-sm">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quality Rating */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">Lead-Qualitat bewerten</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setQualityStatus('qualified')}
                                className={`py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${qualityStatus === 'qualified'
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                Gut / Qualifiziert
                            </button>
                            <button
                                onClick={() => setQualityStatus('unqualified')}
                                className={`py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${qualityStatus === 'unqualified'
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                                Schlecht / Unqualifiziert
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Deine Bewertung hilft dabei, die Lead-Qualitat zu verbessern.
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-semibold text-gray-900 block mb-3">Notizen</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notizen zum Lead hinzufugen..."
                            className="w-full p-4 border border-gray-200 rounded-xl resize-none h-28 focus:ring-2 focus:ring-[#0052FF] focus:border-[#0052FF] outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-[#0052FF] text-white rounded-xl font-medium hover:bg-[#0047E1] disabled:opacity-50 transition-colors"
                        >
                            {saving ? 'Speichert...' : 'Speichern'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
