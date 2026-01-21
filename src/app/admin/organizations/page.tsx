import { query } from '@/lib/db';
import OrgList from '@/components/AdminOrgList';

export default async function AdminOrgsPage() {
    // Fetch organizations with user count and admin email
    const orgs = await query<any>(`
        SELECT 
            o.id, 
            o.name, 
            o.subscription_status, 
            o.created_at,
            COUNT(u.id) as user_count,
            (SELECT email FROM users WHERE org_id = o.id ORDER BY created_at ASC LIMIT 1) as admin_email
        FROM organizations o
        LEFT JOIN users u ON u.org_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Organisationen verwalten</h1>

                <div className="text-sm text-gray-500">
                    <span className="font-medium">{orgs.length}</span> Gesamt
                </div>
            </div>

            <OrgList initialOrgs={orgs || []} />
        </div>
    );
}
