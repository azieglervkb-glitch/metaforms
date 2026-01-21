import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from './db';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'leadsignal-secret-key-change-in-production';

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    org_id: string;
    is_super_admin?: boolean;
    org_subscription_status?: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function createToken(user: User): string {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            orgId: user.org_id,
            isSuperAdmin: user.is_super_admin || false
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyToken(token: string): { userId: string; email: string; role: string; orgId: string; isSuperAdmin?: boolean } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string; orgId: string; isSuperAdmin?: boolean };
    } catch {
        return null;
    }
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await queryOne<User>(
        `SELECT u.id, u.email, u.full_name, u.role, u.org_id, u.is_super_admin, o.subscription_status as org_subscription_status
         FROM users u
         LEFT JOIN organizations o ON u.org_id = o.id
         WHERE u.id = $1`,
        [payload.userId]
    );

    return user;
}

export async function registerUser(email: string, password: string, fullName: string): Promise<{ user: User } | { error: string }> {
    // Check if user exists
    const existing = await queryOne<User>('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
        return { error: 'Ein Benutzer mit dieser E-Mail existiert bereits' };
    }

    const passwordHash = await hashPassword(password);

    // Create organization
    const org = await queryOne<{ id: string }>(
        "INSERT INTO organizations (name) VALUES ($1) RETURNING id",
        [`${fullName}'s Organization`]
    );

    if (!org) {
        return { error: 'Fehler beim Erstellen der Organisation' };
    }

    // Create user
    const user = await queryOne<User>(
        `INSERT INTO users (email, password_hash, full_name, role, org_id) 
     VALUES ($1, $2, $3, 'admin', $4) 
     RETURNING id, email, full_name, role, org_id, is_super_admin`,
        [email, passwordHash, fullName, org.id]
    );

    if (!user) {
        return { error: 'Fehler beim Erstellen des Benutzers' };
    }

    return { user };
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | { error: string }> {
    const user = await queryOne<User & { password_hash: string }>(
        'SELECT id, email, full_name, role, org_id, password_hash, is_super_admin FROM users WHERE email = $1',
        [email]
    );

    if (!user) {
        return { error: 'Ungültige E-Mail oder Passwort' };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
        return { error: 'Ungültige E-Mail oder Passwort' };
    }

    const token = createToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            org_id: user.org_id,
            is_super_admin: user.is_super_admin
        },
        token
    };
}
