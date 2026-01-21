'use client';

import { useState } from 'react';
import type { Lead, LeadStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface LeadCardProps {
    lead: Lead;
    onStatusChange: (leadId: string, status: LeadStatus) => void;
    onSendSignal: (leadId: string) => void;
}

const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    qualified: 'bg-green-500',
    junk: 'bg-red-500',
    not_reached: 'bg-orange-500',
    closed: 'bg-gray-500',
};

const statusLabels: Record<LeadStatus, string> = {
    new: 'Neu',
    contacted: 'Kontaktiert',
    qualified: 'Qualifiziert',
    junk: 'Junk',
    not_reached: 'Nicht erreicht',
    closed: 'Abgeschlossen',
};

export function LeadCard({ lead, onStatusChange, onSendSignal }: LeadCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState(lead.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    const fullName = lead.full_name || 'Unbekannt';
    const createdAt = new Date(lead.created_at).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleStatusChange = async (status: LeadStatus) => {
        setIsSaving(true);
        await onStatusChange(lead.id, status);
        setIsSaving(false);
    };

    const handleSendSignal = async () => {
        setIsSaving(true);
        await onSendSignal(lead.id);
        setIsSaving(false);
    };

    const saveNotes = async () => {
        setIsSaving(true);
        await fetch(`/api/leads/${lead.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
        });
        setIsSaving(false);
    };

    return (
        <>
            <div
                className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setIsOpen(true)}
            >
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold">{fullName}</h3>
                        <p className="text-sm text-muted-foreground">{createdAt}</p>
                    </div>
                    <Badge className={`${statusColors[lead.status]} text-white`}>
                        {statusLabels[lead.status]}
                    </Badge>
                </div>

                <div className="space-y-1 text-sm">
                    {lead.email && (
                        <p className="text-muted-foreground">📧 {lead.email}</p>
                    )}
                    {lead.phone && (
                        <p className="text-muted-foreground">📱 {lead.phone}</p>
                    )}
                </div>

                {lead.quality_feedback_sent && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                        <span>📡</span> Signal an Meta gesendet
                    </div>
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{fullName}</DialogTitle>
                        <DialogDescription>Lead vom {createdAt}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-muted">
                                <p className="text-xs text-muted-foreground mb-1">E-Mail</p>
                                <p className="font-medium">{lead.email || '-'}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted">
                                <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                                <p className="font-medium">{lead.phone || '-'}</p>
                            </div>
                        </div>

                        {/* Custom Fields */}
                        {Object.keys(lead.raw_data || {}).length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium mb-2">Weitere Felder</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(lead.raw_data).map(([key, value]) => (
                                        <div key={key} className="p-2 rounded bg-muted text-sm">
                                            <span className="text-muted-foreground">{key}:</span> {value}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Notizen</h4>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={saveNotes}
                                placeholder="Notizen zum Lead hinzufügen..."
                                rows={3}
                            />
                        </div>

                        {/* Status Actions */}
                        <div>
                            <h4 className="text-sm font-medium mb-3">Status ändern</h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={lead.status === 'contacted' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange('contacted')}
                                    disabled={isSaving}
                                >
                                    📞 Kontaktiert
                                </Button>
                                <Button
                                    variant={lead.status === 'not_reached' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange('not_reached')}
                                    disabled={isSaving}
                                >
                                    📵 Nicht erreicht
                                </Button>
                                <Button
                                    variant={lead.status === 'qualified' ? 'default' : 'outline'}
                                    size="sm"
                                    className={lead.status === 'qualified' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    onClick={() => handleStatusChange('qualified')}
                                    disabled={isSaving}
                                >
                                    👍 Qualifiziert
                                </Button>
                                <Button
                                    variant={lead.status === 'junk' ? 'default' : 'outline'}
                                    size="sm"
                                    className={lead.status === 'junk' ? 'bg-red-600 hover:bg-red-700' : ''}
                                    onClick={() => handleStatusChange('junk')}
                                    disabled={isSaving}
                                >
                                    👎 Junk
                                </Button>
                                <Button
                                    variant={lead.status === 'closed' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange('closed')}
                                    disabled={isSaving}
                                >
                                    ✅ Abgeschlossen
                                </Button>
                            </div>
                        </div>

                        {/* Send Signal to Meta */}
                        {lead.status === 'qualified' && !lead.quality_feedback_sent && (
                            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30">
                                <h4 className="font-medium mb-2">🚀 Algorithmus trainieren</h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    Sende Meta das Signal, dass dieser Lead qualifiziert war. Meta wird lernen, mehr solcher Leads zu finden.
                                </p>
                                <Button
                                    onClick={handleSendSignal}
                                    disabled={isSaving}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    📡 Signal an Meta senden
                                </Button>
                            </div>
                        )}

                        {lead.quality_feedback_sent && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                                <div className="flex items-center gap-2 text-green-600">
                                    <span>✅</span>
                                    <span className="font-medium">Signal wurde an Meta gesendet</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Gesendet am {new Date(lead.quality_feedback_sent_at!).toLocaleDateString('de-DE')}
                                </p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
