// Strongly-typed database entities matching supabase/schema.sql

export type OrgRole = 'owner' | 'admin' | 'developer' | 'viewer' | 'billing' | 'client';
export type OrgBillingStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type OrgPlan = 'free' | 'team' | 'enterprise';
export type EnvironmentName = 'development' | 'staging' | 'production';
export type VirtualKeyStatus = 'active' | 'frozen' | 'revoked';
export type ProviderStatus = 'active' | 'inactive' | 'rate_limited';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AlertCategory = 'cost' | 'ratelimit' | 'latency' | 'provider' | 'security';

export interface SystemAlert {
  id: string;
  user_id: string;
  org_id?: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  service: string;
  description: string;
  metric_value: string;
  threshold: string;
  impact: string;
  channel: string;
  trace_id?: string;
  created_at: string;
  updated_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
}

export interface AlertRule {
  id: string;
  user_id: string;
  org_id?: string;
  name: string;
  category: AlertCategory;
  severity: AlertSeverity;
  threshold: string;
  channel: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetScope = 'organization' | 'project' | 'key' | 'model';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetBreachAction = 'hard_block' | 'soft_alert' | 'downgrade_model' | 'throttle_rate';
export type BudgetStatus = 'active' | 'warning' | 'breached' | 'paused';

export interface BudgetLimit {
  id: string;
  user_id: string;
  org_id?: string;
  name: string;
  scope: BudgetScope;
  target_name: string;
  limit_amount: number;
  current_spend: number;
  currency: string;
  period: BudgetPeriod;
  action_on_breach: BudgetBreachAction;
  notify_threshold_percent: number;
  status: BudgetStatus;
  created_at: string;
  updated_at: string;
}

export interface RateLimitTier {
  id: string;
  user_id: string;
  model: string;
  provider: string;
  rpm_limit: number;
  rpm_current: number;
  tpm_limit: number;
  tpm_current: number;
  concurrency_limit: number;
  concurrency_current: number;
  queue_burst_allowed: boolean;
  status: 'optimal' | 'warning' | 'throttling';
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: 'free' | 'solo_pro' | 'team_scale' | 'enterprise';
  plan_name: string;
  price_amount: number;
  billing_interval: 'mo' | 'yr';
  status: SubscriptionStatus;
  renewal_date: string;
  quota_usage_percent: number;
  quota_used: number;
  quota_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  billing_status: OrgBillingStatus;
  plan: OrgPlan;
  billing_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  company_name: string | null;
  company_website: string | null;
  avatar_url: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: string;
  project_id: string;
  name: EnvironmentName;
  created_at: string;
}

export interface VirtualKey {
  id: string;
  organization_id: string;
  project_id: string;
  environment_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  monthly_limit_usd: number;
  current_spend_usd: number;
  rpm_limit: number;
  tpm_limit: number;
  max_concurrency: number;
  status: VirtualKeyStatus;
  created_at: string;
  last_used_at: string | null;
}

export interface ProviderConnection {
  id: string;
  organization_id: string;
  provider: string;
  secret_reference: string;
  status: ProviderStatus;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

export interface GatewayLog {
  id: string;
  request_id: string; // ost_req_...
  organization_id: string;
  project_id: string;
  environment_id: string;
  virtual_key_id: string;
  provider: string;
  requested_model: string;
  routed_model: string;
  fallback_used: boolean;
  fallback_from_model: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  latency_ms: number;
  status_code: number;
  error_type: string | null;
  error_code: string | null;
  created_at: string;
  completed_at: string | null;
}
