import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pixelId } = await request.json();

        if (!pixelId) {
            return NextResponse.json({ error: 'Pixel ID ist erforderlich' }, { status: 400 });
        }

        // Check if connection exists
        const existing = await queryOne(
            'SELECT id FROM meta_connections WHERE org_id = $1',
            [payload.orgId]
        );

        if (existing) {
            // Update existing
            await queryOne(
                'UPDATE meta_connections SET pixel_id = $1 WHERE org_id = $2',
                [pixelId, payload.orgId]
            );
        } else {
            // Create new (with placeholder access token)
            await queryOne(
                'INSERT INTO meta_connections (org_id, access_token, pixel_id) VALUES ($1, $2, $3)',
                [payload.orgId, 'pending', pixelId]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save pixel error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Speichern' },
            { status: 500 }
        );
    }
}
