import React, { useState, useEffect } from 'react';
import {
  Search,
  Wifi,
  Volume2,
  Battery,
  ChevronUp,
  LayoutGrid,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { AppIcon } from '../common/AppIcon';

interface TaskbarProps {
  onToggleStart: () => void;
  isStartOpen: boolean;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  onToggleQuickSettings: () => void;
  isQuickSettingsOpen: boolean;
  onToggleCalendar: () => void;
  isCalendarOpen: boolean;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  onToggleStart,
  isStartOpen,
  onToggleSearch,
  isSearchOpen,
  onToggleQuickSettings,
  isQuickSettingsOpen,
  onToggleCalendar,
  isCalendarOpen,
}) => {
  const {
    apps,
    windows,
    activeWindowId,
    openWindow,
    minimizeWindow,
    bringToFront,
    settings,
  } = useSystem();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isDark = settings.theme === 'dark';

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Taskbar pinned icons:
  // Show default pinned apps plus any open windows
  const pinnedAppIds = ['explorer', 'edge', 'store', 'terminal', 'settings'];
  const openAppIds = windows.map((w) => w.appId);
  const taskbarAppIds = Array.from(new Set([...pinnedAppIds, ...openAppIds]));

  const handleAppIconClick = (appId: string) => {
    const existingWin = windows.find((w) => w.appId === appId);
    if (!existingWin) {
      openWindow(appId);
    } else {
      if (existingWin.isMinimized) {
        bringToFront(existingWin.id);
      } else if (activeWindowId === existingWin.id) {
        minimizeWindow(existingWin.id);
      } else {
        bringToFront(existingWin.id);
      }
    }
  };

  const minimizeAllWindows = () => {
    windows.forEach((w) => {
      if (!w.isMinimized) minimizeWindow(w.id);
    });
  };

  return (
    <footer
      onClick={(e) => e.stopPropagation()}
      className={`fixed bottom-0 inset-x-0 h-12 z-50 flex items-center justify-between px-3 border-t select-none win-acrylic transition-colors ${
        isDark
          ? 'bg-zinc-950/80 border-zinc-800/60 text-zinc-100'
          : 'bg-slate-100/85 border-slate-200/80 text-zinc-800'
      }`}
    >
      {/* Left empty container for balance when centered */}
      <div className="flex items-center gap-1 min-w-[48px]">
        {settings.taskbarAlignment === 'left' && (
          <div className="flex items-center gap-1">
            {/* Start Button in Left mode */}
            <button
              onClick={onToggleStart}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                isStartOpen
                  ? 'bg-sky-500/20 text-sky-500'
                  : 'hover:bg-zinc-500/10'
              }`}
              title="Пуск"
            >
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <div className="bg-[#0078d4] rounded-[1px]" />
                <div className="bg-[#0078d4] rounded-[1px]" />
                <div className="bg-[#0078d4] rounded-[1px]" />
                <div className="bg-[#0078d4] rounded-[1px]" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Main Apps Bar (Centered or Left) */}
      <div className="flex items-center gap-1 justify-center">
        {settings.taskbarAlignment === 'center' && (
          <>
            {/* Windows 11 Start Button */}
            <button
              onClick={onToggleStart}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isStartOpen
                  ? 'bg-sky-500/20 text-sky-500'
                  : 'hover:bg-zinc-500/10'
              }`}
              title="Пуск"
            >
              <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                <div className="bg-[#0078d4] rounded-[1px]" />
                <div className="bg-[#0078d4] rounded-[1px]" />
                <div className="bg-[#0078d4] rounded-[1px]" />
                <div className="bg-[#0078d4] rounded-[1px]" />
              </div>
            </button>

            {/* Search Button */}
            <button
              onClick={onToggleSearch}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isSearchOpen
                  ? 'bg-sky-500/20 text-sky-500'
                  : 'hover:bg-zinc-500/10'
              }`}
              title="Поиск"
            >
              <Search size={18} className="text-zinc-400 hover:text-current" />
            </button>
          </>
        )}

        {/* Taskbar Apps List */}
        {taskbarAppIds.map((appId) => {
          const appDef = apps.find((a) => a.id === appId);
          if (!appDef) return null;

          const openWin = windows.find((w) => w.appId === appId);
          const isOpen = !!openWin;
          const isActive = openWin && activeWindowId === openWin.id && !openWin.isMinimized;

          return (
            <button
              key={appId}
              onClick={() => handleAppIconClick(appId)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all group cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-zinc-800'
                    : 'bg-white shadow-xs'
                  : 'hover:bg-zinc-500/10'
              }`}
              title={appDef.name}
            >
              <div className="w-6 h-6 flex items-center justify-center transition-transform group-hover:scale-110">
                <AppIcon icon={appDef.icon} size={22} />
              </div>

              {/* Running Pill Indicator underneath */}
              {isOpen && (
                <div
                  className={`absolute bottom-0.5 h-0.5 rounded-full transition-all ${
                    isActive
                      ? 'w-4 bg-sky-500'
                      : 'w-1.5 bg-zinc-400 group-hover:w-3'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right-side System Tray */}
      <div className="flex items-center gap-1">
        {/* Quick Settings Cluster (Wi-Fi, Volume, Battery) */}
        <button
          onClick={onToggleQuickSettings}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isQuickSettingsOpen
              ? 'bg-sky-500/20 text-sky-500'
              : 'hover:bg-zinc-500/10'
          }`}
          title="Быстрые параметры"
        >
          <Wifi size={14} className={settings.wifi ? 'text-current' : 'text-zinc-500'} />
          <Volume2 size={14} className={settings.soundEnabled ? 'text-current' : 'text-zinc-500'} />
          <Battery size={14} className="text-emerald-500" />
        </button>

        {/* Date & Time Clock Cluster */}
        <button
          onClick={onToggleCalendar}
          className={`flex flex-col items-end px-2 py-1 rounded-lg text-right transition-colors cursor-pointer ${
            isCalendarOpen
              ? 'bg-sky-500/20 text-sky-500'
              : 'hover:bg-zinc-500/10'
          }`}
          title="Календарь и центр уведомлений"
        >
          <span className="text-[11px] font-medium leading-none font-mono">{timeStr}</span>
          <span className="text-[10px] text-zinc-400 leading-none mt-0.5 font-mono">{dateStr}</span>
        </button>

        {/* Show Desktop Sliver Button */}
        <div
          onClick={minimizeAllWindows}
          className="w-1.5 h-7 ml-1 rounded-sm border-l border-zinc-500/30 hover:bg-zinc-500/30 cursor-pointer"
          title="Свернуть все окна"
        />
      </div>
    </footer>
  );
};
