import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  Circle,
  AlertCircle,
  Trash2,
  Edit2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import type { LocalTaskRecord, TaskPriority, TaskStatus } from '../types';
import { TaskModal } from './Calendar/TaskModal';

interface TasksPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const TasksPage: React.FC<TasksPageProps> = ({ onNavigateTab }) => {
  const [tasks, setTasks] = useState<LocalTaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<LocalTaskRecord | null>(null);

  // Fetch all tasks from daemon API
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.warn('Failed to fetch tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Quick toggle status: todo -> in_progress -> completed -> todo
  const handleToggleStatus = async (task: LocalTaskRecord) => {
    const nextStatus: TaskStatus =
      task.status === 'todo'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'completed'
        : 'todo';

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, updatedAt: Date.now() } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
      fetchTasks();
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks();
    }
  };

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const totalBudget = tasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0);

  return (
    <div className="space-y-6 font-sans animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
              Tasks &amp; Scheduled Workflows
            </h1>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E5F2EB] text-[#0C2419]">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1 max-w-2xl">
            Schedule autonomous refactors, assign model spending limits per task, and monitor completion progress.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600">Total Tasks</span>
            <div className="w-8 h-8 rounded-full bg-[#E5F2EB] text-[#0C2419] flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-[#0E432F]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-charcoal-900">
              {totalCount}
            </div>
            <span className="text-[11px] text-charcoal-500">
              {tasks.filter((t) => t.status === 'todo').length} pending in queue
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600">In Progress</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-charcoal-900">
              {inProgressCount}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              Currently executing agents
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600">Completed</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-charcoal-900">
              {completedCount}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold font-mono">
              {totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}% completion rate` : '0% done'}
            </span>
          </div>
        </div>

        {/* Committed Budget */}
        <div className="bg-white rounded-2xl p-5 border border-[#EAE4D8] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-600">Committed Budget</span>
            <div className="w-8 h-8 rounded-full bg-[#E5F2EB] text-[#0C2419] flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-[#0E432F]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-charcoal-900">
              ${totalBudget.toFixed(2)}
            </div>
            <span className="text-[11px] text-charcoal-500">
              cumulative token spend limit
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EAE4D8] shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['all', 'todo', 'in_progress', 'completed'] as const).map((s) => {
            const isActive = statusFilter === s;
            const label =
              s === 'all'
                ? 'All Tasks'
                : s === 'todo'
                ? 'Todo'
                : s === 'in_progress'
                ? 'In Progress'
                : 'Completed';

            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0C2419] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-charcoal-600 hover:bg-[#F0ECE1]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search & Priority Select */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] font-sans"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-1.5 text-xs font-semibold text-charcoal-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Task List / Cards */}
      <div className="bg-white rounded-2xl border border-[#EAE4D8] shadow-subtle divide-y divide-[#F5F2EB] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal-400">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E5F2EB] flex items-center justify-center text-[#0C2419] mx-auto">
              <CheckSquare className="w-6 h-6 text-emerald-800" />
            </div>
            <h3 className="text-sm font-bold text-charcoal-900">No tasks found</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks match your current filter settings.'
                : 'Get started by creating your first scheduled coding refactor or autonomous token task.'}
            </p>
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';

            const priorityBadge =
              task.priority === 'high'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : task.priority === 'medium'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200';

            const statusBadge = isCompleted
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isInProgress
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={task.id}
                onClick={() => handleToggleStatus(task)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-[#FAF8F5] transition-colors cursor-pointer group ${
                  isCompleted ? 'opacity-70 bg-[#FAF8F5]/50' : ''
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(task);
                    }}
                    className="mt-0.5 text-charcoal-400 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                    title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : isInProgress ? (
                      <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                    ) : (
                      <Circle className="w-5 h-5 text-charcoal-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold text-charcoal-900 tracking-tight ${
                          isCompleted ? 'line-through text-charcoal-500' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${priorityBadge}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border capitalize ${statusBadge}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-charcoal-600 leading-relaxed max-w-3xl">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata Row: Date, Time, Budget */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-charcoal-500 pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                        <span>{task.targetDate}</span>
                        {task.targetTime && <span>at {task.targetTime}</span>}
                      </div>

                      <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                        <span>${task.tokenBudgetUsd.toFixed(2)} USD limit</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToEdit(task);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-charcoal-500 hover:text-charcoal-900 hover:bg-[#F0ECE1] rounded-lg transition-colors cursor-pointer"
                    title="Edit Task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="p-1.5 text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
          fetchTasks();
        }}
        initialDate={new Date().toISOString().split('T')[0]}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
