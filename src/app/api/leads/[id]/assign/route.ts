// API endpoint to assign a lead to a team member
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendLeadAssignmentEmail } from '@/lib/email';

interface AssignLeadBody {
    userId: string;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { id: leadId } = await params;
        const body: AssignLeadBody = await request.json();
        const { userId } = body;

        // Get the lead
        const lead = await queryOne<{ id: string; org_id: string; full_name: string; email: string; phone: string }>(
            'SELECT id, org_id, full_name, email, phone FROM leads WHERE id = $1',
            [leadId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Verify lead belongs to user's organization
        if (lead.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get the user to assign to
        const assignee = await queryOne<{ id: string; org_id: string; email: string; full_name: string }>(
            'SELECT id, org_id, email, full_name FROM users WHERE id = $1',
            [userId]
        );

        if (!assignee) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify user belongs to same organization
        if (assignee.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'User not in same organization' }, { status: 403 });
        }

        // Update lead assignment
        await query(
            'UPDATE leads SET assigned_to = $1, assigned_at = NOW(), updated_at = NOW() WHERE id = $2',
            [userId, leadId]
        );

        // Send email notification with custom template
        try {
            await sendLeadAssignmentEmail({
                to: assignee.email,
                assigneeName: assignee.full_name || assignee.email,
                leadName: lead.full_name || 'Unbekannt',
                leadEmail: lead.email || '',
                leadPhone: lead.phone || '',
                leadId: lead.id,
                orgId: payload.orgId,
            });
        } catch (emailError) {
            console.error('Failed to send assignment email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            assignee: {
                id: assignee.id,
                name: assignee.full_name,
                email: assignee.email,
            }
        });
    } catch (error) {
        console.error('Failed to assign lead:', error);
        return NextResponse.json(
            { error: 'Failed to assign lead' },
            { status: 500 }
        );
    }
}

// Unassign a lead
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { id: leadId } = await params;

        // Verify lead belongs to user's organization
        const lead = await queryOne<{ org_id: string }>(
            'SELECT org_id FROM leads WHERE id = $1',
            [leadId]
        );

        if (!lead || lead.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
        }

        // Update lead to remove assignment
        await query(
            'UPDATE leads SET assigned_to = NULL, assigned_at = NULL, updated_at = NOW() WHERE id = $1',
            [leadId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to unassign lead:', error);
        return NextResponse.json(
            { error: 'Failed to unassign lead' },
            { status: 500 }
        );
    }
}
