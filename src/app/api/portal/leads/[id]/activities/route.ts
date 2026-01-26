import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

interface TokenData {
    team_member_id: string;
    org_id: string;
}

interface Activity {
    id: string;
    lead_id: string;
    activity_type: string;
    title: string;
    description: string | null;
    activity_date: string;
    created_by_type: string;
    created_by_id: string | null;
    created_at: string;
}

// GET - List activities for a lead (portal)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 401 });
        }

        const tokenData = await queryOne<TokenData>(`
            SELECT team_member_id, org_id
            FROM team_member_tokens
            WHERE token = $1 AND is_active = true
        `, [token]);

        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { id } = await params;

        // Verify lead is assigned to this team member
        const lead = await queryOne<{ id: string }>(
            'SELECT id FROM leads WHERE id = $1 AND assigned_to = $2',
            [id, tokenData.team_member_id]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        let activities: Activity[] = [];
        try {
            activities = await query<Activity>(
                `SELECT * FROM lead_activities
                 WHERE lead_id = $1 AND org_id = $2
                 ORDER BY activity_date DESC, created_at DESC`,
                [id, tokenData.org_id]
            );
        } catch (dbError: unknown) {
            const msg = dbError instanceof Error ? dbError.message : '';
            if (msg.includes('does not exist')) {
                return NextResponse.json({ activities: [] });
            }
            throw dbError;
        }

        return NextResponse.json({ activities });
    } catch (error) {
        console.error('Error fetching portal activities:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new activity (portal)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token required' }, { status: 401 });
        }

        const tokenData = await queryOne<TokenData>(`
            SELECT team_member_id, org_id
            FROM team_member_tokens
            WHERE token = $1 AND is_active = true
        `, [token]);

        if (!tokenData) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { activityType, title, description, activityDate } = body;

        if (!activityType || !title) {
            return NextResponse.json({ error: 'Activity type and title required' }, { status: 400 });
        }

        const validTypes = ['call', 'email', 'meeting', 'note', 'status_change'];
        if (!validTypes.includes(activityType)) {
            return NextResponse.json({ error: 'Invalid activity type' }, { status: 400 });
        }

        // Verify lead is assigned to this team member
        const lead = await queryOne<{ id: string }>(
            'SELECT id FROM leads WHERE id = $1 AND assigned_to = $2',
            [id, tokenData.team_member_id]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        const activity = await queryOne<Activity>(
            `INSERT INTO lead_activities (lead_id, org_id, created_by_type, created_by_id, activity_type, title, description, activity_date)
             VALUES ($1, $2, 'team_member', $3, $4, $5, $6, $7)
             RETURNING *`,
            [id, tokenData.org_id, tokenData.team_member_id, activityType, title, description || null, activityDate || new Date().toISOString()]
        );

        return NextResponse.json({ success: true, activity });
    } catch (error) {
        console.error('Error creating portal activity:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
