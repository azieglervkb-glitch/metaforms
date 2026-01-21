'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next';

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
    const router = useRouter();

    const handleLogout = () => {
        deleteCookie('auth_token');
        router.push('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4 mb-8">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-900">
                        outrnk<span style={{ color: '#0052FF' }}>.</span>
                    </h1>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-600 text-sm">LeadSignal</span>
                </div>

                <div className="flex items-center gap-4">
                    <nav className="flex gap-2">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="btn-secondary text-sm py-2 px-4"
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </header>
    );
}
