import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header - like outrnk */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-gray-900">LeadSignal</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 text-sm">Lead Management</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm mb-6">
            🚀 Trainiere Meta's Algorithmus auf echte Kunden
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Weniger Schrott-Leads.
            <br />
            <span className="text-blue-500">Mehr echte Kunden.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Meta optimiert auf billige Leads, nicht auf gute. LeadSignal sendet Qualitäts-Feedback
            an Meta, damit der Algorithmus lernt, Menschen zu finden, die wirklich kaufen.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 text-lg"
            >
              Jetzt kostenlos testen
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border text-gray-600 rounded-lg font-medium hover:bg-gray-50 text-lg"
            >
              Demo ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* How it works - clean cards like outrnk */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            So funktioniert's
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              number="1"
              title="Leads kommen rein"
              description="Deine Meta Lead Forms schicken Leads automatisch an LeadSignal."
            />
            <StepCard
              number="2"
              title="Du bewertest"
              description="Nach dem Telefonat markierst du: Qualifiziert oder Junk. Ein Klick."
            />
            <StepCard
              number="3"
              title="Meta lernt"
              description="Wir senden das Feedback an Meta. Der Algorithmus findet mehr gute Leads."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Features
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              emoji="🎯"
              title="Conversion Leads Optimization"
              description="Nutze Meta's Conversion Leads Ziel optimal durch echtes Qualitäts-Feedback."
            />
            <FeatureCard
              emoji="📊"
              title="Lead-Management"
              description="Alle Leads in einem Dashboard. Status ändern, Notizen hinzufügen."
            />
            <FeatureCard
              emoji="⚡"
              title="Echtzeit-Sync"
              description="Leads kommen sofort an. Keine Verzögerung, kein manueller Export."
            />
            <FeatureCard
              emoji="🔒"
              title="DSGVO-konform"
              description="Deine Daten bleiben in der EU. Server-Side Tracking."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Bereit für bessere Leads?
          </h2>
          <p className="text-gray-500 mb-8">
            Starte kostenlos und trainiere Meta's Algorithmus auf deine echten Kunden.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 text-lg"
          >
            Kostenlos starten →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          © 2025 LeadSignal. Made with ❤️ for Meta Advertisers.
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white border rounded-xl p-6 relative">
      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="text-2xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}
