import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
  Search,
  Trash2,
  Edit2,
  Flag,
  CheckSquare,
  Cpu,
  X
} from 'lucide-react';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  targetDate: string; // YYYY-MM-DD
  targetTime?: string; // HH:mm
  tokenBudgetUsd: number;
  priority: TaskPriority;
  status: TaskStatus;
  model?: string;
  createdAt: number;
  updatedAt: number;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const INITIAL_TASKS: CalendarTask[] = [
  {
    id: 'task_1',
    title: 'Refactor Auth Middleware with Cursor (Claude 3.7 Sonnet)',
    description: 'Enforce JWT rotation, rate limiting, and token caching.',
    targetDate: '2026-09-15',
    targetTime: '10:00',
    tokenBudgetUsd: 1.50,
    priority: 'high',
    status: 'in_progress',
    model: 'Claude 3.7 Sonnet',
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
  {
    id: 'task_2',
    title: 'Analyze Token Burn Rates & Provider Latency',
    description: 'Export telemetry dataset and test fallback failover to Haiku.',
    targetDate: '2026-09-15',
    targetTime: '14:30',
    tokenBudgetUsd: 0.80,
    priority: 'medium',
    status: 'todo',
    model: 'GPT-4o',
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now(),
  },
  {
    id: 'task_3',
    title: 'Setup Streaming Guardrail Sentinel in CI/CD',
    description: 'Add circuit breaker tests and test budget limits on GitHub Actions.',
    targetDate: '2026-09-16',
    targetTime: '11:00',
    tokenBudgetUsd: 2.00,
    priority: 'urgent',
    status: 'todo',
    model: 'Claude 3.5 Sonnet',
    createdAt: Date.now() - 36000000,
    updatedAt: Date.now(),
  },
  {
    id: 'task_4',
    title: 'Evaluate Gemini 2.0 Flash for Summarization',
    description: 'Benchmark cost vs latency on 100K context payloads.',
    targetDate: '2026-09-18',
    targetTime: '16:00',
    tokenBudgetUsd: 0.50,
    priority: 'low',
    status: 'todo',
    model: 'Gemini 2.0 Flash',
    createdAt: Date.now() - 20000000,
    updatedAt: Date.now(),
  },
  {
    id: 'task_5',
    title: 'Weekly Cost Optimization Audit',
    description: 'Verify all staging projects are capped at $50/mo.',
    targetDate: '2026-09-12',
    targetTime: '09:30',
    tokenBudgetUsd: 0.20,
    priority: 'medium',
    status: 'completed',
    model: 'Claude 3.5 Haiku',
    createdAt: Date.now() - 200000000,
    updatedAt: Date.now(),
  },
  {
    id: 'task_6',
    title: 'Deploy OsterdOps Guard v2.0 to Staging Cluster',
    description: 'Verify loopback binding and local SQLite WAL performance.',
    targetDate: '2026-09-14',
    targetTime: '15:00',
    tokenBudgetUsd: 1.20,
    priority: 'high',
    status: 'completed',
    model: 'GPT-4o',
    createdAt: Date.now() - 150000000,
    updatedAt: Date.now(),
  }
];

export const CalendarView: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Tasks state with LocalStorage persistence & initial mock data
  const [tasks, setTasks] = useState<CalendarTask[]>(() => {
    try {
      const saved = localStorage.getItem('osterdops_calendar_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('osterdops_calendar_tasks', JSON.stringify(tasks));
    } catch {
      // Ignored
    }
  }, [tasks]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string>('');
  const [taskToEdit, setTaskToEdit] = useState<CalendarTask | null>(null);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  // Keyboard navigation: 'T' for task modal, Left/Right for month flip, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTaskToEdit(null);
        setModalInitialDate(selectedDate);
        setIsModalOpen(true);
      } else if (e.key === 'ArrowLeft') {
        handlePrevMonth();
      } else if (e.key === 'ArrowRight') {
        handleNextMonth();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, currentMonth]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.model?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;

      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  // Month-wide metrics
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTasks = useMemo(() => {
    return tasks.filter((t) => t.targetDate.startsWith(monthKey));
  }, [tasks, monthKey]);

  const completedTasksCount = monthTasks.filter((t) => t.status === 'completed').length;
  const inProgressTasksCount = monthTasks.filter((t) => t.status === 'in_progress').length;
  const totalMonthBudget = monthTasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0);

  // Selected date tasks
  const selectedDateTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.targetDate === selectedDate);
  }, [filteredTasks, selectedDate]);

  const selectedDateBudget = selectedDateTasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0);
  const selectedDateCompleted = selectedDateTasks.filter((t) => t.status === 'completed').length;

  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return 'Select a date';
    const [year, month, day] = selectedDate.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Task actions
  const handleToggleStatus = (task: CalendarTask) => {
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, updatedAt: Date.now() } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleOpenNewTask = (dateStr?: string) => {
    setTaskToEdit(null);
    setModalInitialDate(dateStr || selectedDate);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: CalendarTask) => {
    setTaskToEdit(task);
    setModalInitialDate(task.targetDate);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Partial<CalendarTask>) => {
    if (taskToEdit) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskToEdit.id ? ({ ...t, ...taskData, updatedAt: Date.now() } as CalendarTask) : t
        )
      );
    } else {
      const newTask: CalendarTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        targetDate: taskData.targetDate || selectedDate,
        targetTime: taskData.targetTime || '',
        tokenBudgetUsd: taskData.tokenBudgetUsd || 0,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        model: taskData.model || 'Claude 3.7 Sonnet',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  // Calendar cells generation
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
    const todayStr = new Date().toISOString().split('T')[0];

    const tasksByDate = new Map<string, CalendarTask[]>();
    filteredTasks.forEach((t) => {
      const list = tasksByDate.get(t.targetDate) || [];
      list.push(t);
      tasksByDate.set(t.targetDate, list);
    });

    const cells = [];
    for (let i = 0; i < totalCells; i++) {
      let year = currentYear;
      let month = currentMonth;
      let dayNumber: number;
      let isCurrentMonth = true;

      if (i < firstDayOfMonth) {
        isCurrentMonth = false;
        dayNumber = daysInPrevMonth - (firstDayOfMonth - i - 1);
        if (month === 0) {
          month = 11;
          year -= 1;
        } else {
          month -= 1;
        }
      } else if (i >= firstDayOfMonth + daysInMonth) {
        isCurrentMonth = false;
        dayNumber = i - (firstDayOfMonth + daysInMonth) + 1;
        if (month === 11) {
          month = 0;
          year += 1;
        } else {
          month += 1;
        }
      } else {
        dayNumber = i - firstDayOfMonth + 1;
      }

      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(dayNumber).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;
      const dayTasks = tasksByDate.get(dateKey) || [];

      cells.push({
        dateKey,
        dayNumber,
        isCurrentMonth,
        isToday: dateKey === todayStr,
        isSelected: dateKey === selectedDate,
        tasks: dayTasks,
      });
    }
    return cells;
  }, [currentYear, currentMonth, selectedDate, filteredTasks]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
              Calendar & Task Management
            </h1>
            <span className="text-[10px] font-mono uppercase bg-[#E5F2EB] text-[#0C2419] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Solo & Team Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Plan scheduled Cursor refactors, AI agent jobs, token budget limits, and sprint deadlines.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Month / Week View Toggle */}
          <div className="flex items-center bg-white border border-[#EAE4D8] rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#0C2419] text-white shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[#0C2419] text-white shadow-2xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Week
            </button>
          </div>

          {/* + New Task Trigger */}
          <button
            onClick={() => handleOpenNewTask()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Task</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-white/20 rounded text-[10px] font-mono">
              T
            </kbd>
          </button>
        </div>
      </div>

      {/* 2. Top Summary Stat Cards (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Month Tasks */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
              {MONTH_NAMES[currentMonth]} Tasks
            </div>
            <div className="text-2xl font-extrabold text-charcoal-900 mt-1">
              {monthTasks.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-center text-charcoal-700">
            <Layers className="w-5 h-5 text-emerald-800" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl font-extrabold text-emerald-800 mt-1">
              {completedTasksCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E5F2EB] text-emerald-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
              In Progress
            </div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {inProgressTasksCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Token Budget Cap */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
              Total Budget Cap
            </div>
            <div className="text-2xl font-extrabold text-charcoal-900 font-mono mt-1">
              ${totalMonthBudget.toFixed(2)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-center text-charcoal-700">
            <DollarSign className="w-5 h-5 text-emerald-700" />
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Month Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#EAE4D8] rounded-2xl p-3 sm:px-5 shadow-subtle">
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-center text-[#0C2419]">
            <CalendarIcon className="w-4 h-4 text-emerald-800" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-charcoal-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-xl border border-[#EAE4D8] bg-[#FAF8F5] hover:bg-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Previous month (← key)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-xl border border-[#EAE4D8] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-charcoal-700 transition-colors cursor-pointer shadow-2xs"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-xl border border-[#EAE4D8] bg-[#FAF8F5] hover:bg-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Next month (→ key)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-lg justify-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks, models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-9 pr-3 py-1.5 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs transition-all"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-charcoal-700 focus:outline-none focus:border-[#0C2419] shadow-2xs cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-charcoal-700 focus:outline-none focus:border-[#0C2419] shadow-2xs cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* 4. Main Grid: Month Calendar (8 cols) + Daily Agenda Sidebar (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: 7-Column Calendar Grid (8 cols) */}
        <div className="xl:col-span-8">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl shadow-subtle overflow-hidden">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-[#EAE4D8] bg-[#FAF8F5] text-center select-none">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w, idx) => (
                <div
                  key={w}
                  className={`py-3 text-[11px] font-bold tracking-wider uppercase ${
                    idx === 0 || idx === 6 ? 'text-charcoal-400' : 'text-charcoal-600'
                  }`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-[#F2EDE4] bg-[#FAF8F5]/20">
              {calendarCells.map((cell) => {
                const visibleTasks = cell.tasks.slice(0, 2);
                const overflowCount = cell.tasks.length - visibleTasks.length;

                return (
                  <div
                    key={cell.dateKey}
                    onClick={() => setSelectedDate(cell.dateKey)}
                    onDoubleClick={() => handleOpenNewTask(cell.dateKey)}
                    className={`min-h-[110px] sm:min-h-[125px] p-2 flex flex-col justify-between transition-all cursor-pointer group relative ${
                      cell.isCurrentMonth ? 'bg-white' : 'bg-[#FAF8F5]/60 text-charcoal-400'
                    } ${
                      cell.isSelected
                        ? 'ring-2 ring-[#0C2419] ring-inset bg-emerald-50/20'
                        : 'hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {/* Header: Day number + Quick add */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-semibold ${
                          cell.isToday
                            ? 'bg-[#0C2419] text-white font-bold shadow-2xs'
                            : cell.isSelected
                            ? 'text-emerald-900 font-bold bg-emerald-100/60'
                            : cell.isCurrentMonth
                            ? 'text-charcoal-800'
                            : 'text-charcoal-400'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNewTask(cell.dateKey);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center bg-[#E5F2EB] hover:bg-[#D4E8DC] text-[#0C2419] transition-opacity shadow-2xs"
                        title="Add task on this date"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Task Badges */}
                    <div className="space-y-1 my-1 flex-1 overflow-hidden">
                      {visibleTasks.map((t) => {
                        const isCompleted = t.status === 'completed';
                        const isInProgress = t.status === 'in_progress';

                        return (
                          <div
                            key={t.id}
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center gap-1 border transition-all ${
                              isCompleted
                                ? 'bg-[#E5F2EB]/80 border-emerald-200 text-emerald-900 line-through opacity-80'
                                : isInProgress
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : t.priority === 'urgent'
                                ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                                : 'bg-[#FAF8F5] border-[#EAE4D8] text-charcoal-800'
                            }`}
                            title={`${t.title} (${t.priority} priority, ${t.status})`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            ) : isInProgress ? (
                              <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                            ) : (
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  t.priority === 'urgent'
                                    ? 'bg-rose-500'
                                    : t.priority === 'high'
                                    ? 'bg-amber-500'
                                    : 'bg-charcoal-400'
                                }`}
                              />
                            )}
                            <span className="truncate">{t.title}</span>
                            {t.tokenBudgetUsd > 0 && (
                              <span className="text-[9px] font-mono text-charcoal-500 shrink-0">
                                ${t.tokenBudgetUsd.toFixed(1)}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {overflowCount > 0 && (
                        <div className="text-[9.5px] font-semibold text-emerald-800 bg-[#E5F2EB] px-1.5 py-0.5 rounded text-center">
                          +{overflowCount} more
                        </div>
                      )}
                    </div>

                    {/* Bottom Spend Cap Summary */}
                    {cell.tasks.length > 0 && (
                      <div className="flex items-center justify-between text-[9px] font-mono text-charcoal-400 pt-0.5 border-t border-[#F5F2EB]">
                        <span>{cell.tasks.length} task{cell.tasks.length > 1 ? 's' : ''}</span>
                        {cell.tasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0) > 0 && (
                          <span className="text-emerald-800 font-semibold flex items-center">
                            <DollarSign className="w-2 h-2" />
                            {cell.tasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Daily Agenda & Task Drawer (4 cols) */}
        <div className="xl:col-span-4">
          <div className="bg-white border border-[#EAE4D8] rounded-2xl shadow-subtle p-5 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#F2EDE4] pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Daily Agenda</span>
                </div>
                <h3 className="text-base font-bold text-charcoal-900 mt-0.5">
                  {formattedSelectedDate}
                </h3>
              </div>

              <button
                onClick={() => handleOpenNewTask(selectedDate)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>New Task</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5 text-center">
                <div className="text-[10px] font-mono text-charcoal-500 uppercase">Tasks</div>
                <div className="text-sm font-bold text-charcoal-900">{selectedDateTasks.length}</div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5 text-center">
                <div className="text-[10px] font-mono text-charcoal-500 uppercase">Done</div>
                <div className="text-sm font-bold text-emerald-800">
                  {selectedDateCompleted}/{selectedDateTasks.length}
                </div>
              </div>
              <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5 text-center">
                <div className="text-[10px] font-mono text-charcoal-500 uppercase">Budget Cap</div>
                <div className="text-sm font-bold text-charcoal-900 font-mono">
                  ${selectedDateBudget.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Tasks list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
                <span>Scheduled Items</span>
                <span>{selectedDateTasks.length} Total</span>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div className="py-8 px-4 text-center border-2 border-dashed border-[#EAE4D8] rounded-xl space-y-2 bg-[#FAF8F5]/50">
                  <CheckSquare className="w-8 h-8 text-charcoal-300 mx-auto" />
                  <p className="text-xs font-semibold text-charcoal-700">
                    No tasks scheduled for this day
                  </p>
                  <p className="text-[11px] text-charcoal-400">
                    Click "+ New Task" or press <kbd className="px-1.5 py-0.5 bg-white border border-[#E8E2D5] rounded text-[10px] font-mono">T</kbd> to schedule.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {selectedDateTasks.map((task) => {
                    const isCompleted = task.status === 'completed';
                    const isInProgress = task.status === 'in_progress';

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                          isCompleted
                            ? 'bg-[#FAF8F5]/60 border-[#EAE4D8] opacity-75'
                            : isInProgress
                            ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                            : 'bg-white border-[#EAE4D8] shadow-2xs hover:border-[#0C2419]/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          {/* Status Checkbox & Title */}
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleStatus(task)}
                              className="mt-0.5 text-charcoal-400 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                              title={isCompleted ? 'Mark as todo' : 'Mark as completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-charcoal-300" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div
                                className={`text-xs font-bold text-charcoal-900 leading-snug ${
                                  isCompleted ? 'line-through text-charcoal-500' : ''
                                }`}
                              >
                                {task.title}
                              </div>
                              {task.description && (
                                <p className="text-[11px] text-charcoal-500 mt-1 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                              title="Edit task"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-[#F2EDE4]/60 text-[10.5px]">
                          {task.targetTime && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE4D8] text-charcoal-600 font-mono">
                              <Clock className="w-3 h-3 text-charcoal-400" />
                              <span>{task.targetTime}</span>
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold capitalize border ${
                              task.priority === 'urgent'
                                ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                                : task.priority === 'high'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : task.priority === 'medium'
                                ? 'bg-sky-50 border-sky-200 text-sky-800'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {task.priority} Priority
                          </span>

                          {task.model && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#EAE4D8] text-charcoal-600 font-sans">
                              <Cpu className="w-3 h-3 text-charcoal-400" />
                              <span>{task.model}</span>
                            </span>
                          )}

                          {task.tokenBudgetUsd > 0 && (
                            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[#E5F2EB] border border-emerald-200 text-emerald-900 font-semibold font-mono">
                              <DollarSign className="w-3 h-3 text-emerald-700" />
                              <span>{task.tokenBudgetUsd.toFixed(2)} Cap</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Pro Tip */}
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Developer Shortcuts</span>
              </div>
              <p className="text-[11px] text-charcoal-500 leading-relaxed">
                Press <kbd className="px-1 py-0.5 bg-white border border-[#E8E2D5] rounded text-[9.5px] font-mono">T</kbd> for instant new task, <kbd className="px-1 py-0.5 bg-white border border-[#E8E2D5] rounded text-[9.5px] font-mono">←</kbd>/<kbd className="px-1 py-0.5 bg-white border border-[#E8E2D5] rounded text-[9.5px] font-mono">→</kbd> for month flipping.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Create / Edit Task Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white border border-[#EAE4D8] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE4D8] bg-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5F2EB] text-[#0C2419] flex items-center justify-center font-bold">
                  <CalendarIcon className="w-4 h-4 text-emerald-800" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal-900">
                    {taskToEdit ? 'Edit Scheduled Task' : 'New Coding / Agent Task'}
                  </h3>
                  <p className="text-[11px] text-charcoal-500">
                    Schedule Cursor sessions, benchmarks, and token spending caps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-[#F2EDE4] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <TaskModalForm
              taskToEdit={taskToEdit}
              initialDate={modalInitialDate || selectedDate}
              onClose={() => setIsModalOpen(false)}
              onSave={(data) => {
                handleSaveTask(data);
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskModalFormProps {
  taskToEdit: CalendarTask | null;
  initialDate: string;
  onClose: () => void;
  onSave: (data: Partial<CalendarTask>) => void;
}

const TaskModalForm: React.FC<TaskModalFormProps> = ({
  taskToEdit,
  initialDate,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [targetDate, setTargetDate] = useState(taskToEdit?.targetDate || initialDate);
  const [targetTime, setTargetTime] = useState(taskToEdit?.targetTime || '');
  const [tokenBudgetUsd, setTokenBudgetUsd] = useState(
    taskToEdit?.tokenBudgetUsd?.toFixed(2) || '1.00'
  );
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || 'todo');
  const [model, setModel] = useState(taskToEdit?.model || 'Claude 3.7 Sonnet');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || '',
      targetDate: targetDate.trim(),
      targetTime: targetTime.trim() || '',
      tokenBudgetUsd: parseFloat(tokenBudgetUsd) || 0,
      priority,
      status,
      model,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
          Task Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Refactor auth middleware with Cursor (Claude 3.7 Sonnet)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3.5 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all shadow-2xs font-sans"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
          Description / Instructions
        </label>
        <textarea
          rows={2}
          placeholder="Optional notes, prompt strategy, or agent command..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3.5 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all shadow-2xs resize-none font-sans"
        />
      </div>

      {/* Date & Time Row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Target Date <span className="text-rose-500">*</span></span>
          </label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Slot / Time</span>
          </label>
          <input
            type="time"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans"
          />
        </div>
      </div>

      {/* Model & Token Budget Cap */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Target AI Model</span>
          </label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-800 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans cursor-pointer"
          >
            <option value="Claude 3.7 Sonnet">Claude 3.7 Sonnet</option>
            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
            <option value="Claude 3.5 Haiku">Claude 3.5 Haiku</option>
            <option value="GPT-4o">GPT-4o</option>
            <option value="GPT-4o mini">GPT-4o mini</option>
            <option value="o1-preview">o1-preview</option>
            <option value="Gemini 2.0 Flash">Gemini 2.0 Flash</option>
            <option value="DeepSeek-R1">DeepSeek-R1</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
            <span>Token Budget Cap ($)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal-400">
              $
            </span>
            <input
              type="number"
              step="0.10"
              min="0"
              placeholder="1.00"
              value={tokenBudgetUsd}
              onChange={(e) => setTokenBudgetUsd(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-8 pr-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans"
            />
          </div>
        </div>
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Priority</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(['low', 'medium', 'high', 'urgent'] as TaskPriority[]).map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-semibold capitalize border transition-all cursor-pointer text-center ${
                    isSelected
                      ? p === 'urgent'
                        ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-2xs'
                        : p === 'high'
                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                        : p === 'medium'
                        ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-2xs'
                        : 'bg-[#E5F2EB] border-emerald-300 text-emerald-800 shadow-2xs'
                      : 'bg-white border-[#EAE4D8] text-charcoal-600 hover:bg-[#FAF8F5]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-charcoal-500" />
            <span>Status</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-800 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans cursor-pointer"
          >
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#F2EDE4]">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-[#EAE4D8] text-xs font-semibold text-charcoal-700 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
        </button>
      </div>
    </form>
  );
};
