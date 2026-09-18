import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { LocalTaskRecord } from '../../types';
import { MonthGrid } from './MonthGrid';
import { TaskSidebar } from './TaskSidebar';
import { TaskModal } from './TaskModal';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const CalendarPage: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Tasks state
  const [tasks, setTasks] = useState<LocalTaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string>('');
  const [taskToEdit, setTaskToEdit] = useState<LocalTaskRecord | null>(null);

  // Month string format: YYYY-MM
  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  // Fetch tasks from local daemon API
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks?month=${monthKey}`, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.warn('Failed to fetch local tasks from daemon:', err);
    } finally {
      setIsLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Navigate Months
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

  // Keyboard Navigation: 'T' for task modal, Left/Right arrows for month flip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is actively typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
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

  // Open modal for new task
  const handleOpenNewTask = (dateStr?: string) => {
    setTaskToEdit(null);
    setModalInitialDate(dateStr || selectedDate);
    setIsModalOpen(true);
  };

  // Open modal to edit existing task
  const handleEditTask = (task: LocalTaskRecord) => {
    setTaskToEdit(task);
    setModalInitialDate(task.targetDate);
    setIsModalOpen(true);
  };

  // Save task (Create or Edit) with optimistic update
  const handleSaveTask = async (taskData: Partial<LocalTaskRecord>) => {
    if (taskToEdit) {
      // Optimistic update
      const updatedList = tasks.map((t) =>
        t.id === taskToEdit.id ? ({ ...t, ...taskData, updatedAt: Date.now() } as LocalTaskRecord) : t
      );
      setTasks(updatedList);

      try {
        await fetch(`/api/tasks/${taskToEdit.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
          credentials: 'same-origin',
        });
      } catch (err) {
        console.error('Failed to update task:', err);
        fetchTasks();
      }
    } else {
      // Optimistic create
      const tempId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = Date.now();
      const newTask: LocalTaskRecord = {
        id: tempId,
        title: taskData.title || 'Untitled Task',
        description: taskData.description || null,
        targetDate: taskData.targetDate || selectedDate,
        targetTime: taskData.targetTime || null,
        tokenBudgetUsd: taskData.tokenBudgetUsd || 0,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        createdAt: now,
        updatedAt: now,
      };

      setTasks((prev) => [...prev, newTask]);

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask),
          credentials: 'same-origin',
        });
        if (res.ok) {
          const json = await res.json();
          // Update temp ID with real ID from server if different
          if (json.task?.id) {
            setTasks((prev) =>
              prev.map((t) => (t.id === tempId ? json.task : t))
            );
          }
        }
      } catch (err) {
        console.error('Failed to create task:', err);
        fetchTasks();
      }
    }
  };

  // Toggle status between todo and completed
  const handleToggleStatus = async (task: LocalTaskRecord) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchTasks();
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks();
    }
  };

  // Month-wide metrics
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'in_progress').length;
  const totalMonthBudget = tasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900">
              Calendar & Tasks
            </h1>
            <span className="text-[10px] font-mono uppercase bg-[#E5F2EB] text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Local SQLite
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Schedule coding sessions, Cursor refactors, agent runs, and track local token spending caps.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* View Toggle */}
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

          {/* + Add Task Button */}
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

      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks Card */}
        <div className="bg-white border border-[#EAE4D8] rounded-2xl p-4 shadow-subtle flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
              Month Tasks
            </div>
            <div className="text-2xl font-extrabold text-charcoal-900 mt-1">
              {tasks.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-center text-charcoal-700">
            <Layers className="w-5 h-5 text-emerald-800" />
          </div>
        </div>

        {/* Completed Tasks Card */}
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

        {/* In Progress Card */}
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

        {/* Budget Cap Card */}
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

      {/* Month Navigation & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#EAE4D8] rounded-2xl px-5 py-3 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-center text-[#0C2419]">
            <CalendarIcon className="w-4 h-4 text-emerald-800" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-charcoal-900">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Grid: Month Calendar (8 cols) + Daily Agenda Sidebar (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="xl:col-span-8">
          <MonthGrid
            currentYear={currentYear}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            tasks={tasks}
            onSelectDate={setSelectedDate}
            onOpenNewTaskModal={handleOpenNewTask}
          />
        </div>

        {/* Daily Task Sidebar (4 cols) */}
        <div className="xl:col-span-4">
          <TaskSidebar
            selectedDate={selectedDate}
            tasks={tasks}
            onToggleStatus={handleToggleStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onOpenNewTaskModal={handleOpenNewTask}
          />
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialDate={modalInitialDate}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
