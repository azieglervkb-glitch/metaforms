import { NextRequest, NextResponse } from 'next/server';
import { registerUser, createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, fullName } = body;

        if (!email || !password || !fullName) {
            return NextResponse.json(
                { error: 'Alle Felder sind erforderlich', received: { email: !!email, password: !!password, fullName: !!fullName } },
                { status: 400 }
            );
        }

        const result = await registerUser(email, password, fullName);

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        // Create token and set cookie
        const token = createToken(result.user);
        const cookieStore = await cookies();

        cookieStore.set('auth_token', token, {
            httpOnly: true,
            secure: false, // Disable for sslip.io domain
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
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten', stack: error instanceof Error ? error.stack : undefined },
            { status: 500 }
        );
    }
}
