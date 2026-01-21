// Dashboard layout with outrnk style navigation
import Link from 'next/link';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Übersicht' },
    { href: '/dashboard/leads', label: 'Leads' },
    { href: '/dashboard/kanban', label: 'Kanban' },
    { href: '/dashboard/team', label: 'Team' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/settings', label: 'Einstellungen' },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {/* Top Header Bar - outrnk style */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-900">
                            outrnk<span style={{ color: '#0052FF' }}>.</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600 text-sm">LeadSignal</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <form action="/api/auth/signout" method="post">
                        <button
                            type="submit"
                            className="btn-secondary text-sm py-2 px-4"
                        >
                            Abmelden
                        </button>
                    </form>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
