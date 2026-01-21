// List leads for organization
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface Lead {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    status: string;
    quality_status: string;
    created_at: string;
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse query params
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        // Build query
        let sql = `SELECT * FROM leads WHERE org_id = $1`;
        const params: (string | number)[] = [payload.orgId];

        if (status) {
            sql += ` AND status = $2`;
            params.push(status);
        }

        sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const leads = await query<Lead>(sql, params);

        // Get total count
        const countResult = await query<{ count: string }>(
            `SELECT COUNT(*) as count FROM leads WHERE org_id = $1${status ? ' AND status = $2' : ''}`,
            status ? [payload.orgId, status] : [payload.orgId]
        );
        const total = parseInt(countResult[0]?.count || '0');

        return NextResponse.json({
            leads: leads || [],
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Leads list error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
