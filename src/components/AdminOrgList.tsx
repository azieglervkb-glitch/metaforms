'use client';

import { useState } from 'react';

interface Organization {
    id: string;
    name: string;
    subscription_status: string;
    created_at: string;
    user_count: number;
    admin_email: string;
}

export default function OrgList({ initialOrgs }: { initialOrgs: Organization[] }) {
    const [orgs, setOrgs] = useState(initialOrgs);
    const [loading, setLoading] = useState<string | null>(null);

    const handleStatusChange = async (orgId: string, newStatus: string) => {
        if (!confirm(`Möchten Sie den Status wirklich auf "${newStatus}" ändern?`)) return;

        setLoading(orgId);
        try {
            const res = await fetch(`/api/admin/organizations/${orgId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setOrgs(orgs.map(o => o.id === orgId ? { ...o, subscription_status: newStatus } : o));
            } else {
                alert('Fehler beim Aktualisieren');
            }
        } catch (error) {
            alert('Fehler: ' + error);
        }
        setLoading(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin E-Mail</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Erstellt am</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orgs.map((org) => (
                            <tr key={org.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{org.admin_email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{org.user_count}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(org.subscription_status)}`}>
                                        {org.subscription_status === 'pending_approval' ? 'Wartet auf Freigabe' : org.subscription_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(org.created_at).toLocaleDateString('de-DE')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {org.subscription_status !== 'active' ? (
                                        <button
                                            onClick={() => handleStatusChange(org.id, 'active')}
                                            disabled={loading === org.id}
                                            className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
                                        >
                                            {loading === org.id ? '...' : 'Aktivieren'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusChange(org.id, 'inactive')}
                                            disabled={loading === org.id}
                                            className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded text-xs hover:bg-red-100 disabled:opacity-50 transition-colors"
                                        >
                                            {loading === org.id ? '...' : 'Sperren'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orgs.length === 0 && (
                    <div className="text-center py-12 text-gray-500">Keine Organisationen gefunden.</div>
                )}
            </div>
        </div>
    );
}
