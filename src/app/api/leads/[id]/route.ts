// Update lead status
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface Lead {
    id: string;
    org_id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    notes: string;
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status, notes } = body as { status?: string; notes?: string };

        // Build update
        const updates: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        if (status) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
        }

        values.push(id, payload.orgId);

        const lead = await queryOne<Lead>(
            `UPDATE leads SET ${updates.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramIndex++} AND org_id = $${paramIndex} 
       RETURNING *`,
            values
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, lead });
    } catch (error) {
        console.error('Lead update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const lead = await queryOne<Lead>(
            'SELECT * FROM leads WHERE id = $1 AND org_id = $2',
            [id, payload.orgId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ lead });
    } catch (error) {
        console.error('Lead fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
