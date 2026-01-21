import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

interface TokenData {
    team_member_id: string;
    org_id: string;
    first_name: string;
    last_name: string;
}

interface Lead {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    form_name: string;
    quality_status: string;
    status: string;
    notes: string;
    raw_data: Record<string, unknown>;
    created_at: string;
    assigned_at: string;
}

// GET - Get all leads assigned to the team member (via portal token)
export async function GET(request: NextRequest) {
    try {
        // Get token from header or query
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') ||
                      request.nextUrl.searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 401 });
        }

        // Verify token and get team member info
        const tokenData = await queryOne<TokenData>(`
            SELECT
                t.team_member_id,
                t.org_id,
                tm.first_name,
                tm.last_name
            FROM team_member_tokens t
            JOIN team_members tm ON tm.id = t.team_member_id
            WHERE t.token = $1 AND t.is_active = true
        `, [token]);

        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // Update last_used_at
        await query(
            'UPDATE team_member_tokens SET last_used_at = NOW() WHERE token = $1',
            [token]
        );

        // Get all leads assigned to this team member
        const leads = await query<Lead>(`
            SELECT
                id,
                full_name,
                email,
                phone,
                form_name,
                quality_status,
                status,
                notes,
                raw_data,
                created_at,
                assigned_at
            FROM leads
            WHERE assigned_to = $1 AND org_id = $2
            ORDER BY assigned_at DESC
        `, [tokenData.team_member_id, tokenData.org_id]);

        return NextResponse.json({
            teamMember: {
                firstName: tokenData.first_name,
                lastName: tokenData.last_name,
            },
            leads: leads || [],
        });
    } catch (error) {
        console.error('Portal leads error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leads' },
            { status: 500 }
        );
    }
}
