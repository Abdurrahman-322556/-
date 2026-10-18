import React from 'react';
import {
  Wifi,
  Bluetooth,
  Plane,
  Moon,
  Volume2,
  VolumeX,
  Sun,
  Battery,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, openWindow } = useSystem();

  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`fixed bottom-14 right-3 z-40 w-80 rounded-2xl border shadow-2xl p-4 win-acrylic select-none animate-in slide-in-from-bottom-3 duration-200 ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-700/60 text-zinc-100 shadow-black/80'
          : 'bg-slate-100/90 border-white/80 text-zinc-900 shadow-slate-900/20'
      }`}
    >
      {/* Quick Toggles 3x2 Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Wi-Fi */}
        <button
          onClick={() => updateSettings({ wifi: !settings.wifi })}
          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            settings.wifi
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              : 'bg-white text-zinc-600 hover:bg-slate-50'
          }`}
        >
          <Wifi size={18} />
          <span className="text-[10px]">Wi-Fi</span>
        </button>

        {/* Bluetooth */}
        <button
          onClick={() => updateSettings({ bluetooth: !settings.bluetooth })}
          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            settings.bluetooth
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              : 'bg-white text-zinc-600 hover:bg-slate-50'
          }`}
        >
          <Bluetooth size={18} />
          <span className="text-[10px]">Bluetooth</span>
        </button>

        {/* Airplane */}
        <button
          onClick={() => updateSettings({ airplaneMode: !settings.airplaneMode })}
          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            settings.airplaneMode
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              : 'bg-white text-zinc-600 hover:bg-slate-50'
          }`}
        >
          <Plane size={18} />
          <span className="text-[10px]">В самолете</span>
        </button>

        {/* Night Light */}
        <button
          onClick={() => updateSettings({ nightLight: !settings.nightLight })}
          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            settings.nightLight
              ? 'bg-amber-500 text-white shadow-sm'
              : isDark
              ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              : 'bg-white text-zinc-600 hover:bg-slate-50'
          }`}
        >
          <Moon size={18} />
          <span className="text-[10px]">Ночной свет</span>
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            settings.soundEnabled
              ? 'bg-sky-500 text-white shadow-sm'
              : isDark
              ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-800'
              : 'bg-white text-zinc-600 hover:bg-slate-50'
          }`}
        >
          {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <span className="text-[10px]">Звук</span>
        </button>

        {/* Dark theme toggle */}
        <button
          onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
          className={`h-16 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-medium ${
            isDark
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-white text-zinc-600 hover:bg-slate-50'
          }`}
        >
          <Moon size={18} />
          <span className="text-[10px]">{isDark ? 'Темная' : 'Светлая'}</span>
        </button>
      </div>

      {/* Sliders Area */}
      <div className="flex flex-col gap-3 py-2 border-t border-zinc-500/10">
        {/* Brightness */}
        <div className="flex items-center gap-3">
          <Sun size={16} className="text-zinc-400 shrink-0" />
          <input
            type="range"
            min="20"
            max="100"
            value={settings.brightness}
            onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <Volume2 size={16} className="text-zinc-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Bottom Footer with Battery & Settings */}
      <div className="flex items-center justify-between pt-3 border-t border-zinc-500/10 text-xs">
        <div className="flex items-center gap-2 text-zinc-400">
          <Battery size={16} className="text-emerald-500" />
          <span className="text-[11px]">94% (Подключено к сети)</span>
        </div>

        <button
          onClick={() => {
            onClose();
            openWindow('settings');
          }}
          className="p-1.5 rounded-lg hover:bg-zinc-500/10 text-zinc-400 hover:text-current transition-colors"
          title="Все параметры"
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </div>
  );
};
