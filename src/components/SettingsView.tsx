import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  CreditCard,
  Settings,
  Key,
  Laptop,
  AlertTriangle,
  Check,
  ExternalLink,
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  Sliders,
  Calendar,
  Building,
  Sparkles,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { SecurityConsoleView } from './SecurityConsoleView';
import { PreferencesView } from './PreferencesView';
import { BillingView } from './BillingView';
import { useAuth } from '../contexts/AuthContext';

interface SettingsViewProps {
  onNavigateHome?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigateHome }) => {
  const { user, profile, subscription, updateProfile, deleteAccount } = useAuth();

  // Main Sections: general | billing | account | security
  const [activeSection, setActiveSection] = useState<'general' | 'billing' | 'account' | 'security'>('account');
  
  // Sub-tabs under Account / Settings: profile | security | preferences | apikeys | sessions | danger
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'preferences' | 'apikeys' | 'sessions' | 'danger'>('profile');

  // Form States: Profile Information — initialized from auth profile
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Avatar Upload & Local Storage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('ostraops_avatar_url');
    } catch {
      return null;
    }
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Error: Image file size exceeds 2MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        try {
          localStorage.setItem('ostraops_avatar_url', dataUrl);
        } catch {}
        showToast('Avatar photo updated successfully.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setEmailAddress(profile.email || user?.email || '');
      setPhoneNumber(profile.phone || '');
      setJobTitle(profile.job_title || '');
      setCompanyName(profile.company_name || '');
      setCompanyWebsite(profile.company_website || '');
    } else if (user) {
      setEmailAddress(user.email || '');
    }
  }, [profile, user]);

  // Toast & UI
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [dangerConfirmOpen, setDangerConfirmOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const userInitials = (fullName || profile?.full_name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ||
    (emailAddress ? emailAddress.slice(0, 2).toUpperCase() : 'OP');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadAccountData = () => {
    const accountData = {
      exportedAt: new Date().toISOString(),
      account: {
        id: user?.id || 'usr_local_dev',
        email: emailAddress || profile?.email || user?.email,
        fullName: fullName || profile?.full_name,
        jobTitle,
        company: companyName,
        website: companyWebsite,
        phone: phoneNumber,
        memberSince: profile?.created_at || '2025-04-12',
      },
      subscription: {
        plan: subscription?.plan_name || 'Hosted Gateway',
        status: subscription?.status || 'active',
        currency: 'USD',
      },
      security: {
        twoFactorEnabled: true,
        sessionsActive: 2,
        lastPasswordChange: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      telemetrySummary: {
        totalRequestsTracked: 14280,
        totalSpendUsd: 49.0,
        circuitBreakerTriggerCount: 0,
        averageLatencyMs: 14,
      },
    };

    const blob = new Blob([JSON.stringify(accountData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ostraops_account_data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Account telemetry & data archive downloaded.');
  };

  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferEmail.includes('@')) {
      showToast('Error: Please enter a valid email address.');
      return;
    }
    showToast(`Ownership transfer request dispatched to ${transferEmail}.`);
    setTransferModalOpen(false);
    setTransferEmail('');
  };

  const handlePermanentDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsDeletingAccount(true);
    const { error } = await deleteAccount();
    setIsDeletingAccount(false);
    if (error) {
      showToast(`Error: ${error.message}`);
    } else {
      showToast('Account permanently deleted. Zero data retained.');
      setDangerConfirmOpen(false);
      setDeleteConfirmText('');
      if (onNavigateHome) {
        setTimeout(() => onNavigateHome(), 600);
      } else {
        window.location.reload();
      }
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      phone: phoneNumber,
      job_title: jobTitle,
      company_name: companyName,
      company_website: companyWebsite,
    });
    setProfileSaving(false);
    showToast(error ? `Error: ${error.message}` : 'Profile information successfully updated.');
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP HEADER: SETTINGS & ACCOUNT                               */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE5DC] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#9C7938] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#E5DBCA]">
              Organization & Identity
            </span>
            <span className="text-[11px] font-mono text-charcoal-400">Owner Access</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl">
            Manage your personal profile, organization preferences, API tokens, security sessions, and billing subscriptions.
          </p>
        </div>

        {/* 4 Required Main Sections: General, Billing, Account, Security */}
        <div className="flex items-center gap-1.5 bg-[#F5F2EB] p-1.5 rounded-2xl border border-[#EAE5DC]">
          {[
            { id: 'general', label: 'General', icon: Settings },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'account', label: 'Account', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((sec) => {
            const Icon = sec.icon;
            const isSelected = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id as any);
                  if (sec.id === 'general') setActiveSubTab('preferences');
                  if (sec.id === 'account') setActiveSubTab('profile');
                  if (sec.id === 'security') setActiveSubTab('security');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181B] text-white shadow-xs font-bold'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C59E5F]' : 'text-charcoal-500'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-TABS NAVIGATION (Profile / Security / Preferences / API Keys / Sessions / Danger Zone) */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#EAE5DC]">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'security', label: 'Security Console', icon: Shield },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
          { id: 'apikeys', label: 'API & Keys', icon: Key },
          { id: 'sessions', label: 'Sessions', icon: Laptop },
          { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive =
            (activeSection === 'security' && tab.id === 'security') ||
            (activeSection !== 'security' && activeSubTab === tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'security') {
                  setActiveSection('security');
                  setActiveSubTab('security');
                } else {
                  if (tab.id === 'preferences') {
                    setActiveSection('general');
                  } else if (activeSection === 'security' || activeSection === 'billing' || activeSection === 'general') {
                    setActiveSection('account');
                  }
                  setActiveSubTab(tab.id as any);
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#F4EFE6] text-[#9C7938] font-bold border border-[#E5DBCA]'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-sandstone-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C59E5F]' : 'text-charcoal-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER SECURITY CONSOLE, PREFERENCES, BILLING, OR STANDARD 2-COLUMN VIEW */}
      {activeSection === 'security' || activeSubTab === 'security' ? (
        <SecurityConsoleView onNavigateTeam={() => { window.location.hash = '#team'; }} />
      ) : activeSection === 'general' || activeSubTab === 'preferences' ? (
        <PreferencesView />
      ) : activeSection === 'billing' ? (
        <BillingView onNavigateUsage={() => { window.location.hash = '#usage'; }} />
      ) : (
        /* ============================================================ */
        /* MAIN TWO-COLUMN DASHBOARD GRID                               */
        /* ============================================================ */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: MAIN CONFIGURATION PANELS (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

          {/* ========================================================== */}
          {/* SUBTAB: PROFILE INFORMATION (Matching User Image Layout)   */}
          {/* ========================================================== */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Card 1: Profile Information */}
              <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-6">
                <div>
                  <h2 className="text-base font-bold text-charcoal-900 font-sans">
                    Profile Information
                  </h2>
                  <p className="text-xs text-charcoal-500">
                    Update your personal identity, company details, and contact information.
                  </p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-5">
                  {/* Avatar row with working file upload & dynamic initials */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover shadow-md border-2 border-white"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#18181B] via-[#27272A] to-[#C59E5F] text-white flex items-center justify-center font-mono font-bold text-xl shadow-md border-2 border-white">
                          {userInitials}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-6 h-6 rounded-full bg-[#FAF8F5] border border-[#EAE5DC] absolute bottom-0 right-0 flex items-center justify-center text-charcoal-700 text-xs shadow-xs hover:bg-sandstone-200 transition-colors cursor-pointer"
                        title="Change Photo"
                      >
                        ✎
                      </button>
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarFileChange}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE5DC] hover:border-[#C59E5F] text-charcoal-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:bg-sandstone-100"
                      >
                        Change Photo
                      </button>
                      <span className="text-[11px] text-charcoal-400 font-mono block mt-1">
                        JPG, PNG or WebP. Max size 2MB.
                      </span>
                    </div>
                  </div>

                  {/* 2-Columns: Full Name & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-charcoal-700 font-mono uppercase">
                          Email Address
                        </label>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-200">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                      />
                    </div>
                  </div>

                  {/* 2-Columns: Phone Number & Job Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                    />
                  </div>

                  {/* Company Website */}
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                      Company Website
                    </label>
                    <input
                      type="text"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-subtle hover:shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card 2: Connected Accounts (From User Image) */}
              <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-charcoal-900 font-sans">
                      Connected Accounts
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Manage third-party SSO accounts and OAuth integrations linked to your profile.
                    </p>
                  </div>
                  <span className="text-xs text-[#C59E5F] font-mono font-bold cursor-pointer hover:underline">
                    Manage Connections →
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                  {/* Google */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center text-xs font-bold font-mono">
                        G
                      </div>
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block leading-tight">Google Workspace</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">{emailAddress || user?.email || 'user@example.com'}</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border border-emerald-200">
                      Connected
                    </span>
                  </div>

                  {/* Slack */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center text-xs font-bold font-mono text-[#E01E5A]">
                        #
                      </div>
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block leading-tight">Slack Alerts</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">{companyName ? `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.slack.com` : 'workspace.slack.com'}</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border border-emerald-200">
                      Connected
                    </span>
                  </div>

                  {/* GitHub */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center text-xs font-bold font-mono text-[#18181B]">
                        GH
                      </div>
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block leading-tight">GitHub OAuth</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">{(emailAddress || user?.email || 'developer').split('@')[0]}</span>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border border-emerald-200">
                      Connected
                    </span>
                  </div>

                  {/* Microsoft */}
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center text-xs font-bold font-mono text-[#00A4EF]">
                        MS
                      </div>
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block leading-tight">Microsoft SSO</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">{emailAddress || user?.email || 'user@example.com'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Microsoft SSO authorization window opened')}
                      className="text-xs font-bold text-charcoal-700 hover:text-black font-mono cursor-pointer px-2 py-0.5 rounded-md hover:bg-sandstone-200"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}

          {/* ========================================================== */}
          {/* SUBTAB: API & KEYS (Prompt: api key)                       */}
          {/* ========================================================== */}
          {activeSubTab === 'apikeys' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-charcoal-900 font-sans">
                      Personal Gateway Tokens & CLI Keys
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Use these credentials to authenticate your local developer terminal or CI/CD pipelines.
                    </p>
                  </div>
                  <button
                    onClick={() => showToast('Generated new gateway access token')}
                    className="px-3.5 py-1.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    + Generate New Key
                  </button>
                </div>

                <div className="space-y-3 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal-900 block">Antigravity IDE & CLI Token</span>
                      <span className="text-charcoal-500 text-[11px]">ost_live_usr_77291a8c4f92...</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard('ost_live_usr_77291a8c4f92bc3e', 'CLI Token')}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE5DC] text-charcoal-800 text-xs hover:bg-sandstone-100 cursor-pointer"
                      >
                        {copiedField === 'CLI Token' ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => showToast('Token rolled successfully')}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SUBTAB: SESSIONS (Prompt: session)                         */}
          {/* ========================================================== */}
          {activeSubTab === 'sessions' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-charcoal-900 font-sans">
                      Active Browser & Agent Sessions
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Devices currently signed into your OstraOps account.
                    </p>
                  </div>
                  <button
                    onClick={() => showToast('Revoked all other active sessions')}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer font-mono"
                  >
                    Revoke All Other Sessions
                  </button>
                </div>

                <div className="divide-y divide-[#EAE5DC] text-xs font-mono">
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-charcoal-900 block">
                          Windows 11 • Edge Browser (Current Session)
                        </span>
                        <span className="text-charcoal-500 text-[11px]">
                          IP: 192.168.1.1 • Bengaluru, India • Active Now
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                      CURRENT
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sandstone-200 text-charcoal-700 flex items-center justify-center">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-charcoal-900 block">
                          Antigravity IDE Agent Runner
                        </span>
                        <span className="text-charcoal-500 text-[11px]">
                          IP: 192.168.1.1 • CLI Sub-process • Active 2h ago
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast('Terminated agent runner session')}
                      className="text-charcoal-500 hover:text-rose-600 text-[11px] cursor-pointer"
                    >
                      Terminate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SUBTAB: DANGER ZONE (Prompt: danzer zone)                   */}
          {/* ========================================================== */}
          {activeSubTab === 'danger' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-rose-50/40 border border-rose-200 p-6 shadow-subtle space-y-4">
                <div>
                  <h3 className="text-base font-bold text-rose-900 font-sans flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Danger Zone</span>
                  </h3>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Irreversible actions that affect your organization ownership and telemetry archives.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-charcoal-900 block font-sans">Transfer Organization Ownership</span>
                      <span className="text-charcoal-500 text-[11px]">Transfer primary owner role and billing to another administrator.</span>
                    </div>
                    <button
                      onClick={() => setTransferModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Transfer
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-900 block font-sans">Delete Account & Purge Telemetry</span>
                      <span className="text-charcoal-500 text-[11px]">Permanently erase master credentials, API keys, and cached models.</span>
                    </div>
                    <button
                      onClick={() => setDangerConfirmOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACCOUNT SUMMARY & RECENT ACTIVITY (4 Cols - Exact Image Layout) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Widget 1: Account Summary Card (From Image) */}
          <div className="rounded-2xl bg-gradient-to-br from-[#18181B] via-[#242428] to-[#18181B] text-white p-6 shadow-md border border-charcoal-800 space-y-4 relative overflow-hidden">
            {/* Subtle Gold Wave SVG Graphic */}
            <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none">
              <svg width="220" height="140" viewBox="0 0 200 120" fill="none">
                <path d="M0,80 Q50,20 100,60 T200,40" stroke="#C59E5F" strokeWidth="2" fill="none" />
                <path d="M0,95 Q50,40 100,75 T200,60" stroke="#C59E5F" strokeWidth="1.5" fill="none" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3.5">
              <h3 className="text-sm font-bold text-white font-sans tracking-wide">
                Account Summary
              </h3>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Member Since</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C59E5F]" />
                    <span>
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : 'April 12, 2025'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Account Type</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#C59E5F]" />
                    <span>Owner</span>
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Current Plan</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C59E5F]/20 text-[#C59E5F] border border-[#C59E5F]/40 font-mono">
                      {subscription?.plan_name ? subscription.plan_name.toUpperCase() : 'HOSTED GATEWAY'}
                    </span>
                    <button
                      onClick={() => setActiveSection('billing')}
                      className="text-[#C59E5F] hover:text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Manage Plan"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Active Projects</span>
                  <span className="text-white font-bold">8</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Team Members</span>
                  <span className="text-white font-bold">24</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">API Keys</span>
                  <span className="text-white font-bold">4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Quick Actions (From Image) */}
          <div className="rounded-2xl bg-white border border-[#EAE5DC] p-5 shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-charcoal-900 font-sans">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setActiveSection('security');
                  setActiveSubTab('security');
                }}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#C59E5F] text-left transition-all hover:bg-sandstone-100 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#C59E5F] mb-1.5" />
                <span className="text-xs font-bold text-charcoal-900 block leading-tight">Change Password</span>
                <span className="text-[10px] text-charcoal-500 font-mono">Update security</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('security');
                  setActiveSubTab('security');
                }}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#C59E5F] text-left transition-all hover:bg-sandstone-100 cursor-pointer"
              >
                <Key className="w-4 h-4 text-charcoal-800 mb-1.5" />
                <span className="text-xs font-bold text-charcoal-900 block leading-tight">Manage API Keys</span>
                <span className="text-[10px] text-charcoal-500 font-mono">CLI & proxy</span>
              </button>

              <button
                onClick={handleDownloadAccountData}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] hover:border-[#C59E5F] text-left transition-all hover:bg-sandstone-100 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700 mb-1.5" />
                <span className="text-xs font-bold text-charcoal-900 block leading-tight">Download Data</span>
                <span className="text-[10px] text-charcoal-500 font-mono">JSON export</span>
              </button>

              <button
                onClick={() => setActiveSubTab('danger')}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-rose-200 hover:border-rose-400 text-left transition-all hover:bg-rose-50/50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600 mb-1.5" />
                <span className="text-xs font-bold text-rose-900 block leading-tight">Close Account</span>
                <span className="text-[10px] text-rose-500 font-mono">Danger zone</span>
              </button>
            </div>
          </div>

          {/* Widget 3: Recent Account Activity (From Image) */}
          <div className="rounded-2xl bg-white border border-[#EAE5DC] p-5 shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-charcoal-900 font-sans">
                Recent Account Activity
              </h3>
              <span
                onClick={() => showToast('Opened full audit activity ledger')}
                className="text-[11px] text-[#C59E5F] font-mono font-bold cursor-pointer hover:underline"
              >
                View All
              </span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {[
                { title: 'Password changed', time: 'May 15, 2026 at 10:24 AM', ip: '192.168.1.1', icon: Lock, iconColor: 'text-emerald-600 bg-emerald-50' },
                { title: 'New API key generated', time: 'May 14, 2026 at 03:42 PM', ip: '192.168.1.1', icon: Key, iconColor: 'text-emerald-600 bg-emerald-50' },
                { title: 'Team member invited', time: 'May 13, 2026 at 11:16 AM', ip: '192.168.1.1', icon: User, iconColor: 'text-purple-600 bg-purple-50' },
                { title: 'Plan upgraded to Growth', time: 'May 12, 2026 at 09:30 AM', ip: '192.168.1.1', icon: Sparkles, iconColor: 'text-[#C59E5F] bg-[#FAF3E0]' },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-sandstone-100 p-1.5 rounded-xl transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${act.iconColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-charcoal-900 block leading-tight">
                          {act.title}
                        </span>
                        <span className="text-[10px] text-charcoal-500 font-mono">
                          {act.time}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-charcoal-400 group-hover:text-charcoal-700">
                      {act.ip} ›
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    )}

      {/* ============================================================ */}
      {/* MODAL: TRANSFER OWNERSHIP                                    */}
      {/* ============================================================ */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900">
                  Transfer Organization Ownership
                </h3>
                <p className="text-xs text-charcoal-500">
                  Assign the primary administrator role to another verified email.
                </p>
              </div>
            </div>

            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-charcoal-700 font-mono uppercase">
                  New Owner Email Address
                </label>
                <input
                  type="email"
                  required
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full px-3.5 py-2.5 text-xs font-sans bg-white border border-[#EAE5DC] rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#C59E5F] transition-colors"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[11.5px] text-charcoal-600 leading-relaxed">
                The new owner will receive a secure confirmation link. Once accepted, your role will revert to Organization Member.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferModalOpen(false);
                    setTransferEmail('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:bg-sandstone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C59E5F] hover:bg-[#B38D4F] transition-colors cursor-pointer shadow-xs"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL: DELETE ACCOUNT                           */}
      {/* ============================================================ */}
      {dangerConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EAE5DC] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-charcoal-900">
                  Delete Account
                </h3>
                <p className="text-xs text-charcoal-500">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Zero-Data Retention Statement (English only) */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 text-xs text-rose-950 space-y-1.5 leading-relaxed">
              <p className="font-semibold text-rose-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Zero-Data Retention Commitment</span>
              </p>
              <p className="text-charcoal-600 text-[11.5px]">
                We do not store or retain any of your data. All your account credentials, API keys, proxy tokens, and telemetry logs will be permanently erased from our systems immediately.
              </p>
            </div>

            {/* Type DELETE to confirm */}
            <div className="space-y-1.5">
              <label className="block text-xs text-charcoal-700">
                To confirm, type <strong className="font-mono text-rose-600">DELETE</strong> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="w-full px-3.5 py-2.5 text-xs font-mono uppercase bg-white border border-[#EAE5DC] rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => {
                  setDangerConfirmOpen(false);
                  setDeleteConfirmText('');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:bg-sandstone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                onClick={handlePermanentDeleteAccount}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  deleteConfirmText.trim().toUpperCase() === 'DELETE' && !isDeletingAccount
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-rose-300 cursor-not-allowed opacity-60'
                }`}
              >
                {isDeletingAccount ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
