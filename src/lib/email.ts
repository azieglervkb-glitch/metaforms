import { Resend } from 'resend';
import crypto from 'crypto';
import { query } from './db';

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
  id: string; // Lead ID for token generation
  fullName: string | null;
  email: string | null;
  phone: string | null;
  formName: string | null;
}

interface TeamMemberInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface LeadAssignmentEmailParams {
  to: string;
  assigneeName: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  leadId: string;
  formName?: string;
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
 * Send email when lead is assigned to team member
 * Includes one-click rating buttons
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

  const qualifiedUrl = `${appUrl}/api/leads/rate?token=${ratingToken}&rating=qualified`;
  const unqualifiedUrl = `${appUrl}/api/leads/rate?token=${ratingToken}&rating=unqualified`;

  if (!process.env.RESEND_API_KEY) {
    console.log('📧 [DEV] Email would be sent to:', params.to);
    console.log('Lead:', params);
    console.log('Qualified URL:', qualifiedUrl);
    console.log('Unqualified URL:', unqualifiedUrl);
    return { success: true, dev: true };
  }

  try {
    const resend = getResend();
    if (!resend) {
      console.log('📧 [WARN] Resend not configured');
      return { success: false, error: 'Resend not configured' };
    }
    const { data, error } = await resend.emails.send({
      from: 'LeadSignal <noreply@leadsignal.de>',
      to: params.to,
      subject: `Neuer Lead: ${params.leadName || params.leadEmail || 'Neuer Kontakt'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📥 Neuer Lead für dich</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px;">
              Hallo ${params.assigneeName},<br><br>
              Dir wurde ein neuer Lead zugewiesen:
            </p>
            
            <!-- Lead Info -->
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top;">Name:</td>
                  <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 18px;">${params.leadName || '-'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">E-Mail:</td>
                  <td style="padding: 10px 0; color: #111827;"><a href="mailto:${params.leadEmail}" style="color: #3b82f6; text-decoration: none;">${params.leadEmail || '-'}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Telefon:</td>
                  <td style="padding: 10px 0; color: #111827;"><a href="tel:${params.leadPhone}" style="color: #3b82f6; text-decoration: none;">${params.leadPhone || '-'}</a></td>
                </tr>
                ${params.formName ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Formular:</td>
                  <td style="padding: 10px 0; color: #7c3aed; font-weight: 500;">${params.formName}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            <!-- Rating Section -->
            <div style="background: linear-gradient(135deg, #f0f9ff, #eff6ff); border: 2px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #1e40af; margin: 0 0 12px; font-size: 18px;">⭐ Wie war der Lead?</h2>
              <p style="color: #3b82f6; margin: 0 0 20px; font-size: 14px;">
                Klicke nach dem Gespräch auf einen Button. Dein Feedback trainiert Meta's Algorithmus für bessere Leads.
              </p>
              
              <!-- Rating Buttons -->
              <table style="width: 100%;">
                <tr>
                  <td style="padding-right: 8px;">
                    <a href="${qualifiedUrl}" 
                       style="display: block; text-align: center; padding: 16px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ✓ Guter Lead
                    </a>
                  </td>
                  <td style="padding-left: 8px;">
                    <a href="${unqualifiedUrl}" 
                       style="display: block; text-align: center; padding: 16px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      ✗ Schlechter Lead
                    </a>
                  </td>
                </tr>
              </table>
            </div>
            
            <!-- Info Box -->
            <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #854d0e; margin: 0; font-size: 13px;">
                <strong>💡 Tipp:</strong> Wenn du auf "Guter Lead" klickst, senden wir automatisch ein Signal an Meta. 
                Der Algorithmus lernt dann, mehr ähnliche Nutzer anzusprechen → bessere Lead-Qualität!
              </p>
            </div>
            
            <!-- Dashboard Link -->
            <a href="${appUrl}/dashboard/kanban" 
               style="display: inline-block; background: #f3f4f6; color: #374151; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
              Lead im Dashboard öffnen →
            </a>
          </div>
          
          <!-- Footer -->
          <div style="padding: 24px; background: #f9fafb; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
              Diese E-Mail wurde automatisch von LeadSignal gesendet.<br>
              Der Rating-Link ist 7 Tage gültig und kann nur einmal verwendet werden.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully with rating buttons:', data);
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
    console.log('📧 [DEV] New lead notification would be sent to:', adminEmail);
    return { success: true, dev: true };
  }

  try {
    const resend = getResend();
    if (!resend) {
      console.log('📧 [WARN] Resend not configured');
      return { success: false, error: 'Resend not configured' };
    }
    const { data, error } = await resend.emails.send({
      from: 'LeadSignal <noreply@leadsignal.de>',
      to: adminEmail,
      subject: `Neuer Lead eingegangen: ${lead.fullName || lead.email || 'Neuer Kontakt'}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Neuer Lead eingegangen!</h1>
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
