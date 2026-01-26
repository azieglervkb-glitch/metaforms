import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface TempOAuthData {
    id: string;
    user_access_token: string;
    pages_json: string;
    expires_at: string;
}

interface PageData {
    id: string;
    name: string;
    access_token: string;
}

// GET - Get available pages from OAuth session
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
        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
        }

        // Get temporary OAuth data
        const tempData = await queryOne<TempOAuthData>(
            `SELECT id, user_access_token, pages_json, expires_at
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

        return NextResponse.json({
            pages: pages.map(p => ({
                id: p.id,
                name: p.name,
            })),
        });
    } catch (error) {
        console.error('Get pages error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
