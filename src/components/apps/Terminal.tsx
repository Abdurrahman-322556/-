import React, { useState, useRef, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { WINDOWS_VERSIONS } from '../../utils/initialData';
import { ElevationLevel } from '../../types/system';
import { PRINCIPALS } from '../../utils/security';

interface TerminalLine {
  id: string;
  type: 'prompt' | 'output' | 'error' | 'success';
  text: string;
}

interface TerminalProps {
  elevationLevel?: ElevationLevel;
}

export const Terminal: React.FC<TerminalProps> = ({ elevationLevel = 'user' }) => {
  const {
    files,
    createFile,
    createFolder,
    deleteItemChecked,
    renameItemChecked,
    updateFileSecurity,
    bootToWinRE,
    rebootSystem,
    resetThisPC,
    settings,
    currentVersion,
    bootMode,
    bootIntoSafeMode,
    openWindow,
  } = useSystem();

  const verInfo = WINDOWS_VERSIONS[currentVersion] || WINDOWS_VERSIONS.win11_23h2_pro;

  const isElevated = elevationLevel !== 'user';
  const defaultDir = isElevated ? 'C:/Windows/System32' : 'C:/Users/User';

  const [currentDir, setCurrentDir] = useState<string>(defaultDir);
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [textColor, setTextColor] = useState<string>('text-zinc-100');

  const elevationLabel =
    elevationLevel === 'trustedinstaller'
      ? 'РЕКОРД ПО ПРАВАМ: TrustedInstaller (NT SERVICE\\TrustedInstaller)'
      : elevationLevel === 'system'
      ? 'НАИВЫСШИЕ ПРАВА: СИСТЕМА (NT AUTHORITY\\SYSTEM)'
      : elevationLevel === 'admin'
      ? 'ПОВЫШЕННЫЕ ПРИВИЛЕГИИ: Администратор'
      : 'Стандартные права пользователя';

  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 'init-1',
      type: 'output',
      text: `Windows PowerShell [${verInfo.name} - Версия 10.0.${verInfo.build}]`,
    },
    {
      id: 'init-2',
      type: 'output',
      text: `(c) Корпорация Майкрософт (Microsoft Corporation). Все права защищены.`,
    },
    {
      id: 'init-3',
      type: 'success',
      text: `[Уровень прав: ${elevationLabel}] [${bootMode !== 'normal' ? 'РЕЖИМ: БЕЗОПАСНЫЙ' : 'ОБЫЧНЫЙ РЕЖИМ'}]`,
    },
    {
      id: 'init-4',
      type: 'output',
      text: 'Введите "help" для справки, "whoami" для проверки текущих прав, "winver" для сведений о системе.',
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) {
      setLines((prev) => [
        ...prev,
        { id: `line-${Date.now()}`, type: 'prompt', text: `${currentDir.replace(/\//g, '\\')}> ` },
      ]);
      return;
    }

    setHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    const promptLine: TerminalLine = {
      id: `p-${Date.now()}`,
      type: 'prompt',
      text: `${currentDir.replace(/\//g, '\\')}> ${cmd}`,
    };

    const parts = cmd.split(' ');
    const mainCommand = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    let newOutput: TerminalLine[] = [];

    switch (mainCommand) {
      case 'help':
        newOutput = [
          {
            id: `out-${Date.now()}-1`,
            type: 'output',
            text: `Список поддерживаемых системных команд:
  whoami          - Проверка текущего пользователя и уровня прав
  whoami /priv    - Просмотр активных привилегий безопасности
  whoami /groups  - Просмотр групп безопасности
  takeown /f <ф>  - Смена владельца файла на текущую учетную запись
  icacls <файл>   - Просмотр списка контроля доступа (ACL) и прав
  dir / ls        - Отображение файлов и папок в текущем каталоге
  cd <путь>       - Смена текущего каталога (например: cd Desktop или cd ..)
  ren <ст> <нов>  - Переименование файла с проверкой прав доступа
  del <файл>      - Удаление файла с проверкой прав доступа
  type <файл>     - Просмотр содержимого текстового файла
  mkdir <имя>     - Создание новой папки
  winver          - Открыть окно сведений о версии Windows
  safemode        - Перезагрузка в безопасный режим (Safe Mode)
  systeminfo      - Сведения о конфигурации системы, оборудовании и выпуске ОС
  sfc /scannow    - Сканирование целостности системных файлов
  shutdown /r /o  - Перезагрузка и вход в среду восстановления WinRE
  shutdown /r     - Перезагрузка Windows
  reset           - Запуск восстановления системы (сброс к заводским настройкам)
  ipconfig        - Отображение сетевых параметров
  ver             - Версия и сборка операционной системы
  cls / clear     - Очистка экрана консоли
  echo <т> > <ф>  - Запись строки в файл`,
          },
        ];
        break;

      case 'whoami': {
        const isPriv = arg.includes('/priv');
        const isGroups = arg.includes('/groups');

        if (isPriv) {
          if (elevationLevel === 'trustedinstaller') {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `СВЕДЕНИЯ О ПРИВИЛЕГИЯХ (TrustedInstaller - РЕКОРДНЫЙ УРОВЕНЬ ПРАВ)
------------------------------------------------------------------------
Имя привилегии                Описание                              Состояние
============================= ===================================== =========
SeTakeOwnershipPrivilege      Смена владельцев файлов и объектов    Включено
SeSecurityPrivilege           Управление аудитом и журналом         Включено
SeBackupPrivilege             Архивация любых файлов и папок        Включено
SeRestorePrivilege            Восстановление любых файлов и папок   Включено
SeDebugPrivilege              Отладка любых системных процессов     Включено
SeLoadDriverPrivilege         Загрузка и выгрузка драйверов ядра    Включено
SeTcbPrivilege                Действие в качестве части операционной Включено
SeTrustedInstallerBypass      Обход всех ограничений безопасности   Включено`,
              },
            ];
          } else if (elevationLevel === 'system') {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `СВЕДЕНИЯ О ПРИВИЛЕГИЯХ (NT AUTHORITY\\SYSTEM)
------------------------------------------------------------------------
Имя привилегии                Описание                              Состояние
============================= ===================================== =========
SeTcbPrivilege                Действие в качестве части ОС          Включено
SeAssignPrimaryTokenPrivilege Замена маркера уровня процесса        Включено
SeLockMemoryPrivilege         Блокировка страниц в памяти           Включено
SeBackupPrivilege             Архивация файлов и каталогов          Включено
SeRestorePrivilege            Восстановление файлов и каталогов     Включено
SeDebugPrivilege              Отладка программ                      Включено`,
              },
            ];
          } else if (elevationLevel === 'admin') {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `СВЕДЕНИЯ О ПРИВИЛЕГИЯХ (Администратор)
------------------------------------------------------------------------
Имя привилегии                Описание                              Состояние
============================= ===================================== =========
SeShutdownPrivilege           Завершение работы системы             Включено
SeChangeNotifyPrivilege       Обход перекрестной проверки           Включено
SeUndockPrivilege             Извлечение компьютера из док-станции  Включено
SeIncreaseWorkingSetPrivilege Увеличение рабочего набора            Включено`,
              },
            ];
          } else {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `СВЕДЕНИЯ О ПРИВИЛЕГИЯХ (Обычный пользователь)
------------------------------------------------------------------------
Имя привилегии                Описание                              Состояние
============================= ===================================== =========
SeChangeNotifyPrivilege       Обход перекрестной проверки           Включено
SeShutdownPrivilege           Завершение работы системы             Включено`,
              },
            ];
          }
        } else if (isGroups) {
          if (elevationLevel === 'trustedinstaller') {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `Группы пользователя NT SERVICE\\TrustedInstaller:
  - NT SERVICE\\TrustedInstaller (Обязательная группа, Владелец)
  - BUILTIN\\Administrators
  - NT AUTHORITY\\SYSTEM`,
              },
            ];
          } else if (elevationLevel === 'system') {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `Группы учетной записи NT AUTHORITY\\SYSTEM:
  - NT AUTHORITY\\SYSTEM (Высочайшие системные привилегии)
  - BUILTIN\\Administrators`,
              },
            ];
          } else {
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `Группы учетной записи ${settings.registeredOwner}:
  - ${settings.computerName}\\Users
  - BUILTIN\\Administrators
  - Консольный вход`,
              },
            ];
          }
        } else {
          // Standard whoami
          if (elevationLevel === 'trustedinstaller') {
            newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: 'nt service\\trustedinstaller' }];
          } else if (elevationLevel === 'system') {
            newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: 'nt authority\\system' }];
          } else if (elevationLevel === 'admin') {
            newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: `${settings.computerName}\\${settings.registeredOwner} (Администратор)` }];
          } else {
            newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: `${settings.computerName}\\${settings.registeredOwner}` }];
          }
        }
        break;
      }

      case 'icacls': {
        if (!arg) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Использование: icacls <имя_файла>' }];
        } else {
          const filePath = `${currentDir}/${arg}`.toLowerCase();
          const targetFile = files.find((f) => f.path.toLowerCase() === filePath);
          if (!targetFile) {
            newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Файл не найден: ${arg}` }];
          } else {
            const ownerName = PRINCIPALS[targetFile.owner || 'user']?.name || 'User';
            const perms = targetFile.permissions || [];
            const permsLines = perms.map((p) => {
              const flags = [];
              if (p.allowFullControl) flags.push('(F)');
              if (p.allowModify) flags.push('(M)');
              if (p.allowRead) flags.push('(R,RX)');
              if (p.allowWrite) flags.push('(W)');
              if (p.denyRename || p.principal === 'interactive') flags.push('(DENY:RENAME)');
              return `  ${p.principalName}: ${flags.join(' ')}`;
            }).join('\n');

            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'output',
                text: `${targetFile.path}\nВладелец объекта: ${ownerName}\nРазрешения безопасности (DACL):\n${permsLines || '  (Наследуются от родительского каталога)'}\nУспешно обработано 1 файлов.`,
              },
            ];
          }
        }
        break;
      }

      case 'takeown': {
        // takeown /f <file>
        const targetName = arg.replace(/\/f\s+/i, '').trim();
        if (!targetName) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Использование: takeown /f <имя_файла>' }];
        } else {
          const filePath = `${currentDir}/${targetName}`.toLowerCase();
          const targetFile = files.find((f) => f.path.toLowerCase() === filePath);
          if (!targetFile) {
            newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Файл не найден: ${targetName}` }];
          } else {
            const newOwner = elevationLevel === 'trustedinstaller' ? 'trustedinstaller' : elevationLevel === 'system' ? 'system' : 'user';
            updateFileSecurity(targetFile.id, newOwner, targetFile.permissions || []);
            newOutput = [
              {
                id: `out-${Date.now()}`,
                type: 'success',
                text: `УСПЕХ: Файл "${targetName}" теперь принадлежит текущей учетной записи (${PRINCIPALS[newOwner]?.name}).`,
              },
            ];
          }
        }
        break;
      }

      case 'ren':
      case 'rename': {
        const parts = arg.split(/\s+/);
        if (parts.length < 2) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Синтаксическая ошибка. Используйте: ren <старое_имя> <новое_имя>' }];
        } else {
          const oldName = parts[0];
          const newName = parts.slice(1).join(' ');
          const filePath = `${currentDir}/${oldName}`.toLowerCase();
          const targetFile = files.find((f) => f.path.toLowerCase() === filePath);
          if (!targetFile) {
            newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Файл не найден: ${oldName}` }];
          } else {
            const success = renameItemChecked(targetFile.id, newName, elevationLevel);
            if (success) {
              newOutput = [{ id: `out-${Date.now()}`, type: 'success', text: `Файл "${oldName}" переименован в "${newName}".` }];
            } else {
              newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Отказано в доступе при попытке переименовать файл "${oldName}". Проверьте разрешения безопасности.` }];
            }
          }
        }
        break;
      }

      case 'cls':
      case 'clear':
        setLines([]);
        return;

      case 'ver':
        newOutput = [
          { id: `out-${Date.now()}`, type: 'output', text: `Microsoft Windows [${verInfo.name} - Version 10.0.${verInfo.build}]` },
        ];
        break;

      case 'winver':
        openWindow('winver');
        newOutput = [
          { id: `out-${Date.now()}`, type: 'output', text: `Открыто окно сведений о системе Winver (${verInfo.name} сборка ${verInfo.build}).` },
        ];
        break;

      case 'safemode':
        newOutput = [
          { id: `out-${Date.now()}`, type: 'output', text: 'Инициализация перезагрузки в безопасный режим (Safe Mode)...' },
        ];
        setTimeout(() => bootIntoSafeMode('safemode'), 1200);
        break;

      case 'dir':
      case 'ls': {
        const currentItems = files.filter((item) => {
          const itemParent = item.path.substring(0, item.path.lastIndexOf('/')) || 'C:';
          return itemParent.toLowerCase() === currentDir.toLowerCase() && item.path !== currentDir;
        });

        const listText = currentItems
          .map((i) => {
            const time = new Date(i.updatedAt).toLocaleDateString('ru-RU');
            const type = i.isDirectory ? '<DIR>          ' : `      ${i.size || 0} Б `;
            return `${time}  ${type}  ${i.name}`;
          })
          .join('\n');

        newOutput = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            text: ` Содержимое папки ${currentDir.replace(/\//g, '\\')}:\n\n${listText || '  (Каталог пуст)'}\n\n              Всего файлов/папок: ${currentItems.length}`,
          },
        ];
        break;
      }

      case 'cd': {
        if (!arg || arg === '.') {
          newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: currentDir.replace(/\//g, '\\') }];
        } else if (arg === '..' || arg === '../') {
          if (currentDir !== 'C:' && currentDir.includes('/')) {
            const upParts = currentDir.split('/');
            upParts.pop();
            setCurrentDir(upParts.join('/') || 'C:');
          }
        } else if (arg === '\\' || arg === '/') {
          setCurrentDir('C:');
        } else {
          // Resolve relative or absolute
          let target = arg.startsWith('C:') ? arg.replace(/\\/g, '/') : `${currentDir}/${arg}`.replace(/\\/g, '/');
          target = target.replace(/\/$/, '');

          const exists = files.find((f) => f.path.toLowerCase() === target.toLowerCase() && f.isDirectory);
          if (exists) {
            setCurrentDir(exists.path);
          } else {
            newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Системе не удается найти указанный путь: ${arg}` }];
          }
        }
        break;
      }

      case 'mkdir': {
        if (!arg) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Синтаксическая ошибка команды. Используйте: mkdir <имя_папки>' }];
        } else {
          createFolder(currentDir, arg);
          newOutput = [{ id: `out-${Date.now()}`, type: 'success', text: `Папка "${arg}" успешно создана.` }];
        }
        break;
      }

      case 'type':
      case 'cat': {
        if (!arg) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Укажите имя файла для просмотра: type <имя_файла>' }];
        } else {
          const filePath = `${currentDir}/${arg}`.toLowerCase();
          const targetFile = files.find((f) => f.path.toLowerCase() === filePath && !f.isDirectory);
          if (targetFile) {
            newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: targetFile.content || '(Файл пуст)' }];
          } else {
            newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Не удается найти файл: ${arg}` }];
          }
        }
        break;
      }

      case 'del':
      case 'rm': {
        if (!arg) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Укажите имя файла: del <файл>' }];
        } else {
          const filePath = `${currentDir}/${arg}`.toLowerCase();
          const targetFile = files.find((f) => f.path.toLowerCase() === filePath);
          if (targetFile) {
            const allowed = deleteItemChecked(targetFile.id, elevationLevel);
            if (allowed) {
              newOutput = [{ id: `out-${Date.now()}`, type: 'success', text: `Файл "${arg}" успешно удален.` }];
            } else {
              newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Отказано в доступе при попытке удалить файл "${arg}". Требуются разрешения от TrustedInstaller.` }];
            }
          } else {
            newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: `Файл "${arg}" не найден.` }];
          }
        }
        break;
      }

      case 'systeminfo':
        newOutput = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            text: `Имя узла:                      ${settings.computerName}
Название ОС:                   Майкрософт ${verInfo.edition}
Выпуск / Версия ОС:            ${verInfo.name} (${verInfo.version})
Сборка ОС:                     10.0.${verInfo.build}
Изготовитель ОС:               Microsoft Corporation
Режим загрузки:                ${bootMode !== 'normal' ? 'Безопасный режим (Safe Mode)' : 'Обычный'}
Параметры ОС:                  Изолированная рабочая станция
Пакет взаимодействия:          ${verInfo.experiencePack}
Зарегистрированный владелец:   ${settings.registeredOwner}
Тип системы:                   x64-based PC
Процессор(ы):                  13th Gen Intel(R) Core(TM) i9-13900K, 24 ядер
Версия BIOS:                   American Megatrends Inc. 2.10, UEFI
Папка Windows:                 C:\\Windows
Системная папка:               C:\\Windows\\system32
Среда восстановления (WinRE):  Включена (раздел 4 / recovery.wim)
Полный объем физ. памяти:      32 768 МБ
Доступная физ. память:         24 150 МБ
Виртуальная память:            Макс: 37 632 МБ, Доступно: 28 900 МБ
Сетевые адаптеры:              Intel(R) Wi-Fi 6E AX210 160MHz (${bootMode === 'safemode' ? 'Отключено в Safe Mode' : 'Подключено'})`,
          },
        ];
        break;

      case 'sfc':
        if (arg === '/scannow') {
          newOutput = [
            {
              id: `out-${Date.now()}`,
              type: 'output',
              text: `Начато сканирование системы. Этот процесс может занять некоторое время.

Начало этапа проверки при сканировании системы.
Проверка 100% завершена.

Защита ресурсов Windows не обнаружила нарушений целостности. Все компоненты в норме.`,
            },
          ];
        } else {
          newOutput = [{ id: `out-${Date.now()}`, type: 'error', text: 'Используйте команду: sfc /scannow' }];
        }
        break;

      case 'shutdown':
        if (arg.includes('/o') || arg.includes('-o')) {
          newOutput = [
            {
              id: `out-${Date.now()}`,
              type: 'output',
              text: 'Инициализация перезагрузки в среду восстановления Windows (WinRE)...',
            },
          ];
          setTimeout(() => bootToWinRE(), 1200);
        } else if (arg.includes('/r') || arg.includes('-r')) {
          newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: 'Перезагрузка компьютера...' }];
          setTimeout(() => rebootSystem(), 1200);
        } else {
          newOutput = [
            {
              id: `out-${Date.now()}`,
              type: 'output',
              text: 'Использование:\n  shutdown /r      - Перезагрузка Windows\n  shutdown /r /o   - Перезагрузка в среду восстановления WinRE',
            },
          ];
        }
        break;

      case 'reset':
        newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: 'Запуск процесса сброса параметров ПК...' }];
        setTimeout(() => resetThisPC('keep_files'), 1000);
        break;

      case 'ipconfig':
        newOutput = [
          {
            id: `out-${Date.now()}`,
            type: 'output',
            text: `Настройка протокола IP для Windows

Адаптер беспроводной локальной сети Беспроводная сеть:
   DNS-суффикс подключения . . . . . : localdomain
   Локальный IPv6-адрес . . . . . . . : fe80::5482:48f2:193a:94d1%12
   IPv4-адрес. . . . . . . . . . . . : 192.168.1.145
   Маска подсети . . . . . . . . . . : 255.255.255.0
   Основной шлюз. . . . . . . . . : 192.168.1.1`,
          },
        ];
        break;

      case 'echo': {
        const match = rawCmd.match(/echo\s+(.*?)\s*>\s*(.+)/i);
        if (match) {
          const contentToSave = match[1];
          const fileToSave = match[2].trim();
          createFile(currentDir, fileToSave, contentToSave);
          newOutput = [{ id: `out-${Date.now()}`, type: 'success', text: `Записано в файл "${fileToSave}".` }];
        } else {
          newOutput = [{ id: `out-${Date.now()}`, type: 'output', text: arg || '' }];
        }
        break;
      }

      default:
        newOutput = [
          {
            id: `err-${Date.now()}`,
            type: 'error',
            text: `"${mainCommand}" не является внутренней или внешней командой, исполняемой программой или пакетным файлом. Введите "help" для справки.`,
          },
        ];
    }

    setLines((prev) => [...prev, promptLine, ...newOutput]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInputVal(history[prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`flex-1 flex flex-col h-full p-3 font-mono text-xs overflow-y-auto bg-black/95 ${textColor} select-text`}
    >
      {/* Terminal Lines */}
      {lines.map((l) => (
        <div
          key={l.id}
          className={`mb-1 whitespace-pre-wrap leading-relaxed ${
            l.type === 'error'
              ? 'text-red-400'
              : l.type === 'success'
              ? 'text-emerald-400'
              : l.type === 'prompt'
              ? 'text-yellow-400 font-semibold'
              : 'text-zinc-200'
          }`}
        >
          {l.text}
        </div>
      ))}

      {/* Active Prompt Input */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-yellow-400 font-semibold shrink-0">
          {currentDir.replace(/\//g, '\\')}&gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-white"
          spellCheck={false}
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
};
