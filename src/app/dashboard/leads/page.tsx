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
    created_at: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchLeads();
    }, [filter]);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const url = filter === 'all' ? '/api/leads' : `/api/leads?status=${filter}`;
            const res = await fetch(url);
            const data = await res.json();
            setLeads(data.leads || []);
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
        <div className="space-y-6">
            {/* Navigation */}
            <DashboardNav />

            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
                <div className="flex gap-2">
                    {['all', 'new', 'qualified', 'unqualified'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === status
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'all' ? 'Alle' : status === 'new' ? 'Neu' : status === 'qualified' ? 'Qualifiziert' : 'Unqualifiziert'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
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
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">E-Mail</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Telefon</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Datum</th>
                                <th className="text-left p-4 text-sm font-medium text-gray-600">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <span className="font-medium text-gray-900">{lead.full_name || '-'}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{lead.email || '-'}</td>
                                    <td className="p-4 text-gray-600">{lead.phone || '-'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.status === 'qualified' ? 'bg-green-100 text-green-700' :
                                            lead.status === 'unqualified' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {lead.status === 'qualified' ? 'Qualifiziert' :
                                                lead.status === 'unqualified' ? 'Unqualifiziert' : 'Neu'}
                                        </span>
                                        {lead.quality_feedback_sent && (
                                            <span className="ml-2 text-xs text-green-600">✓ Signal gesendet</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-gray-500 text-sm">{formatDate(lead.created_at)}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateLeadQuality(lead.id, 'qualified')}
                                                className="px-3 py-1 rounded bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200"
                                                title="Als qualifiziert markieren"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => updateLeadQuality(lead.id, 'unqualified')}
                                                className="px-3 py-1 rounded bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200"
                                                title="Als unqualifiziert markieren"
                                            >
                                                ✗
                                            </button>
                                            {lead.status === 'qualified' && !lead.quality_feedback_sent && (
                                                <button
                                                    onClick={() => sendQualitySignal(lead.id)}
                                                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200"
                                                    title="Signal an Meta senden"
                                                >
                                                    📤 Signal
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
