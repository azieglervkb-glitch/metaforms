'use client';

import { useState, useEffect } from 'react';
import LeadDetailModal from '@/components/LeadDetailModal';

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
    notes: string | null;
    raw_data?: any;
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
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
        <>
            {/* Section Header */}
            <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Lead Management</h2>
            </div>

            {/* Header with Title only */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">Leads</h1>
            </div>

            {/* Filter & Actions Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                {/* Left: Status Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
                    {[
                        { id: 'all', label: 'Alle' },
                        { id: 'new', label: 'Neu' },
                        { id: 'contacted', label: 'Kontaktiert' },
                        { id: 'qualified', label: 'Qualifiziert' },
                        { id: 'unqualified', label: 'Unqualifiziert' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${filter === tab.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right: Form Filter + Test Lead */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                        <select
                            value={formFilter}
                            onChange={(e) => setFormFilter(e.target.value)}
                            className="select-field w-full lg:w-64 appearance-none pl-4 pr-10 bg-white border border-gray-200 rounded-lg text-sm py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Alle Formulare</option>
                            {forms.map((f) => (
                                <option key={f.form_id} value={f.form_id}>
                                    {f.form_name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>

                    <button
                        onClick={createTestLead}
                        disabled={loading}
                        className="btn-secondary text-xs py-2.5 px-3 whitespace-nowrap flex items-center gap-2 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                        title="Einen Test-Lead generieren"
                    >
                        <span>+ Test-Lead</span>
                    </button>
                </div>
            </div>

            {/* Leads Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">E-Mail</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefon</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Formular</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Zugewiesen</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Datum</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="table-row cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 max-w-[150px] truncate" title={lead.full_name}>
                                                {lead.full_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 max-w-[200px] truncate" title={lead.email}>
                                                {lead.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {lead.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 max-w-[120px] truncate block" title={lead.form_name || ''}>
                                                {lead.form_name || 'Unbekannt'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {lead.assigned_to ? (
                                                <div className="flex items-center">
                                                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium mr-2">
                                                        {lead.assignee_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-sm text-gray-900 max-w-[100px] truncate">{lead.assignee_name}</span>
                                                </div>
                                            ) : (
                                                <span className="px-2 py-1 text-xs text-gray-500 border border-gray-200 rounded-md">
                                                    Nicht zugewiesen
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                                                lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                                                    lead.status === 'unqualified' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800' // Contacted
                                                }`}>
                                                {lead.status === 'new' ? 'Neu' :
                                                    lead.status === 'qualified' ? 'Qualifiziert' :
                                                        lead.status === 'unqualified' ? 'Unqualifiziert' :
                                                            'Kontaktiert'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(lead.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => updateLeadQuality(lead.id, 'qualified')}
                                                    className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded border border-green-200 hover:bg-green-100 transition-colors text-xs"
                                                >
                                                    Qual.
                                                </button>
                                                <button
                                                    onClick={() => updateLeadQuality(lead.id, 'unqualified')}
                                                    className="text-gray-600 hover:text-gray-900 bg-gray-50 px-2 py-1 rounded border border-gray-200 hover:bg-gray-100 transition-colors text-xs"
                                                >
                                                    Ablehnen
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {leads.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Leads gefunden</h3>
                            <p className="mt-1 text-sm text-gray-500">Versuchen Sie es mit anderen Filtern oder</p>
                            <div className="mt-6">
                                <button
                                    onClick={createTestLead}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Test-Lead erstellen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    teamMembers={teamMembers}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={() => {
                        fetchLeads();
                        setSelectedLead(null);
                    }}
                />
            )}
        </>
    );
}
