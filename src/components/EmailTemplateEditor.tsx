'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface TemplateVariable {
    key: string;
    description: string;
}

interface TemplateData {
    subject: string;
    html_content: string;
    is_active: boolean;
}

// Sample data for preview
const PREVIEW_DATA: Record<string, string> = {
    '{{assignee_name}}': 'Max Mustermann',
    '{{lead_name}}': 'Erika Beispiel',
    '{{lead_email}}': 'erika@beispiel.de',
    '{{lead_phone}}': '+49 123 456789',
    '{{form_name}}': 'Kontaktformular Website',
    '{{qualified_url}}': '#',
    '{{unqualified_url}}': '#',
    '{{dashboard_url}}': '#',
};

export default function EmailTemplateEditor() {
    const [template, setTemplate] = useState<TemplateData | null>(null);
    const [variables, setVariables] = useState<TemplateVariable[]>([]);
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [isCustom, setIsCustom] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

    // Load template
    useEffect(() => {
        fetchTemplate();
    }, []);

    const fetchTemplate = async () => {
        try {
            const res = await fetch('/api/settings/email-template');
            const data = await res.json();

            if (data.template) {
                setTemplate(data.template);
                setSubject(data.template.subject);
                setHtmlContent(data.template.html_content);
            }
            setVariables(data.variables || []);
            setIsCustom(data.isCustom);
        } catch (error) {
            console.error('Error loading template:', error);
            toast.error('Fehler beim Laden des Templates');
        }
        setLoading(false);
    };

    // Save template
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings/email-template', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, html_content: htmlContent }),
            });

            if (res.ok) {
                toast.success('Template gespeichert');
                setIsCustom(true);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Fehler beim Speichern');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Fehler beim Speichern');
        }
        setSaving(false);
    };

    // Reset to default
    const handleReset = async () => {
        if (!confirm('Möchtest du das Template wirklich auf den Standard zurücksetzen?')) {
            return;
        }

        try {
            const res = await fetch('/api/settings/email-template', {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Template zurückgesetzt');
                fetchTemplate();
            } else {
                toast.error('Fehler beim Zurücksetzen');
            }
        } catch (error) {
            console.error('Error resetting template:', error);
            toast.error('Fehler beim Zurücksetzen');
        }
    };

    // Insert variable at cursor position
    const insertVariable = useCallback((variable: string) => {
        const textarea = document.getElementById('html-editor') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = htmlContent.substring(0, start) + variable + htmlContent.substring(end);
            setHtmlContent(newContent);

            // Set cursor position after inserted variable
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        } else {
            setHtmlContent(htmlContent + variable);
        }
    }, [htmlContent]);

    // Generate preview HTML
    const getPreviewHtml = useCallback(() => {
        let preview = htmlContent;
        Object.entries(PREVIEW_DATA).forEach(([key, value]) => {
            preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        });
        return preview;
    }, [htmlContent]);

    // Generate preview subject
    const getPreviewSubject = useCallback(() => {
        let preview = subject;
        Object.entries(PREVIEW_DATA).forEach(([key, value]) => {
            preview = preview.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
        });
        return preview;
    }, [subject]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-40 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">E-Mail Template Editor</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Passe die E-Mail an, die an Team-Mitglieder gesendet wird, wenn ein Lead zugewiesen wird.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isCustom && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Angepasst
                        </span>
                    )}
                </div>
            </div>

            {/* Variables Reference */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Verfügbare Variablen (klicken zum Einfügen)</h3>
                <div className="flex flex-wrap gap-2">
                    {variables.map((v) => (
                        <button
                            key={v.key}
                            onClick={() => insertVariable(v.key)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-blue-200 text-sm hover:bg-blue-50 transition-colors group"
                            title={v.description}
                        >
                            <code className="text-blue-600 font-mono text-xs">{v.key}</code>
                            <span className="text-gray-400 text-xs hidden group-hover:inline">- {v.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Subject Line */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Betreffzeile
                </label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                    placeholder="Neuer Lead: {{lead_name}}"
                />
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('editor')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'editor'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        HTML Editor
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === 'preview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Vorschau
                    </button>
                </div>
            </div>

            {/* Editor / Preview */}
            {activeTab === 'editor' ? (
                <div>
                    <textarea
                        id="html-editor"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        className="w-full h-[500px] px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm leading-relaxed resize-y"
                        placeholder="<div>Dein HTML Template...</div>"
                        spellCheck={false}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Tipp: Verwende Inline-CSS für beste E-Mail-Kompatibilität
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    {/* Preview Header */}
                    <div className="bg-gray-100 border-b px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Betreff:</span>
                            <span className="font-medium text-gray-900">{getPreviewSubject()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                            <span className="text-gray-500">An:</span>
                            <span className="text-gray-700">max.mustermann@firma.de</span>
                        </div>
                    </div>

                    {/* Preview Content */}
                    <div className="bg-gray-50 p-6">
                        <div
                            className="bg-white mx-auto max-w-[600px] shadow-lg"
                            dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                        />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
                <button
                    onClick={handleReset}
                    disabled={!isCustom}
                    className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Auf Standard zurücksetzen
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchTemplate()}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Abbrechen
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                    >
                        {saving ? 'Wird gespeichert...' : 'Template speichern'}
                    </button>
                </div>
            </div>
        </div>
    );
}
