import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import crypto from 'crypto';

interface TeamMember {
    id: string;
    org_id: string;
}

interface PortalToken {
    token: string;
}

// GET - Get existing portal token for team member
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authToken = request.cookies.get('auth_token')?.value;
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(authToken);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: memberId } = await params;

        // Verify team member belongs to user's org
        const member = await queryOne<TeamMember>(
            'SELECT id, org_id FROM team_members WHERE id = $1',
            [memberId]
        );

        if (!member || member.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        // Get existing token
        const existing = await queryOne<PortalToken>(
            'SELECT token FROM team_member_tokens WHERE team_member_id = $1 AND is_active = true',
            [memberId]
        );

        if (!existing) {
            return NextResponse.json({ error: 'No portal token exists' }, { status: 404 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de';
        const portalUrl = `${appUrl}/portal/${existing.token}`;

        return NextResponse.json({ portalUrl, token: existing.token });
    } catch (error) {
        console.error('Get portal token error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}

// POST - Generate new portal token for team member
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authToken = request.cookies.get('auth_token')?.value;
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(authToken);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: memberId } = await params;

        // Verify team member belongs to user's org
        const member = await queryOne<TeamMember>(
            'SELECT id, org_id FROM team_members WHERE id = $1',
            [memberId]
        );

        if (!member || member.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        // Deactivate any existing tokens
        await query(
            'UPDATE team_member_tokens SET is_active = false WHERE team_member_id = $1',
            [memberId]
        );

        // Generate new token
        const token = crypto.randomBytes(32).toString('hex');

        await query(
            `INSERT INTO team_member_tokens (team_member_id, org_id, token, is_active)
             VALUES ($1, $2, $3, true)`,
            [memberId, payload.orgId, token]
        );

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de';
        const portalUrl = `${appUrl}/portal/${token}`;

        return NextResponse.json({ success: true, portalUrl, token });
    } catch (error) {
        console.error('Generate portal token error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}

// DELETE - Revoke portal token
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authToken = request.cookies.get('auth_token')?.value;
        if (!authToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(authToken);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: memberId } = await params;

        // Verify team member belongs to user's org
        const member = await queryOne<TeamMember>(
            'SELECT id, org_id FROM team_members WHERE id = $1',
            [memberId]
        );

        if (!member || member.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        // Deactivate all tokens
        await query(
            'UPDATE team_member_tokens SET is_active = false WHERE team_member_id = $1',
            [memberId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Revoke portal token error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
