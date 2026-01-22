import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">outrnk<span className="text-[#0052FF]">.</span></span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm font-medium">Leads</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              FAQ
            </Link>
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

      {/* Hero */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052FF]/5 border border-[#0052FF]/10 text-[#0052FF] text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Trainiere Meta's Algorithmus auf echte Kunden
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Weniger Schrott-Leads.
            <br />
            <span className="text-[#0052FF]">Mehr echte Kunden.</span>
          </h1>

          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Meta optimiert auf billige Leads, nicht auf gute. outrnk Leads sendet Qualitats-Feedback
            an Meta, damit der Algorithmus lernt, Menschen zu finden, die wirklich kaufen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-[#0052FF] text-white rounded-xl font-medium hover:bg-[#0047E1] transition-colors text-lg flex items-center gap-2"
            >
              Jetzt kostenlos testen
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors text-lg"
            >
              Demo ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">So funktioniert's</h2>
            <p className="text-gray-500 text-lg">In drei einfachen Schritten zu besseren Leads</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-[#0052FF] text-white flex items-center justify-center text-lg font-bold mb-6">
                1
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Leads kommen rein</h3>
              <p className="text-gray-500">Deine Meta Lead Forms schicken Leads automatisch an outrnk Leads.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-[#0052FF] text-white flex items-center justify-center text-lg font-bold mb-6">
                2
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Du bewertest</h3>
              <p className="text-gray-500">Nach dem Telefonat markierst du: Qualifiziert oder Junk. Ein Klick.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 relative">
              <div className="w-12 h-12 rounded-xl bg-[#0052FF] text-white flex items-center justify-center text-lg font-bold mb-6">
                3
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Meta lernt</h3>
              <p className="text-gray-500">Wir senden das Feedback an Meta. Der Algorithmus findet mehr gute Leads.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features</h2>
            <p className="text-gray-500 text-lg">Alles was du fur bessere Leads brauchst</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-12 h-12 rounded-xl bg-[#0052FF]/10 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-[#0052FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Conversion Leads Optimization</h3>
              <p className="text-gray-500">Nutze Meta's Conversion Leads Ziel optimal durch echtes Qualitats-Feedback.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Lead-Management</h3>
              <p className="text-gray-500">Alle Leads in einem Dashboard. Status andern, Notizen hinzufugen.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">Echtzeit-Sync</h3>
              <p className="text-gray-500">Leads kommen sofort an. Keine Verzogerung, kein manueller Export.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-3">DSGVO-konform</h3>
              <p className="text-gray-500">Deine Daten bleiben in der EU. Server-Side Tracking.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#0052FF] rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Bereit fur bessere Leads?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Starte kostenlos und trainiere Meta's Algorithmus auf deine echten Kunden.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0052FF] rounded-xl font-medium hover:bg-gray-100 transition-colors text-lg"
            >
              Kostenlos starten
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-gray-500 text-sm">
            © 2025 outrnk. Made for Meta Advertisers.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/faq" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">FAQ</Link>
            <Link href="/login" className="text-gray-500 hover:text-gray-700 text-sm transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
