import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// DELETE - Remove a team member
export async function DELETE(
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

        // Verify the team member belongs to the user's organization
        const member = await queryOne<{ id: string; org_id: string }>(
            'SELECT id, org_id FROM team_members WHERE id = $1',
            [id]
        );

        if (!member) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        if (member.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Delete the team member (cascade will handle tokens and unassign leads)
        await query('DELETE FROM team_members WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete team member error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}

// GET - Get a specific team member
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

        const member = await queryOne<{
            id: string;
            org_id: string;
            first_name: string;
            last_name: string;
            email: string;
            created_at: string;
        }>(
            'SELECT id, org_id, first_name, last_name, email, created_at FROM team_members WHERE id = $1',
            [id]
        );

        if (!member) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        if (member.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        return NextResponse.json({ member });
    } catch (error) {
        console.error('Get team member error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
