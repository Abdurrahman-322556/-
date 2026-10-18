import React, { useState } from 'react';
import { Search, Globe, FileText, X } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { AppIcon } from '../common/AppIcon';

interface SearchFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchFlyout: React.FC<SearchFlyoutProps> = ({ isOpen, onClose }) => {
  const { apps, files, openWindow, settings } = useSystem();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';

  const matchingApps = apps.filter(
    (a) =>
      a.isInstalled &&
      (a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.description.toLowerCase().includes(query.toLowerCase()))
  );

  const matchingFiles = files.filter(
    (f) =>
      !f.isDirectory &&
      f.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleOpenApp = (appId: string) => {
    openWindow(appId);
    onClose();
  };

  const handleOpenFile = (fileId: string) => {
    openWindow('notepad', { fileId });
    onClose();
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed bottom-14 z-40 w-[600px] max-w-[calc(100vw-24px)] rounded-2xl border shadow-2xl p-4 win-acrylic select-none animate-in slide-in-from-bottom-3 duration-200 ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-700/60 text-zinc-100 shadow-black/80'
          : 'bg-slate-100/90 border-white/80 text-zinc-900 shadow-slate-900/20'
      }`}
      style={{
        left: settings.taskbarAlignment === 'center' ? 'max(12px, calc(50vw - 300px))' : '12px',
      }}
    >
      {/* Search Input Bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-3 text-zinc-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск приложений, файлов, веб-страниц..."
          autoFocus
          className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs outline-none ${
            isDark
              ? 'bg-zinc-800/90 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-sky-500'
              : 'bg-white border-slate-300 text-zinc-900 placeholder:text-slate-400 focus:border-sky-500'
          }`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-3 text-zinc-400 hover:text-current"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results View */}
      <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
        {/* Apps Results */}
        {matchingApps.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Приложения
            </div>
            <div className="space-y-1">
              {matchingApps.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  onClick={() => handleOpenApp(app.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-500/10 cursor-pointer transition-colors"
                >
                  <AppIcon icon={app.icon} size={22} />
                  <div>
                    <div className="text-xs font-medium">{app.name}</div>
                    <div className="text-[10px] text-zinc-400">{app.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Results */}
        {matchingFiles.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Документы и файлы
            </div>
            <div className="space-y-1">
              {matchingFiles.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleOpenFile(f.id)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-500/10 cursor-pointer transition-colors"
                >
                  <FileText size={18} className="text-sky-500" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-medium truncate">{f.name}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{f.path}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Web Search fallback */}
        {query.trim() && (
          <div
            onClick={() => {
              openWindow('edge');
              onClose();
            }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-500/10 cursor-pointer transition-colors border border-dashed border-zinc-500/30"
          >
            <Globe size={18} className="text-cyan-500" />
            <div className="text-xs">
              <span>Искать в интернете «<strong>{query}</strong>» через Microsoft Bing</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
