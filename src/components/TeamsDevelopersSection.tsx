import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Key,
  Shield,
  Code,
  Plus,
  X,
  Copy,
  Check,
  Building2,
  Search,
  ShieldCheck,
  Home,
  FolderKanban,
  Cpu,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  ArrowRight,
  MoreHorizontal,
  ChevronDown,
  Layers,
  Brain,
  MessageSquare,
  SlidersHorizontal
} from 'lucide-react';
import { OstraIcon } from './OstraBrand';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarText: string;
  avatarBg: string;
  team: string;
  role: 'Developer' | 'Admin' | 'Security' | 'Owner' | 'Billing';
  spend30d: string;
  lastActive: string;
  userId: string;
  monthlyLimit: number;
  currentSpend: number;
}

interface TeamSquad {
  id: string;
  name: string;
  badge?: string;
  iconBg: string;
  iconColor: string;
  Icon: React.ElementType;
  description: string;
  members: number;
  projects: number;
  apiKeys: number;
  spend30d: string;
  budgetStatus: string;
  budgetPercent: number;
}

interface TeamsDevelopersSectionProps {
  onNavigateDashboard?: () => void;
  onNavigatePricing?: () => void;
}

const TEAMS_DATA: TeamSquad[] = [
  {
    id: 'platform',
    name: 'Platform Team',
    badge: 'Owner',
    Icon: Users,
    iconBg: 'bg-[#C59E5F]/20',
    iconColor: 'text-[#E5C38D]',
    description: 'Core team responsible for platform infrastructure and system operations.',
    members: 4,
    projects: 12,
    apiKeys: 8,
    spend30d: '$6,382.44',
    budgetStatus: 'Budget: Consultation',
    budgetPercent: 78,
  },
  {
    id: 'product',
    name: 'Product Team',
    Icon: Layers,
    iconBg: 'bg-indigo-500/20',
    iconColor: 'text-indigo-400',
    description: 'Building and optimizing customer-facing AI-powered products.',
    members: 6,
    projects: 8,
    apiKeys: 7,
    spend30d: '$9,432.12',
    budgetStatus: 'Budget: Consultation',
    budgetPercent: 62,
  },
  {
    id: 'data-science',
    name: 'Data Science',
    Icon: Cpu,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    description: 'ML models, evaluations, and telemetry data analysis pipelines.',
    members: 5,
    projects: 6,
    apiKeys: 4,
    spend30d: '$3,456.21',
    budgetStatus: 'Budget: Consultation',
    budgetPercent: 48,
  },
  {
    id: 'support',
    name: 'Support Team',
    Icon: MessageSquare,
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    description: 'Customer support, automated triage, and success operations.',
    members: 3,
    projects: 4,
    apiKeys: 3,
    spend30d: '$1,982.04',
    budgetStatus: 'Budget: Consultation',
    budgetPercent: 55,
  },
  {
    id: 'security',
    name: 'Security Team',
    Icon: Shield,
    iconBg: 'bg-emerald-600/20',
    iconColor: 'text-emerald-400',
    description: 'Security, compliance, and threat monitoring and risk management.',
    members: 4,
    projects: 3,
    apiKeys: 2,
    spend30d: '$2,145.18',
    budgetStatus: 'Budget: Consultation',
    budgetPercent: 32,
  },
  {
    id: 'rnd',
    name: 'R&D Team',
    Icon: Brain,
    iconBg: 'bg-violet-600/20',
    iconColor: 'text-violet-400',
    description: 'Advanced research and innovative model development.',
    members: 2,
    projects: 2,
    apiKeys: 2,
    spend30d: '$1,132.08',
    budgetStatus: 'Budget: Consultation',
    budgetPercent: 42,
  },
];

const MEMBERS_DATA: TeamMember[] = [
  {
    id: 'm1',
    name: 'Aarav Das',
    email: 'aarav@company.com',
    avatarText: 'AA',
    avatarBg: 'bg-[#B08945]',
    team: 'Platform Team',
    role: 'Developer',
    spend30d: '$1,234.56',
    lastActive: '2h ago',
    userId: 'usr_aarav_das_01',
    monthlyLimit: 2000,
    currentSpend: 1234.56,
  },
  {
    id: 'm2',
    name: 'Rohan Khurana',
    email: 'rohan@company.com',
    avatarText: 'RK',
    avatarBg: 'bg-[#3B82F6]',
    team: 'Product Team',
    role: 'Developer',
    spend30d: '$892.45',
    lastActive: '3h ago',
    userId: 'usr_rohan_k_02',
    monthlyLimit: 1500,
    currentSpend: 892.45,
  },
  {
    id: 'm3',
    name: 'Sanvi Mehra',
    email: 'sanvi@company.com',
    avatarText: 'SM',
    avatarBg: 'bg-[#D97706]',
    team: 'Data Science',
    role: 'Developer',
    spend30d: '$654.32',
    lastActive: '5h ago',
    userId: 'usr_sanvi_m_03',
    monthlyLimit: 1200,
    currentSpend: 654.32,
  },
  {
    id: 'm4',
    name: 'Aditi Verma',
    email: 'aditi@company.com',
    avatarText: 'AV',
    avatarBg: 'bg-[#059669]',
    team: 'Security Team',
    role: 'Security',
    spend30d: '$456.21',
    lastActive: '6h ago',
    userId: 'usr_aditi_v_04',
    monthlyLimit: 1000,
    currentSpend: 456.21,
  },
  {
    id: 'm5',
    name: 'Nikhil Patel',
    email: 'nikhil@company.com',
    avatarText: 'NP',
    avatarBg: 'bg-[#6366F1]',
    team: 'R&D Team',
    role: 'Developer',
    spend30d: '$210.98',
    lastActive: '8h ago',
    userId: 'usr_nikhil_p_05',
    monthlyLimit: 800,
    currentSpend: 210.98,
  },
];

export const TeamsDevelopersSection: React.FC<TeamsDevelopersSectionProps> = ({
  onNavigateDashboard,
  onNavigatePricing,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'developers' | 'apikeys' | 'roles' | 'activity'>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarActive, setSidebarActive] = useState('teams');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);

  // Invite Form
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState('Platform Team');
  const [newMemberRole, setNewMemberRole] = useState<'Developer' | 'Admin' | 'Security'>('Developer');

  // Create Team Form
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

  const [members, setMembers] = useState<TeamMember[]>(MEMBERS_DATA);
  const [teams, setTeams] = useState<TeamSquad[]>(TEAMS_DATA);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;

    const initials = newMemberName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    const newMember: TeamMember = {
      id: `m${members.length + 1}`,
      name: newMemberName,
      email: newMemberEmail,
      avatarText: initials || 'ID',
      avatarBg: 'bg-[#C59E5F]',
      team: newMemberTeam,
      role: newMemberRole as any,
      spend30d: '$0.00',
      lastActive: 'Just now',
      userId: `usr_${newMemberName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Math.floor(10 + Math.random() * 89)}`,
      monthlyLimit: 1000,
      currentSpend: 0,
    };

    setMembers([newMember, ...members]);
    setInviteModalOpen(false);
    setNewMemberName('');
    setNewMemberEmail('');
    showToast(`Member ${newMember.name} invited successfully`);
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;

    const newTeam: TeamSquad = {
      id: newTeamName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: newTeamName,
      Icon: Users,
      iconBg: 'bg-[#C59E5F]/20',
      iconColor: 'text-[#E5C38D]',
      description: newTeamDesc || 'Dedicated engineering squad with autonomous budget limits.',
      members: 1,
      projects: 1,
      apiKeys: 1,
      spend30d: '$0.00',
      budgetStatus: 'Budget: Consultation',
      budgetPercent: 10,
    };

    setTeams([...teams, newTeam]);
    setCreateTeamModalOpen(false);
    setNewTeamName('');
    setNewTeamDesc('');
    showToast(`Team "${newTeam.name}" created successfully`);
  };

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.team.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [teams, searchQuery]);

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'teams', label: 'Teams & Developers', icon: Users, active: true },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'gateway', label: 'AI Gateway', icon: Cpu },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <section id="teams" className="relative py-16 lg:py-24 bg-[#07090C] text-white overflow-hidden border-t border-white/[0.08] select-none">
      
      {/* Background Ambient Radial Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1300px] h-[750px] bg-gradient-to-b from-[#C59E5F]/15 via-[#E5C38D]/5 to-transparent blur-[180px] pointer-events-none -z-10" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#0B0E14] border border-[#C59E5F]/50 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 font-sans">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Intro Tag */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#C59E5F]/30 text-xs font-mono font-bold text-[#E5C38D] uppercase tracking-wider shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C59E5F] animate-pulse" />
            <span>ORGANIZATION &amp; ACCESS FINOPS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-display leading-[1.12]">
            Teams, Developers &amp; <span className="gold-gradient-text">Squad Governance.</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            Multi-tenant organization architecture: isolate engineering squads, provision hardware-scoped API keys, and enforce hard spend ceilings.
          </p>
        </div>

        {/* ============================================================ */}
        {/* macOS DESKTOP APPLICATION WINDOW FRAME                      */}
        {/* ============================================================ */}
        <div className="w-full max-w-[1480px] mx-auto rounded-[24px] bg-[#07090C] border border-white/[0.14] shadow-[0_35px_110px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300">
          
          {/* ------------------------------------------------------------ */}
          {/* macOS TITLE BAR (Traffic Lights + Search Bar + Profile)       */}
          {/* ------------------------------------------------------------ */}
          <div className="h-12 bg-[#0A0D12] border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between select-none gap-4">
            
            {/* Left: macOS Traffic Lights */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-xs cursor-pointer hover:opacity-80 transition-opacity" title="Close" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-xs cursor-pointer hover:opacity-80 transition-opacity" title="Minimize" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-xs cursor-pointer hover:opacity-80 transition-opacity" title="Fullscreen" />
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#11141B] border border-white/[0.08] text-xs text-zinc-400">
              <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <input
                type="text"
                placeholder="Search teams, members, projects..."
                className="w-full bg-transparent text-white placeholder:text-zinc-500 focus:outline-none text-xs font-sans"
              />
            </div>

            {/* Right: Notifications & Generic Admin Profile (NO Personal Name) */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => showToast('All 6 squads operational. No security violations detected.')}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer relative"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C59E5F] absolute top-1 right-1" />
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08] cursor-pointer group">
                <div className="w-7 h-7 rounded-full bg-[#C59E5F]/20 border border-[#C59E5F]/40 text-[#E5C38D] text-[11px] font-bold font-mono flex items-center justify-center">
                  EA
                </div>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white hidden md:inline">
                  Enterprise Admin
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </div>
            </div>

          </div>

          {/* ------------------------------------------------------------ */}
          {/* WINDOW CONTENT: SIDEBAR + MAIN COCKPIT VIEW                  */}
          {/* ------------------------------------------------------------ */}
          <div className="flex flex-col lg:flex-row min-h-[900px] bg-[#07090C]">
            
            {/* Left Sidebar */}
            <aside className="w-full lg:w-56 shrink-0 bg-[#090C10] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-4 flex flex-col justify-between">
              
              <div className="space-y-6">
                {/* Logo & Brand */}
                <div className="px-2 pt-1 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C59E5F] to-[#E5C38D] p-[1.5px] shadow-sm">
                    <div className="w-full h-full bg-[#07090C] rounded-[10px] flex items-center justify-center p-1">
                      <OstraIcon className="w-full h-full" variant="gold" />
                    </div>
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white font-display">
                    OstraOps
                  </span>
                </div>

                {/* Sidebar Navigation */}
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = sidebarActive === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSidebarActive(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#C59E5F]/15 text-[#E5C38D] border border-[#C59E5F]/30 font-semibold shadow-xs'
                            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5C38D]' : 'text-zinc-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom OstraOps Brand Badge */}
              <div className="pt-4 border-t border-white/[0.08] space-y-2">
                <div className="p-3 rounded-2xl bg-[#0D1016] border border-white/[0.08] space-y-1">
                  <div className="flex items-center gap-2">
                    <OstraIcon className="w-4 h-4" variant="gold" />
                    <span className="text-xs font-bold text-white">OstraOps</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 leading-tight">
                    AI Cost Governance &amp; Operations Platform
                  </div>
                  <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Online</span>
                  </div>
                </div>
              </div>

            </aside>

            {/* Main Content Workspace */}
            <main className="flex-1 p-5 sm:p-7 space-y-6 overflow-x-hidden min-w-0 bg-[#07090C]">
              
              {/* Breadcrumbs & Header Bar */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <span>Dashboard</span>
                  <span>&gt;</span>
                  <span className="text-zinc-300 font-medium">Teams &amp; Developers</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                      Teams &amp; Developers
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                      Manage your organization, teams, client members, user credentials, and developer access settings.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setCreateTeamModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:bg-white/[0.08] hover:border-[#C59E5F]/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Team</span>
                    </button>

                    <button
                      onClick={() => setInviteModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:brightness-110 text-[#07090C] text-xs font-bold shadow-md shadow-[#C59E5F]/20 transition-all cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Invite Members &amp; Clients</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ============================================================ */}
              {/* ROW 1: TOP 4 METRICS CARDS                                    */}
              {/* ============================================================ */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: TOTAL MEMBERS */}
                <div className="p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between hover:border-[#C59E5F]/40 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 text-[#E5C38D] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      TOTAL MEMBERS
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      24
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                      <span>↑ 4 new this month</span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="pt-2">
                    <svg className="w-full h-5 overflow-visible" viewBox="0 0 100 20" fill="none">
                      <path d="M 0,16 Q 30,16 55,10 T 100,2" stroke="#C59E5F" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Metric 2: ACTIVE DEVELOPERS */}
                <div className="p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between hover:border-[#C59E5F]/40 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <Code className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      ACTIVE DEVELOPERS
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      18
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold mt-1">
                      <span>↑ 2 active today</span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="pt-2">
                    <svg className="w-full h-5 overflow-visible" viewBox="0 0 100 20" fill="none">
                      <path d="M 0,16 C 25,16 40,6 60,6 C 75,6 80,14 100,12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Metric 3: ACTIVE API KEYS */}
                <div className="p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between hover:border-[#C59E5F]/40 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      ACTIVE API KEYS
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      32
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-blue-400 font-semibold mt-1">
                      <span>↑ 5 provisioned this month</span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="pt-2">
                    <svg className="w-full h-5 overflow-visible" viewBox="0 0 100 20" fill="none">
                      <path d="M 0,14 Q 40,14 65,8 T 100,4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Metric 4: CONFIGURED RULES */}
                <div className="p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl flex flex-col justify-between hover:border-[#C59E5F]/40 transition-colors group">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-xl bg-[#C59E5F]/15 border border-[#C59E5F]/30 text-[#E5C38D] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      CONFIGURED RULES
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      6
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-1">
                      Fully operational
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="pt-2">
                    <svg className="w-full h-5 overflow-visible" viewBox="0 0 100 20" fill="none">
                      <path d="M 0,16 Q 30,16 60,16 T 80,6 T 100,6" stroke="#C59E5F" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

              </div>

              {/* ============================================================ */}
              {/* ROW 2: TABS & SEARCH FILTER                                  */}
              {/* ============================================================ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  {[
                    { id: 'teams', label: 'Teams' },
                    { id: 'developers', label: 'Developers & Clients' },
                    { id: 'apikeys', label: 'API Keys' },
                    { id: 'roles', label: 'Roles & Permissions' },
                    { id: 'activity', label: 'Activity Log' },
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#181C24] text-white border border-white/[0.12] font-semibold shadow-xs'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Filter Input */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter teams, members, IDs..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#0B0E14] border border-white/[0.1] text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] font-sans"
                  />
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* ============================================================ */}
              {/* ROW 3: SQUADS (8 COLS) + SIDEBAR METRICS (4 COLS)            */}
              {/* ============================================================ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Left 8 cols: Teams (6) Cards */}
                <div className="lg:col-span-8 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white font-sans">
                      Teams ({filteredTeams.length})
                    </h4>
                    <button
                      onClick={() => setCreateTeamModalOpen(true)}
                      className="text-xs font-semibold text-[#E5C38D] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Team</span>
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 -mt-2">
                    Organize your members into teams and manage access settings.
                  </p>

                  {/* 2-Column Team Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredTeams.map((team) => {
                      const Icon = team.Icon;
                      return (
                        <div
                          key={team.id}
                          className="p-4.5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F]/40 transition-all shadow-xl space-y-3 group"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl ${team.iconBg} ${team.iconColor} flex items-center justify-center shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white group-hover:text-[#E5C38D] transition-colors">
                                  {team.name}
                                </span>
                                {team.badge && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.08] text-zinc-400 border border-white/[0.08]">
                                    {team.badge}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showToast(`Configuring squad policy for ${team.name}`);
                              }}
                              className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/[0.04]"
                              title="Squad Settings"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 h-9">
                            {team.description}
                          </p>

                          {/* Stats Strip */}
                          <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-white/[0.06] text-center">
                            <div>
                              <div className="text-[10px] text-zinc-500 font-mono">Members</div>
                              <div className="text-xs font-bold text-white font-mono mt-0.5">{team.members}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-mono">Projects</div>
                              <div className="text-xs font-bold text-white font-mono mt-0.5">{team.projects}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-mono">API Keys</div>
                              <div className="text-xs font-bold text-white font-mono mt-0.5">{team.apiKeys}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-zinc-500 font-mono">Spend (30d)</div>
                              <div className="text-xs font-bold text-white font-mono mt-0.5">{team.spend30d}</div>
                            </div>
                          </div>

                          {/* Budget & Details Action */}
                          <div className="pt-1.5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-zinc-400 font-mono text-[10px]">{team.budgetStatus}</span>
                              <button
                                onClick={onNavigateDashboard}
                                className="text-[10px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <span>View Details</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D]"
                                style={{ width: `${team.budgetPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 4 cols: Side Analytics Rail */}
                <div className="lg:col-span-4 space-y-4">
                  
                  {/* Team Members Overview Donut Chart */}
                  <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-3.5">
                    <h5 className="text-xs font-bold text-white font-sans">
                      Team Members Overview
                    </h5>

                    {/* Donut Chart */}
                    <div className="flex items-center justify-center py-2 relative">
                      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
                        {/* Platform Team (4/24 = 16.7%) */}
                        <circle cx="50" cy="50" r="38" stroke="#C59E5F" strokeWidth="12" fill="none" strokeDasharray="40 199" strokeDashoffset="0" />
                        {/* Product Team (6/24 = 25%) */}
                        <circle cx="50" cy="50" r="38" stroke="#3B82F6" strokeWidth="12" fill="none" strokeDasharray="60 179" strokeDashoffset="-40" />
                        {/* Data Science (5/24 = 20.8%) */}
                        <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="12" fill="none" strokeDasharray="50 189" strokeDashoffset="-100" />
                        {/* Support Team (3/24 = 12.5%) */}
                        <circle cx="50" cy="50" r="38" stroke="#F43F5E" strokeWidth="12" fill="none" strokeDasharray="30 209" strokeDashoffset="-150" />
                        {/* Security Team (4/24 = 16.7%) */}
                        <circle cx="50" cy="50" r="38" stroke="#059669" strokeWidth="12" fill="none" strokeDasharray="40 199" strokeDashoffset="-180" />
                        {/* R&D Team (2/24 = 8.3%) */}
                        <circle cx="50" cy="50" r="38" stroke="#8B5CF6" strokeWidth="12" fill="none" strokeDasharray="20 219" strokeDashoffset="-220" />
                      </svg>

                      {/* Donut Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-black text-white font-mono leading-none">24</span>
                        <span className="text-[9px] text-zinc-400 font-mono mt-0.5">Total Members</span>
                      </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="space-y-1.5 pt-1 text-xs">
                      {[
                        { name: 'Platform Team', count: 4, color: 'bg-[#C59E5F]' },
                        { name: 'Product Team', count: 6, color: 'bg-[#3B82F6]' },
                        { name: 'Data Science', count: 5, color: 'bg-[#10B981]' },
                        { name: 'Support Team', count: 3, color: 'bg-[#F43F5E]' },
                        { name: 'Security Team', count: 4, color: 'bg-[#059669]' },
                        { name: 'R&D Team', count: 2, color: 'bg-[#8B5CF6]' },
                      ].map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                            <span className="text-zinc-300 truncate">{item.name}</span>
                          </div>
                          <span className="font-mono font-bold text-white shrink-0 ml-1">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Role Distribution */}
                  <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-white font-sans">
                        Role Distribution
                      </h5>
                      <button
                        onClick={onNavigatePricing}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-[#E5C38D] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View all</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {[
                        { role: 'Owner', count: 1, percent: 12 },
                        { role: 'Admin', count: 4, percent: 30 },
                        { role: 'Developer', count: 15, percent: 85 },
                        { role: 'Client / Viewer', count: 3, percent: 22 },
                        { role: 'Billing', count: 1, percent: 12 },
                      ].map((r) => (
                        <div key={r.role} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400 font-medium">{r.role}</span>
                            <span className="font-mono font-bold text-white">{r.count}</span>
                          </div>
                          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#C59E5F]"
                              style={{ width: `${r.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Development Activity (7D) */}
                  <div className="p-5 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-sans">
                        Development Activity (7D)
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <span>↑ 12%</span>
                      <span className="text-zinc-400 font-normal">vs last 7 days</span>
                    </div>

                    {/* Activity Area Chart */}
                    <div className="pt-2">
                      <svg className="w-full h-16 overflow-visible" viewBox="0 0 200 50" preserveAspectRatio="none">
                        <path
                          d="M 0,46 C 45,45 80,42 110,34 C 140,24 170,12 200,6"
                          fill="none"
                          stroke="#C59E5F"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 0,46 C 45,45 80,42 110,34 C 140,24 170,12 200,6 L 200,50 L 0,50 Z"
                          fill="url(#goldActivityGradClean)"
                          opacity="0.25"
                        />
                        <defs>
                          <linearGradient id="goldActivityGradClean" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C59E5F" />
                            <stop offset="100%" stopColor="#C59E5F" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 pt-1">
                        <span>May 14</span>
                        <span>May 16</span>
                        <span>May 18</span>
                        <span>May 20</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xl space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                      Quick Actions
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setInviteModalOpen(true)}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#C59E5F]/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#C59E5F] mb-1" />
                        <div className="text-[11px] font-bold text-white">Invite Members</div>
                        <div className="text-[9px] text-zinc-500 font-mono">Create or invite users</div>
                      </button>

                      <button
                        onClick={() => setCreateTeamModalOpen(true)}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#C59E5F]/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-[#E5C38D] mb-1" />
                        <div className="text-[11px] font-bold text-white">Create Team</div>
                        <div className="text-[9px] text-zinc-500 font-mono">Organize &amp; manage</div>
                      </button>

                      <button
                        onClick={onNavigatePricing}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#C59E5F]/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-zinc-400 mb-1" />
                        <div className="text-[11px] font-bold text-white">Manage Roles</div>
                        <div className="text-[9px] text-zinc-500 font-mono">Set permissions</div>
                      </button>

                      <button
                        onClick={onNavigateDashboard}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#C59E5F]/40 hover:bg-white/[0.06] text-left transition-colors cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5 text-zinc-400 mb-1" />
                        <div className="text-[11px] font-bold text-white">API Key Mgmt</div>
                        <div className="text-[9px] text-zinc-500 font-mono">Tokens &amp; keys</div>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* ============================================================ */}
              {/* ROW 4: DEVELOPERS & CLIENT MEMBERS TABLE                     */}
              {/* ============================================================ */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white font-sans">
                      Developers &amp; Client Members
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Collaborate with your team and manage access, roles, and permissions.
                    </p>
                  </div>

                  <button
                    onClick={() => setInviteModalOpen(true)}
                    className="text-xs font-semibold text-[#E5C38D] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Invite Client Member</span>
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                        <th className="py-2.5 px-3">NAME</th>
                        <th className="py-2.5 px-3">EMAIL</th>
                        <th className="py-2.5 px-3">TEAM</th>
                        <th className="py-2.5 px-3">ROLE</th>
                        <th className="py-2.5 px-3">SPEND (30D)</th>
                        <th className="py-2.5 px-3">LAST ACTIVE</th>
                        <th className="py-2.5 px-3 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {filteredMembers.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => setSelectedMember(m)}
                          className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                        >
                          {/* Name with Avatar */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white font-mono shadow-xs shrink-0 ${m.avatarBg}`}>
                                {m.avatarText}
                              </div>
                              <span className="font-bold text-white group-hover:text-[#E5C38D] transition-colors">
                                {m.name}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">
                            {m.email}
                          </td>

                          {/* Team */}
                          <td className="py-3 px-3 text-zinc-300 font-medium">
                            {m.team}
                          </td>

                          {/* Role */}
                          <td className="py-3 px-3 text-zinc-300 font-medium">
                            {m.role}
                          </td>

                          {/* Spend */}
                          <td className="py-3 px-3 font-mono font-bold text-white">
                            {m.spend30d}
                          </td>

                          {/* Last Active */}
                          <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">
                            {m.lastActive}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMember(m);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.1] hover:border-[#C59E5F]/50 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Details &amp; Permissions
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMember(m);
                                }}
                                className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
                                title="Member Actions"
                              >
                                <MoreHorizontal className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </main>

          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW MEMBER DETAILS & CREDENTIALS                   */}
      {/* ============================================================ */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-6 space-y-5 text-white font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white font-mono ${selectedMember.avatarBg}`}>
                  {selectedMember.avatarText}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedMember.name}</h4>
                  <p className="text-xs text-zinc-400 font-mono">{selectedMember.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Credential Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Assigned User ID</label>
                <div className="flex items-center justify-between mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.08]">
                  <span className="font-mono text-xs text-white">{selectedMember.userId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMember.userId);
                      showToast('User ID copied to clipboard');
                    }}
                    className="text-zinc-400 hover:text-[#E5C38D] transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-500 uppercase">Assigned Squad</label>
                <div className="mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.08] text-xs font-semibold text-white">
                  {selectedMember.team} ({selectedMember.role})
                </div>
              </div>

              {/* Monthly Spend Limit */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Monthly Spend Ceiling:</span>
                  <span className="font-mono font-bold text-white">${selectedMember.monthlyLimit}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-zinc-500">Current Spend:</span>
                  <span className="font-mono text-[#E5C38D]">{selectedMember.spend30d}</span>
                </div>
                <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full"
                    style={{ width: `${Math.min(100, (selectedMember.currentSpend / selectedMember.monthlyLimit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: INVITE MEMBER & CREATE ID                           */}
      {/* ============================================================ */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-6 space-y-4 text-white font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#C59E5F]" />
                <h4 className="text-base font-bold text-white">Invite Team Member</h4>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. David Zhao"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="david.z@company.com"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Assigned Team</label>
                  <select
                    value={newMemberTeam}
                    onChange={(e) => setNewMemberTeam(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#C59E5F]"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Role</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-[#C59E5F]"
                  >
                    <option value="Developer">Developer</option>
                    <option value="Admin">Admin</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
                >
                  Issue Credentials &amp; Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CREATE TEAM                                         */}
      {/* ============================================================ */}
      {createTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0B0E14] border border-white/[0.12] shadow-2xl p-6 space-y-4 text-white font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C59E5F]" />
                <h4 className="text-base font-bold text-white">Create New Team</h4>
              </div>
              <button
                onClick={() => setCreateTeamModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Team Name</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Inference Optimization Squad"
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase">Description &amp; Purpose</label>
                <textarea
                  rows={3}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Describe this squad's workload and routing budget scope..."
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#07090C] border border-white/[0.1] text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-[#07090C] text-xs font-bold shadow-md hover:brightness-110 cursor-pointer"
                >
                  Create Team Squad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
