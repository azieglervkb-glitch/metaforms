// Meta API Helper Functions
import crypto from 'crypto';
import type { CAPIEvent, MetaLeadData } from '@/types';

const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Hash data for Meta CAPI (SHA256, lowercase)
 */
export function hashForMeta(value: string): string {
    return crypto
        .createHash('sha256')
        .update(value.toLowerCase().trim())
        .digest('hex');
}

/**
 * Get Meta OAuth URL for user authorization
 */
export function getMetaOAuthUrl(redirectUri: string, state: string): string {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const scopes = [
        'leads_retrieval',
        'pages_manage_ads',
        'pages_read_engagement',
        'ads_management',
        'pages_show_list',
    ].join(',');

    const params = new URLSearchParams({
        client_id: appId!,
        redirect_uri: redirectUri,
        state: state,
        scope: scopes,
        response_type: 'code',
    });

    return `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
    code: string,
    redirectUri: string
): Promise<{ access_token: string; expires_in?: number }> {
    const params = new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        redirect_uri: redirectUri,
        code: code,
    });

    const response = await fetch(
        `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to exchange code for token');
    }

    return response.json();
}

/**
 * Get long-lived access token (60 days)
 */
export async function getLongLivedToken(
    shortLivedToken: string
): Promise<{ access_token: string; expires_in?: number }> {
    const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: shortLivedToken,
    });

    const response = await fetch(
        `${GRAPH_API_BASE}/oauth/access_token?${params.toString()}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get long-lived token');
    }

    return response.json();
}

/**
 * Get user's Facebook pages
 */
export async function getUserPages(
    accessToken: string
): Promise<Array<{ id: string; name: string; access_token: string }>> {
    const response = await fetch(
        `${GRAPH_API_BASE}/me/accounts?access_token=${accessToken}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get pages');
    }

    const data = await response.json();
    return data.data || [];
}

/**
 * Fetch lead details from Meta
 */
export async function getLeadDetails(
    leadId: string,
    accessToken: string
): Promise<MetaLeadData> {
    const response = await fetch(
        `${GRAPH_API_BASE}/${leadId}?access_token=${accessToken}`
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get lead details');
    }

    return response.json();
}

/**
 * Subscribe a page to leadgen webhooks
 */
export async function subscribePageToLeadgen(
    pageId: string,
    pageAccessToken: string
): Promise<boolean> {
    const response = await fetch(
        `${GRAPH_API_BASE}/${pageId}/subscribed_apps`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_token: pageAccessToken,
                subscribed_fields: ['leadgen'],
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to subscribe to leadgen');
    }

    const data = await response.json();
    return data.success === true;
}

/**
 * Send event to Meta Conversions API
 */
export async function sendCAPIEvent(
    pixelId: string,
    accessToken: string,
    events: CAPIEvent[]
): Promise<{ events_received: number; fbtrace_id: string }> {
    const response = await fetch(
        `${GRAPH_API_BASE}/${pixelId}/events`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: events,
                access_token: accessToken,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to send CAPI event');
    }

    return response.json();
}

/**
 * Create a Qualified Lead event for CAPI
 */
export function createQualifiedLeadEvent(
    email: string | null,
    phone: string | null,
    metaLeadId: string
): CAPIEvent {
    const userData: CAPIEvent['user_data'] = {
        lead_id: metaLeadId,
    };

    if (email) {
        userData.em = [hashForMeta(email)];
    }

    if (phone) {
        // Normalize phone: remove spaces, dashes, keep +
        const normalizedPhone = phone.replace(/[\s-]/g, '');
        userData.ph = [hashForMeta(normalizedPhone)];
    }

    return {
        event_name: 'Lead', // Standard event, can also use custom like 'QualifiedLead'
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'system_generated',
        user_data: userData,
        custom_data: {
            lead_event_source: 'LeadSignal',
            qualification_status: 'qualified',
        },
    };
}
