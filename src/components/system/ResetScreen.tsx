import React from 'react';
import { useSystem } from '../../context/SystemContext';

export const ResetScreen: React.FC = () => {
  const { resetProgress } = useSystem();

  const percentage = resetProgress?.percentage || 0;
  const phase = resetProgress?.phase || 'preparing';

  const phaseText =
    phase === 'preparing'
      ? 'Подготовка к сбросу...'
      : phase === 'resetting'
      ? 'Очистка параметров и системных файлов...'
      : phase === 'installing'
      ? 'Установка чистой копии Windows 11...'
      : 'Завершение настройки...';

  return (
    <div className="fixed inset-0 z-50 bg-black text-white font-sans flex flex-col items-center justify-center p-6 select-none">
      {/* Windows 11 Logo (4 blue squares) */}
      <div className="grid grid-cols-2 gap-1 w-16 h-16 mb-12">
        <div className="bg-[#0078d4] rounded-[2px]" />
        <div className="bg-[#0078d4] rounded-[2px]" />
        <div className="bg-[#0078d4] rounded-[2px]" />
        <div className="bg-[#0078d4] rounded-[2px]" />
      </div>

      {/* Windows 11 Spinner */}
      <div className="w-10 h-10 border-4 border-zinc-700 border-t-[#0078d4] rounded-full animate-spin mb-6" />

      {/* Reset Progress Info */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-light tracking-tight">Сброс этого ПК {percentage}%</h1>
        <p className="text-xs text-zinc-400">{phaseText}</p>
        <p className="text-[11px] text-zinc-500 pt-4">
          Не выключайте компьютер. Это займет некоторое время.
        </p>
      </div>
    </div>
  );
};
