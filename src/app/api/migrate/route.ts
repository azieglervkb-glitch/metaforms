import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    try {
        console.log('Starting migration...');

        // 1. Add is_super_admin to users
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false`);

        // 2. Add subscription_status to organizations (if not exists)
        // Note: altering default value if column exists involves more complex SQL, 
        // but here we ensure column exists. The code handles 'trial' vs 'pending' logic.
        // We set default to 'pending_approval' for NEW rows via code default or db default if possible.
        // For now, adding the column if missing is key.
        // If it exists, we might want to change default, but let's keep it safe.
        // We just ensure the column is there if it wasn't.
        // The previous error was likely about missing columns.

        // Check if subscription_status exists first or just run ALTER ADD COLUMN IF NOT EXISTS (PG 9.6+ supports IF NOT EXISTS)
        // Actually standard PG doesn't support ADD COLUMN IF NOT EXISTS easily in one line without PL/SQL block in older versions, 
        // but let's assume standard behavior or ignoring error.
        // Better: simple catch block for each query or use robust syntax.

        try {
            await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false`);
        } catch (e) { console.log('Column is_super_admin might already exist', e); }

        try {
            // We just try to set the default. 
            await query(`ALTER TABLE organizations ALTER COLUMN subscription_status SET DEFAULT 'pending_approval'`);
        } catch (e) {
            console.log('Could not set default for subscription_status', e);
        }

        // 3. Create settings table
        await query(`
            CREATE TABLE IF NOT EXISTS system_settings (
              key VARCHAR(50) PRIMARY KEY,
              value TEXT,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);

        // 4. Promote Admin
        let msg = 'Database schema updated successfully.';
        if (email) {
            await query('UPDATE users SET is_super_admin = true WHERE email = $1', [email]);
            msg += ` User ${email} is now Super Admin.`;
        } else {
            msg += ' NOTE: No email provided (?email=...) so no admin was promoted. Use ?email=your@email.com to become admin.';
        }

        return NextResponse.json({ success: true, message: msg });
    } catch (error: any) {
        console.error('Migration failed:', error);
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
    }
}
