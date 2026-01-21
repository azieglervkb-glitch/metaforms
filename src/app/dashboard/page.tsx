import { cookies } from 'next/headers';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

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
        COUNT(*) FILTER (WHERE quality_status = 'qualified') as qualified,
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
        <div className="space-y-8">
            {/* Tabs - like outrnk */}
            <div className="flex gap-2">
                <Link
                    href="/dashboard"
                    className="px-6 py-2 rounded-full bg-blue-500 text-white text-sm font-medium"
                >
                    Leads
                </Link>
                <Link
                    href="/dashboard/settings"
                    className="px-6 py-2 rounded-full bg-white border text-gray-600 text-sm font-medium hover:bg-gray-50"
                >
                    Einstellungen
                </Link>
            </div>

            {/* Stats Grid - like outrnk with colored left borders */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Leads Gesamt"
                    value={totalLeads}
                    borderColor="border-l-blue-500"
                />
                <StatCard
                    title="Neu"
                    value={newLeads}
                    borderColor="border-l-green-500"
                    valueColor="text-green-500"
                />
                <StatCard
                    title="Qualifiziert"
                    value={qualifiedLeads}
                    borderColor="border-l-green-500"
                    valueColor="text-green-500"
                />
                <StatCard
                    title="Signale gesendet"
                    value={signalsSent}
                    borderColor="border-l-yellow-500"
                    valueColor="text-yellow-500"
                />
            </div>

            {/* Section Header - like outrnk */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">System Analytics</h2>
                <button className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">
                    Analytics anzeigen
                </button>
            </div>

            {/* Leads Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Leads</h2>
                <Link
                    href="/dashboard/leads"
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 flex items-center gap-2"
                >
                    <span>+</span> Leads anzeigen
                </Link>
            </div>

            {/* Empty State Card - like outrnk ChatBot card */}
            <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">Meta Lead Forms</h3>
                                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                    Nicht verbunden
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                                    SETUP ERFORDERLICH
                                </span>
                            </div>
                            <div className="flex gap-8 text-sm text-gray-500 mb-4">
                                <div>
                                    <span className="block font-semibold text-gray-900">0</span>
                                    <span>Leads</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-900">0</span>
                                    <span>Signale</span>
                                </div>
                                <div>
                                    <span className="block font-semibold text-gray-900">0%</span>
                                    <span>Qualitätsrate</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link
                                    href="/dashboard/settings"
                                    className="px-6 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                                >
                                    Verbinden
                                </Link>
                                <button className="px-6 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50">
                                    Details
                                </button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({
    title,
    value,
    borderColor = "border-l-gray-300",
    valueColor = "text-gray-900"
}: {
    title: string;
    value: number;
    borderColor?: string;
    valueColor?: string;
}) {
    return (
        <Card className={`border-l-4 ${borderColor}`}>
            <CardContent className="p-4">
                <p className="text-sm text-gray-500 mb-1">{title}</p>
                <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            </CardContent>
        </Card>
    );
}
