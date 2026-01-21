import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

interface TokenData {
    team_member_id: string;
    org_id: string;
}

interface Lead {
    id: string;
    assigned_to: string;
    org_id: string;
}

// PATCH - Update lead status or quality (via portal token)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get token from header
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 401 });
        }

        // Verify token
        const tokenData = await queryOne<TokenData>(`
            SELECT team_member_id, org_id
            FROM team_member_tokens
            WHERE token = $1 AND is_active = true
        `, [token]);

        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const { id: leadId } = await params;
        const body = await request.json();
        const { status, qualityStatus, notes } = body;

        // Verify lead is assigned to this team member
        const lead = await queryOne<Lead>(
            'SELECT id, assigned_to, org_id FROM leads WHERE id = $1',
            [leadId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        if (lead.assigned_to !== tokenData.team_member_id) {
            return NextResponse.json({ error: 'Lead not assigned to you' }, { status: 403 });
        }

        if (lead.org_id !== tokenData.org_id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Build update query dynamically
        const updates: string[] = [];
        const values: (string | undefined)[] = [];
        let paramIndex = 1;

        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (qualityStatus !== undefined) {
            updates.push(`quality_status = $${paramIndex++}`);
            values.push(qualityStatus);
            // Track that it was rated via portal
            updates.push(`rated_via = $${paramIndex++}`);
            values.push('portal');
        }

        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        updates.push(`updated_at = NOW()`);
        values.push(leadId);

        await query(
            `UPDATE leads SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        // Update token last_used_at
        await query(
            'UPDATE team_member_tokens SET last_used_at = NOW() WHERE token = $1',
            [token]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Portal lead update error:', error);
        return NextResponse.json(
            { error: 'Failed to update lead' },
            { status: 500 }
        );
    }
}
