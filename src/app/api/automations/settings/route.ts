import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface AutomationSettings {
    auto_email_enabled: boolean;
    auto_whatsapp_enabled: boolean;
    whatsapp_api_key: string | null;
}

// GET - Get automation settings
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let settings: AutomationSettings | null = null;
        try {
            settings = await queryOne<AutomationSettings>(
                `SELECT auto_email_enabled, auto_whatsapp_enabled, whatsapp_api_key
                 FROM organizations WHERE id = $1`,
                [payload.orgId]
            );
        } catch (dbError: unknown) {
            const msg = dbError instanceof Error ? dbError.message : '';
            if (msg.includes('does not exist')) {
                return NextResponse.json({
                    autoEmailEnabled: false,
                    autoWhatsappEnabled: false,
                    whatsappApiKey: null,
                });
            }
            throw dbError;
        }

        return NextResponse.json({
            autoEmailEnabled: settings?.auto_email_enabled ?? false,
            autoWhatsappEnabled: settings?.auto_whatsapp_enabled ?? false,
            whatsappApiKey: settings?.whatsapp_api_key ? '••••••' + settings.whatsapp_api_key.slice(-6) : null,
            whatsappApiKeySet: !!settings?.whatsapp_api_key,
        });
    } catch (error) {
        console.error('Get automation settings error:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}

// POST - Update automation settings
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const payload = verifyToken(token);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const updates: string[] = [];
        const values: (string | boolean)[] = [];
        let paramIdx = 1;

        if (body.autoEmailEnabled !== undefined) {
            updates.push(`auto_email_enabled = $${paramIdx++}`);
            values.push(!!body.autoEmailEnabled);
        }
        if (body.autoWhatsappEnabled !== undefined) {
            updates.push(`auto_whatsapp_enabled = $${paramIdx++}`);
            values.push(!!body.autoWhatsappEnabled);
        }
        if (body.whatsappApiKey !== undefined) {
            updates.push(`whatsapp_api_key = $${paramIdx++}`);
            values.push(body.whatsappApiKey || null);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'Keine Änderungen' }, { status: 400 });
        }

        values.push(payload.orgId);
        try {
            await query(
                `UPDATE organizations SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIdx}`,
                values
            );
        } catch (dbError: unknown) {
            const msg = dbError instanceof Error ? dbError.message : '';
            if (msg.includes('does not exist')) {
                return NextResponse.json(
                    { error: 'Datenbank-Spalten fehlen. Bitte Migration ausfuhren (/api/migrate).' },
                    { status: 500 }
                );
            }
            throw dbError;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update automation settings error:', error);
        return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 });
    }
}
