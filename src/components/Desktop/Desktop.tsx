import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileText,
  Trash2,
  HardDrive,
  RefreshCw,
  Plus,
  Monitor,
  Palette,
  Terminal as TerminalIcon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Play,
  Settings,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { AppIcon } from '../common/AppIcon';
import { WindowFrame } from '../WindowFrame/WindowFrame';

// Apps imports
import { FileExplorer } from '../apps/FileExplorer';
import { Notepad } from '../apps/Notepad';
import { Terminal } from '../apps/Terminal';
import { Calculator } from '../apps/Calculator';
import { SettingsApp } from '../apps/SettingsApp';
import { StoreApp } from '../apps/StoreApp';
import { TaskManager } from '../apps/TaskManager';
import { EdgeBrowser } from '../apps/EdgeBrowser';
import { PaintApp } from '../apps/PaintApp';
import { MinesweeperApp } from '../apps/MinesweeperApp';
import { CpuZApp } from '../apps/CpuZApp';
import { VsCodeApp } from '../apps/VsCodeApp';
import { MediaPlayerApp } from '../apps/MediaPlayerApp';
import { WinverDialog } from '../apps/WinverDialog';
import { WINDOWS_VERSIONS } from '../../utils/initialData';
import { AppDefinition, FileSystemItem } from '../../types/system';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
}

interface FileContextMenuState extends ContextMenuState {
  file: FileSystemItem | null;
}

interface AppContextMenuState extends ContextMenuState {
  app: AppDefinition | null;
}

export const Desktop: React.FC = () => {
  const {
    settings,
    windows,
    openWindow,
    requestElevatedLaunch,
    files,
    apps,
    createFile,
    createFolder,
    deleteItemChecked,
    renameItemChecked,
    openFileChecked,
    openPropertiesDialog,
    propertiesDialogFileId,
    closePropertiesDialog,
    securityModal,
    closeSecurityModal,
    uacRequest,
    confirmUac,
    cancelUac,
    bootToWinRE,
    currentVersion,
    bootMode,
    exitSafeMode,
    bootIntoSafeMode,
  } = useSystem();

  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');

  // Context menus
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0 });
  const [fileContextMenu, setFileContextMenu] = useState<FileContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    file: null,
  });
  const [appContextMenu, setAppContextMenu] = useState<AppContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    app: null,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  const currentInfo = WINDOWS_VERSIONS[currentVersion] || WINDOWS_VERSIONS.win11_23h2_pro;

  // Marquee Selection Box State
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
  }>({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });

  const isDark = settings.theme === 'dark';

  // Desktop items: desktop files + installed apps with desktop icons
  const desktopFiles = files.filter(
    (f) =>
      f.path.toLowerCase().startsWith('c:/users/user/desktop/') &&
      f.path !== 'C:/Users/User/Desktop'
  );

  const desktopApps = apps.filter((a) => a.isInstalled && a.hasDesktopIcon);

  const closeAllMenus = () => {
    if (contextMenu.visible) setContextMenu({ visible: false, x: 0, y: 0 });
    if (fileContextMenu.visible) setFileContextMenu({ visible: false, x: 0, y: 0, file: null });
    if (appContextMenu.visible) setAppContextMenu({ visible: false, x: 0, y: 0, app: null });
  };

  // Keyboard navigation & shortcuts (F2 to rename, Delete to remove, Enter to open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is active (unless it's the rename input itself)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        closeAllMenus();
        setRenamingFileId(null);
      } else if (e.key === 'F2' && selectedIconId && selectedIconId.startsWith('file-')) {
        const fileId = selectedIconId.replace('file-', '');
        const target = files.find((f) => f.id === fileId);
        if (target) {
          e.preventDefault();
          setRenamingFileId(target.id);
          setRenameValue(target.name);
        }
      } else if (e.key === 'Delete' && selectedIconId && selectedIconId.startsWith('file-')) {
        const fileId = selectedIconId.replace('file-', '');
        e.preventDefault();
        deleteItemChecked(fileId);
        setSelectedIconId(null);
      } else if (e.key === 'Enter' && selectedIconId) {
        if (selectedIconId === 'shortcut-bin') {
          openWindow('explorer');
        } else if (selectedIconId === 'shortcut-winre') {
          bootToWinRE();
        } else if (selectedIconId.startsWith('app-')) {
          const appId = selectedIconId.replace('app-', '');
          openWindow(appId);
        } else if (selectedIconId.startsWith('file-')) {
          const fileId = selectedIconId.replace('file-', '');
          const file = files.find((f) => f.id === fileId);
          if (file) handleFileOpen(file);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIconId, files, deleteItemChecked, openWindow, bootToWinRE]);

  // Focus rename input on start
  useEffect(() => {
    if (renamingFileId && renameInputRef.current) {
      renameInputRef.current.focus();
      // Select filename without extension
      const name = renameInputRef.current.value;
      const lastDot = name.lastIndexOf('.');
      if (lastDot > 0) {
        renameInputRef.current.setSelectionRange(0, lastDot);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [renamingFileId]);

  // Background Context Menu handler
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    closeAllMenus();
    setContextMenu({
      visible: true,
      x: Math.min(window.innerWidth - 240, e.clientX),
      y: Math.min(window.innerHeight - 340, e.clientY),
    });
  };

  // File Right-Click Context Menu
  const handleFileContextMenu = (e: React.MouseEvent, file: FileSystemItem) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllMenus();
    setSelectedIconId(`file-${file.id}`);
    setFileContextMenu({
      visible: true,
      x: Math.min(window.innerWidth - 260, e.clientX),
      y: Math.min(window.innerHeight - 360, e.clientY),
      file,
    });
  };

  // App Right-Click Context Menu
  const handleAppContextMenu = (e: React.MouseEvent, app: AppDefinition) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllMenus();
    setSelectedIconId(`app-${app.id}`);
    setAppContextMenu({
      visible: true,
      x: Math.min(window.innerWidth - 260, e.clientX),
      y: Math.min(window.innerHeight - 260, e.clientY),
      app,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    closeAllMenus();
    setTimeout(() => setIsRefreshing(false), 250);
  };

  // Marquee selection handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (
      (e.target as HTMLElement).closest('.desktop-icon') ||
      (e.target as HTMLElement).closest('.window-frame') ||
      (e.target as HTMLElement).closest('.desktop-context-menu')
    ) {
      return;
    }
    closeAllMenus();
    if (renamingFileId) {
      handleSaveRename(renamingFileId);
    }
    setSelectedIconId(null);
    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      active: true,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!selectionBox.active) return;
    setSelectionBox((prev) => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY,
    }));
  };

  const handlePointerUp = () => {
    if (selectionBox.active) {
      setSelectionBox((prev) => ({ ...prev, active: false }));
    }
  };

  // File open helper (checks security permissions)
  const handleFileOpen = (file: FileSystemItem) => {
    if (!openFileChecked(file.id)) return;
    if (file.isDirectory) {
      openWindow('explorer');
    } else {
      openWindow('notepad', { fileId: file.id });
    }
  };

  // Rename handlers
  const handleStartRename = (file: FileSystemItem) => {
    closeAllMenus();
    setRenamingFileId(file.id);
    setRenameValue(file.name);
  };

  const handleSaveRename = (fileId: string) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== files.find((f) => f.id === fileId)?.name) {
      renameItemChecked(fileId, trimmed);
    }
    setRenamingFileId(null);
  };

  // App component mapper
  const renderAppContent = (appId: string, customProps?: Record<string, unknown>, elevationLevel?: string) => {
    switch (appId) {
      case 'explorer':
        return <FileExplorer />;
      case 'notepad':
        return <Notepad fileId={customProps?.fileId as string} elevationLevel={elevationLevel as any} />;
      case 'terminal':
        return <Terminal elevationLevel={elevationLevel as any} />;
      case 'calculator':
        return <Calculator />;
      case 'settings':
        return <SettingsApp />;
      case 'store':
        return <StoreApp />;
      case 'taskmgr':
        return <TaskManager />;
      case 'edge':
        return <EdgeBrowser />;
      case 'paint':
        return <PaintApp />;
      case 'minesweeper':
        return <MinesweeperApp />;
      case 'cpuz':
        return <CpuZApp />;
      case 'vscode':
        return <VsCodeApp />;
      case 'mediaplayer':
        return <MediaPlayerApp />;
      case 'winver':
        return <WinverDialog />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs">
            Приложение загружено
          </div>
        );
    }
  };

  const isSafeMode = bootMode !== 'normal';
  const uacAppDef = apps.find((a) => a.id === uacRequest?.appId);
  const uacAppName = uacAppDef?.name || uacRequest?.appId || 'Системный компонент';

  return (
    <div
      onContextMenu={handleContextMenu}
      onClick={closeAllMenus}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`fixed inset-0 bottom-12 select-none overflow-hidden ${
        isSafeMode ? 'bg-black text-white' : ''
      }`}
      style={{
        backgroundImage: isSafeMode ? 'none' : `url(${settings.wallpaper})`,
        backgroundColor: isSafeMode ? '#000000' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: !isSafeMode && settings.nightLight ? 'sepia(0.22) brightness(0.96)' : undefined,
      }}
    >
      {/* Safe Mode Watermarks at 4 Corners */}
      {isSafeMode && (
        <>
          <div className="absolute top-2 left-3 text-xs font-mono text-white/50 pointer-events-none select-none z-10">
            Безопасный режим
          </div>
          <div className="absolute top-2 right-3 text-xs font-mono text-white/50 pointer-events-none select-none z-10">
            Безопасный режим
          </div>
          <div className="absolute bottom-2 left-3 text-xs font-mono text-white/50 pointer-events-none select-none z-10">
            Безопасный режим
          </div>
          <div className="absolute bottom-2 right-3 text-xs font-mono text-white/50 pointer-events-none select-none z-10 text-right leading-tight">
            <div>{currentInfo.name}</div>
            <div>Сборка {currentInfo.build} · Безопасный режим</div>
          </div>

          {/* Safe Mode Notification Bar at Top */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-3 backdrop-blur-md shadow-lg">
            <span>Windows 11 запущена в безопасном режиме (Safe Mode)</span>
            <button
              onClick={exitSafeMode}
              className="px-2.5 py-0.5 rounded bg-amber-400 text-black font-semibold hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Вернуться в обычный режим
            </button>
          </div>
        </>
      )}

      {/* Desktop Icons Grid */}
      <div
        className={`p-4 grid grid-flow-col grid-rows-6 gap-3 w-fit h-full content-start transition-opacity ${
          isRefreshing ? 'opacity-30' : 'opacity-100'
        }`}
      >
        {/* Recycle Bin Shortcut */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIconId('shortcut-bin');
          }}
          onDoubleClick={() => openWindow('explorer')}
          className={`desktop-icon w-22 flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer text-center group border ${
            selectedIconId === 'shortcut-bin'
              ? 'bg-sky-500/30 border-sky-400 text-white'
              : 'border-transparent hover:bg-white/10 text-white'
          }`}
        >
          <div className="w-11 h-11 flex items-center justify-center text-slate-100 drop-shadow-md">
            <Trash2 size={34} />
          </div>
          <span className="text-[11px] font-normal mt-1 leading-tight line-clamp-2 drop-shadow-md">
            Корзина
          </span>
        </div>

        {/* WinRE Shortcut on Desktop */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedIconId('shortcut-winre');
          }}
          onDoubleClick={bootToWinRE}
          className={`desktop-icon w-22 flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer text-center group border ${
            selectedIconId === 'shortcut-winre'
              ? 'bg-sky-500/30 border-sky-400 text-white'
              : 'border-transparent hover:bg-white/10 text-white'
          }`}
          title="Запуск среды восстановления Windows (WinRE)"
        >
          <div className="w-11 h-11 flex items-center justify-center drop-shadow-md">
            <AppIcon icon="winre" size={34} />
          </div>
          <span className="text-[11px] font-medium mt-1 leading-tight line-clamp-2 drop-shadow-md text-amber-300">
            Среда WinRE
          </span>
        </div>

        {/* Installed Apps with Desktop Icons */}
        {desktopApps.map((app) => (
          <div
            key={app.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIconId(`app-${app.id}`);
            }}
            onDoubleClick={() => openWindow(app.id)}
            onContextMenu={(e) => handleAppContextMenu(e, app)}
            className={`desktop-icon w-22 flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer text-center group border ${
              selectedIconId === `app-${app.id}`
                ? 'bg-sky-500/30 border-sky-400 text-white'
                : 'border-transparent hover:bg-white/10 text-white'
            }`}
          >
            <div className="w-11 h-11 flex items-center justify-center drop-shadow-md">
              <AppIcon icon={app.icon} size={34} />
            </div>
            <span className="text-[11px] font-normal mt-1 leading-tight line-clamp-2 drop-shadow-md">
              {app.name}
            </span>
          </div>
        ))}

        {/* Desktop Files */}
        {desktopFiles.map((file) => {
          const isSelected = selectedIconId === `file-${file.id}`;
          const isRenaming = renamingFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!isRenaming) setSelectedIconId(`file-${file.id}`);
              }}
              onDoubleClick={() => !isRenaming && handleFileOpen(file)}
              onContextMenu={(e) => handleFileContextMenu(e, file)}
              className={`desktop-icon w-22 flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer text-center group border relative ${
                isSelected
                  ? 'bg-sky-500/30 border-sky-400 text-white'
                  : 'border-transparent hover:bg-white/10 text-white'
              }`}
            >
              <div className="w-11 h-11 flex items-center justify-center drop-shadow-md relative">
                {file.isDirectory ? (
                  <Folder size={36} className="fill-amber-400 text-amber-500" />
                ) : (
                  <FileText size={36} className="fill-sky-100 text-sky-400" />
                )}

                {/* Small indicator badges for special security policies */}
                {file.permissions?.some((p) => p.principal === 'trustedinstaller') && (
                  <span
                    className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 shadow-sm"
                    title="Защищено TrustedInstaller"
                  >
                    <ShieldCheck size={11} />
                  </span>
                )}
                {file.permissions?.some((p) => p.principal === 'interactive') && (
                  <span
                    className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-sm"
                    title="Служба ИНТЕРАКТИВНЫЕ (Запрет переименования)"
                  >
                    <ShieldAlert size={11} />
                  </span>
                )}
              </div>

              {isRenaming ? (
                <div className="mt-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleSaveRename(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveRename(file.id);
                      } else if (e.key === 'Escape') {
                        setRenamingFileId(null);
                      }
                    }}
                    className="w-full text-[11px] text-center px-1 py-0.5 rounded bg-white text-zinc-900 border border-sky-500 outline-none shadow-md"
                  />
                </div>
              ) : (
                <span className="text-[11px] font-normal mt-1 leading-tight line-clamp-2 drop-shadow-md select-none break-words">
                  {file.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Marquee Selection Drag Box */}
      {selectionBox.active && (
        <div
          className="fixed border border-sky-400 bg-sky-500/20 pointer-events-none z-30"
          style={{
            left: `${Math.min(selectionBox.startX, selectionBox.currentX)}px`,
            top: `${Math.min(selectionBox.startY, selectionBox.currentY)}px`,
            width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
            height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
          }}
        />
      )}

      {/* Render Active Windows */}
      {windows.map((win) => (
        <div key={win.id} className="window-frame">
          <WindowFrame window={win}>
            {renderAppContent(win.appId, win.customProps, win.elevationLevel)}
          </WindowFrame>
        </div>
      ))}

      {/* DESKTOP BACKGROUND CONTEXT MENU */}
      {contextMenu.visible && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          className={`desktop-context-menu fixed z-50 w-64 rounded-xl border shadow-2xl p-1.5 win-acrylic text-xs select-none animate-in zoom-in-95 duration-100 ${
            isDark ? 'bg-zinc-800/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-200 text-zinc-900'
          }`}
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button
            onClick={() => handleRefresh()}
            onContextMenu={(e) => { e.preventDefault(); handleRefresh(); }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Обновить</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* New folder */}
          <button
            onClick={() => {
              createFolder('C:/Users/User/Desktop', `Новая папка ${Math.floor(Math.random() * 100)}`);
              closeAllMenus();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              createFolder('C:/Users/User/Desktop', `Новая папка ${Math.floor(Math.random() * 100)}`);
              closeAllMenus();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <Folder size={14} className="text-amber-500" />
            <span>Создать папку</span>
          </button>

          {/* New text doc */}
          <button
            onClick={() => {
              createFile('C:/Users/User/Desktop', `Текстовый документ ${Math.floor(Math.random() * 100)}.txt`, '');
              closeAllMenus();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              createFile('C:/Users/User/Desktop', `Текстовый документ ${Math.floor(Math.random() * 100)}.txt`, '');
              closeAllMenus();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <FileText size={14} className="text-sky-500" />
            <span>Текстовый документ</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Terminal Options with Elevation */}
          <div className="px-3 py-0.5 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
            Терминал и запуск
          </div>
          <button
            onClick={() => {
              openWindow('terminal');
              closeAllMenus();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              openWindow('terminal');
              closeAllMenus();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <TerminalIcon size={14} />
            <span>Открыть Терминал (User)</span>
          </button>

          <button
            onClick={() => {
              closeAllMenus();
              requestElevatedLaunch('terminal', 'admin');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              closeAllMenus();
              requestElevatedLaunch('terminal', 'admin');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-left font-medium cursor-pointer"
          >
            <Shield size={14} />
            <span>Терминал (от имени Администратора)</span>
          </button>

          <button
            onClick={() => {
              closeAllMenus();
              requestElevatedLaunch('terminal', 'system');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              closeAllMenus();
              requestElevatedLaunch('terminal', 'system');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-purple-500 hover:bg-purple-500/10 text-left font-medium cursor-pointer"
          >
            <ShieldAlert size={14} />
            <span>Терминал (от имени СИСТЕМЫ)</span>
          </button>

          <button
            onClick={() => {
              closeAllMenus();
              requestElevatedLaunch('terminal', 'trustedinstaller');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              closeAllMenus();
              requestElevatedLaunch('terminal', 'trustedinstaller');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 text-left font-semibold cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>Терминал (права TrustedInstaller)</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Personalize */}
          <button
            onClick={() => {
              openWindow('settings');
              closeAllMenus();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              openWindow('settings');
              closeAllMenus();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <Palette size={14} />
            <span>Персонализация</span>
          </button>

          {/* Winver Dialog */}
          <button
            onClick={() => {
              openWindow('winver');
              closeAllMenus();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              openWindow('winver');
              closeAllMenus();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <ShieldCheck size={14} className="text-sky-500" />
            <span>Сведения о Windows (Winver)</span>
          </button>

          {/* Safe Mode Toggle */}
          <button
            onClick={() => {
              closeAllMenus();
              if (bootMode === 'normal') {
                bootIntoSafeMode('safemode');
              } else {
                exitSafeMode();
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              closeAllMenus();
              if (bootMode === 'normal') {
                bootIntoSafeMode('safemode');
              } else {
                exitSafeMode();
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 text-left font-medium cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>{bootMode === 'normal' ? 'Безопасный режим (Safe Mode)' : 'Выйти из безопасного режима'}</span>
          </button>

          {/* Boot to WinRE */}
          <button
            onClick={() => {
              closeAllMenus();
              bootToWinRE();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              closeAllMenus();
              bootToWinRE();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-left font-medium cursor-pointer"
          >
            <Shield size={14} />
            <span>Перейти в WinRE</span>
          </button>
        </div>
      )}

      {/* FILE CONTEXT MENU */}
      {fileContextMenu.visible && fileContextMenu.file && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          className={`desktop-context-menu fixed z-50 w-64 rounded-xl border shadow-2xl p-1.5 win-acrylic text-xs select-none animate-in zoom-in-95 duration-100 ${
            isDark ? 'bg-zinc-800/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-200 text-zinc-900'
          }`}
          style={{ left: `${fileContextMenu.x}px`, top: `${fileContextMenu.y}px` }}
        >
          {/* Open */}
          <button
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              handleFileOpen(f);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              handleFileOpen(f);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left font-semibold cursor-pointer"
          >
            <Play size={13} />
            <span>Открыть</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Elevation Launch Options Header - Clickable for fast elevation */}
          <div
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'admin');
              } else {
                requestElevatedLaunch('notepad', 'admin', { fileId: f.id });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'admin');
              } else {
                requestElevatedLaunch('notepad', 'admin', { fileId: f.id });
              }
            }}
            className="flex items-center justify-between px-3 py-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider hover:bg-zinc-500/10 rounded cursor-pointer group"
            title="Быстрый запуск от имени администратора"
          >
            <span>Запуск с правами</span>
            <Shield size={12} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>

          <button
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'admin');
              } else {
                requestElevatedLaunch('notepad', 'admin', { fileId: f.id });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'admin');
              } else {
                requestElevatedLaunch('notepad', 'admin', { fileId: f.id });
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-left cursor-pointer font-medium"
          >
            <Shield size={13} />
            <span>Запуск от имени администратора</span>
          </button>

          <button
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'system');
              } else {
                requestElevatedLaunch('notepad', 'system', { fileId: f.id });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'system');
              } else {
                requestElevatedLaunch('notepad', 'system', { fileId: f.id });
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-purple-500 hover:bg-purple-500/10 text-left cursor-pointer font-medium"
          >
            <ShieldAlert size={13} />
            <span>Запуск от имени системы (SYSTEM)</span>
          </button>

          <button
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'trustedinstaller');
              } else {
                requestElevatedLaunch('notepad', 'trustedinstaller', { fileId: f.id });
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              if (f.isDirectory) {
                requestElevatedLaunch('explorer', 'trustedinstaller');
              } else {
                requestElevatedLaunch('notepad', 'trustedinstaller', { fileId: f.id });
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 text-left font-semibold cursor-pointer"
          >
            <ShieldCheck size={13} />
            <span>Запуск с правами TrustedInstaller</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Rename File */}
          <button
            onClick={() => handleStartRename(fileContextMenu.file!)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleStartRename(fileContextMenu.file!);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Переименовать (F2)</span>
          </button>

          {/* Delete File */}
          <button
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              deleteItemChecked(f.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              deleteItemChecked(f.id);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-left cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Удалить (Del)</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Properties & Security */}
          <button
            onClick={() => {
              const f = fileContextMenu.file!;
              closeAllMenus();
              openPropertiesDialog(f.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const f = fileContextMenu.file!;
              closeAllMenus();
              openPropertiesDialog(f.id);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left font-medium cursor-pointer"
          >
            <Settings size={13} />
            <span>Свойства и безопасность</span>
          </button>
        </div>
      )}

      {/* APP CONTEXT MENU */}
      {appContextMenu.visible && appContextMenu.app && (
        <div
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
          className={`desktop-context-menu fixed z-50 w-64 rounded-xl border shadow-2xl p-1.5 win-acrylic text-xs select-none animate-in zoom-in-95 duration-100 ${
            isDark ? 'bg-zinc-800/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-200 text-zinc-900'
          }`}
          style={{ left: `${appContextMenu.x}px`, top: `${appContextMenu.y}px` }}
        >
          {/* Open */}
          <button
            onClick={() => {
              const a = appContextMenu.app!;
              closeAllMenus();
              openWindow(a.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const a = appContextMenu.app!;
              closeAllMenus();
              openWindow(a.id);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left font-semibold cursor-pointer"
          >
            <Play size={13} />
            <span>Открыть {appContextMenu.app.name}</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Elevated Launches Header - Clickable */}
          <div
            onClick={() => {
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'admin');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'admin');
            }}
            className="flex items-center justify-between px-3 py-1 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider hover:bg-zinc-500/10 rounded cursor-pointer group"
            title="Быстрый запуск от имени администратора"
          >
            <span>Запуск с правами</span>
            <Shield size={12} className="text-blue-400 group-hover:scale-110 transition-transform" />
          </div>

          <button
            onClick={() => {
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'admin');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'admin');
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-left cursor-pointer font-medium"
          >
            <Shield size={13} />
            <span>Запуск от имени администратора</span>
          </button>

          <button
            onClick={() => {
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'system');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'system');
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-purple-500 hover:bg-purple-500/10 text-left cursor-pointer font-medium"
          >
            <ShieldAlert size={13} />
            <span>Запуск от имени системы</span>
          </button>

          <button
            onClick={() => {
              const a = appContextMenu.app!;
              closeAllMenus();
              requestElevatedLaunch(a.id, 'trustedinstaller');
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const a = appContextMenu.app!;
              closeAllMenus();
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
