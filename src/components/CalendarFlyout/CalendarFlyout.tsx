import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Trash2, CheckCircle2 } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface CalendarFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarFlyout: React.FC<CalendarFlyoutProps> = ({ isOpen, onClose }) => {
  const { notifications, clearNotifications, removeNotification, settings } = useSystem();
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Days calculations
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed bottom-14 right-3 z-40 w-84 rounded-2xl border shadow-2xl p-4 win-acrylic select-none animate-in slide-in-from-bottom-3 duration-200 flex flex-col gap-4 max-h-[85vh] overflow-y-auto ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-700/60 text-zinc-100 shadow-black/80'
          : 'bg-slate-100/90 border-white/80 text-zinc-900 shadow-slate-900/20'
      }`}
    >
      {/* Top Notifications Center */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-zinc-500/10">
          <div className="flex items-center gap-1.5 font-medium">
            <Bell size={13} className="text-sky-500" />
            <span>Уведомления ({notifications.length})</span>
          </div>
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-[11px] text-zinc-400 hover:text-sky-500 transition-colors"
            >
              Очистить все
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-3 text-zinc-400 text-[11px]">Нет новых уведомлений</div>
        ) : (
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-2.5 rounded-xl border text-xs relative group ${
                  isDark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                  <span className="font-semibold text-sky-500">{n.appName}</span>
                  <span>{n.time}</span>
                </div>
                <div className="font-medium text-[11px] leading-tight">{n.title}</div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                  {n.message}
                </div>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 transition-opacity"
                  title="Удалить"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Area */}
      <div className="pt-2 border-t border-zinc-500/10 flex flex-col gap-3">
        {/* Month Selector */}
        <div className="flex items-center justify-between text-xs font-semibold">
          <span>
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-zinc-500/10">
              <ChevronLeft size={15} />
            </button>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-zinc-500/10">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 text-center text-[10px] text-zinc-400 font-medium">
          {daysOfWeek.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Dates Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {/* Previous month filler */}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (
            <div
              key={`prev-${i}`}
              className="py-1.5 text-zinc-400/40 text-[11px]"
            >
              {prevMonthDays - adjustedFirstDay + i + 1}
            </div>
          ))}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = isCurrentMonth && today.getDate() === dayNum;

            return (
              <button
                key={dayNum}
                className={`py-1.5 rounded-full transition-colors font-medium text-[11px] ${
                  isToday
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'hover:bg-zinc-500/10'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
