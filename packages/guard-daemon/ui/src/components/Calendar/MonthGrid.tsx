import React from 'react';
import { CheckCircle2, Clock, DollarSign, Plus } from 'lucide-react';
import type { LocalTaskRecord } from '../../types';

interface MonthGridProps {
  currentYear: number;
  currentMonth: number; // 0-indexed: 0 = Jan, 8 = Sep
  selectedDate: string; // Format: YYYY-MM-DD
  tasks: LocalTaskRecord[];
  onSelectDate: (dateStr: string) => void;
  onOpenNewTaskModal: (dateStr: string) => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  currentYear,
  currentMonth,
  selectedDate,
  tasks,
  onSelectDate,
  onOpenNewTaskModal,
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  const todayStr = new Date().toISOString().split('T')[0];

  // Group tasks by targetDate
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, LocalTaskRecord[]>();
    tasks.forEach((t) => {
      const existing = map.get(t.targetDate) || [];
      existing.push(t);
      map.set(t.targetDate, existing);
    });
    return map;
  }, [tasks]);

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    let year = currentYear;
    let month = currentMonth;
    let dayNumber: number;
    let isCurrentMonth = true;

    if (i < firstDayOfMonth) {
      // Prev month
      isCurrentMonth = false;
      dayNumber = daysInPrevMonth - (firstDayOfMonth - i - 1);
      if (month === 0) {
        month = 11;
        year -= 1;
      } else {
        month -= 1;
      }
    } else if (i >= firstDayOfMonth + daysInMonth) {
      // Next month
      isCurrentMonth = false;
      dayNumber = i - (firstDayOfMonth + daysInMonth) + 1;
      if (month === 11) {
        month = 0;
        year += 1;
      } else {
        month += 1;
      }
    } else {
      // Current month
      dayNumber = i - firstDayOfMonth + 1;
    }

    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNumber).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    const dayTasks = tasksByDate.get(dateKey) || [];
    const isToday = dateKey === todayStr;
    const isSelected = dateKey === selectedDate;

    cells.push({
      dateKey,
      dayNumber,
      isCurrentMonth,
      isToday,
      isSelected,
      tasks: dayTasks,
    });
  }

  return (
    <div className="bg-white border border-[#EAE4D8] rounded-2xl shadow-subtle overflow-hidden font-sans">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-[#EAE4D8] bg-[#FAF8F5] text-center select-none">
        {weekDays.map((w, idx) => (
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

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-[1px] bg-[#EAE4D8]">
        {cells.map((cell) => {
          const visibleTasks = cell.tasks.slice(0, 2);
          const overflowCount = cell.tasks.length - visibleTasks.length;

          return (
            <div
              key={cell.dateKey}
              onClick={() => onSelectDate(cell.dateKey)}
              onDoubleClick={() => onOpenNewTaskModal(cell.dateKey)}
              className={`min-h-[105px] sm:min-h-[120px] p-2 flex flex-col justify-between transition-all cursor-pointer group relative ${
                cell.isCurrentMonth ? 'bg-white' : 'bg-[#FAF8F5]/60 text-charcoal-400'
              } ${
                cell.isSelected
                  ? 'ring-2 ring-[#0C2419] ring-inset bg-emerald-50/20'
                  : 'hover:bg-[#FAF8F5]'
              }`}
            >
              {/* Cell Header: Day Number & Quick Add */}
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

                {/* Quick Add Button on Hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenNewTaskModal(cell.dateKey);
                  }}
                  className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center bg-[#E5F2EB] hover:bg-[#D4E8DC] text-[#0C2419] transition-opacity shadow-2xs"
                  title="Add task on this date"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Task Badges in Cell */}
              <div className="space-y-1 my-1 flex-1 overflow-hidden">
                {visibleTasks.map((t) => {
                  const isCompleted = t.status === 'completed';
                  const isInProgress = t.status === 'in_progress';

                  return (
                    <div
                      key={t.id}
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate flex items-center gap-1 border transition-all ${
                        isCompleted
                          ? 'bg-[#E5F2EB]/70 border-emerald-200 text-emerald-900 line-through opacity-80'
                          : isInProgress
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-[#FAF8F5] border-[#EAE4D8] text-charcoal-800'
                      }`}
                      title={`${t.title} (${t.status})`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                      ) : isInProgress ? (
                        <Clock className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-charcoal-400 shrink-0" />
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

              {/* Bottom Spend / Task Count Summary if any */}
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
  );
};
