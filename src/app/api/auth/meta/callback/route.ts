import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de';

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

        // Use first page (or could prompt user to select)
        const page = pagesData.data[0];

        // Calculate expiration (long-lived tokens last ~60 days)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 60);

        // Save or update connection
        const existing = await queryOne<{ id: string }>(
            'SELECT id FROM meta_connections WHERE org_id = $1',
            [payload.orgId]
        );

        if (existing) {
            await query(
                `UPDATE meta_connections
                 SET access_token = $1, user_id = $2, page_id = $3, page_name = $4,
                     connected_at = NOW(), expires_at = $5
                 WHERE org_id = $6`,
                [page.access_token, 'user', page.id, page.name, expiresAt, payload.orgId]
            );
        } else {
            await query(
                `INSERT INTO meta_connections (org_id, access_token, user_id, page_id, page_name, expires_at)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [payload.orgId, page.access_token, 'user', page.id, page.name, expiresAt]
            );
        }

        return NextResponse.redirect(`${appUrl}/dashboard/settings?success=connected`);
    } catch (error) {
        console.error('Meta OAuth callback error:', error);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.leadsignal.de';
        return NextResponse.redirect(`${appUrl}/dashboard/settings?error=server_error`);
    }
}
