import { queryOne } from '@/lib/db';

export default async function AdminDashboard() {
    // Stats fetching
    const orgStats = await queryOne<{ total: string; pending: string; active: string }>(`
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE subscription_status = 'pending_approval') as pending,
            COUNT(*) FILTER (WHERE subscription_status = 'active') as active
        FROM organizations
    `);

    const userStats = await queryOne<{ total: string }>(`
        SELECT COUNT(*) as total FROM users
    `);

    const leadStats = await queryOne<{ total: string }>(`
        SELECT COUNT(*) as total FROM leads
    `);

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">System Übersicht</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Organisationen</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{orgStats?.total || 0}</p>
                    <div className="mt-2 flex gap-2 text-xs">
                        <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">{orgStats?.active || 0} Aktiv</span>
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">{orgStats?.pending || 0} Ausstehend</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">User Gesamt</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{userStats?.total || 0}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Leads Verarbeitet</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{leadStats?.total || 0}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Wichtige Aufgaben</h3>
                {parseInt(orgStats?.pending || '0') > 0 ? (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg flex justify-between items-center">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-yellow-400 text-xl">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Es gibt <span className="font-bold">{orgStats?.pending}</span> neue Organisationen, die auf Aktivierung warten.
                                </p>
                            </div>
                        </div>
                        <a href="/admin/organizations" className="text-sm font-medium text-yellow-700 hover:text-yellow-600 underline">
                            Verwalten →
                        </a>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="text-green-500">✓</span> Alles erledigt. Keine ausstehenden Aktivierungen.
                    </div>
                )}
            </div>
        </div>
    );
}
