import React, { useState, useEffect } from 'react';
import { Activity, XCircle, RefreshCw, Cpu, Database } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { AppIcon } from '../common/AppIcon';

export const TaskManager: React.FC = () => {
  const { windows, closeWindow, apps, settings } = useSystem();
  const [activeTab, setActiveTab] = useState<'processes' | 'performance'>('processes');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  // Dynamic CPU & RAM simulation
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [ramUsage, setRamUsage] = useState<number>(28);
  const [historyCpu, setHistoryCpu] = useState<number[]>([12, 15, 18, 14, 20, 16, 14, 19, 15, 14]);

  const isDark = settings.theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      const baseCpu = 8 + windows.length * 4;
      const variation = Math.floor(Math.random() * 8) - 4;
      const currentCpu = Math.max(5, Math.min(95, baseCpu + variation));
      setCpuUsage(currentCpu);
      setHistoryCpu((prev) => [...prev.slice(1), currentCpu]);

      const baseRam = 24 + windows.length * 2.5;
      setRamUsage(parseFloat((baseRam + (Math.random() * 1.5 - 0.7)).toFixed(1)));
    }, 1500);

    return () => clearInterval(timer);
  }, [windows.length]);

  // Combined processes list
  const windowProcesses = windows.map((w, index) => {
    const appDef = apps.find((a) => a.id === w.appId);
    return {
      id: w.id,
      name: w.title,
      executable: appDef?.executableName || `${w.appId}.exe`,
      icon: w.icon,
      cpu: `${(Math.random() * 2.5 + 0.1).toFixed(1)}%`,
      memory: `${(Math.random() * 45 + 18).toFixed(1)} МБ`,
      status: 'Выполняется',
      isWindow: true,
    };
  });

  const backgroundProcesses = [
    { id: 'bg-1', name: 'Диспетчер окон рабочего стола', executable: 'dwm.exe', icon: 'settings', cpu: '1.2%', memory: '85.4 МБ', status: 'Выполняется', isWindow: false },
    { id: 'bg-2', name: 'Служба платформы подключенных устройств', executable: 'svchost.exe', icon: 'settings', cpu: '0.1%', memory: '24.1 МБ', status: 'Выполняется', isWindow: false },
    { id: 'bg-3', name: 'Служба времени Windows', executable: 'w32time.dll', icon: 'settings', cpu: '0.0%', memory: '8.4 МБ', status: 'Выполняется', isWindow: false },
    { id: 'bg-4', name: 'Служба аудио Windows', executable: 'audiodg.exe', icon: 'settings', cpu: '0.4%', memory: '16.2 МБ', status: 'Выполняется', isWindow: false },
    { id: 'bg-5', name: 'Среда восстановления Windows (Agent)', executable: 'WinREAgent.exe', icon: 'winre', cpu: '0.0%', memory: '6.1 МБ', status: 'Ожидание', isWindow: false },
  ];

  const allProcesses = [...windowProcesses, ...backgroundProcesses];

  const handleEndTask = () => {
    if (!selectedProcessId) return;
    const targetWin = windows.find((w) => w.id === selectedProcessId);
    if (targetWin) {
      closeWindow(targetWin.id);
      setSelectedProcessId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full text-xs overflow-hidden select-none">
      {/* Tab Navigation */}
      <div
        className={`h-10 px-3 flex items-center justify-between border-b ${
          isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('processes')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'processes'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Процессы
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'performance'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'hover:bg-zinc-500/10 text-zinc-600 dark:text-zinc-300'
            }`}
          >
            Производительность
          </button>
        </div>

        {activeTab === 'processes' && selectedProcessId && (
          <button
            onClick={handleEndTask}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition-colors"
          >
            <XCircle size={13} />
            <span>Снять задачу</span>
          </button>
        )}
      </div>

      {/* PROCESSES VIEW */}
      {activeTab === 'processes' && (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead
              className={`sticky top-0 border-b text-[11px] font-medium text-zinc-400 ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <tr>
                <th className="py-2 px-3">Имя процесса</th>
                <th className="py-2 px-3 w-28">Состояние</th>
                <th className="py-2 px-3 w-20 text-right">ЦП ({cpuUsage}%)</th>
                <th className="py-2 px-3 w-24 text-right">Память</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-500/10 text-[11px]">
              {allProcesses.map((proc) => {
                const isSelected = selectedProcessId === proc.id;
                return (
                  <tr
                    key={proc.id}
                    onClick={() => setSelectedProcessId(proc.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-400 font-medium'
                        : 'hover:bg-zinc-500/5'
                    }`}
                  >
                    <td className="py-2 px-3 flex items-center gap-2">
                      <AppIcon icon={proc.icon} size={15} />
                      <span className="truncate max-w-xs">{proc.name}</span>
                      <span className="text-[9px] text-zinc-500">({proc.executable})</span>
                    </td>
                    <td className="py-2 px-3 text-zinc-400">{proc.status}</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-300">{proc.cpu}</td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-300">{proc.memory}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PERFORMANCE VIEW */}
      {activeTab === 'performance' && (
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* CPU Chart */}
          <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-sky-500" />
                <span className="font-semibold text-sm">ЦП (13th Gen Intel Core i9-13900K)</span>
              </div>
              <span className="font-mono text-sm font-semibold text-sky-500">{cpuUsage}%</span>
            </div>

            {/* Sparkline chart */}
            <div className="h-28 w-full bg-black/30 rounded-lg p-2 flex items-end gap-1.5 overflow-hidden border border-zinc-500/20">
              {historyCpu.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-sky-500/80 rounded-t transition-all duration-300"
                  style={{ height: `${Math.max(6, val)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Скорость: 3.20 ГГц</span>
              <span>Ядер: 24 · Потоков: 32</span>
              <span>Время работы: 0:14:32:05</span>
            </div>
          </div>

          {/* RAM Chart */}
          <div className="p-4 rounded-xl border bg-zinc-500/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-indigo-500" />
                <span className="font-semibold text-sm">Память (DDR5 6000MHz)</span>
              </div>
              <span className="font-mono text-sm font-semibold text-indigo-500">{ramUsage}% (8.9 / 32.0 ГБ)</span>
            </div>

            <div className="w-full bg-zinc-700/30 h-3 rounded-full overflow-hidden mt-1">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${ramUsage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
              <span>Использовано: 8.9 ГБ</span>
              <span>Доступно: 23.1 ГБ</span>
              <span>Форм-фактор: DIMM</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className={`h-6 px-3 flex items-center justify-between border-t text-[10px] text-zinc-400 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <span>Всего процессов: {allProcesses.length}</span>
        <span>Загрузка ЦП: {cpuUsage}%</span>
      </div>
    </div>
  );
};
