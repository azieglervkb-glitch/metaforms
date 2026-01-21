'use client';

import { useState, useEffect } from 'react';
import DashboardNav from '@/components/DashboardNav';

interface Lead {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    quality_status: string;
    quality_feedback_sent: boolean;
    form_id: string | null;
    form_name: string | null;
    created_at: string;
    assigned_to: string | null;
    assignee_name: string | null;
}

interface TeamMember {
    id: string;
    full_name: string;
    email: string;
}

interface FormOption {
    form_id: string;
    form_name: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [forms, setForms] = useState<FormOption[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [formFilter, setFormFilter] = useState<string>('');

    useEffect(() => {
        fetchLeads();
        fetchTeamMembers();
    }, [filter, formFilter]);

    const fetchTeamMembers = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            setTeamMembers(data.members || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            let url = '/api/leads?';
            if (filter !== 'all') {
                url += `status=${filter}&`;
            }
            if (formFilter) {
                url += `form_id=${formFilter}&`;
            }
            const res = await fetch(url);
            const data = await res.json();
            setLeads(data.leads || []);
            setForms(data.forms || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
        setLoading(false);
    };

    const updateLeadQuality = async (leadId: string, qualityStatus: string) => {
        try {
            await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: qualityStatus }),
            });
            fetchLeads();
        } catch (error) {
            console.error('Error updating lead:', error);
        }
    };

    const sendQualitySignal = async (leadId: string) => {
        try {
            const res = await fetch('/api/capi/send-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Signal erfolgreich an Meta gesendet!');
                fetchLeads();
            } else {
                alert(data.error || 'Fehler beim Senden');
            }
        } catch (error) {
            console.error('Error sending signal:', error);
            alert('Fehler beim Senden des Signals');
        }
    };

    const createTestLead = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/leads/test', {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                await fetchLeads();
                alert(`Test-Lead erstellt: ${data.lead.full_name}`);
            } else {
                alert(data.error || 'Fehler beim Erstellen');
            }
        } catch (error) {
            console.error('Error creating test lead:', error);
            alert('Fehler beim Erstellen des Test-Leads');
        } finally {
            setLoading(false);
        }
    };

    const assignLead = async (leadId: string, userId: string | null) => {
        try {
            if (!userId) {
                // Unassign
                await fetch(`/api/leads/${leadId}/assign`, {
                    method: 'DELETE',
                });
            } else {
                // Assign
                await fetch(`/api/leads/${leadId}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId }),
                });
            }
            fetchLeads();
        } catch (error) {
            console.error('Error assigning lead:', error);
            alert('Fehler beim Zuweisen');
        }
    };


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div>
            {/* Navigation */}
            <DashboardNav />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6">
                {/* Section Header */}
                <div className="mb-6">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Lead Management</h2>
                </div>

                {/* Header with Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
                    <div className="flex flex-wrap gap-3">
                        {/* Test Lead Button */}
                        <button
                            onClick={createTestLead}
                            disabled={loading}
                            className="btn-primary text-sm py-2 px-4"
                        >
                            Test-Lead erstellen
                        </button>

                        {/* Form Filter */}
                        {forms.length > 0 && (
                            <select
                                value={formFilter}
                                onChange={(e) => setFormFilter(e.target.value)}
                                className="select-field text-sm py-2"
                            >
                                <option value="">Alle Formulare</option>
                                {forms.map((form) => (
                                    <option key={form.form_id} value={form.form_id}>
                                        {form.form_name || form.form_id}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {['all', 'new', 'contacted', 'qualified', 'unqualified'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Alle' :
                                status === 'new' ? 'Neu' :
                                    status === 'contacted' ? 'Kontaktiert' :
                                        status === 'qualified' ? 'Qualifiziert' :
                                            'Unqualifiziert'}
                        </button>
                    ))}
                </div>

                {/* Leads Table Card */}
                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Lädt...</div>
                    ) : leads.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="text-gray-500">Noch keine Leads vorhanden</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Leads erscheinen hier sobald sie über Meta Lead Forms eingehen
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">E-Mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Telefon</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Formular</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zugewiesen</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Datum</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leads.map((lead) => (
                                        <tr key={lead.id} className="border-b hover:bg-gray-50">
                                            <td className="p-4">
                                                <span className="font-medium text-gray-900">{lead.full_name || '-'}</span>
                                            </td>
                                            <td className="p-4 text-gray-600">{lead.email || '-'}</td>
                                            <td className="p-4 text-gray-600">{lead.phone || '-'}</td>
                                            <td className="p-4">
                                                {lead.form_name ? (
                                                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                                                        {lead.form_name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={lead.assigned_to || ''}
                                                    onChange={(e) => assignLead(lead.id, e.target.value || null)}
                                                    className="px-3 py-1.5 rounded-lg border text-xs bg-white text-gray-700 min-w-[140px]"
                                                >
                                                    <option value="">Nicht zugewiesen</option>
                                                    {teamMembers.map((member) => (
                                                        <option key={member.id} value={member.id}>
                                                            {member.full_name || member.email}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                                                    lead.status === 'unqualified' ? 'bg-red-100 text-red-700' :
                                                        lead.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {lead.status === 'qualified' ? 'Qualifiziert' :
                                                        lead.status === 'unqualified' ? 'Unqualifiziert' :
                                                            lead.status === 'contacted' ? 'Kontaktiert' :
                                                                'Neu'}
                                                </span>
                                                {lead.quality_feedback_sent && (
                                                    <span className="ml-2 text-xs text-green-600">✓ Signal</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm">{formatDate(lead.created_at)}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => updateLeadQuality(lead.id, 'qualified')}
                                                        className="px-3 py-1 rounded bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 border border-green-200"
                                                        title="Als qualifiziert markieren"
                                                    >
                                                        Qualifiziert
                                                    </button>
                                                    <button
                                                        onClick={() => updateLeadQuality(lead.id, 'unqualified')}
                                                        className="px-3 py-1 rounded bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100 border border-gray-200"
                                                        title="Als unqualifiziert markieren"
                                                    >
                                                        Ablehnen
                                                    </button>
                                                    {lead.status === 'qualified' && !lead.quality_feedback_sent && (
                                                        <button
                                                            onClick={() => sendQualitySignal(lead.id)}
                                                            className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 border border-blue-200"
                                                            title="Signal an Meta senden"
                                                        >
                                                            Meta Signal
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
