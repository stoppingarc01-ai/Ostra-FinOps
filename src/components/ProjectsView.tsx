import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Copy,
  Check,
  ArrowRight,
  X,
  Pause,
  Play,
  CheckCircle2
} from 'lucide-react';
import {
  subscribeToUserProjects,
  createProject,
  toggleProjectPause,
  type UserProject,
} from '../lib/projectsService';
import { useAuth } from '../contexts/AuthContext';

// Project interface re-exported from service
type Project = UserProject;

export const ProjectsView: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'All' | 'Production' | 'Staging' | 'Development'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Subscribe to Firestore projects for the logged-in user
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserProjects(user.uid, (list) => {
      setProjects(list);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  // New Project Form State
  const [newName, setNewName] = useState('');
  const [newEnv, setNewEnv] = useState<'Production' | 'Staging' | 'Development'>('Production');
  const [newPrimaryModel, setNewPrimaryModel] = useState('GPT-4o');
  const [newFailoverModel, setNewFailoverModel] = useState('Claude 3.5 Sonnet');
  const [newBudget, setNewBudget] = useState('1000');

  const copyEndpoint = (endpoint: string, id: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePause = useCallback(async (id: string) => {
    if (!user?.uid) return;
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const nextPaused = !project.paused;
    // Optimistic UI update
    setProjects(prev => prev.map(p => p.id === id ? { ...p, paused: nextPaused } : p));
    try {
      await toggleProjectPause(user.uid, id, nextPaused);
    } catch {
      // Revert on failure
      setProjects(prev => prev.map(p => p.id === id ? { ...p, paused: !nextPaused } : p));
      showToast('Failed to update project state.');
    }
  }, [user?.uid, projects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user?.uid) return;

    try {
      const newProj = await createProject(user.uid, {
        name: newName.trim(),
        env: newEnv,
        primaryModel: newPrimaryModel,
        failoverModel: newFailoverModel,
        budgetLimit: parseFloat(newBudget) || 500,
      });
      setProjects(prev => [newProj, ...prev]);
      showToast(`Created project: ${newProj.name}`);
    } catch {
      showToast('Failed to create project — check Firestore connection.');
    }

    setModalOpen(false);
    setNewName('');
    setNewBudget('1000');
  };

  const filteredProjects = projects.filter(p => {
    const matchesEnv = envFilter === 'All' || p.env === envFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.primaryModel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEnv && matchesSearch;
  });

  const totalSpend = projects.reduce((acc, p) => acc + p.spend, 0);
  const totalBudget = projects.reduce((acc, p) => acc + p.budgetLimit, 0);
  const prodCount = projects.filter(p => p.env === 'Production').length;

  return (
    <div className="space-y-6 font-sans text-zinc-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#18181B] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-mono flex items-center gap-2 border border-[#3F3F46] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#C59E5F]" />
          <span>{toastMessage}</span>
        </div>
      )}
      
      {/* ============================================================ */}
      {/* PAGE HEADER & CONTROLS                                       */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-white tracking-tight font-sans">
            Projects &amp; Service Endpoints
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage client applications, per-endpoint spend circuit-breakers, and model routing chains.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] hover:opacity-90 text-black text-xs font-extrabold transition-all shadow-md shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>New Project Endpoint</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TOP SUMMARY METRICS (4 Cards, Dark Obsidian Palette)        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Endpoints */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Active Endpoints</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
              {prodCount} PROD
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {projects.length}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              Across 3 deployment environments
            </div>
          </div>
        </div>

        {/* Card 2: Combined Monthly Spend */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Combined Monthly Spend</span>
            <span className="text-[10px] font-mono text-zinc-500">
              USD
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              Live loopback &amp; edge gateway traffic
            </div>
          </div>
        </div>

        {/* Card 3: Total Enforced Quota */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Total Enforced Budget</span>
            <span className="text-[10px] font-mono font-bold text-[#E5C38D]">
              {((totalSpend / totalBudget) * 100).toFixed(1)}% USED
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] rounded-full"
                style={{ width: `${(totalSpend / totalBudget) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Model Failovers */}
        <div className="p-4 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Failover Switches</span>
            <span className="text-[10px] font-mono font-medium text-emerald-400">
              30 DAYS
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              19
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              100% requests recovered without 5xx
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FILTER & SEARCH BAR                                          */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0B0E14] border border-white/[0.08] shadow-md">
        
        {/* Environment Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Production', 'Staging', 'Development'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setEnvFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                envFilter === tab
                  ? 'bg-[#C59E5F] text-black font-bold shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or model..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] transition-colors"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* PROJECTS LIST GRID                                           */}
      {/* ============================================================ */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-[#0B0E14] border border-white/[0.06] animate-pulse p-6" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B0E14] border border-white/[0.08]">
          <p className="text-zinc-400 text-sm font-mono">No projects found matching the filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => {
            const endpoint = project.endpoint || `https://gateway.ostraops.internal/v1/projects/${project.slug}`;
            const spendPercent = Math.min(100, (project.spend / project.budgetLimit) * 100);
            const isNearCap = spendPercent >= 80;

          return (
            <div
              key={project.id}
              className={`p-5 rounded-3xl bg-[#0B0E14] border transition-all hover:border-white/[0.16] shadow-md flex flex-col justify-between ${
                project.paused
                  ? 'border-dashed border-zinc-700 opacity-60'
                  : 'border-white/[0.08]'
              }`}
            >
              <div className="space-y-4">
                
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-white tracking-tight font-sans">
                        {project.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        project.env === 'Production'
                          ? 'bg-[#C59E5F]/20 text-[#E5C38D] border border-[#C59E5F]/30'
                          : project.env === 'Staging'
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-white/[0.06] text-zinc-300 border border-white/[0.08]'
                      }`}>
                        {project.env}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-1">
                      <span>{project.id}</span>
                      <span>•</span>
                      <span>{project.lastActive}</span>
                    </div>
                  </div>

                  {/* Pause / Resume Button */}
                  <button
                    onClick={() => togglePause(project.id)}
                    className="p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title={project.paused ? 'Resume routing' : 'Pause circuit-breaker route'}
                  >
                    {project.paused ? (
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>
                </div>

                {/* Spend & Circuit-Breaker Cap Bar */}
                <div className="p-3 rounded-2xl bg-[#07090C] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">Circuit-Breaker Spend</span>
                    <div className="font-mono">
                      <span className="font-extrabold text-white">
                        ${project.spend.toFixed(2)}
                      </span>
                      <span className="text-zinc-500"> / ${project.budgetLimit.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearCap ? 'bg-rose-500' : 'bg-gradient-to-r from-[#C59E5F] to-[#E5C38D]'
                      }`}
                      style={{ width: `${spendPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-0.5">
                    <span>{project.tokens} tokens</span>
                    <span>{project.requests.toLocaleString()} requests</span>
                    <span>{project.avgLatency}</span>
                  </div>
                </div>

                {/* Routing & Failover Chain */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] text-zinc-500">Routing Chain:</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[#E5C38D] border border-white/[0.08] font-bold">
                        {project.primaryModel}
                      </span>
                      <span className="text-zinc-600">→</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-300 border border-white/[0.06]">
                        {project.failoverModel}
                      </span>
                    </div>
                  </div>

                  {/* Copyable Proxy Endpoint */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#07090C] border border-white/[0.08] text-[11px] font-mono text-zinc-300">
                    <span className="truncate pr-2">{endpoint}</span>
                    <button
                      onClick={() => copyEndpoint(endpoint, project.id)}
                      className="p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white shrink-0 transition-colors cursor-pointer"
                      title="Copy loopback endpoint"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <button
                  onClick={() => showToast(`Opening live telemetry traces for ${project.name}...`)}
                  className="font-bold text-[#E5C38D] hover:text-white flex items-center gap-1 group transition-colors cursor-pointer"
                >
                  <span>Inspect Traces</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => showToast(`Configuring budget guardrails & circuit-breaker for ${project.name}...`)}
                  className="text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Configure Limits
                </button>
              </div>

            </div>
          );
        })}
        </div>
      )}

      {/* ============================================================ */}
      {/* NEW PROJECT ENDPOINT MODAL                                   */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#0B0E14] rounded-3xl border border-white/[0.1] shadow-2xl p-6 sm:p-7 space-y-5 text-white">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-lg font-extrabold text-white">
                Create New Project Endpoint
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generate a zero-latency loopback endpoint with dedicated circuit breaker limits.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mobile App Gateway"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#C59E5F] transition-colors"
                />
              </div>

              {/* Environment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Deployment Environment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Production', 'Staging', 'Development'] as const).map(env => (
                    <button
                      type="button"
                      key={env}
                      onClick={() => setNewEnv(env)}
                      className={`py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                        newEnv === env
                          ? 'bg-[#C59E5F] text-black border-[#C59E5F] font-bold'
                          : 'bg-[#07090C] border-white/[0.08] text-zinc-300 hover:bg-white/[0.06]'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Model */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Primary Model
                  </label>
                  <select
                    value={newPrimaryModel}
                    onChange={(e) => setNewPrimaryModel(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#C59E5F] font-mono cursor-pointer"
                  >
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                    <option value="DeepSeek-V3">DeepSeek-V3</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Failover Model
                  </label>
                  <select
                    value={newFailoverModel}
                    onChange={(e) => setNewFailoverModel(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-[#C59E5F] font-mono cursor-pointer"
                  >
                    <option value="Claude 3.5 Haiku">Claude 3.5 Haiku</option>
                    <option value="GPT-4o-mini">GPT-4o-mini</option>
                    <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
                  </select>
                </div>
              </div>

              {/* Circuit Breaker Cap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Hard Monthly Budget Cap ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  step="10"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#07090C] border border-white/[0.1] rounded-xl text-white font-mono focus:outline-none focus:border-[#C59E5F] transition-colors"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59E5F] to-[#E5C38D] text-black text-xs font-extrabold transition-all shadow-md cursor-pointer hover:opacity-90"
                >
                  Create Endpoint
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
