import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'E-Mail und Passwort sind erforderlich' },
                { status: 400 }
            );
        }

        const result = await loginUser(email, password);

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        // Set cookie
        const cookieStore = await cookies();

        cookieStore.set('auth_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: {
                id: result.user.id,
                email: result.user.email,
                fullName: result.user.full_name,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Ein Fehler ist aufgetreten' },
            { status: 500 }
        );
    }
}
