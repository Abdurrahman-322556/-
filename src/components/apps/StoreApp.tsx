import React, { useState } from 'react';
import {
  Download,
  Check,
  Star,
  Trash2,
  Play,
  Search,
  Sparkles,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { AppCategory, AppDefinition } from '../../types/system';
import { AppIcon } from '../common/AppIcon';

export const StoreApp: React.FC = () => {
  const { apps, installingApps, installApp, uninstallApp, openWindow, settings } = useSystem();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);

  const isDark = settings.theme === 'dark';

  // Filter apps
  const filteredApps = apps.filter((app) => {
    // Show downloadable or all apps
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'installed' && app.isInstalled) ||
      app.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Все приложения' },
    { id: 'installed', label: 'Установленные' },
    { id: 'entertainment', label: 'Игры и творчество' },
    { id: 'development', label: 'Разработка' },
    { id: 'utilities', label: 'Утилиты' },
    { id: 'productivity', label: 'Продуктивность' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-xs">
      {/* Store Header */}
      <div
        className={`h-14 px-6 flex items-center justify-between border-b gap-4 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <AppIcon icon="store" size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">Microsoft Store</div>
            <div className="text-[10px] text-zinc-400">Каталог виртуальных программ</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64 max-w-full">
          <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск программ, игр, утилит..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-full text-xs border outline-none ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
            }`}
          />
        </div>
      </div>

      {/* Main Body with Categories Bar */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6">
        {/* Hero Feature Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg">
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-1.5 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} />
              <span>Центр виртуальных приложений</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2">
              Устанавливайте программы в симуляторе Windows 11
            </h2>
            <p className="text-blue-100 text-xs leading-relaxed mb-4">
              Все виртуальные приложения устанавливаются в систему, отображаются на рабочем столе,
              в меню «Пуск» и папке Program Files, а также удаляются штатным способом.
            </p>
          </div>
          <div className="absolute right-6 -bottom-6 opacity-20 pointer-events-none text-white">
            <AppIcon icon="store" size={180} />
          </div>
        </div>

        {/* Category Pills/Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-sm'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredApps.map((app) => {
            const isInstalling = installingApps[app.id] !== undefined;
            const progress = installingApps[app.id] || 0;

            return (
              <div
                key={app.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isDark
                    ? 'bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-500'
                    : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-xl p-1 bg-zinc-500/10 flex items-center justify-center shrink-0">
                      <AppIcon icon={app.icon} size={28} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs truncate">{app.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                        <span>{app.category}</span>
                        <span>·</span>
                        <div className="flex items-center text-amber-500">
                          <Star size={10} className="fill-amber-500 mr-0.5" />
                          <span>{app.rating}</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400">{app.size}</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {app.description}
                  </p>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-2 border-t border-zinc-500/10">
                  {isInstalling ? (
                    <div>
                      <div className="flex justify-between text-[10px] text-sky-500 font-medium mb-1">
                        <span>Загрузка и установка...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : app.isInstalled ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => openWindow(app.id)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-sky-500 text-white font-medium text-xs hover:bg-sky-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Play size={12} className="fill-current" />
                        <span>Открыть</span>
                      </button>

                      {!app.isDefault && (
                        <button
                          onClick={() => uninstallApp(app.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Удалить приложение"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => installApp(app.id)}
                      className="w-full py-1.5 px-3 rounded-lg bg-sky-500 text-white font-medium text-xs hover:bg-sky-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download size={13} />
                      <span>Установить</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
