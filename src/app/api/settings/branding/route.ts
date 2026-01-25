import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface BrandingSettings {
    branding_company_name: string | null;
    branding_logo_url: string | null;
    branding_primary_color: string | null;
}

// Max logo size: 500KB (base64 encoded)
const MAX_LOGO_SIZE = 500 * 1024;

// GET - Get branding settings for organization
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const branding = await queryOne<BrandingSettings>(
            `SELECT branding_company_name, branding_logo_url, branding_primary_color
             FROM organizations WHERE id = $1`,
            [payload.orgId]
        );

        return NextResponse.json({
            companyName: branding?.branding_company_name || null,
            logoUrl: branding?.branding_logo_url || null,
            primaryColor: branding?.branding_primary_color || null,
        });
    } catch (error) {
        console.error('Get branding error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Laden' },
            { status: 500 }
        );
    }
}

// POST - Update branding settings
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { companyName, logoUrl, primaryColor } = await request.json();

        // Validate logo size if provided
        if (logoUrl && logoUrl.length > MAX_LOGO_SIZE) {
            return NextResponse.json(
                { error: 'Logo ist zu groß. Maximale Größe: 500KB' },
                { status: 400 }
            );
        }

        // Validate primary color format if provided
        if (primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) {
            return NextResponse.json(
                { error: 'Ungültiges Farbformat. Verwende Hex-Format: #RRGGBB' },
                { status: 400 }
            );
        }

        await query(
            `UPDATE organizations
             SET branding_company_name = $1,
                 branding_logo_url = $2,
                 branding_primary_color = $3,
                 updated_at = NOW()
             WHERE id = $4`,
            [
                companyName || null,
                logoUrl || null,
                primaryColor || null,
                payload.orgId,
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Save branding error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Speichern' },
            { status: 500 }
        );
    }
}

// DELETE - Reset branding to default
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await query(
            `UPDATE organizations
             SET branding_company_name = NULL,
                 branding_logo_url = NULL,
                 branding_primary_color = NULL,
                 updated_at = NOW()
             WHERE id = $1`,
            [payload.orgId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reset branding error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Fehler beim Zurücksetzen' },
            { status: 500 }
        );
    }
}
