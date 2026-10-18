import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AppDefinition,
  BootMode,
  ElevationLevel,
  FilePermission,
  FileSystemItem,
  NotificationItem,
  PrincipalType,
  ResetProgressState,
  RestorePoint,
  SystemSettings,
  SystemStatus,
  UpdateProgressState,
  WindowsVersion,
  WindowState,
} from '../types/system';
import {
  INITIAL_APPS,
  INITIAL_FILES,
  INITIAL_RESTORE_POINTS,
  INITIAL_SETTINGS,
} from '../utils/initialData';
import { playSound } from '../utils/sound';
import {
  checkCanDeleteFile,
  checkCanOpenFile,
  checkCanRenameFile,
  DEFAULT_FILE_PERMISSIONS,
} from '../utils/security';

interface SystemContextType {
  // System State
  systemStatus: SystemStatus;
  setSystemStatus: (status: SystemStatus) => void;
  resetProgress: ResetProgressState | null;

  // Windows Versions & Safe Mode
  currentVersion: WindowsVersion;
  setWindowsVersion: (version: WindowsVersion) => void;
  bootMode: BootMode;
  updateProgress: UpdateProgressState | null;
  installWindowsUpdate: (targetVersion: WindowsVersion) => void;
  bootIntoSafeMode: (mode?: BootMode) => void;
  exitSafeMode: () => void;
  openStartupSettings: () => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (partial: Partial<SystemSettings>) => void;

  // File System
  files: FileSystemItem[];
  createFile: (directoryPath: string, name: string, content?: string) => FileSystemItem;
  createFolder: (directoryPath: string, name: string) => FileSystemItem;
  deleteItem: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  renameItem: (id: string, newName: string) => void;
  getItemByPath: (path: string) => FileSystemItem | undefined;

  // Security & Permissions
  updateFileSecurity: (fileId: string, owner: PrincipalType, permissions: FilePermission[]) => void;
  openFileChecked: (id: string, elevation?: ElevationLevel) => boolean;
  renameItemChecked: (id: string, newName: string, elevation?: ElevationLevel) => boolean;
  deleteItemChecked: (id: string, elevation?: ElevationLevel) => boolean;
  securityModal: { visible: boolean; message: string; title?: string; fileId?: string } | null;
  closeSecurityModal: () => void;
  propertiesDialogFileId: string | null;
  openPropertiesDialog: (fileId: string) => void;
  closePropertiesDialog: () => void;

  // Apps
  apps: AppDefinition[];
  installingApps: Record<string, number>; // appId -> percent (0-100)
  installApp: (appId: string) => Promise<void>;
  uninstallApp: (appId: string) => void;

  // Window Management & Elevation
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (appId: string, customProps?: Record<string, unknown>, elevationLevel?: ElevationLevel) => void;
  requestElevatedLaunch: (appId: string, level: ElevationLevel, customProps?: Record<string, unknown>) => void;
  uacRequest: { appId: string; level: ElevationLevel; customProps?: Record<string, unknown> } | null;
  confirmUac: () => void;
  cancelUac: () => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
  updateWindowPosition: (id: string, pos: { x: number; y: number }) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  snapWindow: (id: string, snap: 'left' | 'right' | null) => void;

  // Notifications
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, appName?: string) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;

  // Recovery & WinRE
  restorePoints: RestorePoint[];
  createRestorePoint: (name: string, description?: string) => RestorePoint;
  restoreToPoint: (pointId: string) => Promise<boolean>;
  deleteRestorePoint: (pointId: string) => void;
  resetThisPC: (mode: 'keep_files' | 'remove_all') => void;
  bootToWinRE: () => void;
  rebootSystem: () => void;
  exitWinREToDesktop: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FILES: 'win11_sim_files_v1',
  APPS: 'win11_sim_apps_v1',
  SETTINGS: 'win11_sim_settings_v1',
  RESTORE_POINTS: 'win11_sim_restore_points_v1',
  VERSION: 'win11_sim_version_v1',
};

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage with graceful fallback
  const [systemStatus, setSystemStatus] = useState<SystemStatus>('desktop');
  const [resetProgress, setResetProgress] = useState<ResetProgressState | null>(null);
  const [updateProgress, setUpdateProgress] = useState<UpdateProgressState | null>(null);

  const [currentVersion, setCurrentVersion] = useState<WindowsVersion>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VERSION) as WindowsVersion;
      if (saved && ['win11_23h2_pro', 'win11_24h1_pro', 'win11_25h2_pro', 'win11_latest'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'win11_23h2_pro';
  });

  const [bootMode, setBootMode] = useState<BootMode>('normal');

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETTINGS;
  });

  const [files, setFiles] = useState<FileSystemItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FILES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FILES;
  });

  const [apps, setApps] = useState<AppDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPS);
      if (saved) {
        const savedApps: AppDefinition[] = JSON.parse(saved);
        // Merge with initial to preserve definitions
        return INITIAL_APPS.map((initApp) => {
          const matched = savedApps.find((s) => s.id === initApp.id);
          return matched ? { ...initApp, isInstalled: matched.isInstalled, hasDesktopIcon: matched.hasDesktopIcon } : initApp;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_APPS;
  });

  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTORE_POINTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RESTORE_POINTS;
  });

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [installingApps, setInstallingApps] = useState<Record<string, number>>({});

  // Security, ACL & Elevation States
  const [securityModal, setSecurityModal] = useState<{
    visible: boolean;
    message: string;
    title?: string;
    fileId?: string;
  } | null>(null);

  const [propertiesDialogFileId, setPropertiesDialogFileId] = useState<string | null>(null);

  const [uacRequest, setUacRequest] = useState<{
    appId: string;
    level: ElevationLevel;
    customProps?: Record<string, unknown>;
  } | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-welcome',
      title: 'Добро пожаловать в Windows 11',
      message: 'Система готова к работе. Доступны классические приложения, магазин программ и WinRE.',
      appName: 'Система',
      time: 'Только что',
      unread: true,
    },
  ]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
    } catch (e) {
      console.error(e);
    }
  }, [files]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(apps));
    } catch (e) {
      console.error(e);
    }
  }, [apps]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RESTORE_POINTS, JSON.stringify(restorePoints));
    } catch (e) {
      console.error(e);
    }
  }, [restorePoints]);

  const updateSettings = useCallback((partial: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // Notifications
  const addNotification = useCallback((title: string, message: string, appName = 'Windows') => {
    if (settings.soundEnabled) {
      playSound('notify', settings.volume / 100);
    }
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      appName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, [settings.soundEnabled, settings.volume]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Window Management
  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 10);
      return prev.map((w) => {
        if (w.id === id) {
          return { ...w, zIndex: maxZ + 1, isMinimized: false };
        }
        return w;
      });
    });
    setActiveWindowId(id);
  }, []);

  const openWindow = useCallback((appId: string, customProps?: Record<string, unknown>, elevationLevel?: ElevationLevel) => {
    if (settings.soundEnabled) {
      playSound('click', settings.volume / 100);
    }

    setWindows((prev) => {
      // Check if already open
      const existing = prev.find((w) => w.appId === appId);
      if (existing) {
        const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 10);
        setActiveWindowId(existing.id);
        return prev.map((w) =>
          w.id === existing.id
            ? {
                ...w,
                isMinimized: false,
                zIndex: maxZ + 1,
                elevationLevel: elevationLevel || w.elevationLevel,
                customProps: customProps || w.customProps,
              }
            : w
        );
      }

      const appDef = apps.find((a) => a.id === appId);
      let title = appDef ? appDef.name : appId;
      const icon = appDef ? appDef.icon : 'app';

      if (elevationLevel === 'trustedinstaller') {
        title = `${title} [TrustedInstaller]`;
      } else if (elevationLevel === 'system') {
        title = `${title} [СИСТЕМА]`;
      } else if (elevationLevel === 'admin') {
        title = `${title} [Администратор]`;
      }

      // Smart cascading window placement
      const offsetIndex = (prev.length % 6) * 32;
      const initialWidth = appId === 'calculator' ? 360 : appId === 'notepad' ? 680 : 840;
      const initialHeight = appId === 'calculator' ? 520 : appId === 'notepad' ? 500 : 580;

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      const posX = Math.max(40, Math.min(viewportWidth - initialWidth - 60, 100 + offsetIndex));
      const posY = Math.max(30, Math.min(viewportHeight - initialHeight - 80, 50 + offsetIndex));

      const maxZ = prev.reduce((max, w) => Math.max(max, w.zIndex), 10);
      const newWin: WindowState = {
        id: `win-${appId}-${Date.now()}`,
        appId,
        title,
        icon,
        isMinimized: false,
        isMaximized: false,
        position: { x: posX, y: posY },
        size: { width: initialWidth, height: initialHeight },
        zIndex: maxZ + 1,
        elevationLevel: elevationLevel || 'user',
        customProps: { ...customProps, elevationLevel: elevationLevel || 'user' },
      };

      setActiveWindowId(newWin.id);
      return [...prev, newWin];
    });
  }, [apps, settings.soundEnabled, settings.volume]);

  // Elevated Launch with UAC
  const requestElevatedLaunch = useCallback(
    (appId: string, level: ElevationLevel, customProps?: Record<string, unknown>) => {
      if (level === 'user') {
        openWindow(appId, customProps, 'user');
        return;
      }
      if (settings.soundEnabled) {
        playSound('notify', settings.volume / 100);
      }
      setUacRequest({ appId, level, customProps });
    },
    [openWindow, settings.soundEnabled, settings.volume]
  );

  const confirmUac = useCallback(() => {
    if (!uacRequest) return;
    const { appId, level, customProps } = uacRequest;
    setUacRequest(null);
    openWindow(appId, customProps, level);
  }, [uacRequest, openWindow]);

  const cancelUac = useCallback(() => {
    setUacRequest(null);
  }, []);

  // Security & Properties Dialog
  const openPropertiesDialog = useCallback((fileId: string) => {
    setPropertiesDialogFileId(fileId);
  }, []);

  const closePropertiesDialog = useCallback(() => {
    setPropertiesDialogFileId(null);
  }, []);

  const closeSecurityModal = useCallback(() => {
    setSecurityModal(null);
  }, []);

  const updateFileSecurity = useCallback(
    (fileId: string, owner: PrincipalType, permissions: FilePermission[]) => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === fileId) {
            return {
              ...f,
              owner,
              permissions,
              updatedAt: new Date().toISOString(),
            };
          }
          return f;
        })
      );
      addNotification(
        'Безопасность обновлена',
        'Разрешения и владелец объекта успешно сохранены.',
        'Безопасность Windows'
      );
    },
    [addNotification]
  );

  // File System methods
  const createFile = useCallback((directoryPath: string, name: string, content = ''): FileSystemItem => {
    const cleanDir = directoryPath.replace(/\/$/, '');
    const fullPath = `${cleanDir}/${name}`;
    const newItem: FileSystemItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      path: fullPath,
      isDirectory: false,
      content,
      size: new Blob([content]).size,
      updatedAt: new Date().toISOString(),
    };

    setFiles((prev) => {
      // Remove any existing file with same path
      const filtered = prev.filter((f) => f.path.toLowerCase() !== fullPath.toLowerCase());
      return [...filtered, newItem];
    });

    return newItem;
  }, []);

  const createFolder = useCallback((directoryPath: string, name: string): FileSystemItem => {
    const cleanDir = directoryPath.replace(/\/$/, '');
    const fullPath = `${cleanDir}/${name}`;
    const newItem: FileSystemItem = {
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      path: fullPath,
      isDirectory: true,
      updatedAt: new Date().toISOString(),
    };

    setFiles((prev) => {
      const filtered = prev.filter((f) => f.path.toLowerCase() !== fullPath.toLowerCase());
      return [...filtered, newItem];
    });

    return newItem;
  }, []);

  const deleteItem = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;
      // If folder, delete all children recursively
      if (target.isDirectory) {
        return prev.filter((f) => !f.path.startsWith(target.path));
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            content,
            size: new Blob([content]).size,
            updatedAt: new Date().toISOString(),
          };
        }
        return f;
      })
    );
  }, []);

  const renameItem = useCallback((id: string, newName: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;
      const parts = target.path.split('/');
      parts.pop();
      const parentPath = parts.join('/');
      const newPath = `${parentPath}/${newName}`;

      return prev.map((f) => {
        if (f.id === id) {
          return { ...f, name: newName, path: newPath, updatedAt: new Date().toISOString() };
        }
        if (target.isDirectory && f.path.startsWith(target.path + '/')) {
          const relative = f.path.substring(target.path.length);
          return { ...f, path: `${newPath}${relative}` };
        }
        return f;
      });
    });
  }, []);

  const getItemByPath = useCallback(
    (path: string) => {
      const normalized = path.replace(/\/$/, '').toLowerCase();
      return files.find((f) => f.path.toLowerCase() === normalized);
    },
    [files]
  );

  // Checked File Operations (Honoring TrustedInstaller and ИНТЕРАКТИВНЫЕ rules)
  const openFileChecked = useCallback(
    (id: string, elevation: ElevationLevel = 'user'): boolean => {
      const target = files.find((f) => f.id === id);
      if (!target) return false;
      const res = checkCanOpenFile(target, elevation);
      if (!res.allowed) {
        if (settings.soundEnabled) playSound('error', settings.volume / 100);
        setSecurityModal({
          visible: true,
          title: 'Ошибка доступа к объекту',
          message: res.reason || 'Вам отказано в доступе к объекту.',
          fileId: id,
        });
        return false;
      }
      return true;
    },
    [files, settings.soundEnabled, settings.volume]
  );

  const renameItemChecked = useCallback(
    (id: string, newName: string, elevation: ElevationLevel = 'user'): boolean => {
      const target = files.find((f) => f.id === id);
      if (!target) return false;
      const res = checkCanRenameFile(target, elevation);
      if (!res.allowed) {
        if (settings.soundEnabled) playSound('error', settings.volume / 100);
        setSecurityModal({
          visible: true,
          title: 'Отказ в доступе при переименовании',
          message: res.reason || 'Вам отказано в доступе на переименование.',
          fileId: id,
        });
        return false;
      }
      renameItem(id, newName);
      return true;
    },
    [files, settings.soundEnabled, settings.volume, renameItem]
  );

  const deleteItemChecked = useCallback(
    (id: string, elevation: ElevationLevel = 'user'): boolean => {
      const target = files.find((f) => f.id === id);
      if (!target) return false;
      const res = checkCanDeleteFile(target, elevation);
      if (!res.allowed) {
        if (settings.soundEnabled) playSound('error', settings.volume / 100);
        setSecurityModal({
          visible: true,
          title: 'Отказ в доступе при удалении',
          message: res.reason || 'Вам отказано в доступе на удаление.',
          fileId: id,
        });
        return false;
      }
      deleteItem(id);
      return true;
    },
    [files, settings.soundEnabled, settings.volume, deleteItem]
  );

  const closeWindow = useCallback((id: string) => {
    if (settings.soundEnabled) {
      playSound('click', settings.volume / 100);
    }
    setWindows((prev) => {
      const remaining = prev.filter((w) => w.id !== id);
      if (remaining.length > 0) {
        const nextActive = remaining.reduce((prevTop, curr) => (curr.zIndex > prevTop.zIndex ? curr : prevTop), remaining[0]);
        setActiveWindowId(nextActive.id);
      } else {
        setActiveWindowId(null);
      }
      return remaining;
    });
  }, [settings.soundEnabled, settings.volume]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prevActive) => (prevActive === id ? null : prevActive));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized, snapState: null } : w))
    );
  }, []);

  const updateWindowPosition = useCallback((id: string, pos: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: pos, snapState: null } : w))
    );
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, size, snapState: null } : w))
    );
  }, []);

  const snapWindow = useCallback((id: string, snap: 'left' | 'right' | null) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, snapState: snap, isMaximized: false } : w))
    );
  }, []);

  // App Installation & Store
  const installApp = useCallback(
    async (appId: string) => {
      if (installingApps[appId] !== undefined) return;

      const appDef = apps.find((a) => a.id === appId);
      if (!appDef || appDef.isInstalled) return;

      // Realistic download & install simulation progress (0 to 100%)
      setInstallingApps((prev) => ({ ...prev, [appId]: 0 }));

      for (let p = 10; p <= 100; p += 15) {
        await new Promise((r) => setTimeout(r, 220));
        setInstallingApps((prev) => ({ ...prev, [appId]: Math.min(100, p) }));
      }

      await new Promise((r) => setTimeout(r, 300));

      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, isInstalled: true, hasDesktopIcon: true } : a))
      );

      setInstallingApps((prev) => {
        const copy = { ...prev };
        delete copy[appId];
        return copy;
      });

      // Create an entry in Program Files in virtual filesystem
      createFolder('C:/Program Files', appDef.name);

      addNotification(
        'Программа установлена',
        `Приложение "${appDef.name}" успешно установлено и добавлено на рабочий стол и в меню "Пуск".`,
        'Microsoft Store'
      );
    },
    [apps, installingApps, addNotification, createFolder]
  );

  const uninstallApp = useCallback(
    (appId: string) => {
      const appDef = apps.find((a) => a.id === appId);
      if (!appDef || appDef.isDefault) return;

      // Close open window if any
      setWindows((prev) => prev.filter((w) => w.appId !== appId));

      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, isInstalled: false, hasDesktopIcon: false } : a))
      );

      // Clean folder in Program Files
      const progFolder = files.find((f) => f.path.toLowerCase() === `c:/program files/${appDef.name.toLowerCase()}`);
      if (progFolder) {
        deleteItem(progFolder.id);
      }

      addNotification('Программа удалена', `Приложение "${appDef.name}" успешно удалено с компьютера.`, 'Параметры');
    },
    [apps, files, deleteItem, addNotification]
  );

  // Restore Points & Recovery
  const createRestorePoint = useCallback(
    (name: string, description = 'Контрольная точка восстановления, созданная пользователем'): RestorePoint => {
      const newPoint: RestorePoint = {
        id: `rp-${Date.now()}`,
        name,
        timestamp: new Date().toISOString(),
        description,
        snapshot: {
          files: JSON.parse(JSON.stringify(files)),
          installedAppIds: apps.filter((a) => a.isInstalled).map((a) => a.id),
          settings: JSON.parse(JSON.stringify(settings)),
        },
      };

      setRestorePoints((prev) => [newPoint, ...prev]);
      addNotification('Точка восстановления создана', `Контрольная точка "${name}" успешно сохранена.`, 'Восстановление');
      return newPoint;
    },
    [files, apps, settings, addNotification]
  );

  const restoreToPoint = useCallback(
    async (pointId: string): Promise<boolean> => {
      const point = restorePoints.find((p) => p.id === pointId);
      if (!point) return false;

      // Close all windows
      setWindows([]);

      // Apply snapshot
      setFiles(point.snapshot.files);
      setSettings(point.snapshot.settings);
      setApps((prev) =>
        prev.map((a) => ({
          ...a,
          isInstalled: point.snapshot.installedAppIds.includes(a.id),
        }))
      );

      return true;
    },
    [restorePoints]
  );

  const deleteRestorePoint = useCallback((pointId: string) => {
    setRestorePoints((prev) => prev.filter((p) => p.id !== pointId));
  }, []);

  // Factory Reset ("Сброс этого ПК")
  const resetThisPC = useCallback(
    (mode: 'keep_files' | 'remove_all') => {
      setWindows([]);
      setSystemStatus('resetting');
      setResetProgress({ mode, phase: 'preparing', percentage: 1 });

      if (settings.soundEnabled) {
        playSound('winre', settings.volume / 100);
      }

      // Step by step realistic reset simulation
      let currentProgress = 1;
      const interval = setInterval(() => {
        currentProgress += 3;
        if (currentProgress < 30) {
          setResetProgress({ mode, phase: 'preparing', percentage: currentProgress });
        } else if (currentProgress < 75) {
          setResetProgress({ mode, phase: 'resetting', percentage: currentProgress });
        } else if (currentProgress < 95) {
          setResetProgress({ mode, phase: 'installing', percentage: currentProgress });
        } else if (currentProgress >= 100) {
          clearInterval(interval);
          setResetProgress({ mode, phase: 'finalizing', percentage: 100 });

          setTimeout(() => {
            // Apply factory reset logic
            if (mode === 'remove_all') {
              // Full wipe to factory defaults
              setFiles(INITIAL_FILES);
              setApps(INITIAL_APPS);
              setSettings(INITIAL_SETTINGS);
              setRestorePoints(INITIAL_RESTORE_POINTS);
              localStorage.removeItem(STORAGE_KEYS.FILES);
              localStorage.removeItem(STORAGE_KEYS.APPS);
              localStorage.removeItem(STORAGE_KEYS.SETTINGS);
              localStorage.removeItem(STORAGE_KEYS.RESTORE_POINTS);
            } else {
              // Keep personal files (desktop and user files preserved), reset apps and settings
              setApps(INITIAL_APPS);
              setSettings(INITIAL_SETTINGS);
              // Clean Program Files only
              setFiles((prev) =>
                prev.filter((f) => !f.path.startsWith('C:/Program Files/') || f.path === 'C:/Program Files')
              );
            }

            // Reboot into Windows 11
            setResetProgress(null);
            setSystemStatus('rebooting');

            setTimeout(() => {
              setSystemStatus('desktop');
              if (settings.soundEnabled) {
                playSound('startup', 0.8);
              }
            }, 3200);
          }, 1200);
        }
      }, 160);
    },
    [settings.soundEnabled, settings.volume]
  );

  // WinRE & System Reboot
  const bootToWinRE = useCallback(() => {
    setWindows([]);
    if (settings.soundEnabled) {
      playSound('winre', settings.volume / 100);
    }
    setSystemStatus('rebooting');
    setTimeout(() => {
      setSystemStatus('winre');
    }, 2000);
  }, [settings.soundEnabled, settings.volume]);

  const rebootSystem = useCallback(() => {
    setWindows([]);
    setSystemStatus('rebooting');
    setTimeout(() => {
      setSystemStatus('desktop');
      if (settings.soundEnabled) {
        playSound('startup', settings.volume / 100);
      }
    }, 3000);
  }, [settings.soundEnabled, settings.volume]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VERSION, currentVersion);
    } catch (e) {
      console.error(e);
    }
  }, [currentVersion]);

  // Windows Update Installation Flow
  const installWindowsUpdate = useCallback(
    (targetVersion: WindowsVersion) => {
      setWindows([]);
      setSystemStatus('updating');
      setUpdateProgress({
        targetVersion,
        percentage: 1,
        phase: 'working_on_updates',
      });

      if (settings.soundEnabled) {
        playSound('winre', settings.volume / 100);
      }

      let currentPercent = 1;
      const interval = setInterval(() => {
        currentPercent += 2;
        setUpdateProgress({
          targetVersion,
          percentage: Math.min(100, currentPercent),
          phase: 'working_on_updates',
        });

        if (currentPercent >= 100) {
          clearInterval(interval);
          setUpdateProgress(null);
          setCurrentVersion(targetVersion);
          setSystemStatus('rebooting');

          setTimeout(() => {
            setSystemStatus('desktop');
            if (settings.soundEnabled) {
              playSound('startup', settings.volume / 100);
            }
            addNotification(
              'Обновление успешно установлено',
              `Ваш компьютер успешно обновлен до сборки ${targetVersion.replace(/_/g, ' ').toUpperCase()}.`,
              'Центр обновления Windows'
            );
          }, 3000);
        }
      }, 120);
    },
    [settings.soundEnabled, settings.volume, addNotification]
  );

  // Safe Mode Flow
  const bootIntoSafeMode = useCallback(
    (mode: BootMode = 'safemode') => {
      setWindows([]);
      setSystemStatus('rebooting');
      setTimeout(() => {
        setBootMode(mode);
        setSystemStatus('desktop');
        if (settings.soundEnabled) {
          playSound('hardware', settings.volume / 100);
        }
        addNotification(
          'Безопасный режим активен',
          `Windows 11 загружена в режиме "${mode === 'safemode_network' ? 'Сетевой безопасный режим' : mode === 'safemode_cmd' ? 'Безопасный режим с поддержкой командной строки' : 'Базовый безопасный режим'}". Запущены только базовые драйверы.`,
          'Служба диагностики'
        );
      }, 2500);
    },
    [settings.soundEnabled, settings.volume, addNotification]
  );

  const exitSafeMode = useCallback(() => {
    setWindows([]);
    setSystemStatus('rebooting');
    setTimeout(() => {
      setBootMode('normal');
      setSystemStatus('desktop');
      if (settings.soundEnabled) {
        playSound('startup', settings.volume / 100);
      }
      addNotification('Обычный режим восстановлен', 'Все стандартные службы и драйверы загружены.', 'Система');
    }, 2500);
  }, [settings.soundEnabled, settings.volume, addNotification]);

  const openStartupSettings = useCallback(() => {
    setWindows([]);
    setSystemStatus('startup_settings');
  }, []);

  const exitWinREToDesktop = useCallback(() => {
    setSystemStatus('rebooting');
    setTimeout(() => {
      setBootMode('normal');
      setSystemStatus('desktop');
      if (settings.soundEnabled) {
        playSound('startup', settings.volume / 100);
      }
    }, 2500);
  }, [settings.soundEnabled, settings.volume]);

  return (
    <SystemContext.Provider
      value={{
        systemStatus,
        setSystemStatus,
        resetProgress,
        currentVersion,
        setWindowsVersion: setCurrentVersion,
        bootMode,
        updateProgress,
        installWindowsUpdate,
        bootIntoSafeMode,
        exitSafeMode,
        openStartupSettings,
        settings,
        updateSettings,
        files,
        createFile,
        createFolder,
        deleteItem,
        updateFileContent,
        renameItem,
        getItemByPath,
        updateFileSecurity,
        openFileChecked,
        renameItemChecked,
        deleteItemChecked,
        securityModal,
        closeSecurityModal,
        propertiesDialogFileId,
        openPropertiesDialog,
        closePropertiesDialog,
        apps,
        installingApps,
        installApp,
        uninstallApp,
        windows,
        activeWindowId,
        openWindow,
        requestElevatedLaunch,
        uacRequest,
        confirmUac,
        cancelUac,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        bringToFront,
        updateWindowPosition,
        updateWindowSize,
        snapWindow,
        notifications,
        addNotification,
        clearNotifications,
        removeNotification,
        restorePoints,
        createRestorePoint,
        restoreToPoint,
        deleteRestorePoint,
        resetThisPC,
        bootToWinRE,
        rebootSystem,
        exitWinREToDesktop,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
