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

// Default template for lead assignment emails - Outrnk UI Style
const DEFAULT_TEMPLATE = {
    subject: 'Neuer Lead: {{lead_name}}',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #27272a;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 6px; color: #fff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Neuer Lead</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <h1 style="margin: 0; color: #fafafa; font-size: 24px; font-weight: 600; line-height: 1.3;">{{lead_name}}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 24px 32px 0;">
              <p style="margin: 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">
                Hallo {{assignee_name}}, dir wurde ein neuer Lead zugewiesen.
              </p>
            </td>
          </tr>

          <!-- Lead Details Card -->
          <tr>
            <td style="padding: 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #27272a; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #71717a; font-size: 13px; display: block; margin-bottom: 4px;">Name</span>
                          <span style="color: #fafafa; font-size: 15px; font-weight: 500;">{{lead_name}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #3f3f46;">
                          <span style="color: #71717a; font-size: 13px; display: block; margin-bottom: 4px;">E-Mail</span>
                          <a href="mailto:{{lead_email}}" style="color: #60a5fa; font-size: 15px; text-decoration: none;">{{lead_email}}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #3f3f46;">
                          <span style="color: #71717a; font-size: 13px; display: block; margin-bottom: 4px;">Telefon</span>
                          <a href="tel:{{lead_phone}}" style="color: #60a5fa; font-size: 15px; text-decoration: none;">{{lead_phone}}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #3f3f46;">
                          <span style="color: #71717a; font-size: 13px; display: block; margin-bottom: 4px;">Formular</span>
                          <span style="color: #a78bfa; font-size: 15px; font-weight: 500;">{{form_name}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Rating Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 16px; color: #a1a1aa; font-size: 14px;">
                Wie war das Gespräch? Dein Feedback verbessert die Lead-Qualität.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding-right: 8px;">
                    <a href="{{qualified_url}}" style="display: block; text-align: center; padding: 14px 20px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px;">
                      Guter Lead
                    </a>
                  </td>
                  <td width="48%" style="padding-left: 8px;">
                    <a href="{{unqualified_url}}" style="display: block; text-align: center; padding: 14px 20px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 14px;">
                      Schlechter Lead
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Portal Section -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3b0764 0%, #581c87 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 4px; color: #e9d5ff; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Dein Portal</p>
                    <p style="margin: 0 0 16px; color: #c4b5fd; font-size: 14px; line-height: 1.5;">
                      Alle deine Leads verwalten - ohne Login.
                    </p>
                    <a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background: #fff; color: #581c87; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
                      Portal öffnen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dashboard Link -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <a href="{{dashboard_url}}" style="display: inline-block; padding: 12px 20px; background: #27272a; color: #a1a1aa; text-decoration: none; border-radius: 8px; font-size: 14px; border: 1px solid #3f3f46;">
                Im Dashboard öffnen
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f0f10; border-top: 1px solid #27272a;">
              <p style="margin: 0; color: #52525b; font-size: 12px; text-align: center; line-height: 1.6;">
                Automatisch gesendet von LeadSignal<br>
                Rating-Link ist 7 Tage gültig
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
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
