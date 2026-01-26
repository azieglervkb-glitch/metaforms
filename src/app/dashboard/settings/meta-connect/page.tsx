'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';

interface Page {
    id: string;
    name: string;
}

interface Pixel {
    id: string;
    name: string;
}

function MetaConnectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');

    const [step, setStep] = useState<'page' | 'pixel'>('page');
    const [pages, setPages] = useState<Page[]>([]);
    const [pixels, setPixels] = useState<Pixel[]>([]);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);
    const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingPixels, setLoadingPixels] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('Keine gültige Session gefunden. Bitte starte den Verbindungsvorgang erneut.');
            setLoading(false);
            return;
        }
        fetchPages();
    }, [sessionId]);

    const fetchPages = async () => {
        try {
            const res = await fetch(`/api/meta/pages?session=${sessionId}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Fehler beim Laden der Seiten');
                return;
            }

            setPages(data.pages || []);
        } catch (err) {
            console.error('Error fetching pages:', err);
            setError('Fehler beim Laden der Seiten');
        }
        setLoading(false);
    };

    const handlePageSelect = async (page: Page) => {
        setSelectedPage(page);
        setLoadingPixels(true);

        try {
            const res = await fetch(`/api/meta/pixels?session=${sessionId}&page_id=${page.id}`);
            const data = await res.json();

            if (res.ok) {
                setPixels(data.pixels || []);
                setStep('pixel');
            } else {
                toast.error(data.error || 'Fehler beim Laden der Pixel');
            }
        } catch (err) {
            console.error('Error fetching pixels:', err);
            toast.error('Fehler beim Laden der Pixel');
        }
        setLoadingPixels(false);
    };

    const handleConnect = async () => {
        if (!selectedPage) return;

        setConnecting(true);
        try {
            const res = await fetch('/api/meta/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    pageId: selectedPage.id,
                    pixelId: selectedPixel?.id || null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Meta erfolgreich verbunden!');
                router.push('/dashboard/settings?success=connected');
            } else {
                toast.error(data.error || 'Fehler beim Verbinden');
                setConnecting(false);
            }
        } catch (err) {
            console.error('Error connecting:', err);
            toast.error('Fehler beim Verbinden');
            setConnecting(false);
        }
    };

    const handleSkipPixel = async () => {
        setSelectedPixel(null);
        await handleConnect();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500">Lade verfügbare Seiten...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-md border border-gray-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Session abgelaufen</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/dashboard/settings"
                        className="inline-block px-6 py-3 bg-[#0052FF] text-white rounded-lg font-medium hover:bg-[#0047E1] transition-colors"
                    >
                        Zurück zu Einstellungen
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <Toaster position="top-center" richColors />

            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/settings" className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Meta verbinden</h1>
                            <p className="text-sm text-gray-500">
                                Schritt {step === 'page' ? '1' : '2'} von 2: {step === 'page' ? 'Facebook-Seite wählen' : 'Pixel wählen'}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto p-6">
                {/* Progress */}
                <div className="flex items-center gap-2 mb-8">
                    <div className={`flex-1 h-1 rounded-full ${step === 'page' || step === 'pixel' ? 'bg-[#0052FF]' : 'bg-gray-200'}`}></div>
                    <div className={`flex-1 h-1 rounded-full ${step === 'pixel' ? 'bg-[#0052FF]' : 'bg-gray-200'}`}></div>
                </div>

                {step === 'page' ? (
                    /* Step 1: Page Selection */
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Facebook-Seite auswählen</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Wähle die Facebook-Seite für diesen Kunden. Die Lead Ads dieser Seite werden automatisch importiert.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                            {pages.map((page) => (
                                <button
                                    key={page.id}
                                    onClick={() => handlePageSelect(page)}
                                    disabled={loadingPixels}
                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#1877F2] rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-gray-900">{page.name}</p>
                                            <p className="text-xs text-gray-500">ID: {page.id}</p>
                                        </div>
                                    </div>
                                    {loadingPixels && selectedPage?.id === page.id ? (
                                        <div className="w-5 h-5 border-2 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>

                        {pages.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">Keine Facebook-Seiten gefunden.</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Stelle sicher, dass du Admin-Zugriff auf die Seiten hast.
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Step 2: Pixel Selection */
                    <div className="space-y-4">
                        {/* Selected Page Info */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-green-700 font-medium">Facebook-Seite ausgewählt</p>
                                <p className="text-green-900 font-semibold">{selectedPage?.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setStep('page');
                                    setSelectedPage(null);
                                    setPixels([]);
                                }}
                                className="ml-auto text-sm text-green-700 hover:text-green-900"
                            >
                                Ändern
                            </button>
                        </div>

                        {/* Pixel Selection */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Meta Pixel auswählen</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Wähle das Pixel für CAPI-Signale (Lead-Qualität). Du kannst diesen Schritt auch überspringen.
                                </p>
                            </div>

                            {pixels.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {pixels.map((pixel) => (
                                        <button
                                            key={pixel.id}
                                            onClick={() => setSelectedPixel(pixel)}
                                            className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                                selectedPixel?.id === pixel.id ? 'bg-[#0052FF]/5' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    selectedPixel?.id === pixel.id ? 'bg-[#0052FF]' : 'bg-gray-100'
                                                }`}>
                                                    <svg className={`w-5 h-5 ${selectedPixel?.id === pixel.id ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-gray-900">{pixel.name}</p>
                                                    <p className="text-xs text-gray-500">Pixel ID: {pixel.id}</p>
                                                </div>
                                            </div>
                                            {selectedPixel?.id === pixel.id && (
                                                <svg className="w-5 h-5 text-[#0052FF]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-900 font-medium">Keine Pixel gefunden</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Kein Pixel verfügbar. Du kannst trotzdem verbinden und später ein Pixel manuell hinzufügen.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4">
                            <button
                                onClick={handleSkipPixel}
                                disabled={connecting}
                                className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                Überspringen (ohne Pixel)
                            </button>
                            <button
                                onClick={handleConnect}
                                disabled={connecting || !selectedPixel}
                                className="px-6 py-3 bg-[#0052FF] text-white rounded-lg font-medium hover:bg-[#0047E1] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {connecting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Verbinde...
                                    </>
                                ) : (
                                    <>
                                        Verbinden
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Help Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Tipp für Agenturen</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Du siehst alle Facebook-Seiten, für die du Admin-Rechte hast. Wähle die Seite des jeweiligen Kunden aus, um dessen Lead Ads zu verbinden.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function MetaConnectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#0052FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MetaConnectContent />
        </Suspense>
    );
}
