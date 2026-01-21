// Database Types for LeadSignal

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'junk' | 'not_reached' | 'closed';

export interface Organization {
  id: string;
  name: string;
  stripe_customer_id: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'member';
  created_at: string;
}

export interface MetaConnection {
  id: string;
  org_id: string;
  fb_user_id: string;
  access_token_encrypted: string;
  page_id: string;
  page_name: string;
  ad_account_id: string | null;
  pixel_id: string | null;
  token_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  org_id: string;
  meta_lead_id: string;
  form_id: string;
  form_name: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  ad_id: string | null;
  ad_name: string | null;
  
  // Lead Data
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  custom_fields: Record<string, string>;
  
  // Status & Quality
  status: LeadStatus;
  quality_score: number | null;
  quality_sent_to_meta: boolean;
  quality_sent_at: string | null;
  
  // Validation
  phone_valid: boolean | null;
  email_valid: boolean | null;
  
  // Notes
  notes: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface MetaLeadgenEntry {
  leadgen_id: string;
  page_id: string;
  form_id: string;
  ad_id?: string;
  created_time: string;
}

export interface MetaLeadData {
  id: string;
  created_time: string;
  field_data: Array<{
    name: string;
    values: string[];
  }>;
  form_id: string;
  ad_id?: string;
  campaign_id?: string;
}

// CAPI Event Types
export interface CAPIEvent {
  event_name: string;
  event_time: number;
  action_source: 'system_generated';
  user_data: {
    em?: string[];
    ph?: string[];
    lead_id?: string;
  };
  custom_data?: Record<string, unknown>;
}
