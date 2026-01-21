import { Pool } from 'pg';

// SSL configuration: only enable if DATABASE_SSL is explicitly set to 'true'
const sslConfig = process.env.DATABASE_SSL === 'true'
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
