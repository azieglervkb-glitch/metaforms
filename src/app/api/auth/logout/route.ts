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

    // Build redirect URL from request
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
}
