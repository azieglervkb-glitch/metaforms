import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/migrate';

// This endpoint runs database migrations
// Call this once after deployment or it runs automatically

let migrationRun = false;

export async function GET() {
    if (migrationRun) {
        return NextResponse.json({ message: 'Migrations already run' });
    }

    try {
        await runMigrations();
        migrationRun = true;
        return NextResponse.json({ success: true, message: 'Migrations completed' });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Migration failed' },
            { status: 500 }
        );
    }
}

export async function POST() {
    return GET();
}
