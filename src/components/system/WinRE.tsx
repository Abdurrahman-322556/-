import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Shield,
  ShieldCheck,
  Terminal as TerminalIcon,
  Wrench,
  Power,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  RefreshCw,
  Globe,
  Calendar,
  Keyboard,
  User,
  Monitor,
  Check,
  Laptop,
  Sliders,
  Sparkles,
  Layers,
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
  | 'winre_cmd'
  | 'reinstall_stage1_regional'
  | 'reinstall_stage2_copying'
  | 'reinstall_stage3_profile'
  | 'reinstall_stage4_system'
  | 'reinstall_stage5_waiting';

export const WinRE: React.FC = () => {
  const {
    exitWinREToDesktop,
    resetThisPC,
    restorePoints,
    restoreToPoint,
    rebootSystem,
    openStartupSettings,
    settings,
    setWinreEnabled,
    reinstallWindows,
  } = useSystem();

  const [step, setStep] = useState<WinREStep>('choose_option');
  const [selectedPointId, setSelectedPointId] = useState<string>(
    restorePoints[0]?.id || ''
  );
  const [restoreProgress, setRestoreProgress] = useState<number>(0);
  const [repairStatus, setRepairStatus] = useState<string>('Диагностика компьютера...');

  // Reinstallation Wizard State (5 Stages)
  // Stage 1: Раскладка, время, язык
  const [selectedLanguage, setSelectedLanguage] = useState<string>(settings.language || 'Русский');
  const [selectedTimeFormat, setSelectedTimeFormat] = useState<string>(settings.timeFormat || 'Русский (Россия)');
  const [selectedKeyboard, setSelectedKeyboard] = useState<string>(settings.keyboardLayout || 'Русская');

  // Stage 2: Копирование файлов
  const [copyProgress, setCopyProgress] = useState<number>(0);
  const [copyPhase, setCopyPhase] = useState<'copy' | 'prepare' | 'features' | 'updates' | 'finishing'>('prepare');

  // Stage 3: Настройка профиля
  const [profileUsername, setProfileUsername] = useState<string>(settings.registeredOwner || 'User');
  const [profileComputerName, setProfileComputerName] = useState<string>(settings.computerName || 'DESKTOP-WIN11');
  const [profilePassword, setProfilePassword] = useState<string>('');

  // Stage 4: Настройка системы
  const [profileTheme, setProfileTheme] = useState<'dark' | 'light'>(settings.theme || 'dark');
  const [profileWinreEnabled, setProfileWinreEnabled] = useState<boolean>(true);
  const [privacyLocation, setPrivacyLocation] = useState<boolean>(true);
  const [privacyDiagnostics, setPrivacyDiagnostics] = useState<boolean>(true);
  const [privacyInking, setPrivacyInking] = useState<boolean>(true);

  // Stage 5: Ожидание
  const [waitingPhaseIndex, setWaitingPhaseIndex] = useState<number>(0);

  // WinRE Administrator Command Prompt State
  const [cmdLines, setCmdLines] = useState<string[]>([
    'Microsoft Windows [Среда восстановления Windows (WinRE) версии 10.0.22631.3296]',
    '(c) Корпорация Майкрософт (Microsoft Corporation). Все права защищены.',
    '',
    'Сеанс командной строки среды восстановления с наивысшими правами NT AUTHORITY\\SYSTEM.',
    'Поддерживаемые команды: sfc /scannow, reagentc /info, reagentc /enable, reagentc /disable, setup, chkdsk, bootrec, exit, help.',
    '',
  ]);
  const [cmdInput, setCmdInput] = useState<string>('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState<number>(-1);
  const cmdBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll cmd
  useEffect(() => {
    if (step === 'winre_cmd') {
      cmdBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [cmdLines, step]);

  // Stage 2 Copying Files Process
  useEffect(() => {
    if (step !== 'reinstall_stage2_copying') return;

    setCopyProgress(0);
    setCopyPhase('copy');

    const interval = setInterval(() => {
      setCopyProgress((prev) => {
        if (prev < 15) {
          setCopyPhase('copy');
          return prev + 3;
        } else if (prev < 75) {
          setCopyPhase('prepare');
          return prev + 4;
        } else if (prev < 90) {
          setCopyPhase('features');
          return prev + 3;
        } else if (prev < 98) {
          setCopyPhase('updates');
          return prev + 2;
        } else {
          setCopyPhase('finishing');
          clearInterval(interval);
          setTimeout(() => {
            setStep('reinstall_stage3_profile');
          }, 1200);
          return 100;
        }
      });
    }, 180);

    return () => clearInterval(interval);
  }, [step]);

  // Stage 5 Waiting Phrases Animation
  const waitingPhrases = [
    'Подождите...',
    'Привет',
    'Выполняется подготовка для вас',
    'Это может занять несколько минут',
    'Не выключайте компьютер',
    'Почти готово...',
  ];

  useEffect(() => {
    if (step !== 'reinstall_stage5_waiting') return;

    setWaitingPhaseIndex(0);

    const interval = setInterval(() => {
      setWaitingPhaseIndex((prev) => {
        if (prev < waitingPhrases.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // Complete reinstallation into Windows 11 desktop
          setTimeout(() => {
            reinstallWindows({
              language: selectedLanguage,
              timeFormat: selectedTimeFormat,
              keyboardLayout: selectedKeyboard,
              username: profileUsername.trim() || 'User',
              computerName: profileComputerName.trim() || 'DESKTOP-WIN11',
              theme: profileTheme,
            });
          }, 1200);
          return prev;
        }
      });
    }, 1600);

    return () => clearInterval(interval);
  }, [step, selectedLanguage, selectedTimeFormat, selectedKeyboard, profileUsername, profileComputerName, profileTheme, reinstallWindows]);

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

    setCmdHistory((prev) => [val, ...prev]);
    setCmdHistoryIdx(-1);

    const newLines = [...cmdLines, `X:\\windows\\system32> ${val}`];
    const parts = val.split(' ');
    const mainCommand = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').toLowerCase();

    switch (mainCommand) {
      case 'help':
        newLines.push(
          'Доступные команды автономной среды WinRE:\n' +
          '  sfc /scannow       - Полное сканирование и восстановление системных файлов Windows\n' +
          '  reagentc /info     - Сведения о состоянии среды восстановления WinRE\n' +
          '  reagentc /enable   - Включение среды восстановления WinRE\n' +
          '  reagentc /disable  - Отключение среды восстановления WinRE\n' +
          '  setup / reinstall  - Запуск мастера переустановки Windows 11\n' +
          '  bootrec /fixmbr    - Восстановление главной загрузочной записи MBR\n' +
          '  bootrec /fixboot   - Запись нового загрузочного сектора\n' +
          '  bootrec /rebuildbcd- Полная перестройка хранилища данных BCD\n' +
          '  chkdsk C: /f       - Проверка файловой системы тома C: и исправление ошибок\n' +
          '  dir                - Список каталогов и файлов\n' +
          '  cls                - Очистка экрана\n' +
          '  exit               - Выход в главное меню WinRE'
        );
        break;

      case 'sfc':
        if (arg === '/scannow' || arg === 'scannow') {
          newLines.push(
            'Начато сканирование автономного образа Windows. Этот процесс может занять некоторое время.\n' +
            'Начало этапа проверки системных файлов...\n' +
            'Проверка 100% завершена.\n' +
            'Защита ресурсов Windows восстановила поврежденные файлы и успешно их исправила.\n' +
            'Целостность автономного образа подтверждена (100%).'
          );
        } else {
          newLines.push('Использование: sfc /scannow (проверка и восстановление системных файлов)');
        }
        break;

      case 'reagentc': {
        if (arg === '/info' || arg === 'info' || arg === '-info') {
          const isEnabled = settings.winreEnabled;
          newLines.push(
            'Сведения о конфигурации среды восстановления Windows (WinRE) и сброса системы:\n\n' +
            `    Состояние Windows RE:         ${isEnabled ? 'Enabled (Включено)' : 'Disabled (Отключено)'}\n` +
            '    Расположение Windows RE:     \\\\?\\GLOBALROOT\\device\\harddisk0\\partition4\\Recovery\\WindowsRE\n' +
            '    Идентификатор данных BCD:    {4a92c36a-208b-11ef-93a8-b42e99fa38c1}\n' +
            '    Расположение образа:         \\\\?\\GLOBALROOT\\device\\harddisk0\\partition4\\Recovery\\WindowsRE\\Winre.wim\n' +
            '    Индекс образа:               1\n' +
            '    Расположение пользовательского образа:\n' +
            '    Индекс пользовательского образа:       0\n\n' +
            'REAGENTC.EXE: Операция выполнена успешно.'
          );
        } else if (arg === '/enable' || arg === 'enable' || arg === '-enable') {
          setWinreEnabled(true);
          newLines.push(
            'REAGENTC.EXE: Операция выполнена успешно. Среда восстановления Windows (WinRE) включена.'
          );
        } else if (arg === '/disable' || arg === 'disable' || arg === '-disable') {
          setWinreEnabled(false);
          newLines.push(
            'REAGENTC.EXE: Операция выполнена успешно. Среда восстановления Windows (WinRE) отключена.'
          );
        } else {
          newLines.push(
            'Использование REAGENTC:\n' +
            '  reagentc /info     - Сведения о состоянии WinRE\n' +
            '  reagentc /enable   - Включить среду восстановления\n' +
            '  reagentc /disable  - Отключить среду восстановления'
          );
        }
        break;
      }

      case 'setup':
      case 'reinstall':
        newLines.push('Инициализация программы установки Windows 11 из среды восстановления...');
        setCmdLines(newLines);
        setCmdInput('');
        setTimeout(() => {
          setStep('reinstall_stage1_regional');
        }, 800);
        return;

      case 'bootrec':
        if (arg.includes('/fixmbr')) {
          newLines.push('Операция успешно завершена. Загрузочная запись MBR успешно обновлена.');
        } else if (arg.includes('/fixboot')) {
          newLines.push('Операция успешно завершена. Новый загрузочный сектор записан.');
        } else if (arg.includes('/rebuildbcd')) {
          newLines.push('Сканирование всех дисков на наличие установок Windows...\nОбнаружено установок Windows: 1 [C:\\Windows]\nДобавить установку в список загрузки? Да.\nОперация успешно завершена.');
        } else {
          newLines.push('Использование bootrec:\n  bootrec /fixmbr\n  bootrec /fixboot\n  bootrec /rebuildbcd');
        }
        break;

      case 'chkdsk':
        newLines.push(
          'Тип файловой системы: NTFS.\n' +
          'Метка тома: Windows 11 OS.\n' +
          'Этап 1: проверка базовой структуры файловой системы...\n' +
          'Этап 2: проверка связей имен файлов...\n' +
          'Этап 3: проверка дескрипторов безопасности...\n' +
          'Windows проверила файловую систему и не обнаружила проблем.\n' +
          'Ошибок не обнаружено. 104857600 КБ всего на диске.'
        );
        break;

      case 'dir':
        newLines.push(
          ' Содержимое папки X:\\windows\\system32\n\n' +
          '01.09.2026  12:00    <DIR>          .\n' +
          '01.09.2026  12:00    <DIR>          ..\n' +
          '01.09.2026  12:00           542 720 cmd.exe\n' +
          '01.09.2026  12:00           128 512 sfc.exe\n' +
          '01.09.2026  12:00           194 048 reagentc.exe\n' +
          '01.09.2026  12:00           215 040 bootrec.exe\n' +
          '01.09.2026  12:00            45 056 chkdsk.exe\n' +
          '01.09.2026  12:00         2 458 624 setup.exe\n' +
          '               6 файлов      3 584 000 байт'
        );
        break;

      case 'cls':
        setCmdLines([
          'Microsoft Windows [Среда восстановления WinRE версии 10.0.22631.3296]',
          'X:\\windows\\system32>',
        ]);
        setCmdInput('');
        return;

      case 'exit':
        setStep('advanced_options');
        return;

      default:
        newLines.push(`"${val}" не распознана как внутренняя или внешняя команда. Введите "help" для справки.`);
        break;
    }

    setCmdLines(newLines);
    setCmdInput('');
  };

  const handleCmdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      if (cmdHistory.length > 0 && cmdHistoryIdx < cmdHistory.length - 1) {
        const nextIdx = cmdHistoryIdx + 1;
        setCmdHistoryIdx(nextIdx);
        setCmdInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (cmdHistoryIdx > 0) {
        const prevIdx = cmdHistoryIdx - 1;
        setCmdHistoryIdx(prevIdx);
        setCmdInput(cmdHistory[prevIdx]);
      } else if (cmdHistoryIdx === 0) {
        setCmdHistoryIdx(-1);
        setCmdInput('');
      }
    }
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
                    Переустановка Windows с начальной настройкой или дополнительные параметры
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
                className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-light tracking-tight">Диагностика</h1>
            </div>

            <div className="space-y-3 pt-2">
              {/* PRIMARY PROMPT REQUIREMENT: Переустановка Windows с началом */}
              <button
                onClick={() => setStep('reinstall_stage1_regional')}
                className="w-full p-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-all text-left flex items-center gap-4 group cursor-pointer border border-emerald-400/40"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-200 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-100 flex items-center gap-2">
                    <span>Переустановка Windows (Начальная настройка)</span>
                    <span className="text-[10px] uppercase font-bold bg-emerald-500/40 text-emerald-200 px-2 py-0.5 rounded-full">
                      Мастер чистой установки
                    </span>
                  </div>
                  <div className="text-xs text-blue-100 mt-0.5">
                    Полноценная переустановка: раскладка, время, язык → копирование файлов → настройка профиля → настройка системы → ожидание
                  </div>
                </div>
              </button>

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
                    Быстрый сброс с возможностью сохранить документы и системные настройки
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
                    Командная строка администратора, точки восстановления, параметры загрузки
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
                className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-light tracking-tight">Дополнительные параметры</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* WinRE Command Prompt */}
              <button
                onClick={() => setStep('winre_cmd')}
                className="p-4 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 transition-all text-left flex flex-col gap-2 border border-sky-400/40 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <TerminalIcon size={24} className="text-sky-300" />
                  <span className="text-[10px] font-mono uppercase bg-sky-500/30 text-sky-200 px-2 py-0.5 rounded">
                    Администратор
                  </span>
                </div>
                <div className="font-semibold text-base text-sky-100">Командная строка (cmd.exe)</div>
                <div className="text-xs text-blue-100 leading-relaxed">
                  Полноценная консоль X:\windows\system32: sfc /scannow, reagentc /info /enable /disable, bootrec, chkdsk
                </div>
              </button>

              {/* Windows Reinstall Option */}
              <button
                onClick={() => setStep('reinstall_stage1_regional')}
                className="p-4 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-all text-left flex flex-col gap-2 border border-emerald-400/40 cursor-pointer"
              >
                <Sparkles size={24} className="text-emerald-300" />
                <div className="font-semibold text-base text-emerald-100">Переустановка Windows</div>
                <div className="text-xs text-blue-100 leading-relaxed">
                  Установка чистой ОС с пошаговой настройкой: раскладка, время, язык, профиль и система
                </div>
              </button>

              <button
                onClick={() => setStep('system_restore_select')}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10 cursor-pointer"
              >
                <Clock size={24} className="text-blue-200" />
                <div className="font-medium text-base">Восстановление системы</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Использование точки восстановления, записанной на компьютере, для отката Windows
                </div>
              </button>

              <button
                onClick={startStartupRepair}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10 cursor-pointer"
              >
                <Wrench size={24} className="text-blue-200" />
                <div className="font-medium text-base">Восстановление при загрузке</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Устранение неполадок, мешающих корректной загрузке операционной системы
                </div>
              </button>

              <button
                onClick={openStartupSettings}
                className="p-4 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 transition-all text-left flex flex-col gap-2 border border-amber-400/40 text-white cursor-pointer"
              >
                <Shield size={24} className="text-amber-300" />
                <div className="font-medium text-base text-amber-200">Параметры загрузки (Безопасный режим)</div>
                <div className="text-xs text-blue-100 leading-relaxed">
                  Запуск Windows в безопасном режиме (Safe Mode) с минимальным набором драйверов
                </div>
              </button>

              <button
                onClick={() => resetThisPC('remove_all')}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-left flex flex-col gap-2 border border-white/10 cursor-pointer"
              >
                <HardDrive size={24} className="text-blue-200" />
                <div className="font-medium text-base">Полный заводской сброс</div>
                <div className="text-xs text-blue-200 leading-relaxed">
                  Форматирование и удаление всех личных файлов и приложений с диска
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REINSTALLATION WIZARD: 5 STAGES AS REQUESTED BY USER */}
        {/* 1. Раскладка, время, язык */}
        {/* 2. Копирование файлов */}
        {/* 3. Настройка профиля */}
        {/* 4. Настройка системы */}
        {/* 5. Ожидание */}
        {/* ========================================================================= */}

        {/* STAGE 1: РАСКЛАДКА, ВРЕМЯ, ЯЗЫК */}
        {step === 'reinstall_stage1_regional' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('troubleshoot')}
                className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-light tracking-tight">Установка Windows 11</h1>
                <div className="text-xs text-blue-200">Шаг 1 из 5: Выбор языка, формата времени и раскладки клавиатуры</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-5">
              {/* Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-100 flex items-center gap-2">
                  <Globe size={14} className="text-sky-300" />
                  <span>Устанавливаемый язык:</span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#004b85] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Русский">Русский (Россия)</option>
                  <option value="English">English (United States)</option>
                  <option value="Deutsch">Deutsch (Deutschland)</option>
                  <option value="Español">Español (España)</option>
                </select>
              </div>

              {/* Time format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-100 flex items-center gap-2">
                  <Calendar size={14} className="text-sky-300" />
                  <span>Формат времени и денежных единиц:</span>
                </label>
                <select
                  value={selectedTimeFormat}
                  onChange={(e) => setSelectedTimeFormat(e.target.value)}
                  className="w-full bg-[#004b85] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Русский (Россия)">Русский (Россия) — 24-часовой формат</option>
                  <option value="English (United States)">English (United States) — 12-hour AM/PM</option>
                  <option value="English (United Kingdom)">English (United Kingdom) — 24-hour</option>
                </select>
              </div>

              {/* Keyboard Layout */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-100 flex items-center gap-2">
                  <Keyboard size={14} className="text-sky-300" />
                  <span>Раскладка клавиатуры или метод ввода:</span>
                </label>
                <select
                  value={selectedKeyboard}
                  onChange={(e) => setSelectedKeyboard(e.target.value)}
                  className="w-full bg-[#004b85] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Русская">Русская (ЙЦУКЕН)</option>
                  <option value="США">США (QWERTY)</option>
                  <option value="Казахская">Казахская (Русская)</option>
                  <option value="Немецкая">Немецкая (QWERTZ)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep('troubleshoot')}
                className="px-5 py-2 rounded-lg border border-white/30 hover:bg-white/10 text-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={() => setStep('reinstall_stage2_copying')}
                className="px-6 py-2.5 rounded-lg bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
              >
                Далее &gt;
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: КОПИРОВАНИЕ ФАЙЛОВ */}
        {step === 'reinstall_stage2_copying' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1 mb-4">
              <h1 className="text-2xl font-light tracking-tight">Установка Windows</h1>
              <div className="text-xs text-blue-200">Шаг 2 из 5: Копирование и подготовка системных файлов</div>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-4">
              {/* Copy progress bar */}
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${copyProgress}%` }}
                />
              </div>

              {/* Progress items checklist */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-center gap-3 text-emerald-300 font-medium">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>Копирование файлов Windows (100%)</span>
                </div>

                <div className={`flex items-center gap-3 transition-opacity ${
                  copyProgress >= 15 ? 'text-white' : 'opacity-40'
                }`}>
                  {copyProgress >= 75 ? (
                    <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
                  ) : (
                    <div className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                  )}
                  <span>
                    Подготовка файлов для установки ({copyProgress}%)
                  </span>
                </div>

                <div className={`flex items-center gap-3 transition-opacity ${
                  copyProgress >= 75 ? 'text-white' : 'opacity-40'
                }`}>
                  {copyProgress >= 90 ? (
                    <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
                  ) : copyProgress >= 75 ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-white/30 shrink-0" />
                  )}
                  <span>Установка компонентов Windows</span>
                </div>

                <div className={`flex items-center gap-3 transition-opacity ${
                  copyProgress >= 90 ? 'text-white' : 'opacity-40'
                }`}>
                  {copyProgress >= 98 ? (
                    <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
                  ) : copyProgress >= 90 ? (
                    <div className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-white/30 shrink-0" />
                  )}
                  <span>Установка обновлений системы</span>
                </div>

                <div className={`flex items-center gap-3 transition-opacity ${
                  copyProgress >= 98 ? 'text-white font-medium' : 'opacity-40'
                }`}>
                  {copyProgress >= 100 ? (
                    <CheckCircle2 size={18} className="text-emerald-300 shrink-0" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-white/30 shrink-0" />
                  )}
                  <span>Завершение</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-blue-200">
              Пожалуйста, подождите. Компьютер автоматически перезагрузится после завершения копирования.
            </p>
          </div>
        )}

        {/* STAGE 3: НАСТРОЙКА ПРОФИЛЯ */}
        {step === 'reinstall_stage3_profile' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-light tracking-tight">Кто будет использовать этот компьютер?</h1>
              <div className="text-xs text-blue-200">Шаг 3 из 5: Создание учетной записи и имени компьютера</div>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-100 flex items-center gap-2">
                  <User size={14} className="text-sky-300" />
                  <span>Имя пользователя:</span>
                </label>
                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  placeholder="Введите имя (например: User)"
                  className="w-full bg-[#004b85] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Computer Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-100 flex items-center gap-2">
                  <Laptop size={14} className="text-sky-300" />
                  <span>Имя компьютера в сети:</span>
                </label>
                <input
                  type="text"
                  value={profileComputerName}
                  onChange={(e) => setProfileComputerName(e.target.value)}
                  placeholder="Например: DESKTOP-WIN11"
                  className="w-full bg-[#004b85] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white transition-colors font-mono"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-100 flex items-center gap-2">
                  <Shield size={14} className="text-sky-300" />
                  <span>Пароль (необязательно):</span>
                </label>
                <input
                  type="password"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  placeholder="Оставьте пустым для входа без пароля"
                  className="w-full bg-[#004b85] border border-white/20 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep('reinstall_stage4_system')}
                className="px-6 py-2.5 rounded-lg bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
              >
                Далее &gt;
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: НАСТРОЙКА СИСТЕМЫ */}
        {step === 'reinstall_stage4_system' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-light tracking-tight">Выберите параметры для вашего устройства</h1>
              <div className="text-xs text-blue-200">Шаг 4 из 5: Настройка темы оформления и параметров системы</div>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 border border-white/15 space-y-4 text-xs">
              {/* Theme choice */}
              <div>
                <label className="font-semibold text-blue-100 mb-2 block flex items-center gap-2">
                  <Monitor size={15} className="text-sky-300" />
                  <span>Тема оформления Windows 11:</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setProfileTheme('dark')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      profileTheme === 'dark'
                        ? 'bg-zinc-900 border-white text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center">
                      {profileTheme === 'dark' && <div className="w-2 h-2 rounded-full bg-sky-400" />}
                    </div>
                    <span>Темная тема</span>
                  </div>

                  <div
                    onClick={() => setProfileTheme('light')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                      profileTheme === 'light'
                        ? 'bg-slate-100 border-white text-blue-950 font-semibold shadow-md'
                        : 'bg-white/5 border-white/10 text-blue-100 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-blue-900 flex items-center justify-center">
                      {profileTheme === 'light' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <span>Светлая тема</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10 my-2" />

              {/* WinRE Enable Toggle */}
              <div
                onClick={() => setProfileWinreEnabled(!profileWinreEnabled)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer border border-white/10 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-white flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    <span>Среда восстановления Windows (WinRE)</span>
                  </div>
                  <div className="text-[11px] text-blue-200">
                    Автоматически включить компонент (reagentc /enable)
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-colors p-0.5 ${
                  profileWinreEnabled ? 'bg-sky-400' : 'bg-white/20'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    profileWinreEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Privacy toggles */}
              <div className="space-y-2 pt-1">
                <div className="font-medium text-blue-100">Параметры конфиденциальности:</div>

                <div
                  onClick={() => setPrivacyLocation(!privacyLocation)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <span>Определение местоположения</span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                    privacyLocation ? 'bg-sky-400' : 'bg-white/20'
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      privacyLocation ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>

                <div
                  onClick={() => setPrivacyDiagnostics(!privacyDiagnostics)}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <span>Отправка диагностических данных</span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                    privacyDiagnostics ? 'bg-sky-400' : 'bg-white/20'
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      privacyDiagnostics ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setStep('reinstall_stage3_profile')}
                className="px-5 py-2 rounded-lg border border-white/30 hover:bg-white/10 text-xs cursor-pointer"
              >
                &lt; Назад
              </button>
              <button
                onClick={() => setStep('reinstall_stage5_waiting')}
                className="px-6 py-2.5 rounded-lg bg-emerald-400 text-blue-950 font-bold text-xs hover:bg-emerald-300 transition-colors shadow-lg cursor-pointer"
              >
                Принять и применить параметры
              </button>
            </div>
          </div>
        )}

        {/* STAGE 5: ОЖИДАНИЕ (WINDOWS 11 OOBE FINALIZATION) */}
        {step === 'reinstall_stage5_waiting' && (
          <div className="fixed inset-0 bg-[#001026] text-white flex flex-col items-center justify-center p-6 z-60 animate-in fade-in duration-700">
            {/* Ambient Radial Glow */}
            <div className="absolute inset-0 bg-radial from-sky-600/20 via-transparent to-transparent pointer-events-none" />

            {/* Spinner */}
            <div className="relative mb-8">
              <div className="w-14 h-14 border-4 border-sky-500/20 border-t-sky-400 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={16} className="text-sky-300 animate-pulse" />
              </div>
            </div>

            {/* Phased greeting text */}
            <div className="text-center space-y-3 z-10 max-w-md">
              <h2 className="text-3xl font-light tracking-wide text-white animate-in fade-in zoom-in-95 duration-500">
                {waitingPhrases[waitingPhaseIndex]}
              </h2>
              <p className="text-xs text-sky-200/80 font-normal leading-relaxed">
                Шаг 5 из 5: Применение настроек профиля {profileUsername}, темы и системных служб.
              </p>
              <p className="text-[11px] text-zinc-400 pt-6">
                Не выключайте компьютер. Скоро вы сможете приступить к работе.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: SYSTEM RESTORE SELECTION WIZARD */}
        {step === 'system_restore_select' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('advanced_options')}
                className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
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
                className="px-5 py-2 rounded border border-white/30 hover:bg-white/10 text-xs cursor-pointer"
              >
                Отмена
              </button>
              <button
                onClick={startSystemRestore}
                disabled={!selectedPointId}
                className="px-6 py-2 rounded bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors disabled:opacity-50 cursor-pointer"
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
              className="px-8 py-2.5 rounded bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
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
              className="px-8 py-2.5 rounded bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-lg cursor-pointer"
            >
              Запустить Windows 11
            </button>
          </div>
        )}

        {/* STEP 9: WINRE COMMAND PROMPT (АДМИНИСТРАТОР X:\windows\system32) */}
        {step === 'winre_cmd' && (
          <div className="w-full bg-black/95 text-white font-mono text-xs rounded-xl p-4 border border-white/20 shadow-2xl space-y-2 h-[480px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400">
              <div className="flex items-center gap-2">
                <TerminalIcon size={14} className="text-sky-400" />
                <span className="text-zinc-200 font-semibold">Администратор: X:\windows\system32\cmd.exe (WinRE)</span>
              </div>
              <button
                onClick={() => setStep('advanced_options')}
                className="hover:text-white px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] transition-colors cursor-pointer"
              >
                Вернуться в меню WinRE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 select-text pr-1 font-mono">
              {cmdLines.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed text-zinc-200">
                  {line}
                </div>
              ))}
              <div ref={cmdBottomRef} />
            </div>

            <form onSubmit={handleCmdSubmit} className="flex items-center gap-2 pt-2 border-t border-zinc-800">
              <span className="text-yellow-400 font-semibold shrink-0">X:\windows\system32&gt;</span>
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                onKeyDown={handleCmdKeyDown}
                autoFocus
                placeholder="sfc /scannow, reagentc /info, reagentc /enable, setup, help..."
                className="flex-1 bg-transparent outline-none border-none text-white text-xs font-mono placeholder:text-zinc-600"
              />
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
