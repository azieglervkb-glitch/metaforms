// Admin layout with same style as user dashboard
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

const ADMIN_NAV_ITEMS = [
    { href: '/admin', label: 'Übersicht' },
    { href: '/admin/organizations', label: 'Organisationen' },
    { href: '/admin/users', label: 'Benutzer' },
    { href: '/admin/settings', label: 'Einstellungen' },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user || !user.is_super_admin) {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen">
            {/* Top Header Bar - same style as dashboard */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-gray-900">
                            outrnk<span style={{ color: '#0052FF' }}>.</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">ADMIN</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex items-center gap-2">
                        {ADMIN_NAV_ITEMS.map((item) => (
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
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Zur App
                        </Link>
                        <form action="/api/auth/logout" method="post">
                            <button
                                type="submit"
                                className="btn-secondary text-sm py-2 px-4"
                            >
                                Abmelden
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
