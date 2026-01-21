import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

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
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold tracking-wider">ADMIN PANEL</h1>
                    <p className="text-xs text-gray-400 mt-1">System Administration</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                        📊 Dashboard
                    </Link>
                    <Link href="/admin/organizations" className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                        🏢 Organisationen
                    </Link>
                    <Link href="/admin/settings" className="block px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium">
                        ⚙️ Einstellungen
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <div className="px-4 py-2 text-xs text-gray-500">
                        Eingeloggt als: <br />
                        <span className="text-gray-300 font-medium">{user.email}</span>
                    </div>
                    <Link href="/dashboard" className="block mt-4 text-center px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        ← Zurück zur App
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-700">Administration</h2>
                    <div className="text-xs text-gray-400 px-3 py-1 bg-gray-50 rounded-full border">
                        Super Admin Mode
                    </div>
                </header>
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
