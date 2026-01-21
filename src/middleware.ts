import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isAuthRoute && token) {
        const payload = verifyToken(token);
        if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
};
