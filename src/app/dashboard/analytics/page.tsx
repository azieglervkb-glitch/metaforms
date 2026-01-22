'use client';

import { useState, useEffect } from 'react';

interface Analytics {
    overview: {
        total: number;
        qualified: number;
        unqualified: number;
        signalsSent: number;
        qualityRate: number;
    };
    daily: Array<{
        date: string;
        total: number;
        qualified: number;
        unqualified: number;
    }>;
    forms: Array<{
        formName: string;
        total: number;
        qualified: number;
        qualityRate: number;
    }>;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics');
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1">Lead-Performance und Conversion-Raten</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-600">Letzte 30 Tage</span>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12">
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Lade Analytics...</span>
                    </div>
                </div>
            ) : analytics ? (
                <>
                    {/* Overview Stats */}
                    <div className="grid grid-cols-5 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Leads Gesamt</p>
                                    <p className="text-2xl font-bold text-gray-900">{analytics.overview.total}</p>
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
                                    <p className="text-2xl font-bold text-green-600">{analytics.overview.qualified}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Unqualifiziert</p>
                                    <p className="text-2xl font-bold text-red-600">{analytics.overview.unqualified}</p>
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
                                    <p className="text-2xl font-bold text-purple-600">{analytics.overview.signalsSent}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Qualitatsrate</p>
                                    <p className="text-2xl font-bold text-amber-600">{analytics.overview.qualityRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        {/* Form Performance */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Formular-Performance</h2>
                                    <p className="text-sm text-gray-500">Qualitatsrate nach Lead-Formular</p>
                                </div>
                            </div>
                            {analytics.forms.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">Noch keine Leads vorhanden</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {analytics.forms.map((form, i) => (
                                        <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{form.formName}</span>
                                                <span className="text-sm text-gray-500">{form.total} Leads</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${form.qualityRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-green-600 w-12 text-right">{form.qualityRate}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Daily Trend */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="font-semibold text-gray-900">Leads pro Tag</h2>
                                    <p className="text-sm text-gray-500">Tagliche Lead-Ubersicht</p>
                                </div>
                            </div>
                            {analytics.daily.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">Noch keine Daten</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border border-gray-200">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Datum</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Gesamt</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Qualifiziert</th>
                                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Unqualifiziert</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {analytics.daily.slice(0, 10).map((day, i) => (
                                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatDate(day.date)}</td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0052FF]/10 text-[#0052FF]">
                                                            {day.total}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                            {day.qualified}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                            {day.unqualified}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Box - How Quality Signals Work */}
                    <div className="bg-[#0052FF]/5 rounded-xl border border-[#0052FF]/10 p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-4">Was bringt das Qualitats-Feedback?</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 flex items-center justify-center mb-3">
                                            <svg className="w-4 h-4 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">Bessere Lead-Qualitat</h4>
                                        <p className="text-sm text-gray-500">Meta optimiert auf Basis deiner Qualifizierungen die Kampagnen.</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">Niedrigere Kosten</h4>
                                        <p className="text-sm text-gray-500">Bessere Leads = hohere Conversion = niedrigerer CPL.</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-4 border border-gray-100">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-medium text-gray-900 mb-1">Praziseres Targeting</h4>
                                        <p className="text-sm text-gray-500">Der Algorithmus findet mehr Nutzer wie deine besten Kunden.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-12">
                    <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium">Fehler beim Laden der Analytics</p>
                        <p className="text-gray-500 text-sm mt-1">Bitte versuche es spater erneut</p>
                    </div>
                </div>
            )}
        </div>
    );
}
