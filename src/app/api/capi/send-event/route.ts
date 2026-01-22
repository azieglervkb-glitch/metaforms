// Send funnel stage event to Meta Conversions API
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendCAPIEvent, hashForMeta } from '@/lib/meta-api';
import type { CAPIEvent } from '@/types';

interface Lead {
    id: string;
    org_id: string;
    email: string;
    phone: string;
    meta_lead_id: string;
    capi_sent_stages: string[];
}

interface MetaConnection {
    access_token: string;
    pixel_id: string;
}

// Valid funnel stages that can be sent to Meta
const VALID_STAGES = ['interested', 'meeting', 'won', 'lost'] as const;
type FunnelStage = typeof VALID_STAGES[number];

// Map stages to Meta event names
const STAGE_EVENT_MAP: Record<FunnelStage, { eventName: string; isPositive: boolean }> = {
    interested: { eventName: 'Lead', isPositive: true },
    meeting: { eventName: 'Lead', isPositive: true },
    won: { eventName: 'Lead', isPositive: true },
    lost: { eventName: 'Lead', isPositive: false },
};

function createFunnelStageEvent(
    email: string | null,
    phone: string | null,
    metaLeadId: string,
    stage: FunnelStage
): CAPIEvent {
    const userData: CAPIEvent['user_data'] = {
        lead_id: metaLeadId,
    };

    if (email) {
        userData.em = [hashForMeta(email)];
    }

    if (phone) {
        const normalizedPhone = phone.replace(/[\s-]/g, '');
        userData.ph = [hashForMeta(normalizedPhone)];
    }

    const stageConfig = STAGE_EVENT_MAP[stage];

    return {
        event_name: stageConfig.eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'system_generated',
        user_data: userData,
        custom_data: {
            lead_event_source: 'crm',
            funnel_stage: stage,
            is_quality_lead: stageConfig.isPositive,
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get lead ID and stage from request
        const { leadId, stage } = await request.json();
        if (!leadId) {
            return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
        }

        if (!stage || !VALID_STAGES.includes(stage)) {
            return NextResponse.json({
                error: 'Valid stage required (interested, meeting, won, lost)'
            }, { status: 400 });
        }

        // Fetch the lead
        const lead = await queryOne<Lead>(
            'SELECT id, org_id, email, phone, meta_lead_id, COALESCE(capi_sent_stages, \'[]\')::jsonb as capi_sent_stages FROM leads WHERE id = $1 AND org_id = $2',
            [leadId, payload.orgId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Parse sent stages
        const sentStages: string[] = Array.isArray(lead.capi_sent_stages)
            ? lead.capi_sent_stages
            : [];

        // Check if this stage was already sent
        if (sentStages.includes(stage)) {
            return NextResponse.json({
                error: `Signal für "${stage}" wurde bereits gesendet`,
                sent_stages: sentStages
            }, { status: 400 });
        }

        // Check if meta_lead_id exists
        if (!lead.meta_lead_id) {
            return NextResponse.json({
                error: 'Lead hat keine Meta Lead ID - kann kein Signal senden'
            }, { status: 400 });
        }

        // Get Meta connection for this org
        const connection = await queryOne<MetaConnection>(
            'SELECT access_token, pixel_id FROM meta_connections WHERE org_id = $1',
            [payload.orgId]
        );

        if (!connection) {
            return NextResponse.json({
                error: 'Keine Meta-Verbindung konfiguriert. Bitte verbinde dein Meta-Konto in den Einstellungen.'
            }, { status: 400 });
        }

        if (!connection.pixel_id) {
            return NextResponse.json({
                error: 'Keine Pixel ID konfiguriert. Bitte trage deine Pixel ID in den Einstellungen ein.'
            }, { status: 400 });
        }

        // Create and send CAPI event
        const event = createFunnelStageEvent(
            lead.email,
            lead.phone,
            lead.meta_lead_id,
            stage as FunnelStage
        );

        const result = await sendCAPIEvent(
            connection.pixel_id,
            connection.access_token,
            [event]
        );

        // Update lead with new sent stage
        const newSentStages = [...sentStages, stage];
        await query(
            `UPDATE leads SET
                capi_sent_stages = $1::jsonb,
                quality_feedback_sent = true,
                quality_feedback_sent_at = NOW()
            WHERE id = $2`,
            [JSON.stringify(newSentStages), leadId]
        );

        return NextResponse.json({
            success: true,
            stage: stage,
            sent_stages: newSentStages,
            events_received: result.events_received,
            fbtrace_id: result.fbtrace_id,
        });
    } catch (error) {
        console.error('CAPI send error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send event' },
            { status: 500 }
        );
    }
}
