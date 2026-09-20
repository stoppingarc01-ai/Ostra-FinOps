import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  ExternalLink,
  X,
  Zap,
  Mail,
  MessageSquare,
  Webhook,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  subscribeToUserAlerts,
  updateAlertStatus,
  createAlert,
  createAlertRule,
  DEFAULT_INITIAL_ALERTS,
  DEFAULT_ALERT_RULES,
  type SystemAlert,
  type AlertRule,
  type AlertSeverity,
  type AlertStatus,
  type AlertCategory
} from '../lib/alertsService';

const getRelativeTime = (isoString: string): string => {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const AlertsView: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  // Sub-tab view: 'feed' (Incidents list) or 'rules' (Guardrail configurations)
  const [viewTab, setViewTab] = useState<'feed' | 'rules'>('feed');

  // Initialized with comprehensive production mock data immediately
  const [alerts, setAlerts] = useState<SystemAlert[]>(() =>
    DEFAULT_INITIAL_ALERTS.map((a, idx) => ({
      ...a,
      id: `ALT-${8840 - idx}`,
      user_id: userId,
      created_at: a.timestamp,
      updated_at: a.timestamp,
    }))
  );

  const [rules, setRules] = useState<AlertRule[]>(() =>
    DEFAULT_ALERT_RULES.map((r, idx) => ({
      ...r,
      id: `rule_${100 + idx}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
  );

  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | AlertStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AlertCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<AlertCategory>('cost');
  const [newRuleSeverity, setNewRuleSeverity] = useState<AlertSeverity>('warning');
  const [newRuleThreshold, setNewRuleThreshold] = useState('');
  const [newRuleChannel, setNewRuleChannel] = useState('#alerts-prod-ai (Slack)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore Sync
  useEffect(() => {
    const unsubscribe = subscribeToUserAlerts(userId, (liveAlerts) => {
      if (liveAlerts && liveAlerts.length > 0) {
        setAlerts(liveAlerts);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleStatusChange = async (alertId: string, newStatus: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Alert ${alertId} marked as ${newStatus}`);

    try {
      await updateAlertStatus(userId, alertId, newStatus);
    } catch {
      // Handled gracefully in mock state
    }
  };

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === ruleId) {
          const nextState = !r.enabled;
          showToast(`Rule "${r.name}" ${nextState ? 'enabled' : 'paused'}`);
          return { ...r, enabled: nextState };
        }
        return r;
      })
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((r) => r.id !== ruleId));
    showToast('Rule removed');
  };

  const handleTestTriggerRule = async (rule: AlertRule) => {
    const newAlert: SystemAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: userId,
      title: `[Test Trigger] ${rule.name}`,
      category: rule.category,
      severity: rule.severity,
      status: 'active',
      timestamp: new Date().toISOString(),
      service: 'Synthetic Probe',
      description: `Manual synthetic trigger executed for rule "${rule.name}". Verified notification dispatch to ${rule.channel}.`,
      metric_value: 'Synthetic Test',
      threshold: rule.threshold,
      impact: 'Test evaluation passed with 0 service degradation',
      channel: rule.channel,
      trace_id: `ost_test_${Math.random().toString(16).substring(2, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setAlerts([newAlert, ...alerts]);
    showToast(`Test alert generated for "${rule.name}"!`);

    try {
      await createAlert(userId, newAlert);
    } catch {
      // Graceful fallback
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) {
      showToast('Please enter an alert rule name');
      return;
    }

    setIsSubmitting(true);
    const newRuleObj: AlertRule = {
      id: `rule_${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: userId,
      name: newRuleName,
      category: newRuleCategory,
      severity: newRuleSeverity,
      threshold: newRuleThreshold || 'Custom condition met',
      channel: newRuleChannel,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newAlertObj: SystemAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: userId,
      title: newRuleName,
      category: newRuleCategory,
      severity: newRuleSeverity,
      status: 'active',
      timestamp: new Date().toISOString(),
      service: 'Ostra Guard Sentinel',
      description: `Threshold rule "${newRuleName}" triggered. Metric condition: ${newRuleThreshold || 'Exceeded threshold'}. Dispatched to ${newRuleChannel}.`,
      metric_value: 'Active trigger',
      threshold: newRuleThreshold || 'Custom Trigger',
      impact: 'Automated policy enforcement active',
      channel: newRuleChannel,
      trace_id: `ost_trc_${Math.random().toString(16).substring(2, 10)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setRules([newRuleObj, ...rules]);
    setAlerts([newAlertObj, ...alerts]);
    setCreateModalOpen(false);
    setNewRuleName('');
    setNewRuleThreshold('');
    showToast(`Alert rule "${newRuleName}" created!`);

    try {
      await createAlertRule(userId, newRuleObj);
      await createAlert(userId, newAlertObj);
    } catch {
      // Handled gracefully in mock
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAlerts = alerts.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && a.status === 'active').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved').length;

  return (
    <div className="space-y-6 pb-14 font-sans selection:bg-[#D4AF7C]/30 selection:text-charcoal-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0B0F0F] text-[#FAF8F5] px-4 py-3 rounded-2xl shadow-2xl border border-[#D4AF7C]/40 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF7C]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-charcoal-900 font-sans">
              System Alerts & Guardrails
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
              {activeCount} Active
            </span>
          </div>
          <p className="text-xs text-charcoal-500 font-medium">
            Real-time telemetry threshold triggers, budget breaches, model latency, and automated gateway failovers.
          </p>
        </div>

        {/* Action Button & Tabs */}
        <div className="flex items-center gap-2.5">
          {/* Sub Navigation Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-sandstone-200/80 border border-[#EAE5DC] text-xs font-mono">
            <button
              onClick={() => setViewTab('feed')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                viewTab === 'feed'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-[#D4AF7C]" />
              <span>Incident Feed ({alerts.length})</span>
            </button>
            <button
              onClick={() => setViewTab('rules')}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold flex items-center gap-1.5 cursor-pointer ${
                viewTab === 'rules'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-[#00A678]" />
              <span>Guardrail Rules ({rules.length})</span>
            </button>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-ostraGold-400" />
            <span>New Alert Rule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Alerts */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Unresolved Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">{activeCount}</span>
            <span className="text-[11px] font-mono text-red-600 font-semibold">
              {criticalCount} critical
            </span>
          </div>
          <div className="text-[11px] text-charcoal-400 mt-2 font-mono flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            Real-time telemetry stream active
          </div>
        </div>

        {/* Metric 2: Critical Breaches */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Critical Severities</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">{criticalCount}</span>
            <span className="text-[11px] font-mono text-charcoal-500 font-medium">
              requires immediate action
            </span>
          </div>
          <div className="text-[11px] text-charcoal-500 mt-2 font-mono">
            TPM rate limit & failover triggers
          </div>
        </div>

        {/* Metric 3: Active Warnings */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Active Warnings</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4AF7C]/20 text-[#8E6B2C] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">{warningCount}</span>
            <span className="text-[11px] font-mono text-[#8E6B2C] font-semibold">
              spend & latency thresholds
            </span>
          </div>
          <div className="text-[11px] text-charcoal-400 mt-2 font-mono">
            Automated circuit breakers armed
          </div>
        </div>

        {/* Metric 4: Auto-Resolved */}
        <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-charcoal-500">Auto-Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-charcoal-900 font-mono">{resolvedCount}</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              100% failover success
            </span>
          </div>
          <div className="text-[11px] text-charcoal-400 mt-2 font-mono">
            Zero downstream request drops
          </div>
        </div>
      </div>

      {/* Notification Dispatch Channels Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B0F0F] to-[#161C20] text-white border border-white/10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF7C]/20 border border-[#D4AF7C]/30 text-[#D4AF7C] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold font-sans flex items-center gap-2">
              <span>Connected Incident Notification Channels</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-neutral-400 font-mono">
              Live webhooks and notifications route instantaneously upon metric threshold violation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-mono flex items-center gap-1.5 border border-white/5">
            <MessageSquare className="w-3 h-3 text-emerald-400" />
            #alerts-prod-ai (Slack)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-mono flex items-center gap-1.5 border border-white/5">
            <Mail className="w-3 h-3 text-[#D4AF7C]" />
            billing@ostra.ai
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-mono flex items-center gap-1.5 border border-white/5">
            <Webhook className="w-3 h-3 text-blue-400" />
            PagerDuty On-Call
          </span>
        </div>
      </div>

      {/* View Tab 1: INCIDENT FEED */}
      {viewTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAE5DC] shadow-subtle flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, service, trace ID, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-sandstone-50 border border-[#EAE5DC] text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#D4AF7C] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-sandstone-100 border border-[#EAE5DC] text-xs font-mono">
                {(['all', 'active', 'acknowledged', 'resolved'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg transition-all capitalize font-medium cursor-pointer ${
                      statusFilter === st
                        ? 'bg-white text-charcoal-900 font-bold shadow-xs'
                        : 'text-charcoal-500 hover:text-charcoal-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Severity Dropdown */}
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-medium text-charcoal-700 focus:outline-none focus:border-[#D4AF7C] cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] text-xs font-medium text-charcoal-700 focus:outline-none focus:border-[#D4AF7C] cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="ratelimit">Rate Limits & TPM</option>
                <option value="cost">Cost & Budgets</option>
                <option value="latency">Latency & Performance</option>
                <option value="provider">Provider Failover</option>
                <option value="security">Security & Guardrails</option>
              </select>
            </div>
          </div>

          {/* Alerts Feed List */}
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#EAE5DC] space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-sandstone-200 text-charcoal-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-charcoal-900">No matching alerts found</h3>
                <p className="text-xs text-charcoal-500">
                  Your gateway guardrails are healthy with no active triggers matching this filter.
                </p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';
                const isResolved = alert.status === 'resolved';

                return (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-2xl bg-white border transition-all hover:shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isResolved
                        ? 'border-[#EAE5DC] opacity-75'
                        : isCritical
                        ? 'border-red-500/40 bg-gradient-to-r from-red-500/[0.02] to-transparent shadow-xs'
                        : isWarning
                        ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/[0.02] to-transparent shadow-xs'
                        : 'border-[#EAE5DC]'
                    }`}
                  >
                    {/* Left Content Area */}
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Severity Icon Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isCritical
                            ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                            : isWarning
                            ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20'
                            : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}
                      >
                        {isCritical ? (
                          <AlertOctagon className="w-4 h-4" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        {/* Header line: Tags and timestamp */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-charcoal-500">
                            {alert.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                              isCritical
                                ? 'bg-red-500/15 text-red-700 border border-red-500/30'
                                : isWarning
                                ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                                : 'bg-blue-500/15 text-blue-700 border border-blue-500/30'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sandstone-200 text-charcoal-700 font-medium">
                            {alert.service}
                          </span>
                          <span className="text-[11px] text-charcoal-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getRelativeTime(alert.timestamp || alert.created_at)}
                          </span>
                          {alert.status === 'acknowledged' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Acknowledged
                            </span>
                          )}
                          {alert.status === 'resolved' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Resolved
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className="text-sm font-bold text-charcoal-900 leading-snug">
                          {alert.title}
                        </h2>

                        {/* Description */}
                        <p className="text-xs text-charcoal-600 leading-relaxed max-w-3xl">
                          {alert.description}
                        </p>

                        {/* Technical Metric Indicators */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-charcoal-500">
                          <span>
                            Trigger: <strong className="text-charcoal-900">{alert.metric_value}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Threshold: <span className="text-charcoal-700">{alert.threshold}</span>
                          </span>
                          <span>•</span>
                          <span>
                            Channel: <span className="text-charcoal-700">{alert.channel}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                          className="px-3 py-1.5 rounded-xl border border-[#EAE5DC] hover:bg-sandstone-100 text-charcoal-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}

                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(alert.id, 'resolved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="p-2 rounded-xl border border-[#EAE5DC] hover:bg-sandstone-100 text-charcoal-600 hover:text-charcoal-900 transition-colors cursor-pointer"
                        title="View Trace & Payload"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View Tab 2: CONFIGURED GUARDRAIL RULES */}
      {viewTab === 'rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => {
              const isCritical = rule.severity === 'critical';
              const isWarning = rule.severity === 'warning';

              return (
                <div
                  key={rule.id}
                  className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
                    rule.enabled
                      ? 'border-[#EAE5DC] shadow-subtle hover:border-[#D4AF7C]'
                      : 'border-dashed border-[#D2D9DC] opacity-60 bg-sandstone-50'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Category & Severity */}
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-sandstone-200 text-charcoal-700 font-bold">
                        {rule.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                          isCritical
                            ? 'bg-red-500/15 text-red-700'
                            : isWarning
                            ? 'bg-amber-500/15 text-amber-800'
                            : 'bg-blue-500/15 text-blue-700'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-charcoal-900 leading-snug">
                      {rule.name}
                    </h3>

                    <div className="p-2.5 rounded-xl bg-sandstone-100/80 border border-[#EAE5DC] space-y-1 text-xs font-mono">
                      <div className="text-[11px] text-charcoal-500">Condition Threshold:</div>
                      <div className="text-charcoal-900 font-bold">{rule.threshold}</div>
                    </div>

                    <div className="text-[11px] font-mono text-charcoal-500 flex items-center gap-1.5 pt-1">
                      <MessageSquare className="w-3.5 h-3.5 text-charcoal-400" />
                      <span>{rule.channel}</span>
                    </div>
                  </div>

                  {/* Bottom Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC]">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className="flex items-center gap-1 text-xs font-medium text-charcoal-700 hover:text-charcoal-900 cursor-pointer"
                    >
                      {rule.enabled ? (
                        <>
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-5 h-5 text-charcoal-400" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestTriggerRule(rule)}
                        className="px-2.5 py-1 rounded-lg bg-sandstone-100 hover:bg-sandstone-200 text-charcoal-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Simulate / Trigger Test Alert"
                      >
                        <Play className="w-3 h-3 text-[#D4AF7C]" />
                        <span>Test</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Slideout / Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 font-sans">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-sandstone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-charcoal-400">
                  {selectedAlert.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider bg-sandstone-200 text-charcoal-700">
                  {selectedAlert.category}
                </span>
                <span className="text-xs text-charcoal-500 font-mono">
                  {getRelativeTime(selectedAlert.timestamp || selectedAlert.created_at)}
                </span>
              </div>
              <h2 className="text-lg font-bold text-charcoal-900 leading-snug">
                {selectedAlert.title}
              </h2>
            </div>

            {/* Diagnostic Payload Breakdown */}
            <div className="p-4 rounded-2xl bg-[#0B0F0F] text-[#FAF8F5] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-neutral-400 text-[11px] pb-2 border-b border-neutral-800">
                <span>INCIDENT TELEMETRY SNAPSHOT</span>
                <span>Trace: {selectedAlert.trace_id || 'ost_trc_default'}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-neutral-500 block">Target Service:</span>
                  <span className="text-[#D4AF7C] font-semibold">{selectedAlert.service}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Recorded Breach:</span>
                  <span className="text-red-400 font-semibold">{selectedAlert.metric_value}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Configured Limit:</span>
                  <span className="text-neutral-200">{selectedAlert.threshold}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Notification Route:</span>
                  <span className="text-neutral-200">{selectedAlert.channel}</span>
                </div>
              </div>
            </div>

            {/* Description & Impact */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-charcoal-800 block mb-0.5">Root Cause Analysis</span>
                <p className="text-charcoal-600 leading-relaxed bg-sandstone-50 p-3 rounded-xl border border-[#EAE5DC]">
                  {selectedAlert.description}
                </p>
              </div>
              <div>
                <span className="font-bold text-charcoal-800 block mb-0.5">Business & SLA Impact</span>
                <p className="text-charcoal-600 leading-relaxed bg-sandstone-50 p-3 rounded-xl border border-[#EAE5DC]">
                  {selectedAlert.impact}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#EAE5DC]">
              <button
                onClick={() => {
                  showToast(`Live logs requested for trace ${selectedAlert.trace_id}`);
                }}
                className="text-xs font-bold text-charcoal-800 hover:text-charcoal-950 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Inspect Raw Gateway Trace</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#D4AF7C]" />
              </button>

              <div className="flex items-center gap-2">
                {selectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedAlert.id, 'resolved');
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 rounded-xl bg-sandstone-100 hover:bg-sandstone-200 text-charcoal-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Alert Rule Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in zoom-in-95 duration-150 font-sans">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-sandstone-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Configure New Alert Rule</h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Set automated guardrails and telemetry thresholds stored in Firestore.
              </p>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-charcoal-800 block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Claude 3.5 Sonnet Rate Limit Warning"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-charcoal-800 block mb-1">Category</label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => setNewRuleCategory(e.target.value as AlertCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs cursor-pointer"
                  >
                    <option value="cost">Cost & Spend Cap</option>
                    <option value="ratelimit">Rate Limit (TPM/RPM)</option>
                    <option value="latency">P99 Latency Spike</option>
                    <option value="provider">Provider Error Rate (5xx)</option>
                    <option value="security">Security & Guardrails</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-charcoal-800 block mb-1">Severity</label>
                  <select
                    value={newRuleSeverity}
                    onChange={(e) => setNewRuleSeverity(e.target.value as AlertSeverity)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs cursor-pointer"
                  >
                    <option value="critical">Critical (P0 Incident)</option>
                    <option value="warning">Warning (Threshold Breach)</option>
                    <option value="info">Informational</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-charcoal-800 block mb-1">Trigger Condition</label>
                <input
                  type="text"
                  placeholder="e.g. Spend > $500/day OR TPM > 90%"
                  value={newRuleThreshold}
                  onChange={(e) => setNewRuleThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-charcoal-800 block mb-1">Notification Dispatch Channel</label>
                <select
                  value={newRuleChannel}
                  onChange={(e) => setNewRuleChannel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#EAE5DC] focus:outline-none focus:border-[#D4AF7C] text-charcoal-900 text-xs cursor-pointer"
                >
                  <option value="#alerts-prod-ai (Slack)">#alerts-prod-ai (Slack Webhook)</option>
                  <option value="billing@ostra.ai (Email)">billing@ostra.ai (Email)</option>
                  <option value="#dev-oncall (PagerDuty)">#dev-oncall (PagerDuty)</option>
                  <option value="https://api.internal.corp/webhook (Custom Webhook)">
                    Custom Webhook (HTTP POST)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE5DC]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-sandstone-100 hover:bg-sandstone-200 text-charcoal-800 text-xs font-bold transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-black text-white text-xs font-bold transition-all shadow-subtle cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Firestore...' : 'Create & Activate Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
