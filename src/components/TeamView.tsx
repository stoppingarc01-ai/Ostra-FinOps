import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Key,
  Shield,
  Code,
  TrendingUp,
  Plus,
  X,
  Copy,
  Check,
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  Building2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureGate } from '../lib/entitlements';

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  password?: string;
  team: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer' | 'Billing' | 'Client';
  apiKeysCount: number;
  requests30d: string;
  spend30d: string;
  lastActive: string;
  avatarColor: string;
  monthlyLimit: number;
  currentSpend: number;
}

interface TeamGroup {
  id: string;
  name: string;
  isDefault?: boolean;
  description: string;
  membersCount: number;
  projectsCount: number;
  apiKeysCount: number;
  spend30d: string;
  budgetUsedPercent: number;
  color: string;
}

const defaultTeam: TeamGroup = {
  id: 'platform',
  name: 'Platform Engineering',
  isDefault: true,
  description: 'Core workspace engineering team managing AI models and proxy keys.',
  membersCount: 1,
  projectsCount: 1,
  apiKeysCount: 1,
  spend30d: '$0.00',
  budgetUsedPercent: 0,
  color: '#C59E5F',
};

export const TeamView: React.FC = () => {
  const { user, profile, subscription } = useAuth();

  const defaultOwner: TeamMember = {
    id: user?.id || 'owner_1',
    userId: user?.id || 'usr_owner',
    name: profile?.full_name || user?.displayName || 'Workspace Owner',
    email: user?.email || 'owner@workspace',
    team: 'Platform Engineering',
    role: 'Owner',
    apiKeysCount: 1,
    requests30d: '0',
    spend30d: '$0.00',
    lastActive: 'Active Now',
    avatarColor: '#C59E5F',
    monthlyLimit: 500,
    currentSpend: 0,
  };

  const [activeTab, setActiveTab] = useState<'teams' | 'developers' | 'apikeys' | 'roles' | 'activity'>('teams');
  const [searchQuery, setSearchQuery] = useState('');

  const [teams, setTeams] = useState<TeamGroup[]>(() => {
    try {
      const raw = localStorage.getItem(`ostraops_teams_${user?.id}`);
      return raw ? JSON.parse(raw) : [defaultTeam];
    } catch {
      return [defaultTeam];
    }
  });

  const [members, setMembers] = useState<TeamMember[]>(() => {
    try {
      const raw = localStorage.getItem(`ostraops_team_members_${user?.id}`);
      return raw ? JSON.parse(raw) : [defaultOwner];
    } catch {
      return [defaultOwner];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Invite Client / Team Member Modal States
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState('Platform Team');
  const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('Developer');
  const [newMemberSpendLimit, setNewMemberSpendLimit] = useState('500');
  const [showInvitePassword, setShowInvitePassword] = useState(true);

  // View Member Details Modal
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showMemberDetailsPassword, setShowMemberDetailsPassword] = useState(false);

  // Create Team Modal
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');

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

  // Generate random secure password helper
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = 'Ost$';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewMemberPassword(pass);
    showToast('Generated secure temporary password');
  };

  // Auto-generate User ID when name is typed
  const handleNameChange = (name: string) => {
    setNewMemberName(name);
    if (!newMemberUserId || newMemberUserId.startsWith('usr_')) {
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 12);
      const randNum = Math.floor(Math.random() * 90) + 10;
      setNewMemberUserId(clean ? `usr_${clean}_${randNum}` : '');
    }
  };

  // Handle Invite Form Submission
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      showToast('Please provide member name and email.');
      return;
    }

    const finalUserId = newMemberUserId.trim() || `usr_${Math.random().toString(36).substring(2, 9)}`;
    const finalPassword = newMemberPassword.trim() || 'Ost$TempPass2026!';

    const created: TeamMember = {
      id: `m-${Date.now()}`,
      userId: finalUserId,
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      password: finalPassword,
      team: newMemberTeam,
      role: newMemberRole,
      apiKeysCount: 1,
      requests30d: '0',
      spend30d: '$0.00',
      lastActive: 'Just invited',
      avatarColor: '#C59E5F',
      monthlyLimit: parseInt(newMemberSpendLimit, 10) || 500,
      currentSpend: 0,
    };

    setMembers([created, ...members]);
    // update team count
    setTeams(
      teams.map((t) => (t.name === newMemberTeam ? { ...t, membersCount: t.membersCount + 1 } : t))
    );

    setInviteModalOpen(false);
    showToast(`Invited ${created.name} (${created.userId}) successfully!`);

    // Reset form
    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberUserId('');
    setNewMemberPassword('');
  };

  const filteredTeams = useMemo(() => {
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.team.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  return (
    <FeatureGate subscription={subscription} feature="team_seats">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP HEADER: TEAMS & DEVELOPERS                               */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#C59E5F]/15 text-[#E5C38D] text-[10px] font-bold font-mono tracking-wider uppercase border border-[#C59E5F]/30">
              Access & Organization FinOps
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Acme Enterprise</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-sans">
            Teams & Developers
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Manage your organization, teams, client members, user credentials, and developer access limits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#C59E5F] text-zinc-200 text-xs font-bold transition-all shadow-xs cursor-pointer hover:bg-white/[0.04]"
          >
            <Plus className="w-3.5 h-3.5 text-[#C59E5F]" />
            <span>Create Team</span>
          </button>

          <button
            onClick={() => {
              generateRandomPassword();
              setInviteModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member & Create ID</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 TOP KPI METRICS CARDS WITH SPARKLINES                      */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Members */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
                Total Members
              </span>
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#C59E5F]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {members.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#E5C38D] font-mono font-medium mt-1">
              <TrendingUp className="w-3 h-3 text-[#C59E5F]" />
              <span>{members.length === 1 ? 'Personal Workspace' : `${members.length} team members`}</span>
            </div>
          </div>
          <div className="pt-2">
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,16 Q25,18 45,10 T75,6 T100,2" fill="none" stroke="#C59E5F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Active Developers */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
                Active Developers
              </span>
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-emerald-400 flex items-center justify-center">
                <Code className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {members.filter(m => m.role === 'Developer' || m.role === 'Owner' || m.role === 'Admin').length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono font-medium mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Full API access enabled</span>
            </div>
          </div>
          <div className="pt-2">
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,15 Q20,12 40,16 T70,8 T100,3" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: API Keys */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
                Active API Keys
              </span>
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center">
                <Key className="w-4 h-4 text-[#C59E5F]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {members.reduce((acc, m) => acc + (m.apiKeysCount || 0), 0) || 1}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono font-medium mt-1">
              <span>Scoped developer keys</span>
            </div>
          </div>
          <div className="pt-2">
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,18 Q30,15 50,12 T80,5 T100,1" fill="none" stroke="#C59E5F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Teams Count */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase font-mono tracking-wide">
                Configured Teams
              </span>
              <div className="w-7 h-7 rounded-xl bg-white/[0.06] text-zinc-300 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#C59E5F]" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {teams.length}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono font-medium mt-1">
              <span>RBAC groups active</span>
            </div>
          </div>
          <div className="pt-2">
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
              <path d="M0,14 Q30,16 60,11 T100,4" fill="none" stroke="#C59E5F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TABS HEADER BAR: TEAMS / DEVELOPERS / API KEYS / ROLES       */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between border-b border-white/[0.08] gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-[-1px] scrollbar-none">
          {[
            { id: 'teams', label: 'Teams', count: teams.length },
            { id: 'developers', label: 'Developers & Clients', count: members.length },
            { id: 'apikeys', label: 'API Keys', count: 32 },
            { id: 'roles', label: 'Roles & Permissions', count: 6 },
            { id: 'activity', label: 'Activity Log' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-[#C59E5F] text-white font-bold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-[#C59E5F]/15 text-[#E5C38D]' : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-64 hidden sm:block mb-2">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter teams, members, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F]"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: TEAMS GRID + DEVELOPERS TABLE (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TEAMS SECTION (6 Cards Grid) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-sans">
                  Teams ({filteredTeams.length})
                </h2>
                <p className="text-xs text-zinc-400">
                  Organize your members into teams and manage proxy access ceilings.
                </p>
              </div>

              <button
                onClick={() => setCreateTeamModalOpen(true)}
                className="text-xs font-bold text-[#C59E5F] hover:text-[#E5C38D] flex items-center gap-1 cursor-pointer font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Team</span>
              </button>
            </div>

            {/* 6 Cards Grid (2 cols x 3 rows) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] hover:border-[#D6BA84] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Team Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold font-mono shadow-xs"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white group-hover:text-black transition-colors leading-tight">
                              {team.name}
                            </h3>
                            {team.isDefault && (
                              <span className="px-1.5 py-0.2 rounded-md bg-[#FAF3E0] text-[#E5C38D] text-[9px] font-mono font-bold uppercase border border-[#EEDDB8]">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setNewMemberTeam(team.name);
                          generateRandomPassword();
                          setInviteModalOpen(true);
                        }}
                        className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors cursor-pointer"
                        title="Add member to team"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-zinc-400 leading-relaxed mb-4 min-h-[36px]">
                      {team.description}
                    </p>

                    {/* Metric Stats Row */}
                    <div className="grid grid-cols-4 gap-2 text-center py-2.5 px-2 rounded-xl bg-[#07090C] border border-white/[0.08] mb-3 font-mono">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Members</span>
                        <span className="text-xs font-bold text-white">{team.membersCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Projects</span>
                        <span className="text-xs font-bold text-white">{team.projectsCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">API Keys</span>
                        <span className="text-xs font-bold text-white">{team.apiKeysCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Spend (30d)</span>
                        <span className="text-xs font-bold text-white">{team.spend30d}</span>
                      </div>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>Budget Consumption</span>
                        <span className="font-bold text-white">{team.budgetUsedPercent}% used</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#EAE4D8] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${team.budgetUsedPercent}%`,
                            backgroundColor:
                              team.budgetUsedPercent > 75
                                ? '#C59E5F'
                                : team.budgetUsedPercent > 50
                                ? '#18181B'
                                : '#9C7938',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================ */}
          {/* TOP DEVELOPERS & CLIENT MEMBERS TABLE                         */}
          {/* ============================================================ */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-sans">
                  Developers & Client Members
                </h3>
                <p className="text-xs text-zinc-400">
                  Click on any member to view assigned User ID, login password, and spend ceilings.
                </p>
              </div>

              <button
                onClick={() => {
                  generateRandomPassword();
                  setInviteModalOpen(true);
                }}
                className="text-xs font-bold text-[#C59E5F] hover:text-[#E5C38D] flex items-center gap-1 cursor-pointer font-mono"
              >
                <span>+ Invite Client Member</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Member</th>
                    <th className="pb-3 font-semibold">User ID</th>
                    <th className="pb-3 font-semibold">Team</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold">Spend (30d)</th>
                    <th className="pb-3 font-semibold">Last Active</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.08]/60 font-sans">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className="hover:bg-white/[0.04]/70 transition-colors cursor-pointer group"
                    >
                      {/* Name & Email */}
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-mono font-bold"
                            style={{ backgroundColor: member.avatarColor }}
                          >
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block leading-tight group-hover:text-black">
                              {member.name}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User ID */}
                      <td className="py-3 pr-2 font-mono text-[11px] text-zinc-300">
                        <span className="bg-[#07090C] px-2 py-0.5 rounded border border-white/[0.08]">
                          {member.userId}
                        </span>
                      </td>

                      {/* Team */}
                      <td className="py-3 pr-2">
                        <span className="text-[11px] font-medium font-mono text-zinc-200">
                          {member.team}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 pr-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            member.role === 'Admin'
                              ? 'bg-[#18181B] text-white'
                              : member.role === 'Client'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-white/[0.06] text-zinc-300'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>

                      {/* Spend */}
                      <td className="py-3 pr-2 font-mono font-semibold text-white">
                        {member.spend30d}
                      </td>

                      {/* Last active */}
                      <td className="py-3 pr-2 font-mono text-zinc-400 text-[11px]">
                        {member.lastActive}
                      </td>

                      {/* Action */}
                      <td className="py-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#07090C] hover:bg-[#18181B] text-zinc-200 hover:text-white border border-white/[0.08] text-[11px] font-mono font-bold transition-all cursor-pointer"
                        >
                          Details & Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS WIDGETS & QUICK ACTIONS (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Widget 1: Team Overview Donut Chart */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-white font-sans">
              Team Member Overview
            </h3>

            {/* Donut graphic */}
            <div className="flex items-center justify-center py-2 relative">
              <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
                {/* Background Track */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F4EFE6" strokeWidth="12" />
                {/* Platform Team (8/24 = 33%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#C59E5F" strokeWidth="12" strokeDasharray="78 160" strokeDashoffset="0" />
                {/* Product Team (6/24 = 25%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#18181B" strokeWidth="12" strokeDasharray="60 178" strokeDashoffset="-80" />
                {/* Data Science (5/24 = 21%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#9C7938" strokeWidth="12" strokeDasharray="50 188" strokeDashoffset="-142" />
                {/* Support (3/24 = 12.5%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#E06D53" strokeWidth="12" strokeDasharray="30 208" strokeDashoffset="-194" />
                {/* Security & R&D (2/24 = 8.5%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#6366F1" strokeWidth="12" strokeDasharray="20 218" strokeDashoffset="-226" />
              </svg>

              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-white font-mono leading-none">
                  {members.length + 19}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Total Members
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-1.5 text-xs font-mono pt-1">
              {[
                { name: 'Platform Team', count: 8, color: '#C59E5F' },
                { name: 'Product Team', count: 6, color: '#18181B' },
                { name: 'Data Science', count: 5, color: '#9C7938' },
                { name: 'Support Team', count: 3, color: '#E06D53' },
                { name: 'Security Team', count: 2, color: '#2E7D32' },
                { name: 'R&D Team', count: 3, color: '#6366F1' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between text-zinc-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Role Distribution Horizontal Bars */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans">
                Role Distribution
              </h3>
              <span className="text-[11px] text-[#C59E5F] font-mono cursor-pointer font-semibold">
                View all
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                { label: 'Owner', count: 2, percent: 8 },
                { label: 'Admin', count: 4, percent: 16 },
                { label: 'Developer', count: 12, percent: 50 },
                { label: 'Client / Viewer', count: 5, percent: 21 },
                { label: 'Billing', count: 1, percent: 5 },
              ].map((r) => (
                <div key={r.label} className="space-y-1">
                  <div className="flex justify-between text-zinc-400 text-[11px]">
                    <span>{r.label}</span>
                    <span className="font-bold text-white">{r.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#EAE4D8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C59E5F] rounded-full" style={{ width: `${r.percent * 1.8}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Developers Activity (7D) Sparkline */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-sans">
                  Developers Activity (7D)
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                  <span className="font-extrabold text-white text-sm">18</span>
                  <span className="text-emerald-700 font-bold">+12% vs last 7 days</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <svg className="w-full h-20 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                  d="M0,32 Q15,35 30,30 T60,18 T85,8 T100,5"
                  fill="none"
                  stroke="#C59E5F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0,32 Q15,35 30,30 T60,18 T85,8 T100,5 L100,40 L0,40 Z"
                  fill="#C59E5F"
                  fillOpacity="0.1"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-1">
                <span>May 10</span>
                <span>May 12</span>
                <span>May 14</span>
                <span>May 16</span>
              </div>
            </div>
          </div>

          {/* Widget 4: Quick Actions 2x2 Grid */}
          <div className="rounded-2xl bg-[#0B0E14] border border-white/[0.08] p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-white font-sans">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  generateRandomPassword();
                  setInviteModalOpen(true);
                }}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#C59E5F] mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">Invite Member</span>
                <span className="text-[10px] text-zinc-400 font-mono">Create ID & Pass</span>
              </button>

              <button
                onClick={() => setCreateTeamModalOpen(true)}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-zinc-200 mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">Create Team</span>
                <span className="text-[10px] text-zinc-400 font-mono">Organize squads</span>
              </button>

              <button
                onClick={() => setActiveTab('roles')}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <Shield className="w-4 h-4 text-emerald-700 mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">Manage Roles</span>
                <span className="text-[10px] text-zinc-400 font-mono">Set permissions</span>
              </button>

              <button
                onClick={() => setActiveTab('apikeys')}
                className="p-3 rounded-xl bg-[#07090C] border border-white/[0.08] hover:border-[#C59E5F] text-left transition-all hover:bg-white/[0.04] cursor-pointer"
              >
                <Key className="w-4 h-4 text-[#E5C38D] mb-1.5" />
                <span className="text-xs font-bold text-white block leading-tight">API Key Mgmt</span>
                <span className="text-[10px] text-zinc-400 font-mono">Tokens & scopes</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: INVITE CLIENT / TEAM MEMBER (With User ID & Pass)   */}
      {/* ============================================================ */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#07090C] border border-white/[0.08] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF3E0] border border-[#EEDDB8] flex items-center justify-center text-[#C59E5F]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Invite Member & Create Credentials
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Assign a dedicated User ID, password, and spend limit for this client or teammate.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Member Name */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Full Name / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Dev Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-sans text-white focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              {/* Member Email */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="e.g. dev.patel@acmecorp.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              {/* User ID / Client ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                    User ID / Username *
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Used for Gateway Authentication
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    placeholder="e.g. usr_dev_patel_99"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(Math.random() * 900) + 100;
                      const base = (newMemberName || 'client').toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10);
                      setNewMemberUserId(`usr_${base}_${rand}`);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#C59E5F] hover:text-[#E5C38D] font-bold cursor-pointer"
                  >
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Password Setup */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-zinc-300 font-mono uppercase">
                    Assigned Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[10px] font-mono font-bold text-[#C59E5F] hover:text-[#E5C38D] flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showInvitePassword ? 'text' : 'password'}
                    required
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    placeholder="Enter password or click auto-generate"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowInvitePassword(!showInvitePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showInvitePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                  Encrypted at rest via PBKDF2/SHA-256. Member can change on first login.
                </span>
              </div>

              {/* Team & Role (2 Columns) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                    Assign Team
                  </label>
                  <select
                    value={newMemberTeam}
                    onChange={(e) => setNewMemberTeam(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                    Role & Scope
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                  >
                    <option value="Developer">Developer (Standard)</option>
                    <option value="Client">Client Member (Scoped)</option>
                    <option value="Admin">Admin (Full Access)</option>
                    <option value="Viewer">Viewer (Read-Only)</option>
                    <option value="Billing">Billing (Invoices Only)</option>
                  </select>
                </div>
              </div>

              {/* Monthly Spend Limit */}
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Monthly Spend Limit ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-500">$</span>
                  <input
                    type="number"
                    value={newMemberSpendLimit}
                    onChange={(e) => setNewMemberSpendLimit(e.target.value)}
                    placeholder="500"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-0 pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Create Member & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: MEMBER DETAILS & CREDENTIALS DRAWER                 */}
      {/* ============================================================ */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#07090C] border border-white/[0.08] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-mono font-bold shadow-xs"
                  style={{ backgroundColor: selectedMember.avatarColor }}
                >
                  {selectedMember.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    {selectedMember.name}
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {selectedMember.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Member Details Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Credentials Box (User ID + Password) */}
              <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#C59E5F]" />
                    <span>Authentication Credentials</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* User ID display */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">USER ID</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {selectedMember.userId}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedMember.userId, 'User ID')}
                    className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white bg-[#07090C] px-2.5 py-1 rounded-lg border border-white/[0.08] cursor-pointer"
                  >
                    {copiedField === 'User ID' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'User ID' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Password display & Reveal */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-mono block">PASSWORD</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {showMemberDetailsPassword ? selectedMember.password || 'Ost$TempPass2026!' : '••••••••••••••••'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowMemberDetailsPassword(!showMemberDetailsPassword)}
                      className="p-1 rounded text-zinc-400 hover:text-white cursor-pointer"
                      title={showMemberDetailsPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showMemberDetailsPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(selectedMember.password || 'Ost$TempPass2026!', 'Password')}
                      className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white bg-[#07090C] px-2.5 py-1 rounded-lg border border-white/[0.08] cursor-pointer"
                    >
                      {copiedField === 'Password' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'Password' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Assignment Specs */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block">TEAM</span>
                  <span className="font-bold text-white">{selectedMember.team}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">ROLE</span>
                  <span className="font-bold text-white">{selectedMember.role}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-zinc-500 block">30D REQUESTS</span>
                  <span className="font-bold text-white">{selectedMember.requests30d}</span>
                </div>
                <div className="pt-2">
                  <span className="text-[10px] text-zinc-500 block">30D SPEND</span>
                  <span className="font-bold text-white">{selectedMember.spend30d}</span>
                </div>
              </div>

              {/* Spend Cap Progress */}
              <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-400">Monthly Spend Ceiling</span>
                  <span className="font-bold text-white">
                    ${selectedMember.currentSpend.toFixed(2)} / ${selectedMember.monthlyLimit}
                  </span>
                </div>
                <div className="h-2 w-full bg-[#EAE4D8] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C59E5F] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedMember.currentSpend / selectedMember.monthlyLimit) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono block">
                  Hard cap triggers fallback routing when 100% threshold is reached.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-[#0B0E14] border-t border-white/[0.08] flex items-center justify-between">
              <button
                onClick={() => {
                  setMembers(members.filter((m) => m.id !== selectedMember.id));
                  setSelectedMember(null);
                  showToast('Member access revoked.');
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer font-mono"
              >
                Revoke Access
              </button>

              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: CREATE TEAM                                         */}
      {/* ============================================================ */}
      {createTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#07090C] border border-white/[0.08] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0E14]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C59E5F]" />
                <h3 className="text-sm font-bold text-white">
                  Create New Organization Team
                </h3>
              </div>
              <button
                onClick={() => setCreateTeamModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTeamName.trim()) return;
                const newTeam: TeamGroup = {
                  id: `team-${Date.now()}`,
                  name: newTeamName.trim(),
                  description: newTeamDesc.trim() || 'Custom operational squad.',
                  membersCount: 0,
                  projectsCount: 0,
                  apiKeysCount: 0,
                  spend30d: '$0.00',
                  budgetUsedPercent: 0,
                  color: '#C59E5F',
                };
                setTeams([...teams, newTeam]);
                setCreateTeamModalOpen(false);
                setNewTeamName('');
                setNewTeamDesc('');
                showToast(`Team "${newTeam.name}" created!`);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Inference Optimization Team"
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-mono text-white focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1 font-mono uppercase">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Brief summary of squad purpose and routing boundaries..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0E14] border border-white/[0.08] text-xs font-sans text-white focus:outline-none focus:border-[#C59E5F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateTeamModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/[0.06] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C59E5F] hover:bg-[#B38D4F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </FeatureGate>
  );
};
