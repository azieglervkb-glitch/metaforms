import { pool } from './db';

export async function runMigrations() {
  console.log('Running database migrations...');

  try {
    // Enable UUID extension
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Organizations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        stripe_customer_id VARCHAR(255),
        subscription_status VARCHAR(50) DEFAULT 'trial',
        subscription_plan VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'member',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Team members table (for lead assignment)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(org_id, email)
      )
    `);

    // Meta connections table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meta_connections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        user_id VARCHAR(255),
        page_id VARCHAR(255),
        page_name VARCHAR(255),
        pixel_id VARCHAR(255),
        connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(org_id)
      )
    `);

    // Add pixel_id if not exists
    await pool.query(`
      ALTER TABLE meta_connections ADD COLUMN IF NOT EXISTS pixel_id VARCHAR(255)
    `);

    // Leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        meta_lead_id VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        full_name VARCHAR(255),
        raw_data JSONB,
        quality_status VARCHAR(50) DEFAULT 'pending',
        quality_feedback_sent BOOLEAN DEFAULT false,
        quality_feedback_sent_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(50) DEFAULT 'new',
        notes TEXT,
        assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(org_id, meta_lead_id)
      )
    `);

    // Add columns if not exists
    await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT`);
    await pool.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID`);

    // Indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_team_members_org_id ON team_members(org_id)`);

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}
