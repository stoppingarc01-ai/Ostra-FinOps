import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import type { LocalTaskRecord } from '../../types';

interface TaskSidebarProps {
  selectedDate: string; // Format: YYYY-MM-DD
  tasks: LocalTaskRecord[];
  onToggleStatus: (task: LocalTaskRecord) => void;
  onEditTask: (task: LocalTaskRecord) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: (dateStr: string) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
  selectedDate,
  tasks,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
}) => {
  // Format selected date
  const formattedDate = React.useMemo(() => {
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

  // Tasks for selected date
  const dayTasks = React.useMemo(() => {
    return tasks.filter((t) => t.targetDate === selectedDate);
  }, [tasks, selectedDate]);

  const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
  const totalBudget = dayTasks.reduce((sum, t) => sum + (t.tokenBudgetUsd || 0), 0);

  return (
    <div className="bg-white border border-[#EAE4D8] rounded-2xl shadow-subtle p-5 font-sans space-y-5">
      {/* Sidebar Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#F2EDE4] pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Daily Agenda</span>
          </div>
          <h3 className="text-base font-bold text-charcoal-900 mt-0.5">
            {formattedDate}
          </h3>
        </div>

        <button
          onClick={() => onOpenNewTaskModal(selectedDate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C2419] hover:bg-[#143B2A] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Date Metrics Pill Row */}
      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5 text-center">
          <div className="text-[10px] font-mono text-charcoal-500 uppercase">Tasks</div>
          <div className="text-sm font-bold text-charcoal-900">{dayTasks.length}</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5 text-center">
          <div className="text-[10px] font-mono text-charcoal-500 uppercase">Done</div>
          <div className="text-sm font-bold text-emerald-800">
            {completedCount}/{dayTasks.length}
          </div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl p-2.5 text-center">
          <div className="text-[10px] font-mono text-charcoal-500 uppercase">Budget Cap</div>
          <div className="text-sm font-bold text-charcoal-900 font-mono">
            ${totalBudget.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">
          <span>Scheduled Items</span>
          <span>{dayTasks.length} Total</span>
        </div>

        {dayTasks.length === 0 ? (
          <div className="py-8 px-4 text-center border-2 border-dashed border-[#EAE4D8] rounded-xl space-y-2 bg-[#FAF8F5]/50">
            <CheckSquare className="w-8 h-8 text-charcoal-300 mx-auto" />
            <p className="text-xs font-semibold text-charcoal-700">
              No tasks scheduled for this day
            </p>
            <p className="text-[11px] text-charcoal-400">
              Click "+ New Task" or press <kbd className="px-1.5 py-0.5 bg-white border border-[#E8E2D5] rounded text-[10px] font-mono">T</kbd> to schedule work.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {dayTasks.map((task) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';

              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border transition-all space-y-2 ${
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
                        onClick={() => onToggleStatus(task)}
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
                          className={`text-xs font-bold text-charcoal-900 leading-tight ${
                            isCompleted ? 'line-through text-charcoal-500' : ''
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-charcoal-500 mt-0.5 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditTask(task)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        title="Edit task"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips: Time, Priority, Budget Cap */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#F2EDE4]/60 text-[10.5px]">
                    {task.targetTime && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#EAE4D8] text-charcoal-600 font-mono">
                        <Clock className="w-3 h-3 text-charcoal-400" />
                        <span>{task.targetTime}</span>
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold capitalize border ${
                        task.priority === 'high'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {task.priority} Priority
                    </span>

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

      {/* Solo Mode Quick Pro Tip */}
      <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Keyboard Shortcuts</span>
        </div>
        <p className="text-[11px] text-charcoal-500 leading-relaxed">
          Press <kbd className="px-1 py-0.5 bg-white border border-[#E8E2D5] rounded text-[9.5px] font-mono">T</kbd> for instant new task, <kbd className="px-1 py-0.5 bg-white border border-[#E8E2D5] rounded text-[9.5px] font-mono">←</kbd>/<kbd className="px-1 py-0.5 bg-white border border-[#E8E2D5] rounded text-[9.5px] font-mono">→</kbd> for month flipping.
        </p>
      </div>
    </div>
  );
};
