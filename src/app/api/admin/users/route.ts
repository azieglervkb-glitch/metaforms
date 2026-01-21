import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

    try {
        const users = await query<{
            id: string;
            email: string;
            full_name: string;
            is_super_admin: boolean;
            created_at: string;
            org_name: string | null;
        }>(`
            SELECT
                u.id,
                u.email,
                u.full_name,
                u.is_super_admin,
                u.created_at,
                o.name as org_name
            FROM users u
            LEFT JOIN organizations o ON u.org_id = o.id
            ORDER BY u.created_at DESC
        `);

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
