import Link from 'next/link';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="text-xl font-bold text-gray-900">outrnk<span className="text-[#0052FF]">.</span></span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-500 text-sm font-medium">Leads</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="px-5 py-2.5 bg-[#0052FF] text-white rounded-lg text-sm font-medium hover:bg-[#0047E1] transition-colors"
                        >
                            Kostenlos starten
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF]/5 border border-[#0052FF]/10 text-[#0052FF] text-sm font-medium mb-6">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Haufig gestellte Fragen
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">FAQ</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Alles was du uber outrnk Leads und Meta Qualitats-Feedback wissen musst.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* What is outrnk Leads */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        iconBg="bg-[#0052FF]/10"
                        title="Was ist outrnk Leads?"
                    >
                        <p className="text-gray-600">
                            outrnk Leads ist ein Tool, das deine Meta Lead Forms mit einem Qualitats-Feedback-System verbindet.
                            Wenn du Leads als &quot;qualifiziert&quot; oder &quot;unqualifiziert&quot; markierst, senden wir diese Information
                            automatisch an Meta zuruck.
                        </p>
                    </FAQCard>

                    {/* What is Quality Feedback */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        }
                        iconBg="bg-purple-100"
                        title="Was ist Qualitats-Feedback?"
                    >
                        <p className="text-gray-600">
                            Qualitats-Feedback (auch &quot;Conversion Leads Optimization&quot; genannt) ist ein Feature von Meta Ads.
                            Dabei sendest du Informationen daruber, welche Leads tatsachlich zu Kunden wurden, zuruck an Meta.
                        </p>
                        <p className="text-gray-600 mt-3">
                            Meta nutzt diese Daten um den Algorithmus zu trainieren und zukunftig mehr Menschen zu
                            erreichen, die deinen besten Kunden ahnlich sind.
                        </p>
                    </FAQCard>

                    {/* How does rating work */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        }
                        iconBg="bg-amber-100"
                        title="Wie funktioniert das Rating?"
                    >
                        <p className="text-gray-600 mb-4">Du hast zwei Optionen fur jeden Lead:</p>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-green-800">Qualifiziert</p>
                                    <p className="text-sm text-green-700">Der Lead ist ein guter Kontakt (echte Anfrage, serioses Interesse, erreichbar)</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-red-800">Unqualifiziert</p>
                                    <p className="text-sm text-red-700">Der Lead ist nicht nutzlich (falsche Daten, kein Interesse, Spam)</p>
                                </div>
                            </div>
                        </div>
                    </FAQCard>

                    {/* What happens when I send signal */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        }
                        iconBg="bg-indigo-100"
                        title="Was passiert wenn ich ein Signal sende?"
                    >
                        <p className="text-gray-600">
                            Wenn du das Signal sendest, ubertragen wir die Lead-ID und die Qualifizierung an Meta's
                            Conversions API (CAPI). Meta verbindet diese Information mit der ursprunglichen Anzeige
                            und dem Nutzer-Profil.
                        </p>
                        <div className="mt-4 p-4 bg-[#0052FF]/5 rounded-lg border border-[#0052FF]/10">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-[#0052FF] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-[#0052FF]">
                                    <strong>Wichtig:</strong> Die Daten werden nur als Hash ubertragen und sind verschlusselt.
                                    Meta kann nur den Zusammenhang zur ursprunglichen Anfrage herstellen.
                                </p>
                            </div>
                        </div>
                    </FAQCard>

                    {/* Benefits */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        }
                        iconBg="bg-green-100"
                        title="Welche Vorteile hat das?"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-[#0052FF]/10 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">Bessere Lead-Qualitat</h4>
                                <p className="text-sm text-gray-500">Meta lernt welche Nutzer am wahrscheinlichsten qualifizierte Leads werden.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">Niedrigerer CPL</h4>
                                <p className="text-sm text-gray-500">Weniger Mull-Leads bedeutet niedrigere Kosten pro qualifiziertem Lead.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">Praziseres Targeting</h4>
                                <p className="text-sm text-gray-500">Der Algorithmus findet mehr Menschen die deinen besten Kunden ahneln.</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">Weniger Zeitverschwendung</h4>
                                <p className="text-sm text-gray-500">Weniger Zeit mit unqualifizierten Leads = mehr Zeit fur echte Interessenten.</p>
                            </div>
                        </div>
                    </FAQCard>

                    {/* How long to see results */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                        iconBg="bg-cyan-100"
                        title="Wie schnell sehe ich Ergebnisse?"
                    >
                        <p className="text-gray-600">
                            Meta empfiehlt mindestens <strong>50-100 qualifizierte Leads</strong> zu senden, bevor der
                            Algorithmus signifikante Verbesserungen zeigt. Je nach Kampagnen-Budget kann das
                            einige Wochen dauern.
                        </p>
                        <p className="text-gray-600 mt-3">
                            Du kannst den Fortschritt in deinem Meta Ads Manager unter &quot;Conversion Leads&quot;
                            im Events Manager verfolgen.
                        </p>
                    </FAQCard>

                    {/* What data is sent */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        }
                        iconBg="bg-emerald-100"
                        title="Welche Daten werden ubertragen?"
                    >
                        <div className="space-y-2">
                            {[
                                { label: 'Lead-ID', desc: 'Die von Meta vergebene eindeutige ID' },
                                { label: 'E-Mail (gehasht)', desc: 'SHA256 verschlusselt' },
                                { label: 'Telefon (gehasht)', desc: 'SHA256 verschlusselt' },
                                { label: 'Event-Name', desc: '"Lead" oder "QualifiedLead"' },
                                { label: 'Zeitstempel', desc: 'Wann das Rating erfolgte' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                                    </svg>
                                    <span className="font-medium text-gray-900">{item.label}</span>
                                    <span className="text-gray-500">– {item.desc}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-gray-500">
                            Alle personlichen Daten werden vor der Ubertragung verschlusselt.
                        </p>
                    </FAQCard>

                    {/* Pricing */}
                    <FAQCard
                        icon={
                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        }
                        iconBg="bg-pink-100"
                        title="Was kostet outrnk Leads?"
                    >
                        <p className="text-gray-600 mb-4">
                            outrnk Leads befindet sich aktuell in der Beta-Phase. Details zur Preisgestaltung
                            werden bald bekannt gegeben.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0052FF] text-white rounded-lg font-medium hover:bg-[#0047E1] transition-colors"
                        >
                            Jetzt kostenlos starten
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </FAQCard>
                </div>

                {/* CTA */}
                <div className="mt-16">
                    <div className="bg-[#0052FF] rounded-2xl p-10 text-center text-white">
                        <h2 className="text-2xl font-bold mb-4">Bereit fur bessere Leads?</h2>
                        <p className="text-white/80 mb-6 max-w-lg mx-auto">
                            Starte jetzt und trainiere Meta's Algorithmus auf deine besten Kunden.
                        </p>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0052FF] rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            Kostenlos registrieren
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-8 px-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <p className="text-gray-500 text-sm">© 2025 outrnk. Alle Rechte vorbehalten.</p>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">Home</Link>
                        <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FAQCard({
    icon,
    iconBg,
    title,
    children
}: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
                    <div className="text-gray-600 leading-relaxed">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
