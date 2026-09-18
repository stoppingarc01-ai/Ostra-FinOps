import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Flag, CheckCircle2, CircleDot } from 'lucide-react';
import type { LocalTaskRecord, TaskPriority, TaskStatus } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<LocalTaskRecord>) => void;
  initialDate?: string;
  taskToEdit?: LocalTaskRecord | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  taskToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [tokenBudgetUsd, setTokenBudgetUsd] = useState<string>('0.00');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setTargetDate(taskToEdit.targetDate || '');
      setTargetTime(taskToEdit.targetTime || '');
      setTokenBudgetUsd(taskToEdit.tokenBudgetUsd?.toFixed(2) || '0.00');
      setPriority(taskToEdit.priority || 'medium');
      setStatus(taskToEdit.status || 'todo');
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setTargetDate(initialDate || todayStr);
      setTargetTime('');
      setTokenBudgetUsd('0.00');
      setPriority('medium');
      setStatus('todo');
    }
  }, [isOpen, taskToEdit, initialDate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetDate.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      targetDate: targetDate.trim(),
      targetTime: targetTime.trim() || null,
      tokenBudgetUsd: parseFloat(tokenBudgetUsd) || 0,
      priority,
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border border-[#EAE4D8] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE4D8] bg-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5F2EB] text-[#0C2419] flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal-900">
                {taskToEdit ? 'Edit Local Task' : 'New Coding / Agent Task'}
              </h3>
              <p className="text-[11px] text-charcoal-500">
                Persisted in local SQLite database (~/.osterdops/traces.db)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-[#F2EDE4] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Refactor auth middleware with Cursor (Claude 3.7)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3.5 py-2 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all shadow-2xs font-sans"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1.5">
              Description / Notes
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
                <Calendar className="w-3.5 h-3.5 text-charcoal-500" />
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
                <span>Slot / Time (Optional)</span>
              </label>
              <input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans"
              />
            </div>
          </div>

          {/* Token Budget Cap ($ USD) */}
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>Token Budget Cap (USD)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-charcoal-400">
                $
              </span>
              <input
                type="number"
                step="0.10"
                min="0"
                placeholder="0.00"
                value={tokenBudgetUsd}
                onChange={(e) => setTokenBudgetUsd(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl pl-8 pr-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white shadow-2xs font-sans"
              />
            </div>
            <p className="text-[10.5px] text-charcoal-400 mt-1">
              Optional hard guardrail limit for this specific refactor/session.
            </p>
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-charcoal-500" />
                <span>Priority</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold capitalize border transition-all cursor-pointer text-center ${
                        isSelected
                          ? p === 'high'
                            ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-2xs'
                            : p === 'medium'
                            ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
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

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-charcoal-800 mb-1.5 flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-charcoal-500" />
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

          {/* Modal Actions */}
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
      </div>
    </div>
  );
};
