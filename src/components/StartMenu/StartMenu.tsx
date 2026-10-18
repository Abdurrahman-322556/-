import React, { useState } from 'react';
import {
  Search,
  Power,
  ChevronRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Moon,
  Sparkles,
  FileText,
  Settings,
  Play,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { USER_AVATAR } from '../../utils/initialData';
import { AppIcon } from '../common/AppIcon';
import { AppDefinition } from '../../types/system';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose, onOpenSearch }) => {
  const {
    apps,
    files,
    openWindow,
    requestElevatedLaunch,
    bootToWinRE,
    rebootSystem,
    settings,
    bootMode,
    bootIntoSafeMode,
    exitSafeMode,
  } = useSystem();

  const [viewAllApps, setViewAllApps] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [appContextMenu, setAppContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    app: AppDefinition | null;
  }>({ visible: false, x: 0, y: 0, app: null });

  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';

  // Installed apps
  const installedApps = apps.filter((a) => a.isInstalled);
  const recentFiles = files.filter((f) => !f.isDirectory).slice(0, 4);

  const handleAppClick = (appId: string) => {
    openWindow(appId);
    onClose();
  };

  const handleFileClick = (fileId: string) => {
    openWindow('notepad', { fileId });
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed bottom-14 z-40 w-[540px] max-w-[calc(100vw-24px)] rounded-2xl border shadow-2xl overflow-hidden win-acrylic select-none animate-in slide-in-from-bottom-3 duration-200 ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-700/60 text-zinc-100 shadow-black/80'
          : 'bg-slate-100/90 border-white/80 text-zinc-900 shadow-slate-900/20'
      }`}
      style={{
        left: settings.taskbarAlignment === 'center' ? 'max(12px, calc(50vw - 270px))' : '12px',
      }}
    >
      <div className="p-6 flex flex-col gap-5 max-h-[640px] overflow-y-auto">
        {/* Search bar inside Start Menu */}
        <div
          onClick={() => {
            onClose();
            onOpenSearch();
          }}
          className={`px-4 py-2.5 rounded-full border flex items-center gap-3 cursor-pointer text-xs transition-colors ${
            isDark
              ? 'bg-zinc-800/80 border-zinc-700 hover:bg-zinc-800 text-zinc-400'
              : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-500 shadow-xs'
          }`}
        >
          <Search size={15} />
          <span>Поиск приложений, файлов и настроек...</span>
        </div>

        {/* View Mode: Pinned Apps vs All Apps */}
        {!viewAllApps ? (
          <>
            {/* Pinned Header */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs tracking-tight">Закреплено</span>
              <button
                onClick={() => setViewAllApps(true)}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>Все приложения</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Pinned Apps 6-col grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {installedApps.slice(0, 12).map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAppContextMenu({
                      visible: true,
                      x: Math.min(window.innerWidth - 240, e.clientX),
                      y: Math.min(window.innerHeight - 200, e.clientY),
                      app,
                    });
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-zinc-500/10 transition-colors text-center group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                    <AppIcon icon={app.icon} size={28} />
                  </div>
                  <span className="text-[11px] mt-1.5 truncate w-full group-hover:text-sky-500">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Recommended / Recent Files */}
            <div className="pt-2 border-t border-zinc-500/10">
              <div className="font-semibold text-xs tracking-tight mb-2.5">Рекомендуем</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file.id)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-500/10 transition-colors cursor-pointer"
                  >
                    <FileText size={20} className="text-sky-500 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="text-xs font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        {new Date(file.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Текстовый документ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* All Apps List */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-500/10">
              <span className="font-semibold text-xs">Все приложения</span>
              <button
                onClick={() => setViewAllApps(false)}
                className="text-[11px] text-sky-500 hover:underline"
              >
                Назад к закрепленным
              </button>
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
              {installedApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAppContextMenu({
                      visible: true,
                      x: Math.min(window.innerWidth - 240, e.clientX),
                      y: Math.min(window.innerHeight - 200, e.clientY),
                      app,
                    });
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-500/10 transition-colors text-left cursor-pointer"
                >
                  <AppIcon icon={app.icon} size={20} />
                  <div>
                    <div className="text-xs font-medium">{app.name}</div>
                    <div className="text-[10px] text-zinc-400">{app.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start Menu Footer with User & Power Menu */}
      <div
        className={`h-14 px-6 flex items-center justify-between border-t relative ${
          isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-slate-200/50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={USER_AVATAR}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-zinc-400/20"
          />
          <span className="text-xs font-medium">{settings.registeredOwner}</span>
        </div>

        {/* Power Button & Flyout */}
        <div className="relative">
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            className="p-2 rounded-full hover:bg-zinc-500/20 text-zinc-400 hover:text-current transition-colors"
            title="Питание"
          >
            <Power size={18} />
          </button>

          {showPowerMenu && (
            <div
              className={`absolute right-0 bottom-12 w-56 p-1.5 rounded-xl border shadow-xl z-50 win-acrylic ${
                isDark ? 'bg-zinc-800/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-200 text-zinc-900'
              }`}
            >
              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onClose();
                  rebootSystem();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-500/10 text-xs text-left"
              >
                <RotateCcw size={14} />
                <span>Перезагрузка</span>
              </button>

              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onClose();
                  bootToWinRE();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 text-xs text-left font-medium"
              >
                <Shield size={14} />
                <span>Перезагрузка в WinRE</span>
              </button>

              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onClose();
                  if (bootMode === 'normal') {
                    bootIntoSafeMode('safemode');
                  } else {
                    exitSafeMode();
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-amber-500 hover:bg-amber-500/10 text-xs text-left font-medium"
              >
                <Shield size={14} />
                <span>{bootMode === 'normal' ? 'Безопасный режим' : 'Выйти из Safe Mode'}</span>
              </button>

              <button
                onClick={() => {
                  setShowPowerMenu(false);
                  onClose();
                  rebootSystem();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-500/10 text-xs text-left"
              >
                <Power size={14} />
                <span>Завершение работы</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* App Context Menu inside Start Menu */}
      {appContextMenu.visible && appContextMenu.app && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed z-60 w-60 rounded-xl border shadow-2xl p-1.5 win-acrylic text-xs select-none animate-in zoom-in-95 duration-100 ${
            isDark ? 'bg-zinc-800/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-200 text-zinc-900'
          }`}
          style={{ left: `${appContextMenu.x}px`, top: `${appContextMenu.y}px` }}
        >
          <button
            onClick={() => {
              const a = appContextMenu.app!;
              setAppContextMenu({ visible: false, x: 0, y: 0, app: null });
              handleAppClick(a.id);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left font-semibold cursor-pointer"
          >
            <Play size={13} />
            <span>Открыть {appContextMenu.app.name}</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          <div className="px-3 py-0.5 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
            Запуск с правами
          </div>

          <button
            onClick={() => {
              const a = appContextMenu.app!;
              setAppContextMenu({ visible: false, x: 0, y: 0, app: null });
              onClose();
              requestElevatedLaunch(a.id, 'admin');
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-left cursor-pointer"
          >
            <Shield size={13} />
            <span>Запуск от имени администратора</span>
          </button>

          <button
            onClick={() => {
              const a = appContextMenu.app!;
              setAppContextMenu({ visible: false, x: 0, y: 0, app: null });
              onClose();
              requestElevatedLaunch(a.id, 'system');
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-purple-500 hover:bg-purple-500/10 text-left cursor-pointer"
          >
            <ShieldAlert size={13} />
            <span>Запуск от имени системы</span>
          </button>

          <button
            onClick={() => {
              const a = appContextMenu.app!;
              setAppContextMenu({ visible: false, x: 0, y: 0, app: null });
              onClose();
              requestElevatedLaunch(a.id, 'trustedinstaller');
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 text-left font-semibold cursor-pointer"
          >
            <ShieldCheck size={13} />
            <span>Запуск с правами (TrustedInstaller)</span>
          </button>
        </div>
      )}
    </div>
  );
};
