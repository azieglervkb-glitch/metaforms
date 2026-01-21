'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Übersicht' },
    { href: '/dashboard/leads', label: 'Leads' },
    { href: '/dashboard/kanban', label: 'Kanban' },
    { href: '/dashboard/team', label: 'Team' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/settings', label: 'Einstellungen' },
];

export default function DashboardNav() {
    const pathname = usePathname();

    return (
        <div className="flex gap-2 flex-wrap">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </div>
    );
}
