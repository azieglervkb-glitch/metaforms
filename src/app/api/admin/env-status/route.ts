import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { cookies } from 'next/headers';

// Helper to check admin auth
async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const payload = token ? verifyToken(token) : null;
    return payload?.isSuperAdmin;
}

export async function GET() {
    if (!(await checkAdmin())) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get saved app_url from database
    let savedAppUrl: string | null = null;
    try {
        const setting = await queryOne<{ value: string }>(
            "SELECT value FROM system_settings WHERE key = 'app_url'"
        );
        savedAppUrl = setting?.value || null;
    } catch {
        // table might not exist yet
    }

    return NextResponse.json({
        resend: !!process.env.RESEND_API_KEY,
        envAppUrl: process.env.NEXT_PUBLIC_APP_URL || null,
        savedAppUrl: savedAppUrl,
        metaToken: !!process.env.META_ACCESS_TOKEN,
    });
}
