import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
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

    return NextResponse.json({
        resend: !!process.env.RESEND_API_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
        metaToken: !!process.env.META_ACCESS_TOKEN,
    });
}
