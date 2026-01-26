'use client';

import OnboardingTutorial from './OnboardingTutorial';

const DASHBOARD_STEPS = [
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'Deine Leads im Uberblick',
        description: 'Unter "Leads" findest du alle eingegangenen Kontakte in einer ubersichtlichen Kartenansicht. Filtere nach Status, Formular oder suche nach Namen, E-Mail oder Telefonnummer.',
        tip: 'Klicke auf eine Lead-Karte, um alle Details zu sehen, Notizen hinzuzufugen und den Status zu andern.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
        ),
        title: 'Kanban-Board',
        description: 'Das Kanban-Board zeigt deine Leads in Spalten nach Status sortiert: Neu, Kontaktiert, Interessiert, Termin, Gewonnen und Verloren. Ziehe Leads einfach per Drag & Drop in eine andere Spalte.',
        tip: 'Wenn du einen Lead in "Interessiert", "Termin", "Gewonnen" oder "Verloren" verschiebst, wird automatisch ein Signal an Meta gesendet fur bessere Lead-Qualitat.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Aktivitaten erfassen',
        description: 'Fur jeden Lead kannst du Aktivitaten wie Anrufe, E-Mails, Meetings und Notizen erfassen. Offne dazu einen Lead und wechsle zum Tab "Aktivitaten". So behaltst du den vollen Uberblick uber deine Kommunikation.',
        tip: 'Jede Aktivitat wird mit Datum und Typ gespeichert, damit du die gesamte Historie nachverfolgen kannst.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        title: 'Team verwalten',
        description: 'Fugen unter "Team" Mitarbeiter hinzu und weise ihnen Leads zu. Jeder Mitarbeiter bekommt automatisch eine E-Mail mit einem persoenlichen Zugangslink zu seinem eigenen Lead-Portal.',
        tip: 'Im Lead-Detail kannst du direkt ein Team-Mitglied aus dem Dropdown auswahlen und zuweisen.',
    },
    {
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        title: 'Einstellungen',
        description: 'Unter "Einstellungen" verbindest du dein Meta-Werbekonto, passt E-Mail-Vorlagen an und konfigurierst dein Branding. So sehen deine Mitarbeiter und Kunden dein Logo und deine Farben.',
        tip: 'Verbinde Meta unter Einstellungen, um automatisch neue Leads aus deinen Lead Ads zu empfangen.',
    },
];

export default function DashboardOnboarding() {
    return (
        <OnboardingTutorial
            storageKey="outrnk_leads_dashboard_onboarding"
            steps={DASHBOARD_STEPS}
            welcomeTitle="Willkommen bei Leads!"
            welcomeSubtitle="Wir zeigen dir in wenigen Schritten, wie du deine Leads optimal verwaltest und dein Team einbindest."
        />
    );
}
