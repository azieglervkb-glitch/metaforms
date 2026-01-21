// API endpoint to assign a lead to a team member
import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendLeadAssignmentEmail } from '@/lib/email';

interface AssignLeadBody {
    leadId: string;
    teamMemberId: string;
}

interface Lead {
    id: string;
    org_id: string;
    full_name: string;
    email: string;
    phone: string;
    form_name: string;
}

interface TeamMember {
    id: string;
    org_id: string;
    first_name: string;
    last_name: string;
    email: string;
}

export async function POST(request: NextRequest) {
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

        const body: AssignLeadBody = await request.json();
        const { leadId, teamMemberId } = body;

        if (!leadId || !teamMemberId) {
            return NextResponse.json({ error: 'leadId and teamMemberId are required' }, { status: 400 });
        }

        // Get the lead
        const lead = await queryOne<Lead>(
            'SELECT id, org_id, full_name, email, phone, form_name FROM leads WHERE id = $1',
            [leadId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Verify lead belongs to user's organization
        if (lead.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // Get the team member to assign to
        const teamMember = await queryOne<TeamMember>(
            'SELECT id, org_id, first_name, last_name, email FROM team_members WHERE id = $1',
            [teamMemberId]
        );

        if (!teamMember) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        // Verify team member belongs to same organization
        if (teamMember.org_id !== payload.orgId) {
            return NextResponse.json({ error: 'Team member not in same organization' }, { status: 403 });
        }

        // Update lead assignment
        await query(
            'UPDATE leads SET assigned_to = $1, assigned_at = NOW(), updated_at = NOW() WHERE id = $2',
            [teamMemberId, leadId]
        );

        // Send email notification with portal link
        try {
            await sendLeadAssignmentEmail({
                to: teamMember.email,
                assigneeName: `${teamMember.first_name} ${teamMember.last_name}`,
                leadName: lead.full_name || 'Unbekannt',
                leadEmail: lead.email || '',
                leadPhone: lead.phone || '',
                leadId: lead.id,
                formName: lead.form_name || undefined,
                orgId: payload.orgId,
                teamMemberId: teamMember.id,
            });
        } catch (emailError) {
            console.error('Failed to send assignment email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json({
            success: true,
            message: `Lead wurde ${teamMember.first_name} ${teamMember.last_name} zugewiesen. E-Mail wurde gesendet.`,
            assignee: {
                id: teamMember.id,
                name: `${teamMember.first_name} ${teamMember.last_name}`,
                email: teamMember.email,
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
