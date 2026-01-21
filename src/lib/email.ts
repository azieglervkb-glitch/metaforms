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

// Default template for lead assignment emails
const DEFAULT_TEMPLATE: EmailTemplate = {
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
 * Send email when lead is assigned to team member
 * Uses custom template if available, otherwise default
 */
export async function sendLeadAssignmentEmail(params: LeadAssignmentEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de';

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
      from: 'LeadSignal <noreply@leadsignal.de>',
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
    const { data, error } = await resend.emails.send({
      from: 'LeadSignal <noreply@leadsignal.de>',
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de'}/dashboard/leads"
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
