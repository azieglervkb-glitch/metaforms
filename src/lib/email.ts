import { Resend } from 'resend';
import crypto from 'crypto';
import { query, queryOne } from './db';

// Lazy initialization
let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface LeadInfo {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  formName: string | null;
}

interface LeadAssignmentEmailParams {
  to: string;
  assigneeName: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadId: string;
  formName?: string;
  orgId: string; // Added for custom templates
  teamMemberId?: string; // For portal link
}

interface EmailTemplate {
  subject: string;
  html_content: string;
}

// Default template for lead assignment emails - Outrnk UI Style (Light + Blue)
const DEFAULT_TEMPLATE: EmailTemplate = {
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

/**
 * Get custom email template for organization or return default
 */
async function getEmailTemplate(orgId: string): Promise<EmailTemplate> {
  try {
    const template = await queryOne<EmailTemplate>(
      `SELECT subject, html_content FROM email_templates
       WHERE org_id = $1 AND template_type = 'lead_assignment' AND is_active = true`,
      [orgId]
    );
    return template || DEFAULT_TEMPLATE;
  } catch {
    return DEFAULT_TEMPLATE;
  }
}

/**
 * Replace template variables with actual values
 */
function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value || '-');
  }
  return result;
}

/**
 * Generate a secure token and store it in database
 */
async function generateAndStoreToken(leadId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO lead_email_tokens (lead_id, token, expires_at) VALUES ($1, $2, $3)`,
    [leadId, token, expiresAt]
  );

  return token;
}

/**
 * Get or create portal token for team member
 */
async function getOrCreatePortalToken(teamMemberId: string, orgId: string): Promise<string | null> {
  try {
    // Check for existing active token
    const existing = await queryOne<{ token: string }>(
      'SELECT token FROM team_member_tokens WHERE team_member_id = $1 AND is_active = true',
      [teamMemberId]
    );

    if (existing) {
      return existing.token;
    }

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    await query(
      `INSERT INTO team_member_tokens (team_member_id, org_id, token, is_active)
       VALUES ($1, $2, $3, true)`,
      [teamMemberId, orgId, token]
    );

    return token;
  } catch (e) {
    console.error('Failed to get/create portal token:', e);
    return null;
  }
}

/**
 * Get app URL from system settings or env
 */
async function getAppUrl(): Promise<string> {
  try {
    const setting = await queryOne<{ value: string }>(
      "SELECT value FROM system_settings WHERE key = 'app_url'"
    );
    if (setting?.value) return setting.value;
  } catch {
    // table might not exist yet
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000';
}

/**
 * Send email when lead is assigned to team member
 * Uses custom template if available, otherwise default
 */
export async function sendLeadAssignmentEmail(params: LeadAssignmentEmailParams) {
  const appUrl = await getAppUrl();

  // Generate rating token
  let ratingToken = '';
  try {
    ratingToken = await generateAndStoreToken(params.leadId);
  } catch (e) {
    console.error('Failed to generate rating token:', e);
  }

  // Get or create portal token for team member
  let portalUrl = `${appUrl}/dashboard/kanban`; // fallback
  if (params.teamMemberId) {
    const portalToken = await getOrCreatePortalToken(params.teamMemberId, params.orgId);
    if (portalToken) {
      portalUrl = `${appUrl}/portal/${portalToken}`;
    }
  }

  const qualifiedUrl = `${appUrl}/api/leads/rate?token=${ratingToken}&rating=qualified`;
  const unqualifiedUrl = `${appUrl}/api/leads/rate?token=${ratingToken}&rating=unqualified`;
  const dashboardUrl = `${appUrl}/dashboard/kanban`;

  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Email skipped - RESEND_API_KEY not configured');
    }
    return { success: true, dev: true };
  }

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    // Get custom template or default
    const template = await getEmailTemplate(params.orgId);

    // Define template variables
    const variables: Record<string, string> = {
      '{{assignee_name}}': params.assigneeName,
      '{{lead_name}}': params.leadName || '-',
      '{{lead_email}}': params.leadEmail || '-',
      '{{lead_phone}}': params.leadPhone || '-',
      '{{form_name}}': params.formName || '-',
      '{{qualified_url}}': qualifiedUrl,
      '{{unqualified_url}}': unqualifiedUrl,
      '{{dashboard_url}}': dashboardUrl,
      '{{portal_url}}': portalUrl,
    };

    // Replace variables in subject and content
    const subject = replaceTemplateVariables(template.subject, variables);
    const htmlContent = replaceTemplateVariables(template.html_content, variables);

    const { data, error } = await resend.emails.send({
      from: 'outrnk Leads <noreply@leadsignal.de>',
      to: params.to,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Send email when new lead arrives (optional notification)
 */
export async function sendNewLeadNotification(adminEmail: string, lead: LeadInfo) {
  if (!process.env.RESEND_API_KEY) {
    return { success: true, dev: true };
  }

  try {
    const resend = getResend();
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }
    const appUrl = await getAppUrl();
    const { data, error } = await resend.emails.send({
      from: 'outrnk Leads <noreply@leadsignal.de>',
      to: adminEmail,
      subject: `Neuer Lead eingegangen: ${lead.fullName || lead.email || 'Neuer Kontakt'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Neuer Lead eingegangen!</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; width: 100px;">Name:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 500;">${lead.fullName || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">E-Mail:</td>
                  <td style="padding: 8px 0; color: #111827;">${lead.email || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Telefon:</td>
                  <td style="padding: 8px 0; color: #111827;">${lead.phone || '-'}</td>
                </tr>
                ${lead.formName ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280;">Formular:</td>
                  <td style="padding: 8px 0; color: #7c3aed; font-weight: 500;">${lead.formName}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            <a href="${appUrl}/dashboard/leads"
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              Leads anzeigen
            </a>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return { success: false, error };
  }
}
