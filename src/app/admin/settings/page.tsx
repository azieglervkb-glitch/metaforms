import AdminSettingsForm from '@/components/AdminSettingsForm';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">System Einstellungen</h1>
            <p className="text-gray-500">Konfigurieren Sie hier globale Einstellungen wie E-Mail-Server.</p>

            <AdminSettingsForm />
        </div>
    );
}
