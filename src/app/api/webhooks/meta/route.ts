// Meta Webhook Handler for Lead Generation
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getLeadDetails } from '@/lib/meta-api';

interface MetaConnection {
    org_id: string;
    access_token: string;
    page_id: string;
}

// Webhook verification (GET request from Meta)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === process.env.WEBHOOK_SECRET) {
        console.log('Webhook verified');
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// Handle incoming lead data (POST request from Meta)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Webhook received:', JSON.stringify(body, null, 2));

        // Process each entry
        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                if (change.field === 'leadgen') {
                    const leadgenId = change.value.leadgen_id;
                    const pageId = change.value.page_id;
                    const formId = change.value.form_id;
                    const adId = change.value.ad_id;

                    await processLead(leadgenId, pageId, formId, adId);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function processLead(
    leadgenId: string,
    pageId: string,
    formId: string,
    adId?: string
) {
    try {
        // Find the meta connection for this page
        const connection = await queryOne<MetaConnection>(
            'SELECT * FROM meta_connections WHERE page_id = $1',
            [pageId]
        );

        if (!connection) {
            console.error('No connection found for page:', pageId);
            return;
        }

        // Fetch lead details from Meta
        const leadData = await getLeadDetails(leadgenId, connection.access_token);

        // Parse field data
        const fieldMap: Record<string, string> = {};
        for (const field of leadData.field_data || []) {
            fieldMap[field.name] = field.values[0] || '';
        }

        // Extract standard fields
        const fullName = fieldMap['full_name'] || `${fieldMap['first_name'] || ''} ${fieldMap['last_name'] || ''}`.trim();
        const email = fieldMap['email'] || null;
        const phone = fieldMap['phone_number'] || fieldMap['phone'] || null;

        // Check if lead already exists
        const existing = await queryOne<{ id: string }>(
            'SELECT id FROM leads WHERE org_id = $1 AND meta_lead_id = $2',
            [connection.org_id, leadgenId]
        );

        if (existing) {
            console.log('Lead already exists:', leadgenId);
            return;
        }

        // Insert lead into database
        await query(
            `INSERT INTO leads (org_id, meta_lead_id, email, phone, full_name, raw_data, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'new')`,
            [connection.org_id, leadgenId, email, phone, fullName, JSON.stringify(fieldMap)]
        );

        console.log('Lead saved successfully:', leadgenId);

        // TODO: Send notification (email, WhatsApp, Slack)
    } catch (error) {
        console.error('Failed to process lead:', error);
    }
}
