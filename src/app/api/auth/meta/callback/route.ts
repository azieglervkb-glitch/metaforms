import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Helper to get app URL from settings or env
async function getAppUrl(request: NextRequest): Promise<string> {
    try {
        const setting = await queryOne<{ value: string }>(
            "SELECT value FROM system_settings WHERE key = 'app_url'"
        );
        if (setting?.value) return setting.value;
    } catch {
        // table might not exist yet
    }
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    // Use request origin as fallback
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const host = request.headers.get('host') || 'localhost:3000';
    return `${protocol}://${host}`;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
}

interface PageData {
    id: string;
    name: string;
    access_token: string;
}

interface PagesResponse {
    data: PageData[];
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        const appUrl = await getAppUrl(request);

        // Handle OAuth errors
        if (error) {
            return NextResponse.redirect(`${appUrl}/dashboard/settings?error=oauth_denied`);
        }

        if (!code) {
            return NextResponse.redirect(`${appUrl}/dashboard/settings?error=no_code`);
        }

        // Verify user is logged in
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.redirect(`${appUrl}/login?error=not_logged_in`);
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
        }

        // Exchange code for access token
        const appId = process.env.NEXT_PUBLIC_META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        const redirectUri = `${appUrl}/api/auth/meta/callback`;

        if (!appId || !appSecret) {
            return NextResponse.redirect(`${appUrl}/dashboard/settings?error=config_missing`);
        }

        const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
        tokenUrl.searchParams.set('client_id', appId);
        tokenUrl.searchParams.set('redirect_uri', redirectUri);
        tokenUrl.searchParams.set('client_secret', appSecret);
        tokenUrl.searchParams.set('code', code);

        const tokenResponse = await fetch(tokenUrl.toString());
        const tokenData: TokenResponse = await tokenResponse.json();

        if (!tokenData.access_token) {
            return NextResponse.redirect(`${appUrl}/dashboard/settings?error=token_failed`);
        }

        // Get long-lived token
        const longLivedUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
        longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
        longLivedUrl.searchParams.set('client_id', appId);
        longLivedUrl.searchParams.set('client_secret', appSecret);
        longLivedUrl.searchParams.set('fb_exchange_token', tokenData.access_token);

        const longLivedResponse = await fetch(longLivedUrl.toString());
        const longLivedData: TokenResponse = await longLivedResponse.json();

        const accessToken = longLivedData.access_token || tokenData.access_token;

        // Get pages the user manages
        const pagesResponse = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
        );
        const pagesData: PagesResponse = await pagesResponse.json();

        if (!pagesData.data || pagesData.data.length === 0) {
            return NextResponse.redirect(`${appUrl}/dashboard/settings?error=no_pages`);
        }

        // Clean up old temporary tokens for this org
        await query(
            'DELETE FROM meta_oauth_temp WHERE org_id = $1',
            [payload.orgId]
        );

        // Store pages temporarily for selection (expires in 15 minutes)
        const tempResult = await queryOne<{ id: string }>(
            `INSERT INTO meta_oauth_temp (org_id, user_access_token, pages_json)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [payload.orgId, accessToken, JSON.stringify(pagesData.data)]
        );

        if (!tempResult) {
            return NextResponse.redirect(`${appUrl}/dashboard/settings?error=temp_save_failed`);
        }

        // Redirect to page selection
        return NextResponse.redirect(`${appUrl}/dashboard/settings/meta-connect?session=${tempResult.id}`);
    } catch (error) {
        console.error('Meta OAuth callback error:', error);
        const appUrl = await getAppUrl(request);
        return NextResponse.redirect(`${appUrl}/dashboard/settings?error=server_error`);
    }
}
