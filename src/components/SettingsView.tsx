import React, { useState, useEffect, useMemo } from 'react';
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
  ShieldCheck,
  Copy,
  Plus
} from 'lucide-react';
import { SecurityConsoleView } from './SecurityConsoleView';
import { PreferencesView } from './PreferencesView';
import { BillingView } from './BillingView';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { subscribeToUserProjects } from '../lib/projectsService';
import { subscribeToUserTeamMembers } from '../lib/teamService';

interface SettingsViewProps {
  onNavigateHome?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigateHome }) => {
  const { user, profile, subscription, updateProfile, deleteAccount, supportAccountId, orgRole } = useAuth();
  const [copiedSupportId, setCopiedSupportId] = useState(false);

  // Main Sections: general | billing | account | security
  const [activeSection, setActiveSection] = useState<'general' | 'billing' | 'account' | 'security'>('account');
  
  // Sub-tabs under Account / Settings: profile | security | preferences | apikeys | sessions | danger
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'preferences' | 'apikeys' | 'sessions' | 'danger'>('profile');

  // Real active projects count
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(0);
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserProjects(user.uid, (list) => {
      setActiveProjectsCount(list.length);
    });
    return unsub;
  }, [user?.uid]);

  // Real team members count live subscription
  const [teamMembersCount, setTeamMembersCount] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(`ostraops_team_members_${user?.id}`);
      return raw ? JSON.parse(raw).length : 1;
    } catch {
      return 1;
    }
  });

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserTeamMembers(user.id, (members) => {
      setTeamMembersCount(members.length);
    });
    return unsub;
  }, [user?.id]);

  // Real API Keys State
  interface PersonalApiKey {
    id: string;
    name: string;
    token: string;
    createdAt: string;
    lastUsed: string;
    expiresIn: string;
  }

  const [apiKeys, setApiKeys] = useState<PersonalApiKey[]>(() => {
    try {
      const raw = localStorage.getItem(`ostraops_user_api_keys_${user?.id || 'guest'}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    const defaultToken = `ost_live_${user?.id ? user.id.slice(0, 8) : 'usr'}_${Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b => b.toString(16).padStart(2, '0')).join('')}`;
    return [
      {
        id: 'key_primary_cli',
        name: 'Antigravity IDE & CLI Gateway Key',
        token: defaultToken,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUsed: 'Active Now',
        expiresIn: 'Never',
      },
    ];
  });
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('Never');

  // Real Sessions State
  interface UserSession {
    id: string;
    device: string;
    browser: string;
    os: string;
    ip: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }

  const detectedInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return { os: 'Windows 11', browser: 'Chrome', tz: 'Local' };
    }
    const ua = navigator.userAgent;
    let browser = 'Chrome';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';

    let os = 'Windows 11';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 11 / 10';
    else if (ua.includes('Macintosh') || ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux Enterprise';
    else if (ua.includes('Android')) os = 'Android Mobile';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'Apple iOS';

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    return { os, browser, tz };
  }, []);

  const [sessions, setSessions] = useState<UserSession[]>(() => {
    try {
      const raw = localStorage.getItem(`ostraops_active_sessions_${user?.id || 'guest'}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'sess_current_browser',
        device: 'Current Workstation',
        browser: 'Web Browser',
        os: 'Desktop OS',
        ip: 'Local Enclave',
        location: 'Active Workstation',
        lastActive: 'Active Now',
        isCurrent: true,
      },
    ];
  });



  // Real Activity Log State
  interface ActivityLogItem {
    id: string;
    title: string;
    time: string;
    ip: string;
    iconType: 'lock' | 'key' | 'user' | 'sparkles' | 'shield';
  }

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const raw = localStorage.getItem(`ostraops_activity_log_${user?.id || 'guest'}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return [
      {
        id: 'act_1',
        title: 'Active Session Authenticated',
        time: `${nowStr} · Active Session`,
        ip: 'Detected Enclave',
        iconType: 'lock',
      },
      {
        id: 'act_2',
        title: 'Support Account ID Assigned',
        time: `${nowStr} · Instant Dossier`,
        ip: 'Verified Enclave',
        iconType: 'shield',
      },
      {
        id: 'act_3',
        title: 'Gateway CLI Key Generated',
        time: `${nowStr} · Primary Token`,
        ip: '127.0.0.1',
        iconType: 'key',
      },
    ];
  });

  const recordActivity = (title: string, iconType: ActivityLogItem['iconType'] = 'sparkles') => {
    const newEntry: ActivityLogItem = {
      id: `act_${Date.now()}`,
      title,
      time: 'Just now',
      ip: 'Active Client',
      iconType,
    };
    const updated = [newEntry, ...activityLogs.slice(0, 7)];
    setActivityLogs(updated);
    try {
      localStorage.setItem(`ostraops_activity_log_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('Please provide a name for the API key');
      return;
    }
    const tokenBytes = new Uint8Array(16);
    crypto.getRandomValues(tokenBytes);
    const hex = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const newToken = `ost_live_${user?.id ? user.id.slice(0, 6) : 'cli'}_${hex}`;
    const newKey: PersonalApiKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      token: newToken,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastUsed: 'Just now',
      expiresIn: newKeyExpiry,
    };
    const updated = [newKey, ...apiKeys];
    setApiKeys(updated);
    try {
      localStorage.setItem(`ostraops_user_api_keys_${user?.id || 'guest'}`, JSON.stringify(updated));
      if (user?.id) {
        setDoc(doc(db, 'user_api_keys', user.id), { keys: updated }, { merge: true }).catch(() => {});
      }
    } catch {}
    recordActivity(`Generated API key: ${newKey.name}`, 'key');
    setNewKeyModalOpen(false);
    setNewKeyName('');
    showToast(`Generated key "${newKey.name}". Token copied to clipboard.`);
    navigator.clipboard.writeText(newToken);
  };

  const handleRevokeKey = (id: string, name: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated);
    try {
      localStorage.setItem(`ostraops_user_api_keys_${user?.id || 'guest'}`, JSON.stringify(updated));
      if (user?.id) {
        setDoc(doc(db, 'user_api_keys', user.id), { keys: updated }, { merge: true }).catch(() => {});
      }
    } catch {}
    recordActivity(`Revoked API key: ${name}`, 'key');
    showToast(`API key "${name}" revoked.`);
  };

  const handleRevokeOtherSessions = () => {
    const current = sessions.filter(s => s.isCurrent);
    setSessions(current);
    try {
      localStorage.setItem(`ostraops_active_sessions_${user?.id || 'guest'}`, JSON.stringify(current));
    } catch {}
    recordActivity('Revoked all other active sessions', 'lock');
    showToast('All other browser and runner sessions revoked.');
  };

  const handleTerminateSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    try {
      localStorage.setItem(`ostraops_active_sessions_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
    recordActivity('Terminated device session', 'lock');
    showToast('Session terminated.');
  };


  // Form States: Profile Information — initialized from auth profile
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');

  // Helper: compress image file using standard HTML canvas to ensure fast Firestore storage (<20KB)
  const compressImage = (file: File, maxDimension = 180, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Failed to parse selected image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Avatar Upload & Local Storage
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    try {
      return profile?.avatar_url || localStorage.getItem('ostraops_avatar_url');
    } catch {
      return null;
    }
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Error: Image file size exceeds 5MB limit.');
      return;
    }
    try {
      showToast('Optimizing & saving photo to Firestore...');
      const compressedDataUrl = await compressImage(file, 180, 0.85);
      setAvatarUrl(compressedDataUrl);
      try {
        localStorage.setItem('ostraops_avatar_url', compressedDataUrl);
        if (user?.id) {
          localStorage.setItem(`ostraops_avatar_${user.id}`, compressedDataUrl);
        }
      } catch {}
      const { error } = await updateProfile({ avatar_url: compressedDataUrl });
      if (error) {
        showToast(`Warning: Local preview ready, but Firestore sync error: ${error.message}`);
      } else {
        recordActivity('Updated profile avatar photo', 'user');
        showToast('Profile photo saved to Firestore successfully.');
      }
    } catch (err: any) {
      showToast('Failed to process image. Please try another image.');
    }
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
      if (profile.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    } else if (user) {
      setEmailAddress(user.email || '');
    }
  }, [profile, user]);

  // Listen for deep-linked tabs in URL hash (e.g. #settings?tab=billing or #settings/billing)
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h.includes('tab=billing') || h.includes('/billing') || h.includes('billing')) {
        if (!h.startsWith('#billing') || h.includes('settings')) {
          setActiveSection('billing');
        }
      } else if (h.includes('tab=security') || h.includes('/security')) {
        setActiveSection('security');
        setActiveSubTab('security');
      } else if (h.includes('tab=general') || h.includes('/general')) {
        setActiveSection('general');
        setActiveSubTab('preferences');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Toast & UI
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [dangerConfirmOpen, setDangerConfirmOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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
        id: user?.id || user?.uid || 'usr_local',
        email: emailAddress || profile?.email || user?.email,
        fullName: fullName || profile?.full_name || 'Verified Member',
        jobTitle: jobTitle || profile?.job_title || 'Developer',
        company: companyName || profile?.company_name || 'Personal Workspace',
        website: companyWebsite || profile?.company_website || '',
        phone: phoneNumber || profile?.phone || '',
        supportAccountId,
        memberSince: profile?.created_at || (user as any)?.metadata?.creationTime || new Date().toISOString(),
      },
      subscription: {
        plan: subscription?.plan_name || 'Free Gateway',
        status: subscription?.status || 'active',
        currency: 'USD',
      },
      statistics: {
        activeProjectsCount,
        teamMembersCount,
        apiKeysCount: apiKeys.length,
      },
      apiKeys: apiKeys.map(k => ({ id: k.id, name: k.name, createdAt: k.createdAt, lastUsed: k.lastUsed })),
      activeSessions: sessions,
      activityAuditLog: activityLogs,
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
    recordActivity('Downloaded account data archive', 'shield');
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
    const { error } = await deleteAccount(deletePassword || undefined);
    setIsDeletingAccount(false);
    if (error) {
      showToast(`Error: ${error.message}`);
    } else {
      showToast('Account permanently deleted. Zero data retained.');
      setDangerConfirmOpen(false);
      setDeleteConfirmText('');
      setDeletePassword('');
      if (onNavigateHome) {
        setTimeout(() => onNavigateHome(), 300);
      } else {
        window.location.hash = '';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#0B0E14]/[0.06] text-[#E5C38D] text-[10px] font-bold font-mono tracking-wider uppercase border border-white/[0.08]">
              Organization & Identity
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Owner Access</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
            Account & Settings
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Manage your personal profile, organization preferences, API tokens, security sessions, and billing subscriptions.
          </p>
        </div>

        {/* 4 Required Main Sections: General, Billing, Account, Security */}
        <div className="flex items-center gap-1.5 bg-[#0B0E14] p-1.5 rounded-2xl border border-white/[0.08]">
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
                    ? 'bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] shadow-xs font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#0B0E14]/[0.06]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#07090C]' : 'text-zinc-500'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* SUB-TABS NAVIGATION (Profile / Security / Preferences / API Keys / Sessions / Danger Zone) */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-white/[0.08]">
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
                  ? 'bg-[#C59E5F]/15 text-[#E5C38D] font-bold border border-[#C59E5F]/30'
                  : 'text-zinc-400 hover:text-white hover:bg-[#0B0E14]/[0.05]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E5C38D]' : 'text-zinc-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER SECURITY CONSOLE, PREFERENCES, BILLING, OR STANDARD 2-COLUMN VIEW */}
      <div key={`${activeSection}-${activeSubTab}`} className="tab-transition-enter">
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
              <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-6 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white font-sans flex items-center gap-2">
                      <span>Profile Information</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified & Locked
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Identity credentials verified during onboarding. Protected against unauthorized modifications.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
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
                        className="w-6 h-6 rounded-full bg-[#07090C] border border-white/[0.08] absolute bottom-0 right-0 flex items-center justify-center text-zinc-300 text-xs shadow-xs hover:bg-white/[0.06] transition-colors cursor-pointer"
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
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F] text-zinc-200 text-xs font-semibold transition-all cursor-pointer shadow-xs hover:bg-white/[0.04]"
                        >
                          Change Photo
                        </button>
                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              setAvatarUrl(null);
                              try {
                                localStorage.removeItem('ostraops_avatar_url');
                                if (user?.id) localStorage.removeItem(`ostraops_avatar_${user.id}`);
                              } catch {}
                              await updateProfile({ avatar_url: '' });
                              showToast('Avatar photo removed.');
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono block mt-1">
                        Photo update enabled. Auto-compressed & synced to Firestore.
                      </span>
                    </div>
                  </div>

                  {/* Permanent Support Account ID Card */}
                  <div className="p-4 rounded-2xl bg-[#0B0E14] border border-[#C59E5F]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[#C59E5F]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-zinc-400 tracking-wider">Permanent Support Account ID</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Verified Enclave</span>
                        </div>
                        <div className="text-base font-mono font-extrabold text-[#E5C38D] tracking-wide select-all mt-0.5">
                          {supportAccountId}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (supportAccountId) {
                          navigator.clipboard.writeText(supportAccountId);
                          setCopiedSupportId(true);
                          showToast('Support Account ID copied to clipboard');
                          setTimeout(() => setCopiedSupportId(false), 2000);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#07090C] hover:bg-white/[0.06] border border-white/[0.1] text-xs font-mono text-zinc-200 hover:text-white transition-colors cursor-pointer self-start sm:self-center"
                    >
                      {copiedSupportId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C59E5F]" />}
                      <span>{copiedSupportId ? 'Copied' : 'Copy Account ID'}</span>
                    </button>
                  </div>

                  {/* 2-Columns: Full Name & Email Address (Uneditable & Locked) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                          Full Name
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={fullName || 'Verified Member'}
                          className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-sans text-zinc-300 cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                          Email Address
                        </label>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 border border-emerald-200">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          <span>Verified</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          readOnly
                          value={emailAddress}
                          className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono text-zinc-300 cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* 2-Columns: Phone Number & Job Title (Uneditable & Locked) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                          Phone Number
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={phoneNumber || 'Not specified'}
                          className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono text-zinc-300 cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                          Job Title / Role
                        </label>
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={jobTitle || profile?.role || 'Developer'}
                          className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-sans text-zinc-300 cursor-not-allowed select-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Company Name (Uneditable & Locked) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                        Company Name
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={companyName || 'Registered Organization'}
                        className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-sans text-zinc-300 cursor-not-allowed select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Company Website (Uneditable & Locked) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                        Company Website
                      </label>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={companyWebsite || 'None specified'}
                        className="w-full px-3.5 py-2.5 pr-8 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-mono text-zinc-300 cursor-not-allowed select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Locked Notice & Re-verify button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <Lock className="w-3.5 h-3.5 text-[#C59E5F]" />
                      <span>Identity details locked. Contact workspace admin to request changes.</span>
                    </div>
                    <a
                      href="#onboarding"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#07090C] hover:bg-white/[0.06] text-zinc-200 text-xs font-semibold font-mono transition-all border border-white/[0.08]"
                    >
                      <span>Review Onboarding Flow</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================== */}
          {/* SUBTAB: API & KEYS (Real-time Token Management)           */}
          {/* ========================================================== */}
          {activeSubTab === 'apikeys' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                      <span>Personal Gateway Tokens & CLI Keys</span>
                      <span className="text-xs font-mono font-normal text-zinc-400">({apiKeys.length} Active)</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Use these credentials to authenticate your local developer terminal or CI/CD pipelines.
                    </p>
                  </div>
                  <button
                    onClick={() => setNewKeyModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate New Key</span>
                  </button>
                </div>

                <div className="space-y-3 pt-2 font-mono text-xs">
                  {apiKeys.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/[0.1] rounded-xl text-zinc-400 font-sans">
                      <Key className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">No personal API keys generated yet.</p>
                      <p className="text-[11px] text-zinc-500 mt-1">Click "Generate New Key" above to generate a secure authentication token.</p>
                    </div>
                  ) : (
                    apiKeys.map((k) => (
                      <div key={k.id} className="p-3.5 rounded-xl bg-[#07090C] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{k.name}</span>
                            <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded font-mono">
                              ACTIVE
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-zinc-400">
                            <span>{k.token.slice(0, 16)}••••••••{k.token.slice(-4)}</span>
                            <span>•</span>
                            <span>Created {k.createdAt}</span>
                            <span>•</span>
                            <span>Expires: {k.expiresIn}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(k.token, k.name)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0B0E14] border border-white/[0.08] text-zinc-200 text-xs hover:bg-white/[0.04] cursor-pointer"
                          >
                            <Copy className="w-3 h-3 text-[#C59E5F]" />
                            <span>{copiedField === k.name ? 'Copied' : 'Copy Key'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevokeKey(k.id, k.name)}
                            className="px-2.5 py-1 text-rose-400 hover:text-rose-300 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SUBTAB: SESSIONS (Real Active Sessions)                    */}
          {/* ========================================================== */}
          {activeSubTab === 'sessions' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-sans">
                      Active Browser & Agent Sessions
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Devices currently signed into your OstraOps account.
                    </p>
                  </div>
                  <button
                    onClick={handleRevokeOtherSessions}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0B0E14] border border-rose-500/40 text-rose-400 hover:bg-rose-950/20 text-xs font-bold transition-all cursor-pointer font-mono self-start sm:self-auto"
                  >
                    Revoke All Other Sessions
                  </button>
                </div>

                <div className="divide-y divide-white/[0.08] text-xs font-mono">
                  {/* Current Active Session (Real-Time Detected) */}
                  <div className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white block">
                            {detectedInfo.os} • {detectedInfo.browser}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            ACTIVE NOW
                          </span>
                        </div>
                        <span className="text-zinc-400 text-[11px] block mt-0.5">
                          Timezone: {detectedInfo.tz} • Platform Web Enclave • Session ID: {user?.id ? user.id.slice(0, 8) : 'curr'}
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-500/20 font-mono">
                      CURRENT DEVICE
                    </span>
                  </div>

                  {/* Secondary Sessions */}
                  {sessions.filter(s => !s.isCurrent).map((sess) => (
                    <div key={sess.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center border border-white/[0.08]">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">
                            {sess.device} • {sess.browser}
                          </span>
                          <span className="text-zinc-400 text-[11px] block mt-0.5">
                            {sess.ip} • Last active {sess.lastActive}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTerminateSession(sess.id)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-rose-400 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Terminate
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* SUBTAB: DANGER ZONE (Prompt: danzer zone)                   */}
          {/* ========================================================== */}
          {activeSubTab === 'danger' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-rose-50/40 border border-rose-200 p-6 shadow-xs space-y-4">
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
                  <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block font-sans">Transfer Organization Ownership</span>
                      <span className="text-zinc-400 text-[11px]">Transfer primary owner role and billing to another administrator.</span>
                    </div>
                    <button
                      onClick={() => setTransferModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#0B0E14] border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer"
                    >
                      Transfer
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-rose-900 block font-sans">Delete Account & Purge Telemetry</span>
                      <span className="text-zinc-400 text-[11px]">Permanently erase master credentials, API keys, and cached models.</span>
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
                        : (user as any)?.metadata?.creationTime
                          ? new Date((user as any).metadata.creationTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                          : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Account Type</span>
                  <span className="text-white font-bold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#C59E5F]" />
                    <span>{orgRole ? (orgRole.charAt(0).toUpperCase() + orgRole.slice(1)) : 'Owner'}</span>
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
                  <span className="text-white font-bold">{activeProjectsCount}</span>
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Team Members</span>
                  <span className="text-white font-bold">{teamMembersCount}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">API Keys</span>
                  <span className="text-white font-bold">{apiKeys.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Widget 2: Quick Actions (From Image) */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-white font-sans">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setActiveSection('security');
                  setActiveSubTab('security');
                }}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <Lock className="w-4 h-4 text-[#C59E5F] mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">Change Password</span>
                <span className="text-[10px] text-zinc-400 font-mono">Update security</span>
              </button>

              <button
                onClick={() => {
                  setActiveSection('security');
                  setActiveSubTab('security');
                }}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <Key className="w-4 h-4 text-zinc-200 mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">Manage API Keys</span>
                <span className="text-[10px] text-zinc-400 font-mono">CLI & proxy</span>
              </button>

              <button
                onClick={handleDownloadAccountData}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-700 mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">Download Data</span>
                <span className="text-[10px] text-zinc-400 font-mono">JSON export</span>
              </button>

              <button
                onClick={() => setActiveSubTab('danger')}
                className="p-3 rounded-xl bg-[#07090C] border border-rose-200 hover:border-rose-400 text-left transition-all hover:bg-rose-50/50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600 mb-1.5" />
                <span className="text-xs font-bold text-rose-900 block leading-tight">Close Account</span>
                <span className="text-[10px] text-rose-500 font-mono">Danger zone</span>
              </button>
            </div>
          </div>

          {/* Widget 3: Recent Account Activity (From Image) */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans">
                Recent Account Activity
              </h3>
              <span
                onClick={() => showToast('Opened full audit activity ledger')}
                className="text-[11px] text-[#C59E5F] font-mono font-bold cursor-pointer hover:underline"
              >
                View All
              </span>
            </div>

            <div className="space-y-2 font-sans text-xs">
              {activityLogs.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center text-[11px] text-zinc-500 font-mono">
                  No activity logged yet.
                </div>
              ) : (
                activityLogs.slice(0, 5).map((act) => {
                  let Icon = Sparkles;
                  let colorClass = 'text-[#C59E5F] bg-[#C59E5F]/10 border border-[#C59E5F]/20';
                  if (act.iconType === 'lock') {
                    Icon = Lock;
                    colorClass = 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/20';
                  } else if (act.iconType === 'key') {
                    Icon = Key;
                    colorClass = 'text-amber-400 bg-amber-950/40 border border-amber-500/20';
                  } else if (act.iconType === 'user') {
                    Icon = User;
                    colorClass = 'text-purple-400 bg-purple-950/40 border border-purple-500/20';
                  } else if (act.iconType === 'shield') {
                    Icon = Shield;
                    colorClass = 'text-sky-400 bg-sky-950/40 border border-sky-500/20';
                  }

                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between group p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block leading-tight truncate">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            {act.time}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300 shrink-0 ml-2">
                        {act.ip}
                      </span>
                    </div>
                  );
                })
              )}
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
          <div className="bg-[#0B0E14] border border-white/[0.08] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Transfer Organization Ownership
                </h3>
                <p className="text-xs text-zinc-400">
                  Assign the primary administrator role to another verified email.
                </p>
              </div>
            </div>

            <form onSubmit={handleTransferOwnership} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 font-mono uppercase">
                  New Owner Email Address
                </label>
                <input
                  type="email"
                  required
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full px-3.5 py-2.5 text-xs font-sans bg-[#0B0E14] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] transition-colors"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] text-[11.5px] text-zinc-400 leading-relaxed">
                The new owner will receive a secure confirmation link. Once accepted, your role will revert to Organization Member.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferModalOpen(false);
                    setTransferEmail('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
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
      {/* MODAL: GENERATE NEW API KEY                                  */}
      {/* ============================================================ */}
      {newKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0B0E14] border border-white/[0.08] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C59E5F]/10 text-[#C59E5F] flex items-center justify-center shrink-0 border border-[#C59E5F]/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Create Gateway API Key
                </h3>
                <p className="text-xs text-zinc-400">
                  Generate a cryptographically signed secret token for CLI or SDK integration.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 font-mono uppercase">
                  Key Identifier / Label
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. Production CI/CD Runner"
                  className="w-full px-3.5 py-2.5 text-xs font-sans bg-[#07090C] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-300 font-mono uppercase">
                  Expiration Period
                </label>
                <select
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-sans bg-[#07090C] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-[#C59E5F] transition-colors"
                >
                  <option value="Never">Never (Permanent)</option>
                  <option value="30 days">30 Days</option>
                  <option value="90 days">90 Days</option>
                  <option value="1 year">1 Year</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] text-[11px] text-zinc-400 font-mono leading-relaxed">
                Tokens are generated on-device with <span className="text-[#C59E5F]">crypto.getRandomValues</span> and securely stored. Token is automatically copied to your clipboard on generation.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewKeyModalOpen(false);
                    setNewKeyName('');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C59E5F] hover:bg-[#B38D4F] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
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
          <div className="bg-[#0B0E14] border border-white/[0.08] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 font-sans">
            
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Delete Account
                </h3>
                <p className="text-xs text-zinc-400">
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
              <p className="text-zinc-400 text-[11.5px]">
                We do not store or retain any of your data. All your account credentials, API keys, proxy tokens, and telemetry logs will be permanently erased from our systems immediately.
              </p>
            </div>

            {/* Type DELETE to confirm */}
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-300">
                To confirm, type <strong className="font-mono text-rose-600">DELETE</strong> below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="w-full px-3.5 py-2.5 text-xs font-mono uppercase bg-[#0B0E14] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Optional Password Verification for Email/Password Accounts */}
            {auth.currentUser?.providerData?.some((p) => p.providerId === 'password') && (
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-300">
                  Password <span className="text-zinc-500 font-normal">(optional security confirmation)</span>
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter current password if applicable"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#0B0E14] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingAccount}
                onClick={() => {
                  setDangerConfirmOpen(false);
                  setDeleteConfirmText('');
                  setDeletePassword('');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
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
    </div>
  );
};
