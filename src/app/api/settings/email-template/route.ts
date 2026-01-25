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

// Default template for lead assignment emails - Outrnk UI Style (Light + Blue)
const DEFAULT_LEAD_ASSIGNMENT_TEMPLATE = {
    subject: 'Neuer Lead: {{lead_name}}',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #111827;">outrnk<span style="color: #0052FF;">.</span></span>
                    <span style="color: #d1d5db; margin: 0 8px;">|</span>
                    <span style="color: #6b7280; font-size: 14px;">Leads</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lead Badge + Name -->
          <tr>
            <td style="padding: 24px 32px 16px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #dbeafe; border-radius: 4px; color: #1d4ed8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Neuer Lead</span>
              <h1 style="margin: 12px 0 0; color: #111827; font-size: 22px; font-weight: 600; line-height: 1.3;">{{lead_name}}</h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 0 32px 20px;">
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Hallo {{assignee_name}}, dir wurde ein neuer Lead zugewiesen.
              </p>
            </td>
          </tr>

          <!-- Lead Details Card -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 2px;">Name</span>
                          <span style="color: #111827; font-size: 14px; font-weight: 500;">{{lead_name}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 2px;">E-Mail</span>
                          <a href="mailto:{{lead_email}}" style="color: #0052FF; font-size: 14px; text-decoration: none;">{{lead_email}}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 2px;">Telefon</span>
                          <a href="tel:{{lead_phone}}" style="color: #0052FF; font-size: 14px; text-decoration: none;">{{lead_phone}}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 2px;">Formular</span>
                          <span style="color: #111827; font-size: 14px; font-weight: 500;">{{form_name}}</span>
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
              <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
                Wie war das Gespräch?
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="padding-right: 6px;">
                    <a href="{{qualified_url}}" style="display: block; text-align: center; padding: 12px 16px; background-color: #0052FF; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                      Guter Lead
                    </a>
                  </td>
                  <td width="48%" style="padding-left: 6px;">
                    <a href="{{unqualified_url}}" style="display: block; text-align: center; padding: 12px 16px; background-color: #f3f4f6; color: #374151; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; border: 1px solid #d1d5db;">
                      Schlechter Lead
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Portal Link -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 12px; color: #1e40af; font-size: 14px; font-weight: 500;">
                      Alle deine Leads im Portal verwalten
                    </p>
                    <a href="{{portal_url}}" style="display: inline-block; padding: 10px 20px; background-color: #0052FF; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                      Portal öffnen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.6;">
                Automatisch gesendet von outrnk. Leads<br>
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

// Default template for team member welcome emails
const DEFAULT_TEAM_WELCOME_TEMPLATE = {
    subject: 'Willkommen im Team!',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 700; color: #111827;">outrnk<span style="color: #0052FF;">.</span></span>
                    <span style="color: #d1d5db; margin: 0 8px;">|</span>
                    <span style="color: #6b7280; font-size: 14px;">Leads</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Badge -->
          <tr>
            <td style="padding: 24px 32px 16px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #dcfce7; border-radius: 4px; color: #166534; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Willkommen</span>
              <h1 style="margin: 12px 0 0; color: #111827; font-size: 22px; font-weight: 600; line-height: 1.3;">Hallo {{member_name}}!</h1>
            </td>
          </tr>

          <!-- Welcome Message -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
                Du wurdest zum Lead-Management-System hinzugefügt. Ab jetzt kannst du Leads empfangen und verwalten.
              </p>
            </td>
          </tr>

          <!-- Info Card -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 2px;">Dein Name</span>
                          <span style="color: #111827; font-size: 14px; font-weight: 500;">{{member_name}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-top: 1px solid #e5e7eb;">
                          <span style="color: #9ca3af; font-size: 12px; display: block; margin-bottom: 2px;">E-Mail</span>
                          <span style="color: #111827; font-size: 14px;">{{member_email}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Portal Access Button -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 4px; color: #1e40af; font-size: 16px; font-weight: 600;">
                      Dein persönliches Portal
                    </p>
                    <p style="margin: 0 0 16px; color: #3b82f6; font-size: 14px;">
                      Hier siehst du alle dir zugewiesenen Leads und kannst sie verwalten.
                    </p>
                    <a href="{{portal_url}}" style="display: inline-block; padding: 12px 24px; background-color: #0052FF; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                      Portal öffnen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What happens next -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <p style="margin: 0 0 12px; color: #111827; font-size: 14px; font-weight: 600;">
                Was passiert als nächstes?
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; text-align: center; line-height: 24px; color: #1d4ed8; font-size: 12px; font-weight: 600;">1</span>
                        </td>
                        <td style="color: #6b7280; font-size: 14px;">
                          Du bekommst eine E-Mail wenn dir ein Lead zugewiesen wird
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; text-align: center; line-height: 24px; color: #1d4ed8; font-size: 12px; font-weight: 600;">2</span>
                        </td>
                        <td style="color: #6b7280; font-size: 14px;">
                          Kontaktiere den Lead und bewerte die Qualität
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: top; padding-right: 12px;">
                          <span style="display: inline-block; width: 24px; height: 24px; background-color: #dbeafe; border-radius: 50%; text-align: center; line-height: 24px; color: #1d4ed8; font-size: 12px; font-weight: 600;">3</span>
                        </td>
                        <td style="color: #6b7280; font-size: 14px;">
                          Verwalte alle deine Leads im Portal
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.6;">
                Automatisch gesendet von outrnk. Leads<br>
                Speichere diesen Link - er ist dein Zugang zum Portal
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

// Template configurations
const TEMPLATE_CONFIGS: Record<string, { defaultTemplate: typeof DEFAULT_LEAD_ASSIGNMENT_TEMPLATE; variables: typeof LEAD_ASSIGNMENT_VARIABLES }> = {
    lead_assignment: {
        defaultTemplate: DEFAULT_LEAD_ASSIGNMENT_TEMPLATE,
        variables: LEAD_ASSIGNMENT_VARIABLES,
    },
    team_member_welcome: {
        defaultTemplate: DEFAULT_TEAM_WELCOME_TEMPLATE,
        variables: TEAM_WELCOME_VARIABLES,
    },
};

// Available template variables for lead assignment
const LEAD_ASSIGNMENT_VARIABLES = [
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

// Available template variables for team welcome
const TEAM_WELCOME_VARIABLES = [
    { key: '{{member_name}}', description: 'Name des Team-Mitglieds' },
    { key: '{{member_email}}', description: 'E-Mail des Team-Mitglieds' },
    { key: '{{portal_url}}', description: 'Link zum persönlichen Portal' },
];

// Export for backward compatibility
export const TEMPLATE_VARIABLES = LEAD_ASSIGNMENT_VARIABLES;

// For backward compatibility
const DEFAULT_TEMPLATE = DEFAULT_LEAD_ASSIGNMENT_TEMPLATE;

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

        // Get template type from query params (default: lead_assignment)
        const templateType = request.nextUrl.searchParams.get('type') || 'lead_assignment';
        const config = TEMPLATE_CONFIGS[templateType];

        if (!config) {
            return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
        }

        // Get template for this organization
        const template = await queryOne<EmailTemplate>(
            `SELECT * FROM email_templates WHERE org_id = $1 AND template_type = $2`,
            [payload.orgId, templateType]
        );

        if (template) {
            return NextResponse.json({
                template,
                variables: config.variables,
                isCustom: true,
            });
        }

        // Return default template if none exists
        return NextResponse.json({
            template: {
                subject: config.defaultTemplate.subject,
                html_content: config.defaultTemplate.html_content,
                is_active: true,
            },
            variables: config.variables,
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

        const { subject, html_content, template_type = 'lead_assignment' } = await request.json();

        if (!subject || !html_content) {
            return NextResponse.json(
                { error: 'Betreff und Inhalt sind erforderlich' },
                { status: 400 }
            );
        }

        if (!TEMPLATE_CONFIGS[template_type]) {
            return NextResponse.json({ error: 'Invalid template type' }, { status: 400 });
        }

        // Upsert template
        const existing = await queryOne<{ id: string }>(
            `SELECT id FROM email_templates WHERE org_id = $1 AND template_type = $2`,
            [payload.orgId, template_type]
        );

        if (existing) {
            await query(
                `UPDATE email_templates
                 SET subject = $1, html_content = $2, updated_at = NOW()
                 WHERE org_id = $3 AND template_type = $4`,
                [subject, html_content, payload.orgId, template_type]
            );
        } else {
            await query(
                `INSERT INTO email_templates (org_id, template_type, subject, html_content)
                 VALUES ($1, $2, $3, $4)`,
                [payload.orgId, template_type, subject, html_content]
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

        // Get template type from query params
        const templateType = request.nextUrl.searchParams.get('type') || 'lead_assignment';

        await query(
            `DELETE FROM email_templates WHERE org_id = $1 AND template_type = $2`,
            [payload.orgId, templateType]
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
