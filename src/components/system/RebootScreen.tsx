import React from 'react';

export const RebootScreen: React.FC = () => {
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

      <p className="text-xs text-zinc-400">Перезагрузка...</p>
    </div>
  );
};
