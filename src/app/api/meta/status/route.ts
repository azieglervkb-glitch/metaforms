import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface MetaConnection {
    page_name: string;
    pixel_id: string;
    connected_at: string;
}

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

        const connection = await queryOne<MetaConnection>(
            'SELECT page_name, pixel_id, connected_at FROM meta_connections WHERE org_id = $1',
            [payload.orgId]
        );

        if (!connection || connection.page_name === null) {
            return NextResponse.json({ connected: false });
        }

        return NextResponse.json({
            connected: true,
            page_name: connection.page_name,
            pixel_id: connection.pixel_id,
            connected_at: connection.connected_at,
        });
    } catch (error) {
        console.error('Meta status error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Error' },
            { status: 500 }
        );
    }
}
