import { NextRequest, NextResponse } from 'next/server';
import { runMigrations } from '@/lib/migrate';

// GET - Run database migrations
export async function GET(request: NextRequest) {
    try {
        // Optional: Check for admin key in production
        const adminKey = request.nextUrl.searchParams.get('key');
        const expectedKey = process.env.ADMIN_MIGRATE_KEY;

        // In production, require a key
        if (process.env.NODE_ENV === 'production' && expectedKey && adminKey !== expectedKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting database migrations...');
        await runMigrations();

        return NextResponse.json({
            success: true,
            message: 'Database migrations completed successfully'
        });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
            {
                error: 'Migration failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
