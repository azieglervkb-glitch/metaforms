import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface TempOAuthData {
    user_access_token: string;
    pages_json: string;
}

interface PageData {
    id: string;
    name: string;
    access_token: string;
}

interface PixelData {
    id: string;
    name: string;
}

interface BusinessResponse {
    id: string;
    name: string;
}

interface AdsPixelsResponse {
    data: PixelData[];
}

// GET - Get available pixels for a page
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

        const sessionId = request.nextUrl.searchParams.get('session');
        const pageId = request.nextUrl.searchParams.get('page_id');

        if (!sessionId || !pageId) {
            return NextResponse.json({ error: 'Session ID and Page ID required' }, { status: 400 });
        }

        // Get temporary OAuth data
        const tempData = await queryOne<TempOAuthData>(
            `SELECT user_access_token, pages_json
             FROM meta_oauth_temp
             WHERE id = $1 AND org_id = $2 AND expires_at > NOW()`,
            [sessionId, payload.orgId]
        );

        if (!tempData) {
            return NextResponse.json({ error: 'Session expired or not found' }, { status: 404 });
        }

        const pages: PageData[] = typeof tempData.pages_json === 'string'
            ? JSON.parse(tempData.pages_json)
            : tempData.pages_json;

        const selectedPage = pages.find(p => p.id === pageId);
        if (!selectedPage) {
            return NextResponse.json({ error: 'Page not found in session' }, { status: 404 });
        }

        // Try to get pixels associated with this page's business
        const pixels: PixelData[] = [];

        try {
            // First, try to get the business associated with this page
            const businessResponse = await fetch(
                `https://graph.facebook.com/v21.0/${pageId}?fields=business&access_token=${selectedPage.access_token}`
            );
            const businessData = await businessResponse.json();

            if (businessData.business?.id) {
                // Get pixels from the business
                const pixelsResponse = await fetch(
                    `https://graph.facebook.com/v21.0/${businessData.business.id}/owned_pixels?access_token=${tempData.user_access_token}`
                );
                const pixelsData: AdsPixelsResponse = await pixelsResponse.json();

                if (pixelsData.data && pixelsData.data.length > 0) {
                    pixels.push(...pixelsData.data.map(p => ({
                        id: p.id,
                        name: p.name,
                    })));
                }
            }
        } catch (pixelError) {
            console.error('Error fetching pixels from business:', pixelError);
        }

        // Also try to get ad accounts and their pixels
        if (pixels.length === 0) {
            try {
                const adAccountsResponse = await fetch(
                    `https://graph.facebook.com/v21.0/me/adaccounts?fields=name,account_id&access_token=${tempData.user_access_token}`
                );
                const adAccountsData = await adAccountsResponse.json();

                if (adAccountsData.data && adAccountsData.data.length > 0) {
                    for (const account of adAccountsData.data.slice(0, 5)) { // Limit to first 5 accounts
                        try {
                            const accountPixelsResponse = await fetch(
                                `https://graph.facebook.com/v21.0/${account.id}/adspixels?fields=id,name&access_token=${tempData.user_access_token}`
                            );
                            const accountPixelsData: AdsPixelsResponse = await accountPixelsResponse.json();

                            if (accountPixelsData.data && accountPixelsData.data.length > 0) {
                                for (const pixel of accountPixelsData.data) {
                                    // Avoid duplicates
                                    if (!pixels.some(p => p.id === pixel.id)) {
                                        pixels.push({
                                            id: pixel.id,
                                            name: `${pixel.name} (${account.name || account.account_id})`,
                                        });
                                    }
                                }
                            }
                        } catch {
                            // Skip accounts we can't access
                        }
                    }
                }
            } catch (adAccountError) {
                console.error('Error fetching ad account pixels:', adAccountError);
            }
        }

        return NextResponse.json({
            pixels,
            pageName: selectedPage.name,
        });
    } catch (error) {
        console.error('Get pixels error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
