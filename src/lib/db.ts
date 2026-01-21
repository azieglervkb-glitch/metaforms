import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';
const sslConfig = process.env.DATABASE_SSL === 'false'
    ? false
    : isProduction
        ? { rejectUnauthorized: false }
        : false;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig,
});

export async function query<T>(text: string, params?: unknown[]): Promise<T[]> {
    const result = await pool.query(text, params);
    return result.rows as T[];
}

export async function queryOne<T>(text: string, params?: unknown[]): Promise<T | null> {
    const result = await pool.query(text, params);
    return result.rows[0] as T | null;
}

export { pool };
