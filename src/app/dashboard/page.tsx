import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import DashboardNav from '@/components/DashboardNav';

interface LeadStats {
    total: string;
    new_count: string;
    qualified: string;
    signals_sent: string;
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const payload = verifyToken(token);
    if (!payload) {
        redirect('/login');
    }

    // Get lead stats
    let totalLeads = 0;
    let newLeads = 0;
    let qualifiedLeads = 0;
    let signalsSent = 0;

    try {
        const stats = await query<LeadStats>(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'qualified') as qualified,
        COUNT(*) FILTER (WHERE quality_feedback_sent = true) as signals_sent
      FROM leads WHERE org_id = $1
    `, [payload.orgId]);

        if (stats[0]) {
            totalLeads = parseInt(stats[0].total) || 0;
            newLeads = parseInt(stats[0].new_count) || 0;
            qualifiedLeads = parseInt(stats[0].qualified) || 0;
            signalsSent = parseInt(stats[0].signals_sent) || 0;
        }
    } catch {
        // DB might not be initialized yet
    }

    return (
        <div>
            {/* Navigation */}
            <DashboardNav />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-4 mb-8">
                    <StatCard title="Leads Gesamt" value={totalLeads} />
                    <StatCard title="Neu" value={newLeads} />
                    <StatCard title="Qualifiziert" value={qualifiedLeads} />
                    <StatCard title="Signale gesendet" value={signalsSent} />
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 mb-8"
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Leads verwalten</h3>
                        <p className="text-sm text-gray-500 mb-4">Alle eingehenden Leads anzeigen und qualifizieren</p>
                        <div className="flex gap-3">
                            <Link href="/dashboard/leads" className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
                                Leads anzeigen
                            </Link>
                            <Link href="/dashboard/kanban" className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">
                                Kanban Board
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Meta verbinden</h3>
                        <p className="text-sm text-gray-500 mb-4">Lead Forms empfangen und Qualitätsignale senden</p>
                        <Link href="/dashboard/settings" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 inline-block">
                            Einstellungen öffnen
                        </Link>
                    </CardContent>
                </Card>
        </div>

            {/* Team */ }
    <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Team verwalten</h3>
            <p className="text-sm text-gray-500 mb-4">Mitarbeiter hinzufügen und Leads zuweisen</p>
            <Link href="/dashboard/team" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 inline-block">
                Team öffnen
            </Link>
        </CardContent>
    </Card>
        </div >
    );
}

function StatCard({
    title,
    value
}: {
    title: string;
    value: number;
}) {
    return (
        <Card className="stat-card p-5">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </Card>
    );
}
