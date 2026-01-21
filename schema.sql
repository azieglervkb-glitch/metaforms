-- LeadSignal PostgreSQL Schema for Coolify
-- Run this against your Coolify PostgreSQL database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  stripe_customer_id VARCHAR(255),
  subscription_status VARCHAR(50) DEFAULT 'trial',
  subscription_plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meta connections table (stores OAuth tokens)
CREATE TABLE IF NOT EXISTS meta_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  user_id VARCHAR(255),
  page_id VARCHAR(255),
  page_name VARCHAR(255),
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(org_id)
);

-- Lead forms table
CREATE TABLE IF NOT EXISTS lead_forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  meta_form_id VARCHAR(255) NOT NULL,
  form_name VARCHAR(255),
  page_id VARCHAR(255),
  page_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, meta_form_id)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  form_id UUID REFERENCES lead_forms(id) ON DELETE SET NULL,
  meta_lead_id VARCHAR(255) NOT NULL,
  
  -- Lead data
  email VARCHAR(255),
  phone VARCHAR(50),
  full_name VARCHAR(255),
  raw_data JSONB,
  
  -- Quality feedback
  quality_status VARCHAR(50) DEFAULT 'pending',
  quality_feedback_sent BOOLEAN DEFAULT false,
  quality_feedback_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, meta_lead_id)
);

-- Quality signals for CAPI
CREATE TABLE IF NOT EXISTS quality_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  signal_type VARCHAR(50) NOT NULL,
  event_name VARCHAR(100),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  meta_response JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_quality_status ON leads(quality_status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_forms_org_id ON lead_forms(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
