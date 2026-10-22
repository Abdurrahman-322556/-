import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FilePlus,
  Trash2,
  ChevronRight,
  ArrowUp,
  RefreshCw,
  HardDrive,
  Monitor,
  FileText,
  Download,
  Search,
  Edit2,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { FileSystemItem } from '../../types/system';
import { AppIcon } from '../common/AppIcon';

interface ExplorerContextMenu {
  visible: boolean;
  x: number;
  y: number;
  item: FileSystemItem | null;
}

export const FileExplorer: React.FC = () => {
  const {
    files,
    createFile,
    createFolder,
    deleteItemChecked,
    renameItemChecked,
    openFileChecked,
    openPropertiesDialog,
    requestElevatedLaunch,
    openWindow,
    settings,
  } = useSystem();

  const [currentPath, setCurrentPath] = useState<string>('C:/Users/User/Desktop');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Renaming state
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>('');

  // Context menu
  const [contextMenu, setContextMenu] = useState<ExplorerContextMenu>({
    visible: false,
    x: 0,
    y: 0,
    item: null,
  });

  const isDark = settings.theme === 'dark';

  // Navigation helpers
  const navigateTo = (path: string) => {
    setCurrentPath(path.replace(/\/$/, ''));
    setSelectedItemId(null);
    setRenamingItemId(null);
  };

  const navigateUp = () => {
    if (currentPath === 'C:' || !currentPath.includes('/')) return;
    const parts = currentPath.split('/');
    parts.pop();
    navigateTo(parts.join('/') || 'C:');
  };

  // Filter items in current directory
  const currentItems = files.filter((item) => {
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    const itemParent = item.path.substring(0, item.path.lastIndexOf('/')) || 'C:';
    return itemParent.toLowerCase() === currentPath.toLowerCase() && item.path !== currentPath;
  });

  const handleDoubleClick = (item: FileSystemItem) => {
    if (!openFileChecked(item.id)) return;

    if (item.isDirectory) {
      navigateTo(item.path);
    } else if (item.name.endsWith('.txt')) {
      openWindow('notepad', { fileId: item.id });
    }
  };

  const handleCreateNewFolder = () => {
    const folderName = `Новая папка ${Math.floor(Math.random() * 100)}`;
    createFolder(currentPath, folderName);
  };

  const handleCreateNewFile = () => {
    const fileName = `Текстовый документ ${Math.floor(Math.random() * 100)}.txt`;
    createFile(currentPath, fileName, 'Новый текстовый документ.');
  };

  const handleDeleteSelected = () => {
    if (!selectedItemId) return;
    deleteItemChecked(selectedItemId);
    setSelectedItemId(null);
  };

  const handleStartRename = (item: FileSystemItem) => {
    setRenamingItemId(item.id);
    setRenameInputValue(item.name);
    setContextMenu({ visible: false, x: 0, y: 0, item: null });
  };

  const handleSaveRename = (id: string) => {
    const trimmed = renameInputValue.trim();
    if (trimmed && trimmed !== files.find((f) => f.id === id)?.name) {
      renameItemChecked(id, trimmed);
    }
    setRenamingItemId(null);
  };

  const handleItemContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(item.id);
    setContextMenu({
      visible: true,
      x: Math.min(window.innerWidth - 240, e.clientX),
      y: Math.min(window.innerHeight - 280, e.clientY),
      item,
    });
  };

  const closeContextMenu = () => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, item: null });
    }
  };

  // Disk space calculations
  const totalCSize = files.reduce((acc, f) => acc + (f.size || 1024), 0);
  const usedMB = (totalCSize / (1024 * 1024) + 18.5).toFixed(1);

  const selectedItem = files.find((f) => f.id === selectedItemId);

  return (
    <div
      onClick={closeContextMenu}
      className="flex-1 flex flex-col h-full text-xs select-none"
    >
      {/* Ribbon / Action Bar */}
      <div
        className={`h-11 px-3 flex items-center justify-between border-b gap-2 ${
          isDark ? 'bg-zinc-800/40 border-zinc-700/50' : 'bg-slate-50/70 border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCreateNewFolder}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
              isDark ? 'hover:bg-zinc-700/50 text-zinc-200' : 'hover:bg-slate-200/70 text-slate-800'
            }`}
            title="Создать папку"
          >
            <FolderPlus size={14} className="text-amber-500" />
            <span>Папка</span>
          </button>

          <button
            onClick={handleCreateNewFile}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
              isDark ? 'hover:bg-zinc-700/50 text-zinc-200' : 'hover:bg-slate-200/70 text-slate-800'
            }`}
            title="Создать текстовый файл"
          >
            <FilePlus size={14} className="text-sky-500" />
            <span>Документ</span>
          </button>

          {selectedItem && (
            <>
              <button
                onClick={() => handleStartRename(selectedItem)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors ${
                  isDark ? 'hover:bg-zinc-700/50 text-zinc-200' : 'hover:bg-slate-200/70 text-slate-800'
                }`}
                title="Переименовать"
              >
                <Edit2 size={13} />
                <span>Переименовать</span>
              </button>

              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors"
                title="Удалить выбранный элемент"
              >
                <Trash2 size={13} />
                <span>Удалить</span>
              </button>

              <button
                onClick={() => openPropertiesDialog(selectedItem.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sky-500 hover:bg-sky-500/10 transition-colors"
                title="Свойства и безопасность"
              >
                <Shield size={13} />
                <span>Свойства</span>
              </button>
            </>
          )}
        </div>

        {/* Search */}
        <div className="relative w-48">
          <Search size={13} className="absolute left-2.5 top-2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск файлов..."
            className={`w-full pl-7 pr-2 py-1 rounded text-xs border outline-none ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500'
            }`}
          />
        </div>
      </div>

      {/* Address & Navigation Bar */}
      <div
        className={`h-9 px-3 flex items-center gap-2 border-b text-[11px] ${
          isDark ? 'bg-zinc-800/20 border-zinc-700/40' : 'bg-white border-slate-200'
        }`}
      >
        <button
          onClick={navigateUp}
          disabled={currentPath === 'C:'}
          className="p-1 rounded hover:bg-zinc-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
          title="Вверх"
        >
          <ArrowUp size={13} />
        </button>

        <button
          onClick={() => navigateTo(currentPath)}
          className="p-1 rounded hover:bg-zinc-500/10"
          title="Обновить"
        >
          <RefreshCw size={13} />
        </button>

        {/* Breadcrumbs */}
        <div
          className={`flex-1 flex items-center px-2 py-1 rounded border overflow-x-auto whitespace-nowrap ${
            isDark ? 'bg-zinc-800/80 border-zinc-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span
            onClick={() => navigateTo('C:')}
            className="cursor-pointer hover:underline text-sky-500 font-medium"
          >
            Этот компьютер
          </span>
          {currentPath.split('/').map((part, index, arr) => (
            <React.Fragment key={index}>
              <ChevronRight size={12} className="mx-1 text-zinc-400 shrink-0" />
              <span
                onClick={() => navigateTo(arr.slice(0, index + 1).join('/'))}
                className="cursor-pointer hover:underline"
              >
                {part === 'C:' ? 'Диск (C:)' : part}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main split: Sidebar & File Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div
          className={`w-44 border-r p-2 flex flex-col gap-1 shrink-0 overflow-y-auto ${
            isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-slate-50/80 border-slate-200 text-slate-700'
          }`}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 text-zinc-400">
            Быстрый доступ
          </div>
          <button
            onClick={() => navigateTo('C:/Users/User/Desktop')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
              currentPath === 'C:/Users/User/Desktop'
                ? 'bg-sky-500/20 text-sky-500 font-medium'
                : 'hover:bg-zinc-500/10'
            }`}
          >
            <Monitor size={14} className="text-blue-500" />
            <span>Рабочий стол</span>
          </button>
          <button
            onClick={() => navigateTo('C:/Users/User/Documents')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
              currentPath === 'C:/Users/User/Documents'
                ? 'bg-sky-500/20 text-sky-500 font-medium'
                : 'hover:bg-zinc-500/10'
            }`}
          >
            <FileText size={14} className="text-amber-500" />
            <span>Документы</span>
          </button>
          <button
            onClick={() => navigateTo('C:/Users/User/Downloads')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
              currentPath === 'C:/Users/User/Downloads'
                ? 'bg-sky-500/20 text-sky-500 font-medium'
                : 'hover:bg-zinc-500/10'
            }`}
          >
            <Download size={14} className="text-emerald-500" />
            <span>Загрузки</span>
          </button>

          <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 mt-2 text-zinc-400">
            Этот компьютер
          </div>
          <button
            onClick={() => navigateTo('C:')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
              currentPath === 'C:' ? 'bg-sky-500/20 text-sky-500 font-medium' : 'hover:bg-zinc-500/10'
            }`}
          >
            <HardDrive size={14} className="text-slate-400" />
            <span>Локальный диск (C:)</span>
          </button>
          <button
            onClick={() => navigateTo('C:/Program Files')}
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left ${
              currentPath === 'C:/Program Files' ? 'bg-sky-500/20 text-sky-500 font-medium' : 'hover:bg-zinc-500/10'
            }`}
          >
            <Folder size={14} className="text-amber-500" />
            <span>Program Files</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {/* This PC Drive view when at root C: */}
          {currentPath === 'C:' && (
            <div className="mb-4 p-3 rounded-lg border bg-zinc-500/5 flex items-center gap-4">
              <HardDrive size={36} className="text-sky-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Локальный диск (C:)</div>
                <div className="w-full bg-zinc-300 dark:bg-zinc-700 h-2 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: '22%' }} />
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  Использовано {usedMB} МБ из 256 ГБ
                </div>
              </div>
            </div>
          )}

          {/* Grid of items */}
          {currentItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2">
              <Folder size={36} className="opacity-30" />
              <span>Папка пуста</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {currentItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                const isRenaming = renamingItemId === item.id;
                const hasTrustedInstaller = item.permissions?.some(
                  (p) => p.principal === 'trustedinstaller'
                );
                const hasInteractive = item.permissions?.some(
                  (p) => p.principal === 'interactive'
                );

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    onDoubleClick={() => handleDoubleClick(item)}
                    onContextMenu={(e) => handleItemContextMenu(e, item)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-lg cursor-pointer transition-colors text-center border group ${
                      isSelected
                        ? isDark
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                          : 'bg-sky-100/70 border-sky-400 text-sky-900'
                        : 'border-transparent hover:bg-zinc-500/10'
                    }`}
                  >
                    {/* Security Badge Indicator */}
                    {hasTrustedInstaller && (
                      <div
                        className="absolute top-1 right-1 p-0.5 rounded bg-amber-500/20 text-amber-500"
                        title="Защищено TrustedInstaller"
                      >
                        <Shield size={11} className="fill-amber-500" />
                      </div>
                    )}
                    {hasInteractive && !hasTrustedInstaller && (
                      <div
                        className="absolute top-1 right-1 p-0.5 rounded bg-rose-500/20 text-rose-500"
                        title="Запрет переименования службой ИНТЕРАКТИВНЫЕ"
                      >
                        <ShieldAlert size={11} />
                      </div>
                    )}

                    {item.isDirectory ? (
                      <Folder size={40} className="fill-amber-400 text-amber-500 mb-1" />
                    ) : item.name.endsWith('.txt') ? (
                      <FileText size={38} className="fill-sky-100 text-sky-500 mb-1" />
                    ) : (
                      <AppIcon icon="file" size={38} className="mb-1" />
                    )}

                    {isRenaming ? (
                      <input
                        type="text"
                        value={renameInputValue}
                        onChange={(e) => setRenameInputValue(e.target.value)}
                        onBlur={() => handleSaveRename(item.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(item.id);
                          if (e.key === 'Escape') setRenamingItemId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-center px-1 py-0.5 rounded border border-sky-500 bg-white dark:bg-zinc-800 text-xs outline-none"
                      />
                    ) : (
                      <span className="text-[11px] line-clamp-2 break-words w-full select-none">
                        {item.name}
                      </span>
                    )}

                    {!item.isDirectory && item.size && (
                      <span className="text-[9px] text-zinc-400 mt-0.5">
                        {(item.size / 1024).toFixed(1)} КБ
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div
        className={`h-6 px-3 flex items-center justify-between border-t text-[10px] text-zinc-400 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <span>Элементов: {currentItems.length}</span>
        <span>{selectedItemId ? '1 элемент выбран' : ''}</span>
      </div>

      {/* Explorer Right-Click Context Menu */}
      {contextMenu.visible && contextMenu.item && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed z-50 w-64 rounded-xl border shadow-2xl p-1.5 win-acrylic text-xs select-none animate-in zoom-in-95 duration-100 ${
            isDark ? 'bg-zinc-800/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-200 text-zinc-900'
          }`}
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Open */}
          <button
            onClick={() => {
              const itm = contextMenu.item!;
              closeContextMenu();
              handleDoubleClick(itm);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              handleDoubleClick(itm);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left font-medium cursor-pointer"
          >
            <Play size={13} />
            <span>Открыть</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Elevated Launches Header - Clickable for fast admin elevation */}
          <div
            onClick={() => {
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'admin', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'admin');
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'admin', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'admin');
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
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'admin', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'admin');
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'admin', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'admin');
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-500 hover:bg-blue-500/10 text-left cursor-pointer font-medium"
          >
            <Shield size={13} />
            <span>Запуск от имени администратора</span>
          </button>

          <button
            onClick={() => {
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'system', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'system');
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'system', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'system');
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-purple-500 hover:bg-purple-500/10 text-left cursor-pointer font-medium"
          >
            <ShieldAlert size={13} />
            <span>Запуск от имени системы (SYSTEM)</span>
          </button>

          <button
            onClick={() => {
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'trustedinstaller', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'trustedinstaller');
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              if (itm.name.endsWith('.txt')) {
                requestElevatedLaunch('notepad', 'trustedinstaller', { fileId: itm.id });
              } else {
                requestElevatedLaunch('terminal', 'trustedinstaller');
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 text-left font-semibold cursor-pointer"
          >
            <ShieldCheck size={13} />
            <span>Запуск с правами TrustedInstaller</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Rename */}
          <button
            onClick={() => handleStartRename(contextMenu.item!)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleStartRename(contextMenu.item!);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Переименовать</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              const itm = contextMenu.item!;
              closeContextMenu();
              deleteItemChecked(itm.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              deleteItemChecked(itm.id);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 text-left cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Удалить</span>
          </button>

          <div className="h-px bg-zinc-500/15 my-1" />

          {/* Properties */}
          <button
            onClick={() => {
              const itm = contextMenu.item!;
              closeContextMenu();
              openPropertiesDialog(itm.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              const itm = contextMenu.item!;
              closeContextMenu();
              openPropertiesDialog(itm.id);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-zinc-500/10 text-left font-medium cursor-pointer"
          >
            <Settings size={13} />
            <span>Свойства и безопасность</span>
          </button>
        </div>
      )}
    </div>
  );
};
