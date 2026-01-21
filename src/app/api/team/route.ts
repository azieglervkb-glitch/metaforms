import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface TeamMember {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
}

interface TeamMemberStats {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    total_leads: string;
    qualified_leads: string;
    unqualified_leads: string;
    pending_leads: string;
    has_portal_token: boolean;
}

// GET - List team members with stats
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

        // Get team members with lead statistics
        const members = await query<TeamMemberStats>(`
            SELECT
                tm.id,
                tm.first_name,
                tm.last_name,
                tm.email,
                tm.created_at,
                COALESCE(COUNT(l.id), 0)::text as total_leads,
                COALESCE(COUNT(l.id) FILTER (WHERE l.quality_status = 'qualified'), 0)::text as qualified_leads,
                COALESCE(COUNT(l.id) FILTER (WHERE l.quality_status = 'unqualified'), 0)::text as unqualified_leads,
                COALESCE(COUNT(l.id) FILTER (WHERE l.quality_status = 'pending'), 0)::text as pending_leads,
                EXISTS(SELECT 1 FROM team_member_tokens tmt WHERE tmt.team_member_id = tm.id AND tmt.is_active = true) as has_portal_token
            FROM team_members tm
            LEFT JOIN leads l ON l.assigned_to = tm.id
            WHERE tm.org_id = $1
            GROUP BY tm.id, tm.first_name, tm.last_name, tm.email, tm.created_at
            ORDER BY tm.first_name
        `, [payload.orgId]);

        return NextResponse.json({ members });
    } catch (error) {
        console.error('Team list error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}

// POST - Add team member
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

        const { firstName, lastName, email } = await request.json();

        if (!firstName || !lastName || !email) {
            return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 });
        }

        // Check if member already exists
        const existing = await queryOne(
            'SELECT id FROM team_members WHERE org_id = $1 AND email = $2',
            [payload.orgId, email]
        );

        if (existing) {
            return NextResponse.json({ error: 'Team-Mitglied mit dieser E-Mail existiert bereits' }, { status: 400 });
        }

        const member = await queryOne<TeamMember>(
            `INSERT INTO team_members (org_id, first_name, last_name, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, email, created_at`,
            [payload.orgId, firstName, lastName, email]
        );

        return NextResponse.json({ success: true, member });
    } catch (error) {
        console.error('Team add error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
