import Link from 'next/link';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold text-blue-600">
                        LeadSignal
                    </Link>
                    <Link
                        href="/login"
                        className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
                    >
                        Anmelden
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Häufige Fragen</h1>
                <p className="text-lg text-gray-600 mb-12">
                    Alles was du über LeadSignal und Meta Qualitäts-Feedback wissen musst.
                </p>

                <div className="space-y-8">
                    {/* What is LeadSignal */}
                    <FAQSection
                        title="Was ist LeadSignal?"
                        emoji="🎯"
                    >
                        <p>
                            LeadSignal ist ein Tool, das deine Meta Lead Forms mit einem Qualitäts-Feedback-System verbindet.
                            Wenn du Leads als &quot;qualifiziert&quot; oder &quot;unqualifiziert&quot; markierst, senden wir diese Information
                            automatisch an Meta zurück.
                        </p>
                    </FAQSection>

                    {/* What is Quality Feedback */}
                    <FAQSection
                        title="Was ist Qualitäts-Feedback?"
                        emoji="📊"
                    >
                        <p>
                            Qualitäts-Feedback (auch &quot;Conversion Leads Optimization&quot; genannt) ist ein Feature von Meta Ads.
                            Dabei sendest du Informationen darüber, welche Leads tatsächlich zu Kunden wurden, zurück an Meta.
                        </p>
                        <p className="mt-3">
                            Meta nutzt diese Daten um den Algorithmus zu trainieren und zukünftig mehr Menschen zu
                            erreichen, die deinen besten Kunden ähnlich sind.
                        </p>
                    </FAQSection>

                    {/* How does rating work */}
                    <FAQSection
                        title="Wie funktioniert das Rating?"
                        emoji="⭐"
                    >
                        <p>Du hast zwei Optionen für jeden Lead:</p>
                        <ul className="list-disc list-inside mt-3 space-y-2 text-gray-700">
                            <li>
                                <strong className="text-green-600">✓ Qualifiziert</strong> – Der Lead ist ein guter Kontakt
                                (z.B. echte Anfrage, seriöses Interesse, erreichbar per Telefon)
                            </li>
                            <li>
                                <strong className="text-red-600">✗ Unqualifiziert</strong> – Der Lead ist nicht nützlich
                                (z.B. falsche Kontaktdaten, kein echtes Interesse, Spam)
                            </li>
                        </ul>
                        <p className="mt-3">
                            Nachdem du einen Lead als &quot;Qualifiziert&quot; markierst, kannst du mit einem Klick das
                            Qualitätssignal an Meta senden.
                        </p>
                    </FAQSection>

                    {/* What happens when I send signal */}
                    <FAQSection
                        title="Was passiert wenn ich ein Signal sende?"
                        emoji="📤"
                    >
                        <p>
                            Wenn du das Signal sendest, übertragen wir die Lead-ID und die Qualifizierung an Meta's
                            Conversions API (CAPI). Meta verbindet diese Information mit der ursprünglichen Anzeige
                            und dem Nutzer-Profil.
                        </p>
                        <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <p className="text-blue-900">
                                <strong>Wichtig:</strong> Die Daten werden nur als Hash übertragen und sind verschlüsselt.
                                Meta kann nur den Zusammenhang zur ursprünglichen Anfrage herstellen.
                            </p>
                        </div>
                    </FAQSection>

                    {/* Benefits */}
                    <FAQSection
                        title="Welche Vorteile hat das?"
                        emoji="💡"
                    >
                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">📈 Bessere Lead-Qualität</h4>
                                <p className="text-green-700 text-sm">
                                    Meta lernt welche Nutzer am wahrscheinlichsten qualifizierte Leads werden.
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">💰 Niedrigerer CPL</h4>
                                <p className="text-green-700 text-sm">
                                    Weniger Müll-Leads bedeutet niedrigere Kosten pro qualifiziertem Lead.
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">🎯 Präziseres Targeting</h4>
                                <p className="text-green-700 text-sm">
                                    Der Algorithmus findet mehr Menschen die deinen besten Kunden ähneln.
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-semibold text-green-800 mb-2">⏰ Weniger Zeitverschwendung</h4>
                                <p className="text-green-700 text-sm">
                                    Weniger Zeit mit unqualifizierten Leads = mehr Zeit für echte Interessenten.
                                </p>
                            </div>
                        </div>
                    </FAQSection>

                    {/* How long to see results */}
                    <FAQSection
                        title="Wie schnell sehe ich Ergebnisse?"
                        emoji="⏱️"
                    >
                        <p>
                            Meta empfiehlt mindestens <strong>50-100 qualifizierte Leads</strong> zu senden, bevor der
                            Algorithmus signifikante Verbesserungen zeigt. Je nach Kampagnen-Budget kann das
                            einige Wochen dauern.
                        </p>
                        <p className="mt-3">
                            Du kannst den Fortschritt in deinem Meta Ads Manager unter &quot;Conversion Leads&quot;
                            im Events Manager verfolgen.
                        </p>
                    </FAQSection>

                    {/* What data is sent */}
                    <FAQSection
                        title="Welche Daten werden übertragen?"
                        emoji="🔒"
                    >
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            <li><strong>Lead-ID</strong> – Die von Meta vergebene eindeutige ID</li>
                            <li><strong>E-Mail (gehasht)</strong> – SHA256 verschlüsselt</li>
                            <li><strong>Telefon (gehasht)</strong> – SHA256 verschlüsselt</li>
                            <li><strong>Event-Name</strong> – &quot;Lead&quot; oder &quot;QualifiedLead&quot;</li>
                            <li><strong>Zeitstempel</strong> – Wann das Rating erfolgte</li>
                        </ul>
                        <p className="mt-4 text-sm text-gray-500">
                            Alle persönlichen Daten werden vor der Übertragung verschlüsselt.
                        </p>
                    </FAQSection>

                    {/* Pricing */}
                    <FAQSection
                        title="Was kostet LeadSignal?"
                        emoji="💳"
                    >
                        <p>
                            LeadSignal befindet sich aktuell in der Beta-Phase. Details zur Preisgestaltung
                            werden bald bekannt gegeben.
                        </p>
                        <div className="mt-4">
                            <Link
                                href="/register"
                                className="inline-block px-6 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"
                            >
                                Jetzt kostenlos starten →
                            </Link>
                        </div>
                    </FAQSection>
                </div>

                {/* CTA */}
                <div className="mt-16 text-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-4">Bereit für bessere Leads?</h2>
                    <p className="mb-6 opacity-90">
                        Starte jetzt und trainiere Meta's Algorithmus auf deine besten Kunden.
                    </p>
                    <Link
                        href="/register"
                        className="inline-block px-8 py-3 rounded-lg bg-white text-blue-600 font-bold hover:bg-gray-100"
                    >
                        Kostenlos registrieren
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-16 py-8 text-center text-gray-500 text-sm">
                <p>© 2026 LeadSignal. Alle Rechte vorbehalten.</p>
            </footer>
        </div>
    );
}

function FAQSection({
    title,
    emoji,
    children
}: {
    title: string;
    emoji: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                {title}
            </h2>
            <div className="text-gray-700 leading-relaxed">
                {children}
            </div>
        </div>
    );
}
