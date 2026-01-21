import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params are promise in newer Next.js or just object? In App Router it's object or promise depending on version. Usually params are available. Actually in Next 15 params is promise, in 14 it is object. Assuming 14/15 safe interaction.
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const payload = token ? verifyToken(token) : null;

        if (!payload?.isSuperAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body;

        const validStatuses = ['active', 'inactive', 'pending_approval', 'trial'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await query(
            'UPDATE organizations SET subscription_status = $1, updated_at = NOW() WHERE id = $2',
            [status, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Admin Org Update Error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
