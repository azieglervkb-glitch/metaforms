// Dashboard layout with sidebar - outrnk style (light theme)
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header Bar - like outrnk */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-white">
                <div className="flex h-full items-center justify-between px-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">LeadSignal</span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 text-sm">Lead Management System</span>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                            Admin
                        </span>
                        <form action="/api/auth/signout" method="post">
                            <button
                                type="submit"
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                            >
                                Abmelden
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-16">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
