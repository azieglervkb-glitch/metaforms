// API endpoint to create test leads
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const SAMPLE_NAMES = [
    'Max Mustermann',
    'Anna Schmidt',
    'Thomas Müller',
    'Sarah Weber',
    'Michael Fischer',
    'Laura Meyer',
    'Daniel Hoffmann',
    'Julia Koch',
    'Markus Becker',
    'Lisa Richter'
];

const SAMPLE_COMPANIES = [
    'Tech Solutions GmbH',
    'Digital Marketing AG',
    'Consulting Partners',
    'E-Commerce Experts',
    'Innovation Labs',
    'Smart Business Solutions',
    'Growth Agency',
    'Future Systems',
    'Web Development Pro',
    'Marketing Masters'
];

function generateTestLead() {
    const name = SAMPLE_NAMES[Math.floor(Math.random() * SAMPLE_NAMES.length)];
    const company = SAMPLE_COMPANIES[Math.floor(Math.random() * SAMPLE_COMPANIES.length)];
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ')[1];
    
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.de`;
    const phone = `+49 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000000 + 1000000)}`;
    
    return {
        full_name: name,
        email,
        phone,
        company,
        message: `Ich interessiere mich für Ihre Dienstleistungen. Bitte kontaktieren Sie mich.`,
        raw_data: {
            full_name: name,
            email,
            phone_number: phone,
            company_name: company,
            message: `Ich interessiere mich für Ihre Dienstleistungen. Bitte kontaktieren Sie mich.`
        }
    };
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Generate test lead
        const testLead = generateTestLead();
        
        // Generate a unique test lead ID
        const testLeadId = `test_lead_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Insert test lead into database
        await query(
            `INSERT INTO leads 
            (org_id, meta_lead_id, email, phone, full_name, raw_data, status, form_id, form_name, ad_id)
            VALUES ($1, $2, $3, $4, $5, $6, 'new', $7, $8, $9)`,
            [
                payload.orgId,
                testLeadId,
                testLead.email,
                testLead.phone,
                testLead.full_name,
                JSON.stringify(testLead.raw_data),
                'test_form_001',
                'Test Lead Form',
                'test_ad_001'
            ]
        );

        return NextResponse.json({
            success: true,
            lead: {
                id: testLeadId,
                ...testLead
            }
        });
    } catch (error) {
        console.error('Failed to create test lead:', error);
        return NextResponse.json(
            { error: 'Failed to create test lead' },
            { status: 500 }
        );
    }
}
