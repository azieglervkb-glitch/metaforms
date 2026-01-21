import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { sendLeadAssignmentEmail } from '@/lib/email';

interface Lead {
    full_name: string;
    email: string;
    phone: string;
    form_name: string | null;
}

interface TeamMember {
    first_name: string;
    last_name: string;
    email: string;
}

// Assign lead to team member
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

        const { leadId, teamMemberId } = await request.json();

        if (!leadId || !teamMemberId) {
            return NextResponse.json({ error: 'Lead ID und Team-Mitglied ID erforderlich' }, { status: 400 });
        }

        // Update lead assignment
        const lead = await queryOne<Lead>(
            `UPDATE leads SET assigned_to = $1, updated_at = NOW() 
       WHERE id = $2 AND org_id = $3 
       RETURNING full_name, email, phone, form_name`,
            [teamMemberId, leadId, payload.orgId]
        );

        if (!lead) {
            return NextResponse.json({ error: 'Lead nicht gefunden' }, { status: 404 });
        }

        // Get team member details for email
        const member = await queryOne<TeamMember>(
            'SELECT first_name, last_name, email FROM team_members WHERE id = $1 AND org_id = $2',
            [teamMemberId, payload.orgId]
        );

        if (!member) {
            return NextResponse.json({ error: 'Team-Mitglied nicht gefunden' }, { status: 404 });
        }

        // Send email notification via Resend
        await sendLeadAssignmentEmail(
            {
                firstName: member.first_name,
                lastName: member.last_name,
                email: member.email,
            },
            {
                fullName: lead.full_name,
                email: lead.email,
                phone: lead.phone,
                formName: lead.form_name,
            }
        );

        return NextResponse.json({
            success: true,
            message: `Lead wurde ${member.first_name} ${member.last_name} zugewiesen. E-Mail-Benachrichtigung gesendet.`
        });
    } catch (error) {
        console.error('Lead assign error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
