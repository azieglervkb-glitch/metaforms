export default function AdminSettingsPage() {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <div className="text-5xl mb-4">⚙️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Einstellungen</h2>
            <p className="text-gray-500 mb-6">Globale Systemeinstellungen (SMTP, Texte, etc.) werden hier bald verfügbar sein.</p>
            <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded cursor-not-allowed">
                Kommt bald
            </button>
        </div>
    );
}
