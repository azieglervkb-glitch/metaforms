import { queryOne } from '@/lib/db';
import Link from 'next/link';

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
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Ubersicht</h1>
                <p className="text-gray-500 text-sm mt-1">Willkommen im Admin-Bereich</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Organisationen</p>
                            <p className="text-2xl font-bold text-gray-900">{orgStats?.total || 0}</p>
                        </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">{orgStats?.active || 0} Aktiv</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">{orgStats?.pending || 0} Ausstehend</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Benutzer Gesamt</p>
                            <p className="text-2xl font-bold text-gray-900">{userStats?.total || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Leads Verarbeitet</p>
                            <p className="text-2xl font-bold text-gray-900">{leadStats?.total || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">System Status</p>
                            <p className="text-2xl font-bold text-green-600">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Tasks */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900">Wichtige Aufgaben</h2>
                        <p className="text-sm text-gray-500">Offene Aktionen die deine Aufmerksamkeit benotigen</p>
                    </div>
                </div>

                {parseInt(orgStats?.pending || '0') > 0 ? (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-amber-900">Organisationen warten auf Aktivierung</p>
                                    <p className="text-sm text-amber-700">
                                        <span className="font-bold">{orgStats?.pending}</span> neue Organisationen benotigen Freischaltung
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/admin/organizations"
                                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
                            >
                                Verwalten
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-green-900">Alles erledigt</p>
                                <p className="text-sm text-green-700">Keine ausstehenden Aktivierungen oder Aufgaben</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-3 gap-4">
                <Link href="/admin/organizations" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#0052FF]/30 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-[#0052FF]/10 flex items-center justify-center mb-4 group-hover:bg-[#0052FF]/20 transition-colors">
                        <svg className="w-6 h-6 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Organisationen</h3>
                    <p className="text-sm text-gray-500">Alle Organisationen verwalten und aktivieren</p>
                </Link>

                <Link href="/admin/users" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#0052FF]/30 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Benutzer</h3>
                    <p className="text-sm text-gray-500">Alle registrierten Benutzer ansehen</p>
                </Link>

                <Link href="/admin/settings" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#0052FF]/30 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Einstellungen</h3>
                    <p className="text-sm text-gray-500">System-Einstellungen konfigurieren</p>
                </Link>
            </div>
        </div>
    );
}
