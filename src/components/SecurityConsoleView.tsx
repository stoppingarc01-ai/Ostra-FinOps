import React, { useState } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Smartphone,
  Clock,
  Download,
  Trash2,
  Search,
  Users,
  Terminal,
  Network,
  Database,
  Sparkles,
  ChevronRight,
  Info,
  X,
  Code
} from 'lucide-react';

interface SecurityConsoleViewProps {
  onNavigateTeam?: () => void;
}

export const SecurityConsoleView: React.FC<SecurityConsoleViewProps> = ({ onNavigateTeam }) => {
  // Navigation / Filter Tab
  const [securityCategory, setSecurityCategory] = useState<
    'all' | 'auth' | 'sessions' | 'tokens' | 'vault' | 'rbac' | 'audit' | 'webhooks' | 'network' | 'privacy'
  >('all');

  // Interactive Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Authentication State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('8 hours');
  const [requireReAuth, setRequireReAuth] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [require2FAAllMembers, setRequire2FAAllMembers] = useState(true);
  const [backupCodesModalOpen, setBackupCodesModalOpen] = useState(false);

  // Active Sessions State
  const [otherSessions, setOtherSessions] = useState([
    {
      id: 'sess-1',
      device: 'Safari 17.4 · macOS Sonoma',
      location: 'Bengaluru, India',
      ip: '122.170.18.91',
      lastActive: '2 hours ago',
      type: 'desktop'
    },
    {
      id: 'sess-2',
      device: 'Chrome Mobile · Android 14',
      location: 'Mumbai, India',
      ip: '103.21.244.22',
      lastActive: 'Yesterday at 4:15 PM',
      type: 'mobile'
    }
  ]);

  // Virtual Tokens State
  const [virtualTokens, setVirtualTokens] = useState([
    {
      id: 'vt-1',
      name: 'Production Vercel AI SDK Gateway',
      tokenMasked: 'ost_live_9f81a7b••••••••••',
      env: 'Production',
      scope: 'models:infer, telemetry:write, cache:read',
      expiration: 'Never',
      lastUsed: '4 min ago',
      createdBy: 'Shaan (Owner)',
      createdDate: 'Sep 12, 2026'
    },
    {
      id: 'vt-2',
      name: 'Staging Integration Testing Key',
      tokenMasked: 'ost_stg_4c11b0e••••••••••',
      env: 'Staging',
      scope: 'models:infer, projects:read',
      expiration: 'Oct 15, 2026',
      lastUsed: '32 min ago',
      createdBy: 'Dev Lead',
      createdDate: 'Sep 08, 2026'
    },
    {
      id: 'vt-3',
      name: 'Developer CLI & LangChain Agent',
      tokenMasked: 'ost_dev_local_82a••••••••••',
      env: 'Development',
      scope: 'models:infer (60 req/min limit)',
      expiration: '30 days',
      lastUsed: '2 hours ago',
      createdBy: 'Shaan (Owner)',
      createdDate: 'Aug 29, 2026'
    }
  ]);

  // Create Virtual Token Modal
  const [createTokenModalOpen, setCreateTokenModalOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenEnv, setNewTokenEnv] = useState<'Development' | 'Staging' | 'Production'>('Production');
  const [newTokenExpiry, setNewTokenExpiry] = useState('90 days');
  const [createdTokenResult, setCreatedTokenResult] = useState<string | null>(null);

  // Provider Key Vault State
  const [providerVault, setProviderVault] = useState([
    {
      id: 'pv-gemini',
      provider: 'Google Gemini API',
      alias: 'gemini-master-enterprise',
      maskedKey: 'AIzaSy••••••••••••••••••••••••3821',
      models: 'Gemini 3.8 Flash, 3.1 Pro, 2.5 Pro',
      storage: 'Hardware HSM Level 3',
      lastUsed: 'Just now',
      createdBy: 'Shaan (Owner)',
      status: 'Connected',
      latency: '34ms'
    },
    {
      id: 'pv-openai',
      provider: 'OpenAI API',
      alias: 'openai-org-enterprise-vault',
      maskedKey: 'sk-proj-••••••••••••••••••••••••8912',
      models: 'GPT-5.6, GPT-5.5, GPT-5.4',
      storage: 'AES-256-GCM Encrypted',
      lastUsed: '2 min ago',
      createdBy: 'Shaan (Owner)',
      status: 'Connected',
      latency: '41ms'
    },
    {
      id: 'pv-anthropic',
      provider: 'Anthropic API',
      alias: 'anthropic-claude-master',
      maskedKey: 'sk-ant-••••••••••••••••••••••••7741',
      models: 'Claude Opus 4.8, Sonnet 4.6, Haiku 4.5',
      storage: 'AES-256-GCM Encrypted',
      lastUsed: '14 min ago',
      createdBy: 'Admin',
      status: 'Connected',
      latency: '48ms'
    },
    {
      id: 'pv-mistral',
      provider: 'Mistral AI',
      alias: 'mistral-primary-vault',
      maskedKey: 'mis_••••••••••••••••••••••••4902',
      models: 'Mistral Large 3, Mistral Small 4',
      storage: 'AES-256-GCM Encrypted',
      lastUsed: '1 hour ago',
      createdBy: 'Admin',
      status: 'Connected',
      latency: '58ms'
    },
    {
      id: 'pv-groq',
      provider: 'Groq & DeepSeek (Ultra-Speed)',
      alias: 'groq-lpu-cluster-key',
      maskedKey: 'gsk_••••••••••••••••••••••••1108',
      models: 'DeepSeek R1 Distill, Llama 3.3 70B',
      storage: 'AES-256-GCM Encrypted',
      lastUsed: '45 min ago',
      createdBy: 'Shaan (Owner)',
      status: 'Connected',
      latency: '19ms'
    }
  ]);

  // Connect Provider Modal
  const [connectProviderModalOpen, setConnectProviderModalOpen] = useState(false);
  const [newProviderName, setNewProviderName] = useState('OpenAI API');
  const [newProviderKey, setNewProviderKey] = useState('');

  // Webhook Security State
  const [webhookSecretMasked] = useState('whsec_••••••••••••••••••••••••8819');
  const [revealedWebhookSecret, setRevealedWebhookSecret] = useState(false);
  const [signWebhooks, setSignWebhooks] = useState(true);

  // Network Security State
  const [restrictDashboardIP, setRestrictDashboardIP] = useState(false);
  const [restrictApiIP, setRestrictApiIP] = useState(false);
  const [ipAllowlist, setIpAllowlist] = useState([
    { id: 'ip-1', label: 'Acme Mumbai HQ Gateway', cidr: '103.21.244.0/24', addedBy: 'Shaan' },
    { id: 'ip-2', label: 'AWS Production NAT Gateway (us-east-1)', cidr: '52.14.88.120/32', addedBy: 'Admin' },
    { id: 'ip-3', label: 'GCP Kubernetes Cluster Egress', cidr: '35.200.12.80/32', addedBy: 'Admin' }
  ]);
  const [addIpModalOpen, setAddIpModalOpen] = useState(false);
  const [newIpLabel, setNewIpLabel] = useState('');
  const [newIpCidr, setNewIpCidr] = useState('');

  // Data & Privacy State (AI INFRASTRUCTURE CRITICAL)
  const [loggingMode, setLoggingMode] = useState<'full' | 'metadata' | 'disabled'>('metadata');
  const [traceRetention, setTraceRetention] = useState('7 days');
  const [excludeSensitiveHeaders, setExcludeSensitiveHeaders] = useState(true);
  const [redactDetectedSecrets, setRedactDetectedSecrets] = useState(true);
  const [localFirstTelemetry, setLocalFirstTelemetry] = useState(true);

  // Audit Logs State & Filters
  const [auditFilter, setAuditFilter] = useState<'All' | 'Authentication' | 'API' | 'Members' | 'Tokens' | 'Settings'>('All');
  const [auditSearch, setAuditSearch] = useState('');

  const auditEvents = [
    {
      id: 'aud-1',
      category: 'Tokens',
      title: 'Virtual token created',
      detail: 'ost_live_production_v2 generated for Vercel AI SDK',
      actor: 'Shaan (Owner)',
      time: '4 minutes ago',
      ip: '103.21.244.18',
      type: 'token'
    },
    {
      id: 'aud-2',
      category: 'API',
      title: 'Provider key rotated',
      detail: 'OpenAI Master Vault credential rotated',
      actor: 'Admin',
      time: '2 hours ago',
      ip: '103.21.244.18',
      type: 'vault'
    },
    {
      id: 'aud-3',
      category: 'Members',
      title: 'Developer invited',
      detail: 'Arjun Sharma invited with Developer role & $500 ceiling',
      actor: 'Owner',
      time: 'Yesterday at 05:40 PM',
      ip: '103.21.244.18',
      type: 'member'
    },
    {
      id: 'aud-4',
      category: 'Authentication',
      title: 'Failed authentication attempt',
      detail: '3 failed password attempts detected from untrusted origin (Blocked by WAF Rate Limiter)',
      actor: 'System Firewall',
      time: 'Yesterday at 02:11 PM',
      ip: '194.26.29.11',
      type: 'security_alert'
    },
    {
      id: 'aud-5',
      category: 'Settings',
      title: '2FA policy enforced',
      detail: 'Require 2FA for all workspace members enabled',
      actor: 'Shaan (Owner)',
      time: '2 days ago',
      ip: '103.21.244.18',
      type: 'policy'
    },
    {
      id: 'aud-6',
      category: 'API',
      title: 'Webhook signing secret rotated',
      detail: 'HMAC-SHA256 signature secret refreshed',
      actor: 'Admin',
      time: '3 days ago',
      ip: '103.21.244.18',
      type: 'webhook'
    }
  ];

  const filteredAuditEvents = auditEvents.filter((item) => {
    if (auditFilter !== 'All' && item.category !== auditFilter) return false;
    if (
      auditSearch &&
      !item.title.toLowerCase().includes(auditSearch.toLowerCase()) &&
      !item.detail.toLowerCase().includes(auditSearch.toLowerCase()) &&
      !item.actor.toLowerCase().includes(auditSearch.toLowerCase()) &&
      !item.ip.includes(auditSearch)
    ) {
      return false;
    }
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasNumber, hasUpper, hasSpecial].filter(Boolean).length;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }
    if (strengthScore < 3) {
      showToast('Please choose a stronger password matching security policies.');
      return;
    }
    showToast('Password successfully changed and re-encrypted.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSignOutOtherSessions = () => {
    setOtherSessions([]);
    showToast('Successfully signed out of all other sessions.');
  };

  const handleCreateTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) {
      showToast('Please provide a token name.');
      return;
    }
    const entropyHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const prefix = newTokenEnv === 'Production' ? 'ost_live_' : newTokenEnv === 'Staging' ? 'ost_stg_' : 'ost_dev_';
    const generatedToken = `${prefix}${entropyHex}91a0c7e48b`;

    const newTokenItem = {
      id: `vt-${Date.now()}`,
      name: newTokenName,
      tokenMasked: `${generatedToken.substring(0, 12)}••••••••••`,
      env: newTokenEnv,
      scope: 'models:infer, telemetry:write',
      expiration: newTokenExpiry,
      lastUsed: 'Never',
      createdBy: 'Shaan (Owner)',
      createdDate: 'Today'
    };

    setVirtualTokens([newTokenItem, ...virtualTokens]);
    setCreatedTokenResult(generatedToken);
    setNewTokenName('');
  };

  const handleRevokeToken = (id: string, name: string) => {
    setVirtualTokens(virtualTokens.filter((t) => t.id !== id));
    showToast(`Revoked virtual token: ${name}`);
  };

  const handleRotateToken = (name: string) => {
    showToast(`Rotated virtual token: ${name}. Old key invalidated.`);
  };

  const handleRotateProviderKey = (provider: string) => {
    showToast(`Triggered zero-downtime rotation for ${provider}. Master credentials updated in HSM.`);
  };

  const handleTestLatency = (provider: string, currentLatency: string) => {
    showToast(`Handshake verified with ${provider} gateway: ${currentLatency} RTT.`);
  };

  const handleExportAuditLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `osterdops-security-audit-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported audit logs with cryptographic SHA-256 manifest.');
  };

  const handleAddIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpLabel.trim() || !newIpCidr.trim()) {
      showToast('Please enter both label and CIDR.');
      return;
    }
    setIpAllowlist([...ipAllowlist, { id: `ip-${Date.now()}`, label: newIpLabel, cidr: newIpCidr, addedBy: 'Shaan' }]);
    setAddIpModalOpen(false);
    setNewIpLabel('');
    setNewIpCidr('');
    showToast('Trusted CIDR added to IP allowlist.');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP AI SECURITY POSTURE SCORECARD                            */}
      {/* ============================================================ */}
      <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-bl from-[#C59E5F]/15 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-[#F4EFE6] text-[#9C7938] border border-[#E5DBCA]">
                AI Infrastructure Security Console
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                HSM Level 3 Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
              Enterprise Access & Model Key Vault
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-3xl font-sans">
              Dynamic master key swapping, virtual token isolation, active session monitoring, and real-time cryptographic audit telemetry.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#FAF8F5] p-3 rounded-xl border border-[#EAE5DC]">
            <div className="text-right">
              <div className="text-[11px] font-mono uppercase text-charcoal-400 font-bold">Posture Score</div>
              <div className="text-xl font-extrabold text-charcoal-900 font-mono flex items-center justify-end gap-1">
                <span className="text-emerald-600">96</span>
                <span className="text-xs text-charcoal-400 font-normal">/ 100</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#18181B] flex items-center justify-center text-[#C59E5F]">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4 Security Metric Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#EAE5DC]">
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Provider Vault</span>
            <span className="text-xs font-bold text-charcoal-900 font-mono flex items-center gap-1.5 mt-0.5">
              <KeyRound className="w-3.5 h-3.5 text-[#C59E5F]" />
              5 Keys Encrypted (AES-256)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Virtual Tokens</span>
            <span className="text-xs font-bold text-charcoal-900 font-mono flex items-center gap-1.5 mt-0.5">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              {virtualTokens.length} Active (Zero Exposed)
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase block">2FA Enforcement</span>
            <span className="text-xs font-bold text-emerald-700 font-mono flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              Required for All Members
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC]">
            <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Privacy Mode</span>
            <span className="text-xs font-bold text-charcoal-900 font-mono flex items-center gap-1.5 mt-0.5">
              <Database className="w-3.5 h-3.5 text-purple-600" />
              Metadata Only (Redacted)
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER PILLS / QUICK SECTION SELECTOR                        */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#EAE5DC]">
        {[
          { id: 'all', label: 'All Security Console' },
          { id: 'auth', label: '1. Authentication & 2FA' },
          { id: 'sessions', label: '2. Active Sessions' },
          { id: 'tokens', label: '3. Virtual Tokens' },
          { id: 'vault', label: '4. Provider Key Vault' },
          { id: 'rbac', label: '5. RBAC & Roles' },
          { id: 'audit', label: '6. Security & Audit Logs' },
          { id: 'webhooks', label: '7. Webhooks' },
          { id: 'network', label: '8. Network Security' },
          { id: 'privacy', label: '9. Data & Privacy' }
        ].map((tab) => {
          const isActive = securityCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSecurityCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#18181B] text-white font-bold shadow-xs'
                  : 'bg-white border border-[#EAE5DC] text-charcoal-600 hover:text-charcoal-900 hover:bg-[#FAF8F5]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* SECTION 1: AUTHENTICATION & TWO-FACTOR AUTHENTICATION        */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'auth') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C59E5F]" />
                1. Authentication & Identity Protection
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Manage passwords, session lifetimes, re-authentication policies, and two-factor authentication.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Password Form (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-charcoal-900 font-sans">
                  Change Master Password
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                  PBKDF2/SHA-256 Protected
                </span>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                    Current Password
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                      New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                      Confirm New Password
                    </label>
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                    />
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-charcoal-600">Password Strength:</span>
                      <span className={`font-bold ${strengthScore <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {strengthScore <= 1 ? 'Very Weak' : strengthScore === 2 ? 'Medium' : strengthScore === 3 ? 'Strong' : 'Very Strong'}
                      </span>
                    </div>
                    <div className="w-full bg-[#EAE5DC] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strengthScore <= 1 ? 'bg-rose-500 w-1/4' : strengthScore === 2 ? 'bg-amber-500 w-2/4' : strengthScore === 3 ? 'bg-emerald-500 w-3/4' : 'bg-[#C59E5F] w-full'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-charcoal-500 pt-1">
                      <span className={hasMinLength ? 'text-emerald-700 font-bold' : ''}>• 8+ characters</span>
                      <span className={hasNumber ? 'text-emerald-700 font-bold' : ''}>• At least 1 number</span>
                      <span className={hasUpper ? 'text-emerald-700 font-bold' : ''}>• 1 uppercase letter</span>
                      <span className={hasSpecial ? 'text-emerald-700 font-bold' : ''}>• 1 special symbol</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="text-xs font-mono text-charcoal-500 hover:text-charcoal-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPasswords ? 'Hide' : 'Show'} Passwords</span>
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              {/* Session Policies & Re-auth */}
              <div className="pt-4 border-t border-[#EAE5DC] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">Session Timeout</span>
                    <span className="text-[11px] text-charcoal-500">Automatically logout inactive dashboard sessions.</span>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => {
                      setSessionTimeout(e.target.value);
                      showToast(`Session timeout set to ${e.target.value}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-800 focus:outline-none"
                  >
                    <option>15 minutes</option>
                    <option>1 hour</option>
                    <option>8 hours</option>
                    <option>24 hours</option>
                    <option>7 days</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">Require Re-authentication</span>
                    <span className="text-[11px] text-charcoal-500">Prompt for password before rotating master provider keys or deleting tokens.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireReAuth}
                    onChange={(e) => {
                      setRequireReAuth(e.target.checked);
                      showToast(e.target.checked ? 'Re-authentication required for sensitive operations' : 'Re-authentication relaxed');
                    }}
                    className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">Login Notifications</span>
                    <span className="text-[11px] text-charcoal-500">Alert via email when a login occurs from an unrecognized device or IP.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={loginAlerts}
                    onChange={(e) => {
                      setLoginAlerts(e.target.checked);
                      showToast(e.target.checked ? 'Login alerts active' : 'Login alerts disabled');
                    }}
                    className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2FA Card & OAuth (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Prominent 2FA Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#18181B] to-[#27272A] text-white p-6 shadow-md space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5]/10 border border-white/10 flex items-center justify-center text-[#C59E5F]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    2FA ACTIVE
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-sans">Two-factor authentication</h3>
                  <p className="text-xs text-charcoal-300 mt-1 leading-relaxed">
                    Add an extra layer of protection to your OsterdOps account. Prevents unauthorized model access even if credentials leak.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-charcoal-200">
                    <span>Authenticator App</span>
                    <span className="text-emerald-400 font-bold">● Configured (TOTP)</span>
                  </div>
                  <div className="flex items-center justify-between text-charcoal-200">
                    <span>Backup Codes</span>
                    <span className="text-charcoal-300">8 Remaining</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setBackupCodesModalOpen(true)}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold font-mono transition-all border border-white/10 cursor-pointer text-center"
                  >
                    View Backup Codes
                  </button>
                  <button
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(twoFactorEnabled ? '2FA disabled (Not recommended)' : '2FA activated');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    {twoFactorEnabled ? 'Manage' : 'Enable 2FA'}
                  </button>
                </div>

                {/* Team Enforcement Toggle */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#C59E5F]" />
                      Require 2FA for all members
                    </span>
                    <span className="text-[10px] text-charcoal-400">All developers must authenticate with TOTP to access gateway.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={require2FAAllMembers}
                    onChange={(e) => {
                      setRequire2FAAllMembers(e.target.checked);
                      showToast(e.target.checked ? '2FA enforced across all workspace developers' : '2FA enforcement disabled');
                    }}
                    className="w-4 h-4 accent-[#C59E5F] rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Connected OAuth Providers */}
              <div className="rounded-2xl bg-white border border-[#EAE5DC] p-5 shadow-subtle space-y-3">
                <h4 className="text-xs font-bold text-charcoal-900 uppercase font-mono tracking-wider">
                  Connected SSO Providers
                </h4>
                
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center font-bold text-xs">
                        G
                      </div>
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block">Google Workspace</span>
                        <span className="text-[10px] font-mono text-charcoal-500">shaan@acmecorp.com</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-charcoal-500 hover:text-rose-600 font-bold cursor-pointer" onClick={() => showToast('Google SSO verified')}>
                      Connected
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#EAE5DC] flex items-center justify-center font-bold text-xs">
                        GH
                      </div>
                      <div>
                        <span className="text-xs font-bold text-charcoal-900 block">GitHub Enterprise</span>
                        <span className="text-[10px] font-mono text-charcoal-500">@shaan-prasad</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-charcoal-500 hover:text-rose-600 font-bold cursor-pointer" onClick={() => showToast('GitHub SSO verified')}>
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: ACTIVE SESSIONS                                   */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'sessions') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#C59E5F]" />
                2. Active Sessions & Hardware Logins
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Review devices currently authenticated into your OsterdOps dashboard and revoke stale sessions.
              </p>
            </div>
            {otherSessions.length > 0 && (
              <button
                onClick={handleSignOutOtherSessions}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-sandstone-100 border border-[#EAE5DC] text-rose-700 text-xs font-bold font-mono transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sign out all other sessions</span>
              </button>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] divide-y divide-[#EAE5DC] shadow-subtle overflow-hidden">
            {/* Current Session */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F5]/60">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#18181B] text-white flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-[#C59E5F]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-900">Chrome 124 · Windows 11</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ● Current session
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-charcoal-500 mt-0.5">
                    <span>Mumbai, India</span>
                    <span>•</span>
                    <span>IP: 103.21.244.18</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">Last active: Just now</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-charcoal-400 font-medium">This Computer</span>
            </div>

            {/* Other Sessions */}
            {otherSessions.map((sess) => (
              <div key={sess.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-charcoal-700 flex items-center justify-center">
                    {sess.type === 'mobile' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">{sess.device}</span>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-charcoal-500 mt-0.5">
                      <span>{sess.location}</span>
                      <span>•</span>
                      <span>IP: {sess.ip}</span>
                      <span>•</span>
                      <span>Last active: {sess.lastActive}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOtherSessions(otherSessions.filter((s) => s.id !== sess.id));
                    showToast(`Terminated session on ${sess.device}`);
                  }}
                  className="text-xs font-mono font-bold text-rose-600 hover:text-rose-800 cursor-pointer self-start sm:self-auto"
                >
                  Revoke
                </button>
              </div>
            ))}

            {otherSessions.length === 0 && (
              <div className="p-4 text-center text-xs font-mono text-charcoal-500">
                No other active sessions. Your account is only signed in on this current browser.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: API & VIRTUAL TOKENS                              */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'tokens') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#C59E5F]" />
                  3. Virtual Tokens (Client & Framework Access)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#FAF3E0] text-[#9C7938] border border-[#E5DBCA]">
                  CORE SECURITY PILLAR
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                Manage tokens used by your applications, Next.js servers, and autonomous agents without exposing root provider credentials.
              </p>
            </div>
            <button
              onClick={() => setCreateTokenModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold font-mono transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Create Virtual Token</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle overflow-hidden">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#EAE5DC] flex items-center justify-between text-xs font-mono text-charcoal-600">
              <span className="font-bold uppercase tracking-wider text-[11px]">Active Virtual Tokens ({virtualTokens.length})</span>
              <span className="text-charcoal-400 text-[11px]">Tokens are cryptographically hashed via SHA-256</span>
            </div>

            <div className="divide-y divide-[#EAE5DC]">
              {virtualTokens.map((tok) => (
                <div key={tok.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-sandstone-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-charcoal-900 font-sans">{tok.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase ${
                          tok.env === 'Production'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : tok.env === 'Staging'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-charcoal-100 text-charcoal-800 border border-charcoal-200'
                        }`}
                      >
                        {tok.env}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-charcoal-500">
                      <span className="font-bold text-charcoal-800 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE5DC]">
                        {tok.tokenMasked}
                      </span>
                      <span>Scope: <strong className="text-charcoal-700">{tok.scope}</strong></span>
                      <span>Expires: <strong className="text-charcoal-700">{tok.expiration}</strong></span>
                      <span>Last used: <strong className="text-emerald-700 font-bold">{tok.lastUsed}</strong></span>
                      <span>By: {tok.createdBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-auto font-mono text-xs">
                    <button
                      onClick={() => handleRotateToken(tok.name)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-sandstone-100 border border-[#EAE5DC] text-charcoal-800 font-bold cursor-pointer"
                    >
                      Rotate
                    </button>
                    <button
                      onClick={() => handleRevokeToken(tok.id, tok.name)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#FAF8F5]/80 border-t border-[#EAE5DC] flex items-center gap-2 text-xs font-sans text-charcoal-600">
              <Info className="w-4 h-4 text-[#C59E5F] shrink-0" />
              <span>
                <strong>Security Guarantee:</strong> Full virtual tokens are displayed exactly once at creation time and never stored in plaintext. If lost, generate a new token or trigger a zero-downtime rotation.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 4: PROVIDER KEY VAULT                                */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'vault') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C59E5F]" />
                  4. Provider Key Vault (Encrypted Upstream Credentials)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AES-256-GCM HSM PROTECTED
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                Upstream LLM credentials are encrypted in hardware security modules and <strong>never exposed to developers or client applications</strong>.
              </p>
            </div>
            <button
              onClick={() => setConnectProviderModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold font-mono transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Connect Master Provider Key</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle overflow-hidden">
            <div className="divide-y divide-[#EAE5DC]">
              {providerVault.map((pv) => (
                <div key={pv.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-sandstone-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-center font-bold text-xs text-charcoal-800 font-mono">
                        {pv.provider.includes('Google') ? 'G' : pv.provider.includes('OpenAI') ? 'OA' : pv.provider.includes('Anthropic') ? 'AN' : pv.provider.includes('Mistral') ? 'M' : 'GQ'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-charcoal-900 font-sans">{pv.provider}</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Connected
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-charcoal-400 block">{pv.alias}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-charcoal-500 pt-1">
                      <span className="font-bold text-charcoal-800 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EAE5DC]">
                        {pv.maskedKey}
                      </span>
                      <span>Models: <strong className="text-charcoal-700">{pv.models}</strong></span>
                      <span>Storage: <strong className="text-purple-700">{pv.storage}</strong></span>
                      <span>Last used: <strong className="text-emerald-700 font-bold">{pv.lastUsed}</strong></span>
                      <span>Added by: {pv.createdBy}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start lg:self-auto font-mono text-xs">
                    <button
                      onClick={() => handleTestLatency(pv.provider, pv.latency)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-sandstone-100 border border-[#EAE5DC] text-charcoal-800 font-bold cursor-pointer"
                    >
                      Ping ({pv.latency})
                    </button>
                    <button
                      onClick={() => handleRotateProviderKey(pv.provider)}
                      className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-black text-white font-bold cursor-pointer"
                    >
                      Rotate Key
                    </button>
                    <button
                      onClick={() => {
                        setProviderVault(providerVault.filter((p) => p.id !== pv.id));
                        showToast(`Revoked provider vault key for ${pv.provider}`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <span className="text-charcoal-600">
                All provider keys are isolated in memory and stripped before HTTP response delivery.
              </span>
              <button
                onClick={() => showToast('Master key vault audit verified with zero leaks')}
                className="text-[#C59E5F] hover:text-[#9C7938] font-bold cursor-pointer flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Verify HSM Cryptographic Attestation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 5: PERMISSIONS / RBAC                                */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'rbac') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C59E5F]" />
                5. Role-Based Access Control (RBAC)
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Fine-grained privileges controlling who can access billing, manage virtual tokens, and swap provider keys.
              </p>
            </div>
            <a
              href="#team"
              onClick={(e) => {
                if (onNavigateTeam) {
                  e.preventDefault();
                  onNavigateTeam();
                }
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-sandstone-100 border border-[#EAE5DC] text-charcoal-900 text-xs font-bold font-mono transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Manage Roles in Teams →</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                role: 'Owner',
                desc: 'Full root access to all billing, encryption vaults, audit logs, and workspace destruction.',
                privilege: 'Full Access',
                color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
              },
              {
                role: 'Admin',
                desc: 'Manage workspace members, rotate master provider keys, configure spend limits.',
                privilege: 'Manage Workspace + Devs',
                color: 'bg-blue-50 text-blue-800 border-blue-200'
              },
              {
                role: 'Developer',
                desc: 'Access inference endpoints, generate dev virtual tokens, test model prompts and fallbacks.',
                privilege: 'Usage + Integrations',
                color: 'bg-purple-50 text-purple-800 border-purple-200'
              },
              {
                role: 'Viewer',
                desc: 'Read-only access to spend dashboards, performance latency charts, and CSV report downloads.',
                privilege: 'Read-only Telemetry',
                color: 'bg-charcoal-100 text-charcoal-800 border-charcoal-200'
              }
            ].map((r) => (
              <div key={r.role} className="p-5 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-charcoal-900 font-sans">{r.role}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${r.color}`}>
                      {r.privilege}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-500 font-sans leading-relaxed">
                    {r.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-[#EAE5DC] text-[10px] font-mono text-charcoal-400">
                  Default Policy Active
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise Custom Roles Banner */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C59E5F] shrink-0" />
              <span className="text-charcoal-700">
                <strong>Enterprise Feature:</strong> Granular model-level policies (e.g. restrict <code>Claude Opus 4.8</code> to specific engineering squads) can be created via custom policies.
              </span>
            </div>
            <button
              onClick={() => showToast('Enterprise custom RBAC preview requested')}
              className="text-[#C59E5F] hover:text-[#9C7938] font-bold font-mono cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              Request Custom RBAC →
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 6: SECURITY & AUDIT LOGS                             */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'audit') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C59E5F]" />
                6. Security Activity & Audit Ledger
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Tamper-evident chronological record of all administrative actions, key rotations, and authentication attempts.
              </p>
            </div>
            <button
              onClick={handleExportAuditLogs}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold font-mono transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-[#C59E5F]" />
              <span>Export Audit Log (JSON)</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle overflow-hidden">
            {/* Filter and Search Bar */}
            <div className="p-4 bg-[#FAF8F5] border-b border-[#EAE5DC] flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
                {(['All', 'Authentication', 'API', 'Members', 'Tokens', 'Settings'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAuditFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      auditFilter === cat
                        ? 'bg-[#18181B] text-white font-bold'
                        : 'bg-white border border-[#EAE5DC] text-charcoal-600 hover:text-charcoal-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Search actor, action, or IP..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>
            </div>

            {/* Event List */}
            <div className="divide-y divide-[#EAE5DC]">
              {filteredAuditEvents.map((evt) => (
                <div key={evt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sandstone-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        evt.type === 'security_alert'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : evt.type === 'vault'
                          ? 'bg-purple-50 text-purple-600 border border-purple-200'
                          : evt.type === 'token'
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'bg-[#FAF8F5] text-[#C59E5F] border border-[#EAE5DC]'
                      }`}
                    >
                      {evt.type === 'security_alert' ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-charcoal-900 font-sans">{evt.title}</span>
                        <span className="text-[10px] font-mono text-charcoal-400 uppercase bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#EAE5DC]">
                          {evt.category}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-600 font-sans mt-0.5">{evt.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-charcoal-500 shrink-0 self-start sm:self-auto">
                    <span>{evt.actor}</span>
                    <span>•</span>
                    <span>{evt.ip}</span>
                    <span>•</span>
                    <span className="text-charcoal-700 font-bold">{evt.time}</span>
                  </div>
                </div>
              ))}

              {filteredAuditEvents.length === 0 && (
                <div className="p-6 text-center text-xs font-mono text-charcoal-400">
                  No security events match the current filter query.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 7: WEBHOOK SECURITY                                  */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'webhooks') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                <Code className="w-4 h-4 text-[#C59E5F]" />
                7. Webhook Security & HMAC Verification
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Sign outgoing events with HMAC-SHA256 signatures to verify payloads originate from OsterdOps.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block font-mono uppercase">
                  Signing Secret
                </span>
                <span className="text-xs font-mono text-charcoal-500">
                  {revealedWebhookSecret ? 'whsec_99a81bc4f20e8832a764d9' : webhookSecretMasked}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevealedWebhookSecret(!revealedWebhookSecret)}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-sandstone-100 border border-[#EAE5DC] text-xs font-mono text-charcoal-800 cursor-pointer"
                >
                  {revealedWebhookSecret ? 'Hide' : 'Reveal'}
                </button>
                <button
                  onClick={() => copyToClipboard('whsec_99a81bc4f20e8832a764d9', 'Webhook Secret')}
                  className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-sandstone-100 border border-[#EAE5DC] text-xs font-mono text-charcoal-800 cursor-pointer"
                >
                  {copiedField === 'Webhook Secret' ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => {
                    setRevealedWebhookSecret(false);
                    showToast('Webhook signing secret rotated.');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-black text-white text-xs font-mono font-bold cursor-pointer"
                >
                  Rotate Secret
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE5DC] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">Sign outgoing webhooks</span>
                <span className="text-[11px] text-charcoal-500">
                  Computes <code>X-OsterdOps-Signature</code> header using HMAC-SHA256 on every dispatched alert.
                </span>
              </div>
              <input
                type="checkbox"
                checked={signWebhooks}
                onChange={(e) => {
                  setSignWebhooks(e.target.checked);
                  showToast(e.target.checked ? 'HMAC webhook signing enabled' : 'Webhook signing disabled');
                }}
                className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 8: NETWORK SECURITY                                  */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'network') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                <Network className="w-4 h-4 text-[#C59E5F]" />
                8. Network Security & IP Access Control
              </h2>
              <p className="text-xs text-charcoal-500 font-sans">
                Restrict access to dashboard consoles and virtual API gateways to trusted IP CIDRs.
              </p>
            </div>
            <button
              onClick={() => setAddIpModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-sandstone-100 border border-[#EAE5DC] text-charcoal-900 text-xs font-bold font-mono transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>+ Add Trusted IP / CIDR</span>
            </button>
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block">Restrict Dashboard Access</span>
                  <span className="text-[11px] text-charcoal-500">Only whitelisted IPs can open this console.</span>
                </div>
                <input
                  type="checkbox"
                  checked={restrictDashboardIP}
                  onChange={(e) => {
                    setRestrictDashboardIP(e.target.checked);
                    showToast(e.target.checked ? 'Dashboard IP restriction active' : 'Dashboard IP restriction disabled');
                  }}
                  className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block">Restrict Virtual API Access</span>
                  <span className="text-[11px] text-charcoal-500">Blocks API tokens invoked outside trusted networks.</span>
                </div>
                <input
                  type="checkbox"
                  checked={restrictApiIP}
                  onChange={(e) => {
                    setRestrictApiIP(e.target.checked);
                    showToast(e.target.checked ? 'API IP restriction active' : 'API IP restriction disabled');
                  }}
                  className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Trusted IPs Table */}
            <div className="border border-[#EAE5DC] rounded-xl overflow-hidden divide-y divide-[#EAE5DC] font-mono text-xs">
              <div className="p-3 bg-[#FAF8F5] font-bold text-charcoal-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
                <span>Configured Trusted CIDRs ({ipAllowlist.length})</span>
                <span>Enforcement: Active</span>
              </div>
              {ipAllowlist.map((ip) => (
                <div key={ip.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal-900 font-sans block">{ip.label}</span>
                    <span className="text-charcoal-500 text-[11px]">{ip.cidr}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIpAllowlist(ipAllowlist.filter((i) => i.id !== ip.id));
                      showToast(`Removed CIDR: ${ip.cidr}`);
                    }}
                    className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Enterprise PrivateLink Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal-900">AWS PrivateLink & Azure ExpressRoute</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18181B] text-white">
                    ENTERPRISE
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-0.5">
                  Route LLM model inferences entirely across dedicated private VPC endpoints without traversing the public internet.
                </p>
              </div>
              <button
                onClick={() => showToast('Enterprise VPC peering guide requested')}
                className="text-[#C59E5F] hover:text-[#9C7938] font-bold font-mono cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                Contact Solutions Architect →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 9: DATA & PRIVACY (AI INFRASTRUCTURE CRITICAL)       */}
      {/* ============================================================ */}
      {(securityCategory === 'all' || securityCategory === 'privacy') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-charcoal-900 font-sans flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#C59E5F]" />
                  9. Data & Prompt Privacy (AI Governance)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-50 text-purple-800 border border-purple-200">
                  ZERO-RETENTION COMPLIANT
                </span>
              </div>
              <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                Protect sensitive intellectual property, customer PII, and company secrets passed into AI models.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#EAE5DC] p-6 shadow-subtle space-y-6">
            {/* Prompt / Response Logging Radio */}
            <div>
              <span className="text-xs font-bold text-charcoal-900 block uppercase font-mono tracking-wider mb-2">
                Prompt / Response Telemetry Logging
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'full',
                    title: 'Full Content',
                    desc: 'Stores complete prompt text and model completions for debugging. (⚠️ Not recommended for HIPAA/SOC2)',
                    recommended: false
                  },
                  {
                    id: 'metadata',
                    title: 'Metadata Only',
                    desc: 'Stores token usage counts, model names, latency, and cost metrics without persisting raw prompt bodies.',
                    recommended: true
                  },
                  {
                    id: 'disabled',
                    title: 'Disabled (Zero Logging)',
                    desc: 'Pure streaming proxy. Zero request payloads written to disk or database.',
                    recommended: false
                  }
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setLoggingMode(opt.id as any);
                      showToast(`Logging mode set to ${opt.title}`);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      loggingMode === opt.id
                        ? 'bg-[#F4EFE6] border-[#E5DBCA] text-charcoal-900 shadow-xs'
                        : 'bg-[#FAF8F5] border-[#EAE5DC] text-charcoal-600 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold font-sans flex items-center gap-1.5">
                          <span
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                              loggingMode === opt.id ? 'border-[#C59E5F] bg-[#C59E5F]' : 'border-charcoal-300'
                            }`}
                          >
                            {loggingMode === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          {opt.title}
                        </span>
                        {opt.recommended && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#18181B] text-white">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-charcoal-500 leading-relaxed font-sans">
                        {opt.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trace Retention Dropdown */}
            <div className="pt-4 border-t border-[#EAE5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-charcoal-900 block">Trace Retention Period</span>
                <span className="text-[11px] text-charcoal-500">
                  Automatically purge latency and cost traces after the specified time window.
                </span>
              </div>
              <select
                value={traceRetention}
                onChange={(e) => {
                  setTraceRetention(e.target.value);
                  showToast(`Trace retention updated to ${e.target.value}`);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-800 focus:outline-none"
              >
                <option>7 days (Default)</option>
                <option>14 days</option>
                <option>30 days</option>
                <option>90 days (Enterprise)</option>
              </select>
            </div>

            {/* 3 Vital Safeguards Checkboxes */}
            <div className="pt-4 border-t border-[#EAE5DC] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block">Exclude Sensitive HTTP Headers</span>
                  <span className="text-[11px] text-charcoal-500">
                    Automatically strips <code>Authorization</code>, <code>Cookie</code>, and <code>X-API-Key</code> from traces.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={excludeSensitiveHeaders}
                  onChange={(e) => {
                    setExcludeSensitiveHeaders(e.target.checked);
                    showToast(e.target.checked ? 'Sensitive headers excluded' : 'Sensitive headers inclusion enabled');
                  }}
                  className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block">Redact Detected Secrets</span>
                  <span className="text-[11px] text-charcoal-500">
                    Scans outgoing prompts using high-entropy heuristic regexes and redacts OpenAI keys, AWS tokens, and credit cards.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={redactDetectedSecrets}
                  onChange={(e) => {
                    setRedactDetectedSecrets(e.target.checked);
                    showToast(e.target.checked ? 'Secret redaction enabled' : 'Secret redaction disabled');
                  }}
                  className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block">Local-First Telemetry</span>
                  <span className="text-[11px] text-charcoal-500">
                    Aggregates gateway telemetry on your edge node prior to pushing analytics.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={localFirstTelemetry}
                  onChange={(e) => {
                    setLocalFirstTelemetry(e.target.checked);
                    showToast(e.target.checked ? 'Local-first telemetry enabled' : 'Local-first telemetry disabled');
                  }}
                  className="w-4 h-4 accent-[#18181B] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE VIRTUAL TOKEN                                  */}
      {/* ============================================================ */}
      {createTokenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  Create Virtual Token
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Generate scoped credentials for client SDKs or backend runtimes.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreateTokenModalOpen(false);
                  setCreatedTokenResult(null);
                }}
                className="text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdTokenResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Copy this virtual token now.</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    For security reasons, OsterdOps <strong>never displays the complete token again</strong> after closing this dialog.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] font-mono text-xs break-all flex items-center justify-between gap-2">
                  <span className="font-bold text-charcoal-900">{createdTokenResult}</span>
                  <button
                    onClick={() => copyToClipboard(createdTokenResult, 'Virtual Token')}
                    className="px-2.5 py-1 rounded bg-white border border-[#EAE5DC] text-xs font-bold shrink-0 hover:bg-sandstone-100 cursor-pointer"
                  >
                    {copiedField === 'Virtual Token' ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCreateTokenModalOpen(false);
                    setCreatedTokenResult(null);
                    showToast('Virtual token active in gateway.');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTokenSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={newTokenName}
                    onChange={(e) => setNewTokenName(e.target.value)}
                    placeholder="e.g. Next.js AI Production Gateway"
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                      Environment
                    </label>
                    <select
                      value={newTokenEnv}
                      onChange={(e) => setNewTokenEnv(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none"
                    >
                      <option>Production</option>
                      <option>Staging</option>
                      <option>Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                      Expiration
                    </label>
                    <select
                      value={newTokenExpiry}
                      onChange={(e) => setNewTokenExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none"
                    >
                      <option>30 days</option>
                      <option>90 days</option>
                      <option>1 year</option>
                      <option>Never</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-1.5">
                  <span className="text-[11px] font-bold text-charcoal-700 font-mono uppercase block">Assigned Scopes</span>
                  <div className="space-y-1 text-xs font-mono text-charcoal-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-[#18181B]" />
                      <span>models:infer (Model Execution)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-[#18181B]" />
                      <span>telemetry:write (Streaming Metrics)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded accent-[#18181B]" />
                      <span>cache:read (Semantic Cache)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateTokenModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono font-bold text-charcoal-700 hover:bg-sandstone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    Generate Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CONNECT PROVIDER MASTER KEY                           */}
      {/* ============================================================ */}
      {connectProviderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  Store Encrypted Provider Key
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Your master key will be encrypted via Hardware HSM and never shared.
                </p>
              </div>
              <button
                onClick={() => setConnectProviderModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newProviderKey.trim()) {
                  showToast('Please enter an API key.');
                  return;
                }
                const masked = `${newProviderKey.substring(0, 6)}••••••••••••${newProviderKey.substring(newProviderKey.length - 4)}`;
                setProviderVault([
                  ...providerVault,
                  {
                    id: `pv-${Date.now()}`,
                    provider: newProviderName,
                    alias: `${newProviderName.toLowerCase().replace(/\s+/g, '-')}-custom-key`,
                    maskedKey: masked,
                    models: 'All Supported Tier Models',
                    storage: 'AES-256-GCM Encrypted',
                    lastUsed: 'Just now',
                    createdBy: 'Shaan (Owner)',
                    status: 'Connected',
                    latency: '39ms'
                  }
                ]);
                setConnectProviderModalOpen(false);
                setNewProviderKey('');
                showToast(`Master credentials for ${newProviderName} safely encrypted in HSM.`);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                  Provider
                </label>
                <select
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none"
                >
                  <option>OpenAI API</option>
                  <option>Google Gemini API</option>
                  <option>Anthropic API</option>
                  <option>Mistral AI</option>
                  <option>Groq & DeepSeek</option>
                  <option>Cohere API</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                  Master API Key
                </label>
                <input
                  type="password"
                  value={newProviderKey}
                  onChange={(e) => setNewProviderKey(e.target.value)}
                  placeholder="sk-... or AIzaSy..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-[11px] text-charcoal-600 font-sans">
                Verified via zero-knowledge encrypted handshake before saving.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConnectProviderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono font-bold text-charcoal-700 hover:bg-sandstone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Encrypt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: BACKUP CODES                                          */}
      {/* ============================================================ */}
      {backupCodesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  2FA Backup & Recovery Codes
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Keep these one-time recovery codes in a secure password manager.
                </p>
              </div>
              <button
                onClick={() => setBackupCodesModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl font-mono text-xs text-charcoal-900">
              {['8921-4410', '3910-8821', '5512-9904', '7731-0029', '1182-4591', '6620-3341', '9012-7744', '2241-8890'].map(
                (code, idx) => (
                  <div key={idx} className="p-1.5 bg-white rounded border border-[#EAE5DC] text-center font-bold">
                    {code}
                  </div>
                )
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  copyToClipboard('8921-4410\n3910-8821\n5512-9904\n7731-0029\n1182-4591\n6620-3341\n9012-7744\n2241-8890', 'Backup Codes');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono font-bold text-charcoal-800 hover:bg-sandstone-100 cursor-pointer"
              >
                Copy All Codes
              </button>
              <button
                onClick={() => setBackupCodesModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#18181B] text-white text-xs font-mono font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ADD TRUSTED IP                                        */}
      {/* ============================================================ */}
      {addIpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#EAE5DC] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal-900 font-sans">
                  Add Trusted IP or CIDR
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Whitelist specific networks for dashboard or API execution.
                </p>
              </div>
              <button onClick={() => setAddIpModalOpen(false)} className="text-charcoal-400 hover:text-charcoal-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIpSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                  Network Label
                </label>
                <input
                  type="text"
                  value={newIpLabel}
                  onChange={(e) => setNewIpLabel(e.target.value)}
                  placeholder="e.g. Acme HQ Main Office"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-sans text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1 font-mono uppercase">
                  IP or CIDR Range
                </label>
                <input
                  type="text"
                  value={newIpCidr}
                  onChange={(e) => setNewIpCidr(e.target.value)}
                  placeholder="e.g. 103.21.244.0/24 or 54.12.89.1/32"
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs font-mono text-charcoal-900 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddIpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-mono font-bold text-charcoal-700 hover:bg-sandstone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Whitelist CIDR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
