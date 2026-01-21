import { type NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecretString = process.env.JWT_SECRET;
if (!jwtSecretString) {
    throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = new TextEncoder().encode(jwtSecretString);

async function verifyTokenEdge(token: string): Promise<boolean> {
    try {
        await jwtVerify(token, JWT_SECRET);
        return true;
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const path = request.nextUrl.pathname;

    // Protected routes
    const protectedRoutes = ['/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    // Auth routes (redirect if already logged in)
    const authRoutes = ['/login', '/register'];
    const isAuthRoute = authRoutes.some(route => path.startsWith(route));

    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const valid = await verifyTokenEdge(token);
        if (!valid) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isAuthRoute && token) {
        const valid = await verifyTokenEdge(token);
        if (valid) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
