'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Lead, LeadStatus } from '@/types';
import { LeadCard } from '@/components/LeadCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

function LeadsContent() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') as LeadStatus | null;

    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<LeadStatus | 'all'>(initialStatus || 'all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    const fetchLeads = async (status?: LeadStatus | 'all') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
            });
            if (status && status !== 'all') {
                params.set('status', status);
            }

            const response = await fetch(`/api/leads?${params.toString()}`);
            const data = await response.json();

            if (data.leads) {
                setLeads(data.leads);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            toast.error('Fehler beim Laden der Leads');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads(activeTab);
    }, [activeTab, pagination.page]);

    const handleStatusChange = async (leadId: string, status: LeadStatus) => {
        try {
            const response = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setLeads(leads.map(lead =>
                    lead.id === leadId ? { ...lead, status } : lead
                ));
                toast.success('Status aktualisiert');
            } else {
                toast.error('Fehler beim Aktualisieren');
            }
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('Fehler beim Aktualisieren');
        }
    };

    const handleSendSignal = async (leadId: string) => {
        try {
            const response = await fetch('/api/capi/send-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            });

            const data = await response.json();

            if (response.ok) {
                setLeads(leads.map(lead =>
                    lead.id === leadId
                        ? { ...lead, quality_sent_to_meta: true, quality_sent_at: new Date().toISOString() }
                        : lead
                ));
                toast.success('Signal erfolgreich an Meta gesendet! 🚀');
            } else {
                toast.error(data.error || 'Fehler beim Senden');
            }
        } catch (error) {
            console.error('Send signal failed:', error);
            toast.error('Fehler beim Senden des Signals');
        }
    };

    const tabs: { value: LeadStatus | 'all'; label: string; emoji: string }[] = [
        { value: 'all', label: 'Alle', emoji: '📊' },
        { value: 'new', label: 'Neu', emoji: '🆕' },
        { value: 'contacted', label: 'Kontaktiert', emoji: '📞' },
        { value: 'qualified', label: 'Qualifiziert', emoji: '👍' },
        { value: 'junk', label: 'Junk', emoji: '👎' },
        { value: 'not_reached', label: 'Nicht erreicht', emoji: '📵' },
        { value: 'closed', label: 'Abgeschlossen', emoji: '✅' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Leads</h1>
                    <p className="text-muted-foreground mt-1">
                        {pagination.total} Lead{pagination.total !== 1 ? 's' : ''} insgesamt
                    </p>
                </div>
                <Button onClick={() => fetchLeads(activeTab)} variant="outline">
                    🔄 Aktualisieren
                </Button>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeadStatus | 'all')}>
                <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="data-[state=active]:bg-background"
                        >
                            {tab.emoji} {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Loading State */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : leads.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-4xl mb-4">📭</p>
                    <h3 className="text-lg font-semibold">Keine Leads gefunden</h3>
                    <p className="text-muted-foreground">
                        {activeTab === 'all'
                            ? 'Verbinde dein Meta-Konto, um Leads zu empfangen.'
                            : `Keine Leads mit Status "${tabs.find(t => t.value === activeTab)?.label}".`
                        }
                    </p>
                </div>
            ) : (
                <>
                    {/* Lead Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {leads.map(lead => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onStatusChange={handleStatusChange}
                                onSendSignal={handleSendSignal}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page === 1}
                            >
                                ← Zurück
                            </Button>
                            <span className="text-sm text-muted-foreground px-4">
                                Seite {pagination.page} von {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                            >
                                Weiter →
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Loading fallback for Suspense
function LeadsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Leads</h1>
                <p className="text-muted-foreground mt-1">Wird geladen...</p>
            </div>
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={<LeadsLoading />}>
            <LeadsContent />
        </Suspense>
    );
}
