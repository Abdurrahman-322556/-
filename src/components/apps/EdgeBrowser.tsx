import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Home,
  Search,
  Plus,
  X,
  Bookmark,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface Tab {
  id: string;
  title: string;
  url: string;
}

export const EdgeBrowser: React.FC = () => {
  const { settings, openWindow } = useSystem();
  const isDark = settings.theme === 'dark';

  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab-1', title: 'Microsoft Edge', url: 'edge://welcome' },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [urlInput, setUrlInput] = useState<string>('edge://welcome');

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const navigateTo = (url: string, title?: string) => {
    setUrlInput(url);
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, url, title: title || (url.startsWith('edge://') ? 'Edge Начало' : url) }
          : t
      )
    );
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = urlInput.trim();
    if (!target) return;

    if (!target.includes('.') && !target.startsWith('edge://')) {
      // Treat as search query
      navigateTo(`search://?q=${encodeURIComponent(target)}`, `Поиск: ${target}`);
    } else {
      navigateTo(target);
    }
  };

  const createNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = { id: newId, title: 'Новая вкладка', url: 'edge://welcome' };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlInput('edge://welcome');
  };

  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
      setUrlInput(remaining[0].url);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full text-xs overflow-hidden select-none">
      {/* Tabs Header Bar */}
      <div
        className={`h-9 px-2 pt-1 flex items-center gap-1 border-b overflow-x-auto ${
          isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-200 border-slate-300'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setActiveTabId(tab.id);
                setUrlInput(tab.url);
              }}
              className={`group max-w-xs flex-1 h-full px-3 rounded-t-lg flex items-center justify-between gap-2 text-[11px] cursor-pointer transition-colors ${
                isActive
                  ? isDark
                    ? 'bg-zinc-900 text-zinc-100'
                    : 'bg-white text-zinc-900 shadow-xs'
                  : isDark
                  ? 'hover:bg-zinc-900/50 text-zinc-400'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span className="truncate">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => closeTab(tab.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-500/20"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          );
        })}

        <button
          onClick={createNewTab}
          className="p-1 rounded hover:bg-zinc-500/20 text-zinc-400 hover:text-current"
          title="Новая вкладка"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Navigation & Address Bar */}
      <div
        className={`h-11 px-3 flex items-center gap-2 border-b ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          onClick={() => navigateTo('edge://welcome', 'Edge Начало')}
          className="p-1.5 rounded hover:bg-zinc-500/10 text-zinc-400 hover:text-current"
          title="Домой"
        >
          <Home size={14} />
        </button>
        <button
          onClick={() => navigateTo(activeTab.url)}
          className="p-1.5 rounded hover:bg-zinc-500/10 text-zinc-400 hover:text-current"
          title="Обновить"
        >
          <RefreshCw size={14} />
        </button>

        {/* Address Input Form */}
        <form onSubmit={handleUrlSubmit} className="flex-1 relative">
          <Search size={13} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-full text-xs border outline-none ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-sky-500'
                : 'bg-slate-100 border-slate-200 text-zinc-900 focus:border-sky-500'
            }`}
          />
        </form>
      </div>

      {/* Bookmarks Bar */}
      <div
        className={`h-7 px-3 flex items-center gap-4 border-b text-[10px] text-zinc-400 ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <button
          onClick={() => navigateTo('edge://welcome', 'Microsoft Edge')}
          className="hover:text-sky-500 transition-colors"
        >
          Главная страница
        </button>
        <button
          onClick={() => navigateTo('wiki://win11', 'Справка: Windows 11')}
          className="hover:text-sky-500 transition-colors"
        >
          Википедия: Windows 11
        </button>
        <button
          onClick={() => navigateTo('wiki://winre', 'Документация WinRE')}
          className="hover:text-sky-500 transition-colors"
        >
          Среда восстановления WinRE
        </button>
      </div>

      {/* Page Content Renderer */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900">
        {activeTab.url === 'edge://welcome' && (
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center pt-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg mb-4">
              <ExternalLink size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Microsoft Edge</h1>
            <p className="text-zinc-500 text-xs mb-8">
              Быстрый веб-браузер нового поколения для Windows 11.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
              <div
                onClick={() => navigateTo('wiki://win11', 'Справка: Windows 11')}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-sky-500 cursor-pointer transition-all bg-zinc-50 dark:bg-zinc-800/40"
              >
                <div className="font-semibold text-xs text-sky-500 mb-1">Справка по Windows 11</div>
                <div className="text-[11px] text-zinc-500">
                  Архитектура системы, Fluent Design, меню Пуск и поддержка виртуальных программ.
                </div>
              </div>

              <div
                onClick={() => navigateTo('wiki://winre', 'Среда WinRE')}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-sky-500 cursor-pointer transition-all bg-zinc-50 dark:bg-zinc-800/40"
              >
                <div className="font-semibold text-xs text-blue-500 mb-1">Среда восстановления WinRE</div>
                <div className="text-[11px] text-zinc-500">
                  Руководство по контрольным точкам, заводскому сбросу и устранению сбоев.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab.url.startsWith('search://') && (
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            <h2 className="text-sm font-semibold text-zinc-400">
              Результаты поиска Microsoft Bing:
            </h2>
            <div className="p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-800/40 flex flex-col gap-1">
              <a
                onClick={() => navigateTo('wiki://win11', 'Справка: Windows 11')}
                className="text-sky-500 font-semibold hover:underline cursor-pointer"
              >
                Операционная система Windows 11 — Обзор возможностей
              </a>
              <span className="text-[10px] text-emerald-600">https://learn.microsoft.com/windows-11</span>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                Интерактивный симулятор Windows 11 с классическими приложениями, файловой системой,
                поддержкой установки виртуального ПО и средой восстановления WinRE.
              </p>
            </div>
          </div>
        )}

        {activeTab.url === 'wiki://win11' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-xl font-bold tracking-tight border-b pb-2">Windows 11</h1>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <strong>Windows 11</strong> — проприетарная операционная система для персональных компьютеров,
              разработанная компанией Microsoft. Представлена в 2021 году как преемница Windows 10.
            </p>
            <h3 className="text-sm font-semibold pt-2">Ключевые особенности симулятора:</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <li>Центрированная панель задач и обновленный макет меню «Пуск».</li>
              <li>Среда выполнения виртуальных программ с установкой через Microsoft Store.</li>
              <li>Интерактивный Терминал с системными командами (sfc, systeminfo, shutdown /r /o).</li>
              <li>Штатная система сброса параметров ПК («Сбросить этот ПК») с двумя режимами.</li>
              <li>Полнофункциональная среда восстановления Windows Recovery Environment (WinRE).</li>
            </ul>
          </div>
        )}

        {activeTab.url === 'wiki://winre' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-xl font-bold tracking-tight border-b pb-2 text-blue-500 flex items-center gap-2">
              <Shield size={22} />
              <span>Windows Recovery Environment (WinRE)</span>
            </h1>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              <strong>Среда восстановления Windows (WinRE)</strong> — это автономная среда восстановления на базе
              Windows PE, которая загружается в случае критических сбоев или по запросу пользователя.
            </p>
            <h3 className="text-sm font-semibold pt-2">Функционал в симуляторе:</h3>
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3 rounded-lg border bg-zinc-500/5">
                <span className="font-semibold text-xs text-sky-500">Восстановление системы (System Restore)</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Откат системы к ранее созданной контрольной точке без потери личных документов.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-zinc-500/5">
                <span className="font-semibold text-xs text-amber-500">Сброс этого ПК (Factory Reset)</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Полная очистка и переустановка Windows 11 с автоматической инициализацией.
                </p>
              </div>
              <div className="p-3 rounded-lg border bg-zinc-500/5">
                <span className="font-semibold text-xs text-emerald-500">Командная строка WinRE</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Низкоуровневая диагностика, проверка целостности файлов и управление дисками.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
