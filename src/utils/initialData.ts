import { AppDefinition, FileSystemItem, RestorePoint, SystemSettings } from '../types/system';

export const WALLPAPERS = [
  {
    id: 'bloom',
    name: 'Windows 11 Bloom (Light)',
    url: '/src/assets/images/win11_bloom_wallpaper_1790478484324.jpg',
    theme: 'light' as const,
  },
  {
    id: 'dark',
    name: 'Windows 11 Bloom (Dark)',
    url: '/src/assets/images/win11_dark_wallpaper_1790478502839.jpg',
    theme: 'dark' as const,
  },
  {
    id: 'sunrise',
    name: 'Sunrise Horizon',
    url: '/src/assets/images/win11_sunrise_wallpaper_1790478514640.jpg',
    theme: 'light' as const,
  },
  {
    id: 'deep-blue',
    name: 'Windows Blue Radial',
    url: 'linear-gradient(135deg, #0b1f3a 0%, #0d3b66 50%, #001220 100%)',
    theme: 'dark' as const,
  },
];

export const USER_AVATAR = '/src/assets/images/win11_user_avatar_1790478530962.jpg';

export const WINDOWS_VERSIONS: Record<string, import('../types/system').WindowsVersionInfo> = {
  win11_23h2_pro: {
    id: 'win11_23h2_pro',
    name: 'Windows 11 Pro',
    version: '23H2',
    build: '22631.3296',
    edition: 'Windows 11 Pro',
    features: [
      'Классический Fluent Design и центрированная панель задач',
      'Шифрование BitLocker и виртуализация Hyper-V',
      'Встроенная среда восстановления WinRE',
      'Интерактивный диспетчер задач и терминал',
    ],
    releaseDate: 'Октябрь 2023',
    updateSize: 'Базовый дистрибутив',
    experiencePack: 'Windows Feature Experience Pack 1000.22631.1000.0',
  },
  win11_24h1_pro: {
    id: 'win11_24h1_pro',
    name: 'Windows 11 24H1 Pro',
    version: '24H1',
    build: '26100.1742',
    edition: 'Windows 11 Pro',
    features: [
      'Обновленное ядро Germanium и поддержка Wi-Fi 7',
      'Нативная распаковка 7-zip и tar в Проводнике',
      'Команда sudo в терминале Windows',
      'Расширенные профили энергопотребления',
      'Улучшенное восстановление системы при сбоях',
    ],
    releaseDate: 'Май 2024',
    updateSize: '4.1 ГБ',
    experiencePack: 'Windows Feature Experience Pack 1000.26100.1000.0',
  },
  win11_25h2_pro: {
    id: 'win11_25h2_pro',
    name: 'Windows 11 25H2 Pro',
    version: '25H2',
    build: '27686.1000',
    edition: 'Windows 11 Pro',
    features: [
      'Компоненты ядра Windows NT переписанные на Rust',
      'Улучшенный режим энергосбережения Energy Saver Pro',
      'Продвинутая подсистема WinRE с интеллектуальной самодиагностикой',
      'Мгновенный откат драйверов в безопасном режиме',
      'Обновленный проводник с динамическими фильтрами',
    ],
    releaseDate: 'Октябрь 2025',
    updateSize: '5.2 ГБ',
    experiencePack: 'Windows Feature Experience Pack 1000.27686.1000.0',
  },
  win11_latest: {
    id: 'win11_latest',
    name: 'Windows последняя версия',
    version: '26H1 Preview',
    build: '28000.1000',
    edition: 'Windows 11 Pro Canary Edition',
    features: [
      'Экспериментальное ультра-ядро с нулевой задержкой',
      'Мгновенный переход в безопасный режим Safe Mode за 1 секунду',
      'Интеллектуальное самовосстановление системных файлов в фоне',
      'Квантово-устойчивые алгоритмы криптографии',
      'Полная интеграция с магазином виртуальных приложений',
    ],
    releaseDate: 'Сентябрь 2026 (Актуальная)',
    updateSize: '6.0 ГБ',
    experiencePack: 'Windows Next-Gen Experience Pack 2026.1',
  },
};

export const INITIAL_APPS: AppDefinition[] = [
  // Built-in System Apps
  {
    id: 'winver',
    name: 'Сведения о Windows (Winver)',
    icon: 'info',
    description: 'Системное окно сведений о выпуске Windows 11, версии сборки и лицензировании.',
    category: 'System',
    size: '1.2 MB',
    rating: 5.0,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'winver.exe',
    version: '10.0.22631.1',
  },
  {
    id: 'explorer',
    name: 'Проводник',
    icon: 'folder',
    description: 'Файловый менеджер Windows 11 для навигации по папкам и дискам.',
    category: 'System',
    size: '12.4 MB',
    rating: 4.8,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'explorer.exe',
    version: '10.0.22631.1',
  },
  {
    id: 'settings',
    name: 'Параметры',
    icon: 'settings',
    description: 'Системные настройки, персонализация, сброс до заводских настроек и восстановление WinRE.',
    category: 'System',
    size: '28.1 MB',
    rating: 4.6,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'SystemSettings.exe',
    version: '11.0.22631.1',
  },
  {
    id: 'terminal',
    name: 'Терминал Windows',
    icon: 'terminal',
    description: 'Командная строка с поддержкой команд файловой системы, утилит sfc, shutdown /r /o и системной информации.',
    category: 'System',
    size: '18.9 MB',
    rating: 4.9,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'cmd.exe',
    version: '1.19.10573.0',
  },
  {
    id: 'notepad',
    name: 'Блокнот',
    icon: 'notepad',
    description: 'Текстовый редактор с поддержкой создания, редактирования и сохранения файлов.',
    category: 'Productivity',
    size: '8.2 MB',
    rating: 4.7,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'notepad.exe',
    version: '11.2311.33.0',
  },
  {
    id: 'calculator',
    name: 'Калькулятор',
    icon: 'calculator',
    description: 'Стандартный калькулятор Windows 11 с историей вычислений и памятью.',
    category: 'Productivity',
    size: '6.5 MB',
    rating: 4.9,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'calc.exe',
    version: '11.2210.0.0',
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    icon: 'globe',
    description: 'Быстрый и безопасный веб-браузер с вкладками, закладками и симулятором поиска.',
    category: 'Productivity',
    size: '84.0 MB',
    rating: 4.5,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'msedge.exe',
    version: '122.0.2365.92',
  },
  {
    id: 'taskmgr',
    name: 'Диспетчер задач',
    icon: 'activity',
    description: 'Мониторинг запущенных процессов, графики нагрузки ЦП и оперативной памяти.',
    category: 'System',
    size: '14.2 MB',
    rating: 4.8,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: false,
    executableName: 'Taskmgr.exe',
    version: '10.0.22631.1',
  },
  {
    id: 'store',
    name: 'Microsoft Store',
    icon: 'store',
    description: 'Каталог приложений: находите, скачивайте и устанавливайте виртуальные программы.',
    category: 'System',
    size: '42.0 MB',
    rating: 4.4,
    isInstalled: true,
    isDefault: true,
    hasDesktopIcon: true,
    executableName: 'WinStore.App.exe',
    version: '22312.1401.5.0',
  },

  // Store Virtual Downloadable Apps
  {
    id: 'paint',
    name: 'Paint',
    icon: 'palette',
    description: 'Классический графический редактор для рисования, набросков, палитры цветов и сохранения изображений.',
    category: 'Entertainment',
    size: '24.5 MB',
    rating: 4.7,
    isInstalled: false,
    isDefault: false,
    hasDesktopIcon: false,
    executableName: 'mspaint.exe',
    version: '11.2309.28.0',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    icon: 'gamepad',
    description: 'Легендарная классическая головоломка "Сапер" с выбором сложности и флагами.',
    category: 'Entertainment',
    size: '15.3 MB',
    rating: 4.9,
    isInstalled: false,
    isDefault: false,
    hasDesktopIcon: false,
    executableName: 'minesweeper.exe',
    version: '2.1.0',
  },
  {
    id: 'cpuz',
    name: 'CPU-Z Hardware Monitor',
    icon: 'cpu',
    description: 'Диагностическая утилита спецификаций процессора, материнской платы и ОЗУ.',
    category: 'Utilities',
    size: '9.8 MB',
    rating: 4.9,
    isInstalled: false,
    isDefault: false,
    hasDesktopIcon: false,
    executableName: 'cpuz.exe',
    version: '2.08.0',
  },
  {
    id: 'mediaplayer',
    name: 'Медиаплеер',
    icon: 'music',
    description: 'Аудиоплеер со звуковыми треками, синтезатором волн и визуализацией частот.',
    category: 'Entertainment',
    size: '31.2 MB',
    rating: 4.6,
    isInstalled: false,
    isDefault: false,
    hasDesktopIcon: false,
    executableName: 'Microsoft.Media.Player.exe',
    version: '11.2310.8.0',
  },
  {
    id: 'vscode',
    name: 'Visual Studio Code',
    icon: 'code',
    description: 'Полнофункциональный редактор кода с подсветкой синтаксиса и возможностью запуска JavaScript.',
    category: 'Development',
    size: '96.4 MB',
    rating: 5.0,
    isInstalled: false,
    isDefault: false,
    hasDesktopIcon: false,
    executableName: 'Code.exe',
    version: '1.87.2',
  },
];

export const INITIAL_FILES: FileSystemItem[] = [
  // Root and User directories
  {
    id: 'c-drive',
    name: 'Локальный диск (C:)',
    path: 'C:',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'c-users',
    name: 'Users',
    path: 'C:/Users',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'c-user-home',
    name: 'User',
    path: 'C:/Users/User',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'folder-desktop',
    name: 'Desktop',
    path: 'C:/Users/User/Desktop',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'folder-docs',
    name: 'Documents',
    path: 'C:/Users/User/Documents',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'folder-downloads',
    name: 'Downloads',
    path: 'C:/Users/User/Downloads',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'folder-progfiles',
    name: 'Program Files',
    path: 'C:/Program Files',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'folder-windows',
    name: 'Windows',
    path: 'C:/Windows',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },
  {
    id: 'folder-system32',
    name: 'System32',
    path: 'C:/Windows/System32',
    isDirectory: true,
    updatedAt: '2026-09-01T12:00:00Z',
  },

  // Desktop files
  {
    id: 'file-trusted-test',
    name: 'Защищено TrustedInstaller.txt',
    path: 'C:/Users/User/Desktop/Защищено TrustedInstaller.txt',
    isDirectory: false,
    owner: 'trustedinstaller',
    permissions: [
      {
        principal: 'trustedinstaller',
        principalName: 'TrustedInstaller (NT SERVICE\\TrustedInstaller)',
        allowFullControl: true,
        allowModify: true,
        allowRead: true,
        allowWrite: true,
        allowRename: true,
      },
      {
        principal: 'system',
        principalName: 'СИСТЕМА',
        allowFullControl: true,
        allowModify: true,
        allowRead: true,
        allowWrite: true,
        allowRename: true,
      },
    ],
    content: `[ФАЙЛ С ЗАЩИТОЙ TRUSTEDINSTALLER]

Этот файл принадлежит учетной записи TrustedInstaller.
Согласно правилам безопасности Windows:
- Пользователь НЕ имеет права открыть данный файл
- Пользователь НЕ имеет права переименовать данный файл
- Пользователь НЕ имеет права удалить данный файл

Чтобы получить доступ к файлу:
1. Кликните правой кнопкой мыши по файлу -> "Запуск с правами TrustedInstaller"
   (Или запустите Блокнот/Терминал с правами TrustedInstaller)
2. Либо откройте "Свойства" -> вкладка "Безопасность" -> "Сменить владельца" и добавьте права пользователю!`,
    size: 512,
    updatedAt: '2026-09-26T20:00:00Z',
  },
  {
    id: 'file-interactive-test',
    name: 'Служба ИНТЕРАКТИВНЫЕ (Запрет переименования).txt',
    path: 'C:/Users/User/Desktop/Служба ИНТЕРАКТИВНЫЕ (Запрет переименования).txt',
    isDirectory: false,
    owner: 'user',
    permissions: [
      {
        principal: 'user',
        principalName: 'User (Общий администратор)',
        allowFullControl: true,
        allowModify: true,
        allowRead: true,
        allowWrite: true,
        allowRename: false,
        denyRename: true,
      },
      {
        principal: 'interactive',
        principalName: 'ИНТЕРАКТИВНЫЕ (Служба защиты от переименования)',
        allowFullControl: false,
        allowModify: false,
        allowRead: true,
        allowWrite: false,
        allowRename: false,
        denyRename: true,
      },
    ],
    content: `[СЛУЖБА ИНТЕРАКТИВНЫЕ]

К этому файлу привязана системная служба ИНТЕРАКТИВНЫЕ.
Особенность службы:
- Запрещено ТОЛЬКО переименование данного файла!
- Открытие и чтение файла — РАЗРЕШЕНО.
- Удаление файла — РАЗРЕШЕНО.
- Попробуйте переименовать файл (F2 или контекстное меню), чтобы увидеть блокировку службой ИНТЕРАКТИВНЫЕ!`,
    size: 420,
    updatedAt: '2026-09-26T20:00:00Z',
  },
  {
    id: 'file-security-guide',
    name: 'Инструкция по правам и запуску.txt',
    path: 'C:/Users/User/Desktop/Инструкция по правам и запуску.txt',
    isDirectory: false,
    owner: 'user',
    content: `Инструкция по управлению правами и запуском программ:

1. Запуск с разными правами:
   - Правый клик по любому приложению или файлу:
     * "Запуск от имени администратора" (с окном контроля UAC)
     * "Запуск от имени системы" (NT AUTHORITY\\SYSTEM)
     * "Запуск с самыми высокими правами (TrustedInstaller)" (рекорд по правам!)

2. Уровни прав и учетные записи:
   - User (Общий администратор)
   - Администраторы (Группа)
   - Администратор (Встроенный администратор)
   - СИСТЕМА (NT AUTHORITY\\SYSTEM) - наивысшие системные права ядра
   - TrustedInstaller (NT SERVICE\\TrustedInstaller) - рекордный уровень прав

3. Настройка разрешений:
   - Правый клик по файлу -> "Свойства" -> вкладка "Безопасность"
   - Добавление и удаление пользователей и служб
   - Смена владельца файла
   - Точечная настройка: Полный доступ, Изменение, Чтение, Запись, Переименование`,
    size: 780,
    updatedAt: '2026-09-26T20:00:00Z',
  },
  {
    id: 'file-welcome',
    name: 'Добро пожаловать в Windows 11.txt',
    path: 'C:/Users/User/Desktop/Добро пожаловать в Windows 11.txt',
    isDirectory: false,
    content: `Добро пожаловать в симулятор Windows 11!

Здесь реализованы ключевые системные компоненты:
1. Интерактивный рабочий стол с перемещением окон, панелью задач и пуском.
2. Проводник файлов с навигацией по диску C:, созданием папок и текстовых документов.
3. Microsoft Store с поддержкой скачивания и установки виртуальных программ (Paint, VS Code, Сапер, CPU-Z и др.).
4. Командная строка (cmd) с реальными системными командами (dir, cd, sfc /scannow, systeminfo, shutdown /r /o).
5. Сброс до заводских настроек в Параметрах -> Система -> Восстановление ("Сбросить этот ПК").
6. Среда восстановления WinRE (Windows Recovery Environment) с функциями восстановления системы из точек и устранения неполадок!`,
    size: 684,
    updatedAt: '2026-09-26T20:00:00Z',
  },
  {
    id: 'file-winre-info',
    name: 'Инструкция WinRE.txt',
    path: 'C:/Users/User/Desktop/Инструкция WinRE.txt',
    isDirectory: false,
    content: `Среда восстановления Windows (WinRE):

Как войти в WinRE:
1. Кликните по значку "Среда восстановления (WinRE)" на Рабочем столе.
2. Откройте "Параметры" -> "Система" -> "Восстановление" -> "Особые варианты загрузки" -> "Перезагрузить сейчас".
3. В Меню Пуск -> Питание -> Удерживая Shift, нажмите "Перезагрузка".
4. В Терминале выполните команду: shutdown /r /o

Возможности WinRE:
- Восстановление системы с помощью контрольных точек (System Restore)
- Полный или частичный сброс этого ПК
- Восстановление при загрузке (Startup Repair)
- Автономная командная строка WinRE`,
    size: 590,
    updatedAt: '2026-09-26T20:00:00Z',
  },

  // Documents files
  {
    id: 'file-system-spec',
    name: 'Характеристики_ПК.txt',
    path: 'C:/Users/User/Documents/Характеристики_ПК.txt',
    isDirectory: false,
    content: `Имя устройства: DESKTOP-WIN11PRO
Процессор: 13th Gen Intel(R) Core(TM) i9-13900K 3.00 GHz
Оперативная память: 32.0 ГБ (31.8 ГБ доступно)
Тип системы: 64-разрядная операционная система, процессор x64
Выпуск: Windows 11 Pro
Версия: 23H2
Сборка ОС: 22631.3296
Взаимодействие: Windows Feature Experience Pack 1000.22631.1000.0`,
    size: 345,
    updatedAt: '2026-09-26T18:30:00Z',
  },
];

export const INITIAL_SETTINGS: SystemSettings = {
  theme: 'light',
  wallpaper: '/src/assets/images/win11_bloom_wallpaper_1790478484324.jpg',
  accentColor: '#0078d4',
  soundEnabled: true,
  volume: 80,
  brightness: 95,
  wifi: true,
  bluetooth: true,
  nightLight: false,
  airplaneMode: false,
  taskbarAlignment: 'center',
  computerName: 'DESKTOP-WIN11PRO',
  registeredOwner: 'User',
  winreEnabled: true,
  language: 'Русский (Россия)',
  keyboardLayout: 'Русская (Россия)',
  timeFormat: '24 часа (Россия)',
};

export const INITIAL_RESTORE_POINTS: RestorePoint[] = [
  {
    id: 'rp-initial',
    name: 'Исходная контрольная точка установки Windows',
    timestamp: '2026-09-20T10:00:00Z',
    description: 'Системная точка восстановления, созданная после установки Windows 11.',
    snapshot: {
      files: INITIAL_FILES,
      installedAppIds: ['explorer', 'settings', 'terminal', 'notepad', 'calculator', 'edge', 'taskmgr', 'store'],
      settings: INITIAL_SETTINGS,
    },
  },
];
