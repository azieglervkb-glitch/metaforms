import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface MessageLog {
    id: string;
    template_id: string | null;
    lead_id: string | null;
    type: string;
    recipient: string;
    subject: string | null;
    status: string;
    error_message: string | null;
    sent_at: string;
    template_name?: string;
    lead_name?: string;
}

// GET - List send logs
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');

        let logs: MessageLog[] = [];
        try {
            logs = await query<MessageLog>(
                `SELECT ml.*,
                        amt.name as template_name,
                        l.full_name as lead_name
                 FROM auto_message_logs ml
                 LEFT JOIN auto_message_templates amt ON ml.template_id = amt.id
                 LEFT JOIN leads l ON ml.lead_id = l.id
                 WHERE ml.org_id = $1
                 ORDER BY ml.sent_at DESC
                 LIMIT $2 OFFSET $3`,
                [payload.orgId, limit, offset]
            );
        } catch (dbError: unknown) {
            const msg = dbError instanceof Error ? dbError.message : '';
            if (msg.includes('does not exist')) {
                return NextResponse.json({ logs: [], total: 0 });
            }
            throw dbError;
        }

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Get logs error:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
