// Dashboard layout with outrnk style navigation
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Übersicht' },
    { href: '/dashboard/leads', label: 'Leads' },
    { href: '/dashboard/kanban', label: 'Kanban' },
    { href: '/dashboard/team', label: 'Team' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/settings', label: 'Einstellungen' },
];

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    // Access Control Check
    if (user && !user.is_super_admin) {
        const status = user.org_subscription_status;
        if (status === 'pending_approval' || status === 'inactive') {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center border border-gray-100">
                        <div className="text-4xl mb-4">
                            {status === 'inactive' ? '🚫' : '⏳'}
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            {status === 'inactive' ? 'Account deaktiviert' : 'Wartet auf Freigabe'}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            {status === 'inactive'
                                ? 'Ihr Account wurde deaktiviert. Bitte kontaktieren Sie den Support.'
                                : 'Vielen Dank für Ihre Registrierung. Ihr Account wird derzeit überprüft und in Kürze freigeschaltet.'}
                        </p>
                        <form action="/api/auth/logout" method="post">
                            <button className="text-sm text-gray-500 hover:text-gray-900 underline">
                                Abmelden
                            </button>
                        </form>
                    </div>
                </div>
            );
        }
    }

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
                        <span className="text-gray-600 text-sm">Leads</span>

                        {/* Admin Link REMOVED as per user request */}
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
                    <form action="/api/auth/logout" method="post">
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
