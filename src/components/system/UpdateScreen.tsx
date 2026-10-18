import React from 'react';
import { useSystem } from '../../context/SystemContext';
import { WINDOWS_VERSIONS } from '../../utils/initialData';

export const UpdateScreen: React.FC = () => {
  const { updateProgress } = useSystem();

  const percentage = updateProgress?.percentage || 0;
  const targetVerKey = updateProgress?.targetVersion || 'win11_latest';
  const targetInfo = WINDOWS_VERSIONS[targetVerKey] || { name: 'Windows 11' };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white font-sans flex flex-col items-center justify-center p-6 select-none">
      {/* Windows 11 Logo */}
      <div className="grid grid-cols-2 gap-1 w-16 h-16 mb-12">
        <div className="bg-[#0078d4] rounded-[2px]" />
        <div className="bg-[#0078d4] rounded-[2px]" />
        <div className="bg-[#0078d4] rounded-[2px]" />
        <div className="bg-[#0078d4] rounded-[2px]" />
      </div>

      {/* Windows 11 Spinner */}
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#0078d4] rounded-full animate-spin mb-6" />

      {/* Update Progress Info */}
      <div className="text-center space-y-2 max-w-md">
        <h1 className="text-2xl font-light tracking-tight">
          Идет работа с обновлениями {percentage}%
        </h1>
        <p className="text-xs text-sky-400 font-medium">
          Установка обновления: {targetInfo.name}
        </p>
        <p className="text-xs text-zinc-400">
          Не выключайте компьютер. Это может занять некоторое время.
        </p>
        <p className="text-[11px] text-zinc-500 pt-3">
          Компьютер перезагрузится автоматически.
        </p>
      </div>
    </div>
  );
};
