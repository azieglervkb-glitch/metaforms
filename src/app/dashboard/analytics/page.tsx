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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <span className="text-sm text-gray-500">Letzte 30 Tage</span>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Lädt...</div>
            ) : analytics ? (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatCard title="Leads Gesamt" value={analytics.overview.total} color="blue" />
                        <StatCard title="Qualifiziert" value={analytics.overview.qualified} color="green" />
                        <StatCard title="Unqualifiziert" value={analytics.overview.unqualified} color="red" />
                        <StatCard title="Signale gesendet" value={analytics.overview.signalsSent} color="purple" />
                        <StatCard
                            title="Qualitätsrate"
                            value={`${analytics.overview.qualityRate}%`}
                            color="yellow"
                            large
                        />
                    </div>

                    {/* Form Performance */}
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Formular-Performance</h2>
                        {analytics.forms.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Noch keine Leads vorhanden</p>
                        ) : (
                            <div className="space-y-4">
                                {analytics.forms.map((form, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">{form.formName}</span>
                                                <span className="text-sm text-gray-500">{form.total} Leads</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${form.qualityRate}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right w-20">
                                            <span className="text-lg font-bold text-green-600">{form.qualityRate}%</span>
                                            <span className="text-xs text-gray-500 block">Qualifiziert</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Daily Trend */}
                    <div className="bg-white rounded-xl border p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">Leads pro Tag</h2>
                        {analytics.daily.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Noch keine Daten</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Datum</th>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Gesamt</th>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Qualifiziert</th>
                                            <th className="text-left p-3 text-sm font-medium text-gray-600">Unqualifiziert</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.daily.slice(0, 14).map((day, i) => (
                                            <tr key={i} className="border-b hover:bg-gray-50">
                                                <td className="p-3 font-medium">{formatDate(day.date)}</td>
                                                <td className="p-3 text-blue-600">{day.total}</td>
                                                <td className="p-3 text-green-600">{day.qualified}</td>
                                                <td className="p-3 text-red-600">{day.unqualified}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* How Quality Signals Work */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
                        <h2 className="font-semibold text-gray-900 mb-3">💡 Was bringt das Qualitäts-Feedback?</h2>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-white/50 rounded-lg p-4">
                                <span className="text-2xl mb-2 block">📊</span>
                                <h3 className="font-medium text-gray-900">Bessere Lead-Qualität</h3>
                                <p className="text-gray-600">Meta optimiert auf Basis deiner Qualifizierungen die Kampagnen.</p>
                            </div>
                            <div className="bg-white/50 rounded-lg p-4">
                                <span className="text-2xl mb-2 block">💰</span>
                                <h3 className="font-medium text-gray-900">Niedrigere Kosten</h3>
                                <p className="text-gray-600">Bessere Leads = höhere Conversion = niedrigerer CPL.</p>
                            </div>
                            <div className="bg-white/50 rounded-lg p-4">
                                <span className="text-2xl mb-2 block">🎯</span>
                                <h3 className="font-medium text-gray-900">Präziseres Targeting</h3>
                                <p className="text-gray-600">Der Algorithmus findet mehr Nutzer wie deine besten Kunden.</p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-red-500">Fehler beim Laden der Analytics</div>
            )}
        </div>
    );
}

function StatCard({
    title,
    value,
    color,
    large = false
}: {
    title: string;
    value: number | string;
    color: string;
    large?: boolean;
}) {
    const colors: Record<string, string> = {
        blue: 'border-l-blue-500',
        green: 'border-l-green-500',
        red: 'border-l-red-500',
        purple: 'border-l-purple-500',
        yellow: 'border-l-yellow-500',
    };

    const textColors: Record<string, string> = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        purple: 'text-purple-600',
        yellow: 'text-yellow-600',
    };

    return (
        <div className={`bg-white rounded-xl border border-l-4 ${colors[color]} p-4 ${large ? 'md:col-span-1' : ''}`}>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
        </div>
    );
}
