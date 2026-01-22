import { cookies } from 'next/headers';
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

interface TeamStats {
    count: string;
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

    let totalLeads = 0;
    let newLeads = 0;
    let qualifiedLeads = 0;
    let signalsSent = 0;
    let teamCount = 0;

    try {
        const stats = await query<LeadStats>(`
            SELECT
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'new') as new_count,
                COUNT(*) FILTER (WHERE status = 'qualified' OR status = 'won') as qualified,
                COUNT(*) FILTER (WHERE quality_feedback_sent = true) as signals_sent
            FROM leads WHERE org_id = $1
        `, [payload.orgId]);

        if (stats[0]) {
            totalLeads = parseInt(stats[0].total) || 0;
            newLeads = parseInt(stats[0].new_count) || 0;
            qualifiedLeads = parseInt(stats[0].qualified) || 0;
            signalsSent = parseInt(stats[0].signals_sent) || 0;
        }

        const team = await query<TeamStats>(`SELECT COUNT(*) as count FROM team_members WHERE org_id = $1`, [payload.orgId]);
        if (team[0]) {
            teamCount = parseInt(team[0].count) || 0;
        }
    } catch {
        // DB might not be initialized yet
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Willkommen zuruck! Hier ist deine Ubersicht.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Leads Gesamt</p>
                            <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Neue Leads</p>
                            <p className="text-2xl font-bold text-amber-600">{newLeads}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Qualifiziert</p>
                            <p className="text-2xl font-bold text-green-600">{qualifiedLeads}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Meta Signale</p>
                            <p className="text-2xl font-bold text-purple-600">{signalsSent}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Leads verwalten</h3>
                            <p className="text-sm text-gray-500 mb-4">Alle eingehenden Leads anzeigen, qualifizieren und durch die Pipeline bewegen.</p>
                            <div className="flex gap-3">
                                <Link href="/dashboard/leads" className="px-4 py-2.5 rounded-lg bg-[#0052FF] text-white text-sm font-medium hover:bg-[#0047E1] transition-colors">
                                    Leads anzeigen
                                </Link>
                                <Link href="/dashboard/kanban" className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    Pipeline
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Meta Conversion API</h3>
                            <p className="text-sm text-gray-500 mb-4">Lead Forms empfangen und Qualitatssignale an Meta senden.</p>
                            <Link href="/dashboard/settings" className="px-4 py-2.5 rounded-lg bg-[#0052FF] text-white text-sm font-medium hover:bg-[#0047E1] transition-colors inline-block">
                                Einstellungen
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team & Analytics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">Team</h3>
                                <span className="text-sm text-gray-500">{teamCount} Mitglieder</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Mitarbeiter hinzufugen und Leads zuweisen.</p>
                            <Link href="/dashboard/team" className="px-4 py-2.5 rounded-lg bg-[#0052FF] text-white text-sm font-medium hover:bg-[#0047E1] transition-colors inline-block">
                                Team verwalten
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
                            <p className="text-sm text-gray-500 mb-4">Lead-Performance und Conversion-Raten analysieren.</p>
                            <Link href="/dashboard/analytics" className="px-4 py-2.5 rounded-lg bg-[#0052FF] text-white text-sm font-medium hover:bg-[#0047E1] transition-colors inline-block">
                                Analytics offnen
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#0052FF]/5 rounded-xl border border-[#0052FF]/10 p-6">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">So funktioniert's</h3>
                        <ul className="text-sm text-gray-600 space-y-1.5">
                            <li className="flex items-start gap-2">
                                <span className="text-[#0052FF] mt-0.5">1.</span>
                                <span>Verbinde dein Meta-Konto in den Einstellungen</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#0052FF] mt-0.5">2.</span>
                                <span>Leads kommen automatisch von deinen Lead Ads</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#0052FF] mt-0.5">3.</span>
                                <span>Qualifiziere Leads - das Signal geht zuruck an Meta</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[#0052FF] mt-0.5">4.</span>
                                <span>Meta optimiert deine Ads fur bessere Lead-Qualitat</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
