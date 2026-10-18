import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X, LayoutGrid, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { WindowState } from '../../types/system';
import { useSystem } from '../../context/SystemContext';
import { AppIcon } from '../common/AppIcon';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const {
    activeWindowId,
    bringToFront,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    updateWindowSize,
    snapWindow,
    settings,
  } = useSystem();

  const isFocused = activeWindowId === win.id;
  const isDark = settings.theme === 'dark';

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [showSnapMenu, setShowSnapMenu] = useState(false);
  const snapMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag handlers
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (win.isMaximized || win.snapState) return;
    bringToFront(win.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.position.x,
      y: e.clientY - win.position.y,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 120, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      updateWindowPosition(win.id, { x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(320, resizeStart.w + deltaX);
      const newHeight = Math.max(240, resizeStart.h + deltaY);
      updateWindowSize(win.id, { width: newWidth, height: newHeight });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (isResizing) {
      setIsResizing(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Resize handler
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (win.isMaximized || win.snapState) return;
    e.stopPropagation();
    bringToFront(win.id);
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      w: win.size.width,
      h: win.size.height,
    });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  // Snap layout menu hover handlers
  const handleMaximizeMouseEnter = () => {
    snapMenuTimeoutRef.current = setTimeout(() => {
      setShowSnapMenu(true);
    }, 280);
  };

  const handleMaximizeMouseLeave = () => {
    if (snapMenuTimeoutRef.current) {
      clearTimeout(snapMenuTimeoutRef.current);
    }
    snapMenuTimeoutRef.current = setTimeout(() => {
      setShowSnapMenu(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (snapMenuTimeoutRef.current) clearTimeout(snapMenuTimeoutRef.current);
    };
  }, []);

  if (win.isMinimized) {
    return null;
  }

  // Calculate layout geometry
  let style: React.CSSProperties = {
    zIndex: win.zIndex,
  };

  let positionClass = '';

  if (win.isMaximized) {
    positionClass = 'fixed inset-0 bottom-12 rounded-none';
  } else if (win.snapState === 'left') {
    positionClass = 'fixed top-0 left-0 bottom-12 w-1/2 rounded-none border-r';
  } else if (win.snapState === 'right') {
    positionClass = 'fixed top-0 right-0 bottom-12 w-1/2 rounded-none border-l';
  } else {
    style = {
      ...style,
      left: `${win.position.x}px`,
      top: `${win.position.y}px`,
      width: `${win.size.width}px`,
      height: `${win.size.height}px`,
    };
    positionClass = 'fixed rounded-lg shadow-2xl';
  }

  return (
    <div
      style={style}
      onPointerDown={() => bringToFront(win.id)}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`flex flex-col overflow-hidden transition-shadow select-none ${positionClass} ${
        isDark
          ? 'bg-zinc-900/95 text-zinc-100 border-zinc-700/60 shadow-black/60'
          : 'bg-white/95 text-zinc-900 border-zinc-200/80 shadow-slate-900/20'
      } border win-acrylic`}
    >
      {/* Titlebar */}
      <div
        onPointerDown={handleTitlePointerDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        className={`h-9 shrink-0 flex items-center justify-between px-3 cursor-default select-none border-b transition-colors ${
          isDark
            ? isFocused
              ? 'bg-zinc-800/80 border-zinc-700/50'
              : 'bg-zinc-900/60 border-zinc-800/40 text-zinc-400'
            : isFocused
            ? 'bg-slate-100/90 border-slate-200/60'
            : 'bg-slate-50/50 border-slate-100 text-slate-400'
        }`}
      >
        {/* App Title & Icon & Elevation Badge */}
        <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
          <AppIcon icon={win.icon} size={16} />
          <span className="text-xs font-normal truncate tracking-tight">{win.title}</span>

          {win.elevationLevel === 'trustedinstaller' && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center gap-1 shrink-0">
              <ShieldCheck size={11} />
              <span>TrustedInstaller</span>
            </span>
          )}
          {win.elevationLevel === 'system' && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center gap-1 shrink-0">
              <ShieldAlert size={11} />
              <span>СИСТЕМА</span>
            </span>
          )}
          {win.elevationLevel === 'admin' && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-500 border border-blue-500/40 flex items-center gap-1 shrink-0">
              <Shield size={11} />
              <span>Администратор</span>
            </span>
          )}
        </div>

        {/* Windows 11 Controls */}
        <div className="flex items-center h-full -mr-3 relative">
          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(win.id)}
            className={`w-11 h-full flex items-center justify-center transition-colors ${
              isDark ? 'hover:bg-zinc-700/60 text-zinc-300' : 'hover:bg-slate-200/70 text-slate-700'
            }`}
            title="Свернуть"
          >
            <Minus size={13} />
          </button>

          {/* Maximize / Restore & Snap Layouts */}
          <div
            className="relative h-full"
            onMouseEnter={handleMaximizeMouseEnter}
            onMouseLeave={handleMaximizeMouseLeave}
          >
            <button
              onClick={() => maximizeWindow(win.id)}
              className={`w-11 h-full flex items-center justify-center transition-colors ${
                isDark ? 'hover:bg-zinc-700/60 text-zinc-300' : 'hover:bg-slate-200/70 text-slate-700'
              }`}
              title={win.isMaximized ? 'Восстановить' : 'Развернуть'}
            >
              {win.isMaximized ? <Copy size={11} className="rotate-180" /> : <Square size={11} />}
            </button>

            {/* Snap Layout Flyout */}
            {showSnapMenu && (
              <div
                className={`absolute right-0 top-9 w-48 p-2 rounded-lg shadow-xl border z-50 win-acrylic ${
                  isDark ? 'bg-zinc-800/95 border-zinc-700' : 'bg-white/95 border-slate-200'
                }`}
              >
                <div className="text-[11px] font-medium mb-1.5 px-1 opacity-70">Макеты привязки (Snap)</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Left / Right split */}
                  <div className="flex gap-1 p-1 rounded hover:bg-sky-500/10 border border-transparent hover:border-sky-500/40 cursor-pointer">
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'left');
                        setShowSnapMenu(false);
                      }}
                      className="w-1/2 h-8 rounded bg-sky-500/30 hover:bg-sky-500 flex items-center justify-center text-[10px] text-white"
                      title="Привязать слева"
                    >
                      50%
                    </button>
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'right');
                        setShowSnapMenu(false);
                      }}
                      className="w-1/2 h-8 rounded bg-sky-500/30 hover:bg-sky-500 flex items-center justify-center text-[10px] text-white"
                      title="Привязать справа"
                    >
                      50%
                    </button>
                  </div>

                  {/* Full restore */}
                  <button
                    onClick={() => {
                      snapWindow(win.id, null);
                      setShowSnapMenu(false);
                    }}
                    className="p-1 rounded hover:bg-sky-500/10 border border-transparent hover:border-sky-500/40 cursor-pointer flex items-center justify-center"
                    title="Свободное окно"
                  >
                    <div className="w-full h-8 rounded border border-dashed border-sky-500/60 flex items-center justify-center text-[10px] opacity-80">
                      Обычное
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => closeWindow(win.id)}
            className="w-11 h-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-600 transition-colors"
            title="Закрыть"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Window Body / Application Content */}
      <div className="flex-1 overflow-auto relative flex flex-col">{children}</div>

      {/* Resize Handle (bottom-right) */}
      {!win.isMaximized && !win.snapState && (
        <div
          onPointerDown={handleResizePointerDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20 flex items-end justify-end p-0.5 opacity-40 hover:opacity-100"
        >
          <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-current" />
        </div>
      )}
    </div>
  );
};
