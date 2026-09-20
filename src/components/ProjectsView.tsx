import React, { useState } from 'react';
import {
  Plus,
  Search,
  Copy,
  Check,
  ArrowRight,
  X,
  Pause,
  Play
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  slug: string;
  env: 'Production' | 'Staging' | 'Development';
  spend: number;
  budgetLimit: number;
  tokens: string;
  requests: number;
  avgLatency: string;
  primaryModel: string;
  failoverModel: string;
  endpoint: string;
  paused: boolean;
  lastActive: string;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_prd_01',
    name: 'Main Web Platform',
    slug: 'web-platform',
    env: 'Production',
    spend: 2450.21,
    budgetLimit: 3500.00,
    tokens: '142.8M',
    requests: 48920,
    avgLatency: '320ms',
    primaryModel: 'GPT-4o',
    failoverModel: 'Claude 3.5 Sonnet',
    endpoint: '127.0.0.1:8080/v1/projects/web-platform',
    paused: false,
    lastActive: 'Just now',
  },
  {
    id: 'proj_prd_02',
    name: 'Customer Support Copilot',
    slug: 'support-copilot',
    env: 'Production',
    spend: 1210.43,
    budgetLimit: 1500.00,
    tokens: '94.2M',
    requests: 26410,
    avgLatency: '410ms',
    primaryModel: 'Claude 3.5 Sonnet',
    failoverModel: 'Claude 3.5 Haiku',
    endpoint: '127.0.0.1:8080/v1/projects/support-copilot',
    paused: false,
    lastActive: '2m ago',
  },
  {
    id: 'proj_prd_03',
    name: 'Checkout Fraud Detector',
    slug: 'fraud-detector',
    env: 'Production',
    spend: 412.32,
    budgetLimit: 800.00,
    tokens: '31.5M',
    requests: 9840,
    avgLatency: '180ms',
    primaryModel: 'Gemini 1.5 Pro',
    failoverModel: 'Gemini 1.5 Flash',
    endpoint: '127.0.0.1:8080/v1/projects/fraud-detector',
    paused: false,
    lastActive: '5m ago',
  },
  {
    id: 'proj_stg_01',
    name: 'Internal Coding Assistant',
    slug: 'internal-coder',
    env: 'Staging',
    spend: 164.34,
    budgetLimit: 500.00,
    tokens: '18.4M',
    requests: 3120,
    avgLatency: '480ms',
    primaryModel: 'Claude 3.7 Sonnet',
    failoverModel: 'Claude 3.5 Haiku',
    endpoint: '127.0.0.1:8080/v1/projects/internal-coder',
    paused: false,
    lastActive: '18m ago',
  },
  {
    id: 'proj_stg_02',
    name: 'Analytics SQL Generator',
    slug: 'sql-generator',
    env: 'Staging',
    spend: 54.12,
    budgetLimit: 300.00,
    tokens: '6.2M',
    requests: 840,
    avgLatency: '390ms',
    primaryModel: 'GPT-4o-mini',
    failoverModel: 'Gemini 1.5 Flash',
    endpoint: '127.0.0.1:8080/v1/projects/sql-generator',
    paused: false,
    lastActive: '1h ago',
  },
  {
    id: 'proj_dev_01',
    name: 'Automated Code Reviewer',
    slug: 'pr-reviewer',
    env: 'Development',
    spend: 21.40,
    budgetLimit: 200.00,
    tokens: '2.8M',
    requests: 412,
    avgLatency: '510ms',
    primaryModel: 'Claude 3.5 Sonnet',
    failoverModel: 'Haiku 3.5',
    endpoint: '127.0.0.1:8080/v1/projects/pr-reviewer',
    paused: false,
    lastActive: '3h ago',
  },
  {
    id: 'proj_dev_02',
    name: 'Marketing Copy Generator',
    slug: 'marketing-copy',
    env: 'Development',
    spend: 9.82,
    budgetLimit: 150.00,
    tokens: '1.4M',
    requests: 120,
    avgLatency: '290ms',
    primaryModel: 'GPT-4o',
    failoverModel: 'GPT-4o-mini',
    endpoint: '127.0.0.1:8080/v1/projects/marketing-copy',
    paused: false,
    lastActive: '1d ago',
  },
  {
    id: 'proj_dev_03',
    name: 'R&D Synthetic Data Lab',
    slug: 'rnd-synthetic',
    env: 'Development',
    spend: 6.00,
    budgetLimit: 100.00,
    tokens: '0.9M',
    requests: 70,
    avgLatency: '620ms',
    primaryModel: 'DeepSeek-V3',
    failoverModel: 'GPT-4o-mini',
    endpoint: '127.0.0.1:8080/v1/projects/rnd-synthetic',
    paused: true,
    lastActive: '3d ago',
  },
];

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [envFilter, setEnvFilter] = useState<'All' | 'Production' | 'Staging' | 'Development'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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

  const togglePause = (id: string) => {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, paused: !p.paused } : p))
    );
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProj: Project = {
      id: `proj_${newEnv.toLowerCase().slice(0, 3)}_${Math.floor(10 + Math.random() * 90)}`,
      name: newName.trim(),
      slug,
      env: newEnv,
      spend: 0.00,
      budgetLimit: parseFloat(newBudget) || 500,
      tokens: '0.0M',
      requests: 0,
      avgLatency: '0ms',
      primaryModel: newPrimaryModel,
      failoverModel: newFailoverModel,
      endpoint: `127.0.0.1:8080/v1/projects/${slug}`,
      paused: false,
      lastActive: 'Just created',
    };

    setProjects([newProj, ...projects]);
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
    <div className="space-y-6">
      
      {/* ============================================================ */}
      {/* PAGE HEADER & CONTROLS                                       */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-charcoal-900 tracking-tight font-sans">
            Projects &amp; Service Endpoints
          </h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Manage client applications, per-endpoint spend circuit-breakers, and model routing chains.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-ostraGold-400" />
          <span>New Project Endpoint</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TOP SUMMARY METRICS (4 Cards, OstraOps Palette)            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Endpoints */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Active Endpoints</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sandstone-200 text-charcoal-700">
              {prodCount} PROD
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono">
              {projects.length}
            </div>
            <div className="text-[11px] text-charcoal-500 mt-0.5">
              Across 3 deployment environments
            </div>
          </div>
        </div>

        {/* Card 2: Combined Monthly Spend */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Combined Monthly Spend</span>
            <span className="text-[10px] font-mono text-charcoal-500">
              USD
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono">
              ${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-charcoal-500 mt-0.5">
              Live loopback &amp; edge gateway traffic
            </div>
          </div>
        </div>

        {/* Card 3: Total Enforced Quota */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Total Enforced Budget</span>
            <span className="text-[10px] font-mono font-bold text-charcoal-700">
              {((totalSpend / totalBudget) * 100).toFixed(1)}% USED
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono">
              ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="h-1.5 w-full bg-[#EAE5DC] rounded-full overflow-hidden mt-1.5">
              <div 
                className="h-full bg-ostraGold-500 rounded-full"
                style={{ width: `${(totalSpend / totalBudget) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Model Failovers */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-charcoal-500">Failover Switches</span>
            <span className="text-[10px] font-mono font-medium text-charcoal-600">
              30 DAYS
            </span>
          </div>
          <div className="pt-2">
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono">
              19
            </div>
            <div className="text-[11px] text-charcoal-500 mt-0.5">
              100% requests recovered without 5xx
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FILTER & SEARCH BAR                                          */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle">
        
        {/* Environment Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Production', 'Staging', 'Development'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setEnvFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                envFilter === tab
                  ? 'bg-charcoal-900 text-white font-bold shadow-xs'
                  : 'text-charcoal-600 hover:bg-sandstone-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, or model..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#EAE5DC] rounded-xl text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-ostraGold-500 transition-colors"
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* PROJECTS LIST GRID                                           */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const spendPercent = Math.min(100, (project.spend / project.budgetLimit) * 100);
          const isNearCap = spendPercent >= 80;

          return (
            <div
              key={project.id}
              className={`p-5 rounded-3xl bg-white border transition-all hover:shadow-md flex flex-col justify-between ${
                project.paused
                  ? 'border-dashed border-[#DCD5C9] opacity-75'
                  : 'border-[#EAE5DC] shadow-subtle'
              }`}
            >
              <div className="space-y-4">
                
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-charcoal-900 tracking-tight font-sans">
                        {project.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        project.env === 'Production'
                          ? 'bg-[#18181B] text-white'
                          : project.env === 'Staging'
                          ? 'bg-sandstone-300 text-charcoal-800'
                          : 'bg-sandstone-200 text-charcoal-600'
                      }`}>
                        {project.env}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-charcoal-400 font-mono mt-1">
                      <span>{project.id}</span>
                      <span>•</span>
                      <span>{project.lastActive}</span>
                    </div>
                  </div>

                  {/* Pause / Resume Button */}
                  <button
                    onClick={() => togglePause(project.id)}
                    className="p-1.5 rounded-lg border border-[#EAE5DC] hover:bg-sandstone-200 text-charcoal-600 transition-colors"
                    title={project.paused ? 'Resume routing' : 'Pause circuit-breaker route'}
                  >
                    {project.paused ? (
                      <Play className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Pause className="w-3.5 h-3.5 text-charcoal-500" />
                    )}
                  </button>
                </div>

                {/* Spend & Circuit-Breaker Cap Bar */}
                <div className="p-3 rounded-2xl bg-[#FCFAF7] border border-[#EAE5DC] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-500 font-medium">Circuit-Breaker Spend</span>
                    <div className="font-mono">
                      <span className="font-extrabold text-charcoal-900">
                        ${project.spend.toFixed(2)}
                      </span>
                      <span className="text-charcoal-400"> / ${project.budgetLimit.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-[#EAE5DC] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearCap ? 'bg-charcoal-900' : 'bg-ostraGold-500'
                      }`}
                      style={{ width: `${spendPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-charcoal-500 font-mono pt-0.5">
                    <span>{project.tokens} tokens</span>
                    <span>{project.requests.toLocaleString()} requests</span>
                    <span>{project.avgLatency}</span>
                  </div>
                </div>

                {/* Routing & Failover Chain */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-charcoal-600">
                    <span className="text-[11px] text-charcoal-500">Routing Chain:</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-sandstone-200 text-charcoal-900 font-bold">
                        {project.primaryModel}
                      </span>
                      <span className="text-charcoal-400">→</span>
                      <span className="px-2 py-0.5 rounded-md bg-sandstone-100 text-charcoal-700">
                        {project.failoverModel}
                      </span>
                    </div>
                  </div>

                  {/* Copyable Proxy Endpoint */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F5F2EB] text-[11px] font-mono text-charcoal-700">
                    <span className="truncate pr-2">{project.endpoint}</span>
                    <button
                      onClick={() => copyEndpoint(project.endpoint, project.id)}
                      className="p-1 rounded hover:bg-sandstone-300 text-charcoal-600 shrink-0 transition-colors"
                      title="Copy loopback endpoint"
                    >
                      {copiedId === project.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-2 border-t border-[#EAE5DC] flex items-center justify-between text-xs">
                <button
                  onClick={() => alert(`Opening telemetry traces for ${project.name} (${project.id})`)}
                  className="font-bold text-charcoal-900 hover:text-ostraGold-600 flex items-center gap-1 group transition-colors"
                >
                  <span>Inspect Traces</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => alert(`Configuring limits & circuit-breaker for ${project.name}`)}
                  className="text-charcoal-500 hover:text-charcoal-900 font-medium transition-colors"
                >
                  Configure Limits
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* NEW PROJECT ENDPOINT MODAL                                   */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-[#EAE5DC] pb-4">
              <div>
                <h3 className="text-base font-extrabold text-charcoal-900 tracking-tight font-sans">
                  Create New Endpoint
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Route traffic through local loopback proxy
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-charcoal-400 hover:bg-sandstone-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-800 block">
                  Application / Project Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mobile Copilot Engine"
                  className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EAE5DC] rounded-xl text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-ostraGold-500 transition-colors"
                />
              </div>

              {/* Environment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-800 block">
                  Deployment Environment
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Production', 'Staging', 'Development'] as const).map(env => (
                    <button
                      type="button"
                      key={env}
                      onClick={() => setNewEnv(env)}
                      className={`py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        newEnv === env
                          ? 'bg-charcoal-900 text-white border-charcoal-900 font-bold'
                          : 'bg-[#FCFAF7] border-[#EAE5DC] text-charcoal-700 hover:bg-sandstone-200'
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
                  <label className="text-xs font-bold text-charcoal-800 block">
                    Primary Model
                  </label>
                  <select
                    value={newPrimaryModel}
                    onChange={(e) => setNewPrimaryModel(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FCFAF7] border border-[#EAE5DC] rounded-xl text-charcoal-900 focus:outline-none focus:border-ostraGold-500 font-mono"
                  >
                    <option value="GPT-4o">GPT-4o</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                    <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                    <option value="DeepSeek-V3">DeepSeek-V3</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-charcoal-800 block">
                    Failover Model
                  </label>
                  <select
                    value={newFailoverModel}
                    onChange={(e) => setNewFailoverModel(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-[#FCFAF7] border border-[#EAE5DC] rounded-xl text-charcoal-900 focus:outline-none focus:border-ostraGold-500 font-mono"
                  >
                    <option value="Claude 3.5 Haiku">Claude 3.5 Haiku</option>
                    <option value="GPT-4o-mini">GPT-4o-mini</option>
                    <option value="Gemini 1.5 Flash">Gemini 1.5 Flash</option>
                  </select>
                </div>
              </div>

              {/* Circuit Breaker Cap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-charcoal-800 block">
                  Hard Monthly Budget Cap ($ USD)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  step="10"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FCFAF7] border border-[#EAE5DC] rounded-xl text-charcoal-900 font-mono focus:outline-none focus:border-ostraGold-500 transition-colors"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-charcoal-600 hover:bg-sandstone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
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
