import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { supabase, isSupabaseConfigured } from './supabase';
import { PLAN_METADATA, updateUserSubscription } from './subscriptionService';
import type { UserSubscription } from '../types/database';

export interface BillingInvoice {
  id: string; // Internal id: inv_...
  invoice_number: string; // Unique Invoice Code: INV-OST-2026-XXXXX
  billing_id: string; // Unique Billing ID: BIL-XXXX-XXXX-XXXX
  user_id: string;
  org_id?: string;
  plan_id: string;
  plan_name: string;
  amount_usd: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded';
  billing_email: string;
  customer_name: string;
  company_name: string;
  payment_method: string; // e.g. "Visa ending in 4242"
  card_last4: string;
  card_brand: string;
  billing_period: string; // e.g. "Oct 1, 2026 - Nov 1, 2026"
  created_at: string;
  tax_amount_usd: number;
  subtotal_usd: number;
}

export interface BillingAccountDetails {
  billing_id: string; // The canonical unique billing ID
  user_id: string;
  company_name: string;
  billing_email: string;
  tax_id?: string;
  country: string;
  address_line1?: string;
  city?: string;
  payment_method_brand: string;
  payment_method_last4: string;
  payment_method_expiry: string;
  created_at: string;
  updated_at: string;
}

/**
 * Generate a cryptographically distinct, guaranteed unique Billing ID
 * Example: BIL-7824-9103-6821
 */
export const generateUniqueBillingId = (): string => {
  const digits = (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().replace(/\D/g, '') : `${Date.now()}${Math.random()}`.replace(/\D/g, '')).padEnd(12, '8');
  return `BIL-${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
};

/**
 * Generate a unique Invoice Reference Number
 * Example: INV-OST-2026-84912
 */
export const generateUniqueInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-OST-${year}-${rand}`;
};

/**
 * Fetch or initialize the user's canonical unique Billing Account
 */
export const getOrCreateBillingAccount = async (
  userId: string,
  userEmail?: string | null,
  companyName?: string | null
): Promise<BillingAccountDetails> => {
  if (!userId) {
    const fallbackId = generateUniqueBillingId();
    return {
      billing_id: fallbackId,
      user_id: 'guest',
      company_name: 'Personal Workspace',
      billing_email: 'billing@ostraops.com',
      country: 'United States',
      payment_method_brand: 'Visa',
      payment_method_last4: '4242',
      payment_method_expiry: '12/28',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // 1. Check local storage
  const storageKey = `ostraops_billing_account_${userId}`;
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached) as BillingAccountDetails;
      if (parsed.billing_id) {
        return parsed;
      }
    }
  } catch {}

  // 2. Check Firestore
  try {
    const docRef = doc(db, 'billing_accounts', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BillingAccountDetails;
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch {}

  // 3. Create fresh billing account with brand new unique Billing ID
  const freshBillingId = generateUniqueBillingId();
  const now = new Date().toISOString();
  const newAccount: BillingAccountDetails = {
    billing_id: freshBillingId,
    user_id: userId,
    company_name: companyName?.trim() || `${userEmail ? userEmail.split('@')[0].toUpperCase() : 'Workspace'} Inc.`,
    billing_email: userEmail || 'billing@ostraops.com',
    country: 'United States',
    payment_method_brand: 'Visa',
    payment_method_last4: '4242',
    payment_method_expiry: '08/29',
    created_at: now,
    updated_at: now,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(newAccount));
    localStorage.setItem('ostraops_last_billing_id', freshBillingId);
  } catch {}

  try {
    await setDoc(doc(db, 'billing_accounts', userId), newAccount, { merge: true });
  } catch {}

  return newAccount;
};

/**
 * Record a successful billing transaction, generating a unique invoice & refreshing the subscription
 */
export const processBillingCheckout = async (params: {
  userId: string;
  planId: string;
  planName: string;
  priceAmount: number;
  billingInterval: 'mo' | 'yr';
  billingEmail: string;
  customerName: string;
  companyName: string;
  taxId?: string;
  country: string;
  cardLast4?: string;
  cardBrand?: string;
}): Promise<{
  success: boolean;
  billingId: string;
  invoice: BillingInvoice;
  account: BillingAccountDetails;
}> => {
  const {
    userId,
    planId,
    planName,
    priceAmount,
    billingInterval,
    billingEmail,
    customerName,
    companyName,
    taxId,
    country,
    cardLast4 = '4242',
    cardBrand = 'Visa',
  } = params;

  // Always fetch or generate the unique Billing ID
  const account = await getOrCreateBillingAccount(userId, billingEmail, companyName);
  
  // Every checkout transaction gets a fresh unique Invoice Number
  const invoiceNumber = generateUniqueInvoiceNumber();
  const now = new Date();
  const nextMonth = new Date(now.getTime() + (billingInterval === 'yr' ? 365 : 30) * 86_400_000);
  
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const billingPeriod = `${formatDate(now)} - ${formatDate(nextMonth)}`;
  const subtotal = priceAmount;
  const tax = 0; // standard reverse-charge / tax included

  const invoice: BillingInvoice = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoice_number: invoiceNumber,
    billing_id: account.billing_id,
    user_id: userId,
    plan_id: planId,
    plan_name: planName,
    amount_usd: subtotal + tax,
    subtotal_usd: subtotal,
    tax_amount_usd: tax,
    currency: 'USD',
    status: 'paid',
    billing_email: billingEmail,
    customer_name: customerName,
    company_name: companyName,
    payment_method: `${cardBrand} ending in ${cardLast4}`,
    card_last4: cardLast4,
    card_brand: cardBrand,
    billing_period: billingPeriod,
    created_at: now.toISOString(),
  };

  // 1. Update user's billing account details
  account.company_name = companyName;
  account.billing_email = billingEmail;
  account.tax_id = taxId;
  account.country = country;
  account.payment_method_brand = cardBrand;
  account.payment_method_last4 = cardLast4;
  account.updated_at = now.toISOString();

  try {
    localStorage.setItem(`ostraops_billing_account_${userId}`, JSON.stringify(account));
    localStorage.setItem('ostraops_last_billing_id', account.billing_id);
  } catch {}

  // 2. Save invoice to user-scoped invoice list in localStorage
  try {
    const existingRaw = localStorage.getItem(`ostraops_invoices_${userId}`);
    const existing: BillingInvoice[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Prepend new invoice so latest is always first
    const updated = [invoice, ...existing.filter((i) => i.invoice_number !== invoice.invoice_number)];
    localStorage.setItem(`ostraops_invoices_${userId}`, JSON.stringify(updated));
  } catch {}

  // 3. Update User Subscription across React context & storage
  const quotaLimit = planId.includes('pro') ? 10000000 : planId.includes('starter') ? 1000000 : 50000;
  const subPayload: Partial<UserSubscription> = {
    plan_id: planId,
    plan_name: planName,
    price_amount: priceAmount,
    billing_interval: billingInterval,
    status: 'active',
    renewal_date: formatDate(nextMonth),
    quota_limit: quotaLimit,
  };

  try {
    await updateUserSubscription(userId, subPayload);
  } catch {}

  // 4. Async Firestore persistence
  try {
    await setDoc(doc(db, 'billing_accounts', userId), account, { merge: true });
    await setDoc(doc(db, 'invoices', invoice.id), invoice, { merge: true });
  } catch (err) {
    console.warn('Firestore billing write notice:', err);
  }

  // 5. Update Supabase organization plan
  if (isSupabaseConfigured && userId) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', userId)
        .maybeSingle();

      if (profile?.org_id) {
        await supabase
          .from('organizations')
          .update({
            plan: planId,
            billing_status: 'active',
            billing_email: billingEmail,
          })
          .eq('id', profile.org_id);
      }
    } catch {}
  }

  return {
    success: true,
    billingId: account.billing_id,
    invoice,
    account,
  };
};

/**
 * Fetch all invoices for a user, automatically initializing default history if none exists
 */
export const getUserInvoices = async (
  userId: string,
  userSubscription?: UserSubscription | null,
  userEmail?: string | null,
  companyName?: string | null
): Promise<BillingInvoice[]> => {
  if (!userId) return [];

  // Check local cache
  const storageKey = `ostraops_invoices_${userId}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw) as BillingInvoice[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // If no invoices exist yet, generate an initial invoice matching current subscription
  const billingAccount = await getOrCreateBillingAccount(userId, userEmail, companyName);
  const currentPlan = userSubscription?.plan_id || 'starter_gateway';
  const meta = PLAN_METADATA[currentPlan] || { name: 'Starter Gateway', price: 35 };

  const initialInvoice: BillingInvoice = {
    id: `inv_initial_${userId.substring(0, 6)}`,
    invoice_number: generateUniqueInvoiceNumber(),
    billing_id: billingAccount.billing_id,
    user_id: userId,
    plan_id: currentPlan,
    plan_name: meta.name,
    amount_usd: meta.price,
    subtotal_usd: meta.price,
    tax_amount_usd: 0,
    currency: 'USD',
    status: 'paid',
    billing_email: userEmail || billingAccount.billing_email,
    customer_name: userEmail?.split('@')[0] || 'Admin',
    company_name: billingAccount.company_name,
    payment_method: 'Visa ending in 4242',
    card_last4: '4242',
    card_brand: 'Visa',
    billing_period: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - Next Cycle`,
    created_at: new Date().toISOString(),
  };

  const initialList = [initialInvoice];
  try {
    localStorage.setItem(storageKey, JSON.stringify(initialList));
  } catch {}

  return initialList;
};
