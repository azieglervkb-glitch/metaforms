import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to check auth
async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;
    return payload?.isSuperAdmin;
}

export async function GET() {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const settings = await query<{ key: string; value: string }>('SELECT key, value FROM system_settings');
        const settingsMap: Record<string, string> = {};
        settings.forEach(s => settingsMap[s.key] = s.value);

        return NextResponse.json({ settings: settingsMap });
    } catch (error) {
        return NextResponse.json({ error: 'DB Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!(await checkAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    try {
        const body = await request.json();
        // body contains key-value pairs

        // Upsert each key
        for (const [key, value] of Object.entries(body)) {
            // Check if key exists
            const existing = await queryOne('SELECT key FROM system_settings WHERE key = $1', [key]);
            if (existing) {
                await query('UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = $2', [value, key]);
            } else {
                await query('INSERT INTO system_settings (key, value) VALUES ($1, $2)', [key, value]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settings Update Error:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
