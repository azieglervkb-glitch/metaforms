'use client';

import { useState, useEffect } from 'react';

interface TutorialStep {
    icon: React.ReactNode;
    title: string;
    description: string;
    tip?: string;
}

interface OnboardingTutorialProps {
    storageKey: string;
    steps: TutorialStep[];
    primaryColor?: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
}

export default function OnboardingTutorial({
    storageKey,
    steps,
    primaryColor = '#0052FF',
    welcomeTitle,
    welcomeSubtitle,
}: OnboardingTutorialProps) {
    const [visible, setVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen

    useEffect(() => {
        try {
            const seen = localStorage.getItem(storageKey);
            if (!seen) {
                setVisible(true);
            }
        } catch {
            // localStorage not available
        }
    }, [storageKey]);

    const handleComplete = () => {
        try {
            localStorage.setItem(storageKey, 'true');
        } catch {
            // ignore
        }
        setVisible(false);
    };

    const handleNext = () => {
        if (currentStep >= steps.length - 1) {
            handleComplete();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > -1) {
            setCurrentStep(currentStep - 1);
        }
    };

    if (!visible) return null;

    const isWelcome = currentStep === -1;
    const totalSteps = steps.length;
    const progress = isWelcome ? 0 : ((currentStep + 1) / totalSteps) * 100;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
            <div
                className="bg-white w-full sm:w-auto sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: '90vh' }}
            >
                {/* Progress bar */}
                {!isWelcome && (
                    <div className="h-1 bg-gray-100">
                        <div
                            className="h-full transition-all duration-500 ease-out rounded-r-full"
                            style={{ width: `${progress}%`, backgroundColor: primaryColor }}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isWelcome ? (
                        /* Welcome Screen */
                        <div className="px-6 pt-10 pb-6 sm:px-10 sm:pt-12 text-center">
                            {/* Animated icon */}
                            <div
                                className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColor}12` }}
                            >
                                <svg className="w-10 h-10" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {welcomeTitle}
                            </h2>
                            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                                {welcomeSubtitle}
                            </p>

                            {/* Step preview */}
                            <div className="mt-8 space-y-2">
                                {steps.map((step, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-3 text-left bg-gray-50 rounded-xl px-4 py-3"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {i + 1}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{step.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Step Content */
                        <div className="px-6 pt-8 pb-6 sm:px-10">
                            {/* Step counter */}
                            <div className="flex items-center gap-2 mb-6">
                                <span
                                    className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {currentStep + 1}/{totalSteps}
                                </span>
                                <span className="text-xs text-gray-400 font-medium">
                                    {steps[currentStep].title}
                                </span>
                            </div>

                            {/* Icon */}
                            <div
                                className="w-16 h-16 rounded-2xl mb-5 flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColor}10` }}
                            >
                                <div style={{ color: primaryColor }}>
                                    {steps[currentStep].icon}
                                </div>
                            </div>

                            {/* Title & Description */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {steps[currentStep].title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {steps[currentStep].description}
                            </p>

                            {/* Tip */}
                            {steps[currentStep].tip && (
                                <div
                                    className="mt-4 rounded-xl px-4 py-3 flex items-start gap-3"
                                    style={{ backgroundColor: `${primaryColor}08`, border: `1px solid ${primaryColor}15` }}
                                >
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-gray-600 leading-relaxed">
                                        <strong className="font-semibold">Tipp:</strong> {steps[currentStep].tip}
                                    </p>
                                </div>
                            )}

                            {/* Dots */}
                            <div className="flex items-center justify-center gap-1.5 mt-6">
                                {steps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentStep(i)}
                                        className="transition-all duration-300 rounded-full"
                                        style={{
                                            width: i === currentStep ? 24 : 8,
                                            height: 8,
                                            backgroundColor: i === currentStep ? primaryColor : '#E5E7EB',
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 sm:px-10 pt-2">
                    {isWelcome ? (
                        <div className="space-y-2">
                            <button
                                onClick={handleNext}
                                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-colors"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Tutorial starten
                            </button>
                            <button
                                onClick={handleComplete}
                                className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Uberspringen
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Zuruck
                            </button>
                            <div className="flex-1" />
                            <button
                                onClick={handleComplete}
                                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Uberspringen
                            </button>
                            <button
                                onClick={handleNext}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {currentStep >= totalSteps - 1 ? 'Fertig' : 'Weiter'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
