'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Lead {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    quality_status?: string;
    quality_feedback_sent: boolean;
    created_at: string;
    notes: string | null;
    assigned_to: string | null;
    form_name: string | null;
    raw_data?: Record<string, any>;
}

interface TeamMember {
    id: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string; // fallback
    email: string;
}

interface LeadDetailModalProps {
    lead: Lead;
    teamMembers: TeamMember[];
    onClose: () => void;
    onUpdate: () => void;
}

export default function LeadDetailModal({
    lead,
    teamMembers,
    onClose,
    onUpdate
}: LeadDetailModalProps) {
    const [notes, setNotes] = useState(lead.notes || '');
    const [status, setStatus] = useState(lead.status);
    const [assignedTo, setAssignedTo] = useState(lead.assigned_to || '');
    const [saving, setSaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Helper to extract member name safely
    const getMemberName = (member: TeamMember) => {
        if (member.full_name) return member.full_name;
        if (member.first_name) return `${member.first_name} ${member.last_name || ''}`;
        return member.name || member.email;
    };

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
            const res = await fetch('/api/leads/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id, teamMemberId: assignedTo }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(data.message || 'Lead erfolgreich zugewiesen!');
                onUpdate();
            } else {
                alert(data.error || 'Fehler beim Zuweisen');
            }
        } catch (error) {
            console.error('Error assigning:', error);
            alert('Netzwerkfehler beim Zuweisen');
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

    // Parse raw_data if string, otherwise use as is
    let formData: Record<string, any> = {};
    if (lead.raw_data) {
        if (typeof lead.raw_data === 'string') {
            try {
                formData = JSON.parse(lead.raw_data);
            } catch {
                formData = {};
            }
        } else {
            formData = lead.raw_data;
        }
    }

    // Filter standard fields to only show extra answers
    const extraFields = Object.entries(formData).filter(([key]) =>
        !['full_name', 'email', 'phone', 'phone_number'].includes(key)
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
                        {lead.form_name && (
                            <p className="text-sm text-gray-500 mt-1">
                                Über: <span className="font-medium text-blue-600">{lead.form_name}</span>
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* 1. Contact Info Card */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="text-lg">👤</span> Kontakt
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                <p className="font-medium text-gray-900 text-lg">{lead.full_name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">E-Mail</label>
                                <p className="font-medium text-gray-900 break-all">{lead.email || '-'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Telefon</label>
                                <p className="font-medium text-gray-900">{lead.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Erstellt am</label>
                                <p className="font-medium text-gray-900">
                                    {new Date(lead.created_at).toLocaleDateString('de-DE', {
                                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Form Answers (Dynamic) */}
                    {extraFields.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="text-lg">📝</span> Formular Antworten
                            </h3>
                            <div className="grid gap-3">
                                {extraFields.map(([key, value]) => (
                                    <div key={key} className="bg-blue-50/50 rounded-lg p-3 border border-blue-50">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-blue-800 uppercase mb-1">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-gray-900 font-medium whitespace-pre-wrap">
                                                {String(value)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Workflow Actions */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Status */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                            <div className="flex flex-wrap gap-2">
                                {['new', 'contacted', 'qualified', 'unqualified'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatus(s)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === s
                                            ? s === 'qualified' ? 'bg-green-500 text-white shadow-md transform scale-105' :
                                                s === 'unqualified' ? 'bg-red-500 text-white shadow-md transform scale-105' :
                                                    s === 'contacted' ? 'bg-blue-500 text-white shadow-md transform scale-105' :
                                                        'bg-yellow-500 text-white shadow-md transform scale-105'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        {s === 'new' ? 'Neu' :
                                            s === 'contacted' ? 'Kontaktiert' :
                                                s === 'qualified' ? '✓ Quali.' :
                                                    '✗ Unquali.'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assignment */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Zuweisung</label>
                            <div className="flex gap-2">
                                <select
                                    value={assignedTo}
                                    onChange={(e) => setAssignedTo(e.target.value)}
                                    className="flex-1 text-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    <option value="">-- Wählen --</option>
                                    {teamMembers.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {getMemberName(member)}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAssign}
                                    disabled={!assignedTo || assigning}
                                    className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {assigning ? '...' : 'OK'}
                                </button>
                            </div>
                            {teamMembers.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    <Link href="/dashboard/team" className="text-blue-500 hover:underline">
                                        + Team einladen
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. Notes */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">Notizen</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Interne Notizen zum Lead..."
                            className="w-full p-3 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50/30 text-gray-900 text-sm"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t gap-4">
                        {status === 'qualified' && !lead.quality_feedback_sent ? (
                            <button
                                onClick={handleSendSignal}
                                disabled={sending}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors"
                            >
                                {sending ? '...' : 'Signal an Meta senden 🚀'}
                            </button>
                        ) : lead.quality_feedback_sent ? (
                            <div className="px-4 py-2 bg-green-50 rounded-lg text-green-700 text-sm font-medium flex items-center gap-2 border border-green-100">
                                ✓ Signal gesendet
                            </div>
                        ) : <div></div>}

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors ml-auto"
                        >
                            {saving ? 'Speichert...' : 'Speichern'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
