// Send qualified lead event to Meta Conversions API
import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendCAPIEvent, createQualifiedLeadEvent } from '@/lib/meta-api';

interface Lead {
    id: string;
    org_id: string;
    email: string;
    phone: string;
    meta_lead_id: string;
    quality_feedback_sent: boolean;
    quality_feedback_sent_at: string;
}

interface MetaConnection {
    access_token: string;
    pixel_id: string;
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

        // Get lead ID from request
        const { leadId } = await request.json();
        if (!leadId) {
            return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
        }

        // Fetch the lead
        const lead = await queryOne<Lead>(
            'SELECT * FROM leads WHERE id = $1 AND org_id = $2',
            [leadId, payload.orgId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Check if already sent
        if (lead.quality_feedback_sent) {
            return NextResponse.json({
                error: 'Quality signal already sent for this lead',
                sent_at: lead.quality_feedback_sent_at
            }, { status: 400 });
        }

        // Get Meta connection for this org
        const connection = await queryOne<MetaConnection>(
            'SELECT access_token, pixel_id FROM meta_connections WHERE org_id = $1',
            [payload.orgId]
        );

        if (!connection) {
            return NextResponse.json({
                error: 'No Meta connection configured. Please connect your Meta account in settings.'
            }, { status: 400 });
        }

        // Create and send CAPI event
        const event = createQualifiedLeadEvent(
            lead.email,
            lead.phone,
            lead.meta_lead_id
        );

        const result = await sendCAPIEvent(
            connection.pixel_id,
            connection.access_token,
            [event]
        );

        // Mark lead as sent
        await queryOne(
            `UPDATE leads SET quality_feedback_sent = true, quality_feedback_sent_at = NOW() 
       WHERE id = $1`,
            [leadId]
        );

        return NextResponse.json({
            success: true,
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
