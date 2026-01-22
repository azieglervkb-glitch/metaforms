import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();

    cookieStore.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });

    // Build redirect URL from request headers (handles proxies correctly)
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const redirectUrl = `${protocol}://${host}/login`;

    return NextResponse.redirect(redirectUrl);
}
