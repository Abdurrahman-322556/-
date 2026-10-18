import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Shield,
  Terminal as TerminalIcon,
  Wrench,
  Power,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  RefreshCw,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

type WinREStep =
  | 'choose_option'
  | 'troubleshoot'
  | 'advanced_options'
  | 'system_restore_select'
  | 'system_restore_running'
  | 'system_restore_done'
  | 'startup_repair_running'
  | 'startup_repair_done'
  | 'winre_cmd';

export const WinRE: React.FC = () => {
  const {
    exitWinREToDesktop,
    resetThisPC,
    restorePoints,
    restoreToPoint,
    rebootSystem,
    openStartupSettings,
    bootIntoSafeMode,
  } = useSystem();

  const [step, setStep] = useState<WinREStep>('choose_option');
  const [selectedPointId, setSelectedPointId] = useState<string>(
    restorePoints[0]?.id || ''
  );
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [repairStatus, setRepairStatus] = useState<string>('Диагностика компьютера...');

  // WinRE Command prompt state
  const [cmdLines, setCmdLines] = useState<string[]>([
    'Microsoft Windows [Среда восстановления WinRE версии 10.0.22631]',
    'X:\\windows\\system32>',
  ]);
  const [cmdInput, setCmdInput] = useState<string>('');

  const startSystemRestore = async () => {
    if (!selectedPointId) return;
    setStep('system_restore_running');
    setRestoreProgress(5);

    for (let p = 15; p <= 100; p += 15) {
      await new Promise((r) => setTimeout(r, 400));
      setRestoreProgress(p);
    }

    await restoreToPoint(selectedPointId);
    setStep('system_restore_done');
  };

  const startStartupRepair = async () => {
    setStep('startup_repair_running');
    setRepairStatus('Диагностика компьютера...');
    await new Promise((r) => setTimeout(r, 1800));

    setRepairStatus('Попытка устранения неполадок загрузочной записи...');
    await new Promise((r) => setTimeout(r, 1600));

    setRepairStatus('Проверка целостности загрузочного тома...');
    await new Promise((r) => setTimeout(r, 1400));

    setStep('startup_repair_done');
  };

  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = cmdInput.trim();
    if (!val) return;

    const newLines = [...cmdLines, `X:\\windows\\system32> ${val}`];
    const low = val.toLowerCase();

    if (low === 'help') {
      newLines.push(
        'Доступные команды WinRE:\n  sfc /scannow  - Проверка системных файлов\n  bootrec /fixmbr - Исправление MBR\n  chkdsk C: /f  - Проверка файловой системы\n  exit         - Выход в меню WinRE\n  reset        - Сбросить этот ПК'
      );
    } else if (low === 'exit') {
      setStep('advanced_options');
      return;
    } else if (low.startsWith('sfc')) {
      newLines.push('Сканирование автономного образа Windows... Целостность подтверждена (100%).');
    } else if (low.startsWith('bootrec')) {
      newLines.push('Операция успешно завершена. Загрузочный сектор обновлен.');
    } else if (low.startsWith('chkdsk')) {
      newLines.push('Файловая система проверена. Ошибок не обнаружено.');
    } else if (low === 'reset') {
      resetThisPC('keep_files');
      return;
    } else {
      newLines.push(`"${val}" не распознана. Введите "help" для справки.`);
    }

    setCmdLines(newLines);
    setCmdInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#005a9e] text-white font-sans flex flex-col items-center justify-center p-6 select-none overflow-y-auto">
      <div className="w-full max-w-2xl">
        {/* STEP 1: CHOOSE AN OPTION */}
        {step === 'choose_option' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-3xl font-light tracking-tight">Выбор действия</h1>

            <div className="space-y-3 pt-2">
              <button
                onClick={exitWinREToDesktop}
                className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex items-center gap-4 group cursor-pointer border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Play size={24} className="fill-current" />
                </div>
                <div>
                  <div className="text-lg font-medium">Продолжить</div>
                  <div className="text-xs text-blue-200">Выход и использование Windows 11</div>
                </div>
              </button>

              <button
                onClick={() => setStep('troubleshoot')}
                className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex items-center gap-4 group cursor-pointer border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Wrench size={24} />
                </div>
                <div>
                  <div className="text-lg font-medium">Поиск и устранение неисправностей</div>
                  <div className="text-xs text-blue-200">
                    Возврат компьютера в исходное состояние или дополнительные параметры
                  </div>
                </div>
              </button>

              <button
                onClick={rebootSystem}
                className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex items-center gap-4 group cursor-pointer border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                  <Power size={24} />
                </div>
                <div>
                  <div className="text-lg font-medium">Выключить компьютер</div>
                  <div className="text-xs text-blue-200">Завершение работы операционной системы</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TROUBLESHOOT */}
        {step === 'troubleshoot' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('choose_option')}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-light tracking-tight">Диагностика</h1>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => resetThisPC('keep_files')}
                className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex items-center gap-4 group cursor-pointer border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <div className="text-lg font-medium">Вернуть компьютер в исходное состояние</div>
                  <div className="text-xs text-blue-200">
                    Позволяет выбрать сохранение или удаление файлов, а затем переустанавливает Windows
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStep('advanced_options')}
                className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex items-center gap-4 group cursor-pointer border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0">
                  <Shield size={24} />
                </div>
                <div>
                  <div className="text-lg font-medium">Дополнительные параметры</div>
                  <div className="text-xs text-blue-200">
                    Восстановление системы из контрольных точек, командная строка WinRE, восстановление при загрузке
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ADVANCED OPTIONS */}
        {step === 'advanced_options' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('troubleshoot')}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-light tracking-tight">Дополнительные параметры</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setStep('system_restore_select')}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10"
              >
                <Clock size={24} className="text-blue-200" />
                <div className="font-medium text-base">Восстановление системы</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Использование точки восстановления, записанной на компьютере, для отката Windows
                </div>
              </button>

              <button
                onClick={startStartupRepair}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10"
              >
                <Wrench size={24} className="text-blue-200" />
                <div className="font-medium text-base">Восстановление при загрузке</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Устранение неполадок, мешающих корректной загрузке операционной системы
                </div>
              </button>

              <button
                onClick={openStartupSettings}
                className="p-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-all text-left flex flex-col gap-2 border border-amber-400/40 text-white"
              >
                <Shield size={24} className="text-amber-300" />
                <div className="font-medium text-base text-amber-200">Параметры загрузки (Безопасный режим)</div>
                <div className="text-xs text-blue-100 leading-relaxed">
                  Изменение параметров загрузки Windows, включая запуск в безопасном режиме (Safe Mode)
                </div>
              </button>

              <button
                onClick={() => setStep('winre_cmd')}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10"
              >
                <TerminalIcon size={24} className="text-blue-200" />
                <div className="font-medium text-base">Командная строка</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Использование командной строки для расширенного устранения неполадок
                </div>
              </button>

              <button
                onClick={() => resetThisPC('remove_all')}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10"
              >
                <HardDrive size={24} className="text-blue-200" />
                <div className="font-medium text-base">Полный заводской сброс</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Форматирование и полная повторная установка оригинального образа системы
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SYSTEM RESTORE SELECTION WIZARD */}
        {step === 'system_restore_select' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('advanced_options')}
                className="p-2 rounded-full hover:bg-white/10"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-light tracking-tight">Восстановление системы</h1>
                <div className="text-xs text-blue-200">
                  Выберите контрольную точку для отката состояния Windows 11
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {restorePoints.map((rp) => (
                <div
                  key={rp.id}
                  onClick={() => setSelectedPointId(rp.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    selectedPointId === rp.id
                      ? 'bg-white text-blue-900 border-white font-medium shadow-md'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                  }`}
                >
                  <div className="text-sm font-semibold">{rp.name}</div>
                  <div className="text-xs opacity-80 mt-1 flex items-center justify-between">
                    <span>{new Date(rp.timestamp).toLocaleString('ru-RU')}</span>
                    <span>{rp.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <button
                onClick={() => setStep('advanced_options')}
                className="px-5 py-2 rounded border border-white/30 hover:bg-white/10 text-xs"
              >
                Отмена
              </button>
              <button
                onClick={startSystemRestore}
                disabled={!selectedPointId}
                className="px-6 py-2 rounded bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Далее &gt;
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SYSTEM RESTORE PROGRESS */}
        {step === 'system_restore_running' && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-light">Подождите, выполняется восстановление файлов и параметров Windows...</h2>
            <p className="text-xs text-blue-200">
              Восстановление реестра, системных файлов и конфигурации приложений ({restoreProgress}%)
            </p>
            <div className="w-full max-w-md bg-white/20 h-2 rounded-full mx-auto overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${restoreProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 6: SYSTEM RESTORE DONE */}
        {step === 'system_restore_done' && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <CheckCircle2 size={56} className="text-emerald-300 mx-auto" />
            <h2 className="text-2xl font-light">Восстановление системы выполнено успешно</h2>
            <p className="text-xs text-blue-200 max-w-md mx-auto leading-relaxed">
              Система была успешно восстановлена до выбранного состояния. Документы и файлы сохранены.
            </p>
            <button
              onClick={exitWinREToDesktop}
              className="px-8 py-2.5 rounded bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-lg"
            >
              Перезагрузка в Windows 11
            </button>
          </div>
        )}

        {/* STEP 7: STARTUP REPAIR PROGRESS */}
        {step === 'startup_repair_running' && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-light">Устранение неполадок при загрузке</h2>
            <p className="text-xs text-blue-200">{repairStatus}</p>
          </div>
        )}

        {/* STEP 8: STARTUP REPAIR DONE */}
        {step === 'startup_repair_done' && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <CheckCircle2 size={56} className="text-emerald-300 mx-auto" />
            <h2 className="text-2xl font-light">Восстановление при загрузке завершено</h2>
            <p className="text-xs text-blue-200 max-w-md mx-auto leading-relaxed">
              Средство восстановления при загрузке проверило систему на наличие ошибок. Загрузчик Windows 11 восстановлен.
            </p>
            <button
              onClick={exitWinREToDesktop}
              className="px-8 py-2.5 rounded bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-lg"
            >
              Запустить Windows 11
            </button>
          </div>
        )}

        {/* STEP 9: WINRE COMMAND PROMPT */}
        {step === 'winre_cmd' && (
          <div className="w-full bg-black/95 text-white font-mono text-xs rounded-xl p-4 border border-white/20 shadow-2xl space-y-2 h-[420px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400">
              <span>Среда командной строки WinRE</span>
              <button
                onClick={() => setStep('advanced_options')}
                className="hover:text-white px-2 py-0.5 rounded bg-zinc-800"
              >
                Вернуться в меню WinRE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 select-text">
              {cmdLines.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {line}
                </div>
              ))}
            </div>

            <form onSubmit={handleCmdSubmit} className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <span className="text-yellow-400">X:\windows\system32&gt;</span>
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                autoFocus
                placeholder="Введите команду (help, sfc, bootrec, exit)..."
                className="flex-1 bg-transparent outline-none border-none text-white text-xs font-mono"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
