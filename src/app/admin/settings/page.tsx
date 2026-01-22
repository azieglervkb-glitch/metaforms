import AdminSettingsForm from '@/components/AdminSettingsForm';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Einstellungen</h1>
                <p className="text-gray-500 text-sm mt-1">Konfiguriere globale Einstellungen fur das System</p>
            </div>

            <AdminSettingsForm />
        </div>
    );
}
