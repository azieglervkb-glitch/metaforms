import { Resend } from 'resend';

// Lazy initialization - only create when needed and API key exists
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

/**
 * Send email when lead is assigned to team member
 */
export async function sendLeadAssignmentEmail(member: TeamMemberInfo, lead: LeadInfo) {
  if (!process.env.RESEND_API_KEY) {
    console.log('📧 [DEV] Email would be sent to:', member.email);
    console.log('Lead:', lead);
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
      to: member.email,
      subject: `Neuer Lead zugewiesen: ${lead.fullName || lead.email || 'Neuer Kontakt'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📥 Neuer Lead für dich</h1>
          </div>
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 16px; margin-top: 0;">
              Hallo ${member.firstName},
            </p>
            <p style="color: #374151;">
              Dir wurde ein neuer Lead zugewiesen. Hier sind die Details:
            </p>
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de'}/dashboard/kanban" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              Lead in LeadSignal öffnen
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
              Diese E-Mail wurde automatisch von LeadSignal gesendet.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
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
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
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
