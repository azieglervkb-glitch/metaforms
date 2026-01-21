import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface EmailTemplate {
    id: string;
    org_id: string;
    template_type: string;
    subject: string;
    html_content: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Default template for lead assignment emails
const DEFAULT_TEMPLATE = {
    subject: 'Neuer Lead: {{lead_name}}',
    html_content: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 32px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Neuer Lead für dich</h1>
  </div>

  <!-- Content -->
  <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
      Hallo {{assignee_name}},<br><br>
      Dir wurde ein neuer Lead zugewiesen:
    </p>

    <!-- Lead Info -->
    <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top;">Name:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 18px;">{{lead_name}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">E-Mail:</td>
          <td style="padding: 10px 0; color: #111827;"><a href="mailto:{{lead_email}}" style="color: #3b82f6; text-decoration: none;">{{lead_email}}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Telefon:</td>
          <td style="padding: 10px 0; color: #111827;"><a href="tel:{{lead_phone}}" style="color: #3b82f6; text-decoration: none;">{{lead_phone}}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280;">Formular:</td>
          <td style="padding: 10px 0; color: #7c3aed; font-weight: 500;">{{form_name}}</td>
        </tr>
      </table>
    </div>

    <!-- Rating Section -->
    <div style="background: linear-gradient(135deg, #f0f9ff, #eff6ff); border: 2px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1e40af; margin: 0 0 12px; font-size: 18px;">Wie war der Lead?</h2>
      <p style="color: #3b82f6; margin: 0 0 20px; font-size: 14px;">
        Klicke nach dem Gespräch auf einen Button. Dein Feedback trainiert den Algorithmus für bessere Leads.
      </p>

      <!-- Rating Buttons -->
      <table style="width: 100%;">
        <tr>
          <td style="padding-right: 8px;">
            <a href="{{qualified_url}}"
               style="display: block; text-align: center; padding: 16px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Guter Lead
            </a>
          </td>
          <td style="padding-left: 8px;">
            <a href="{{unqualified_url}}"
               style="display: block; text-align: center; padding: 16px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Schlechter Lead
            </a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Portal Link -->
    <div style="background: linear-gradient(135deg, #faf5ff, #f3e8ff); border: 2px solid #c4b5fd; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #6b21a8; margin: 0 0 12px; font-size: 18px;">Dein persönliches Portal</h2>
      <p style="color: #7c3aed; margin: 0 0 16px; font-size: 14px;">
        Im Portal siehst du alle deine Leads und kannst sie direkt verwalten - ohne Login.
      </p>
      <a href="{{portal_url}}"
         style="display: inline-block; text-align: center; padding: 14px 28px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Mein Lead-Portal öffnen
      </a>
    </div>

    <!-- Dashboard Link -->
    <a href="{{dashboard_url}}"
       style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
      Lead im Dashboard öffnen
    </a>
  </div>

  <!-- Footer -->
  <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
      Diese E-Mail wurde automatisch gesendet.<br>
      Der Rating-Link ist 7 Tage gültig.
    </p>
  </div>
</div>`,
};

// Available template variables for documentation
export const TEMPLATE_VARIABLES = [
    { key: '{{assignee_name}}', description: 'Name des Empfängers' },
    { key: '{{lead_name}}', description: 'Name des Leads' },
    { key: '{{lead_email}}', description: 'E-Mail des Leads' },
    { key: '{{lead_phone}}', description: 'Telefon des Leads' },
    { key: '{{form_name}}', description: 'Name des Formulars' },
    { key: '{{qualified_url}}', description: 'Link für "Guter Lead"' },
    { key: '{{unqualified_url}}', description: 'Link für "Schlechter Lead"' },
    { key: '{{dashboard_url}}', description: 'Link zum Dashboard' },
    { key: '{{portal_url}}', description: 'Link zum persönlichen Portal' },
];

// GET - Get email template for organization
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

        // Get template for this organization
        const template = await queryOne<EmailTemplate>(
            `SELECT * FROM email_templates WHERE org_id = $1 AND template_type = 'lead_assignment'`,
            [payload.orgId]
        );

        if (template) {
            return NextResponse.json({
                template,
                variables: TEMPLATE_VARIABLES,
                isCustom: true,
            });
        }

        // Return default template if none exists
        return NextResponse.json({
            template: {
                subject: DEFAULT_TEMPLATE.subject,
                html_content: DEFAULT_TEMPLATE.html_content,
                is_active: true,
            },
            variables: TEMPLATE_VARIABLES,
            isCustom: false,
        });
    } catch (error) {
        console.error('Get template error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Laden' },
            { status: 500 }
        );
    }
}

// POST - Save email template
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

        const { subject, html_content } = await request.json();

        if (!subject || !html_content) {
            return NextResponse.json(
                { error: 'Betreff und Inhalt sind erforderlich' },
                { status: 400 }
            );
        }

        // Upsert template
        const existing = await queryOne<{ id: string }>(
            `SELECT id FROM email_templates WHERE org_id = $1 AND template_type = 'lead_assignment'`,
            [payload.orgId]
        );

        if (existing) {
            await query(
                `UPDATE email_templates
                 SET subject = $1, html_content = $2, updated_at = NOW()
                 WHERE org_id = $3 AND template_type = 'lead_assignment'`,
                [subject, html_content, payload.orgId]
            );
        } else {
            await query(
                `INSERT INTO email_templates (org_id, template_type, subject, html_content)
                 VALUES ($1, 'lead_assignment', $2, $3)`,
                [payload.orgId, subject, html_content]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save template error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Speichern' },
            { status: 500 }
        );
    }
}

// DELETE - Reset to default template
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await query(
            `DELETE FROM email_templates WHERE org_id = $1 AND template_type = 'lead_assignment'`,
            [payload.orgId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset template error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Zurücksetzen' },
            { status: 500 }
        );
    }
}
