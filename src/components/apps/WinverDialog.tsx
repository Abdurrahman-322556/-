import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { WINDOWS_VERSIONS } from '../../utils/initialData';

export const WinverDialog: React.FC = () => {
  const { currentVersion, bootMode, settings, closeWindow, windows } = useSystem();
  const verInfo = WINDOWS_VERSIONS[currentVersion] || WINDOWS_VERSIONS.win11_23h2_pro;

  const winverWindow = windows.find((w) => w.appId === 'winver');

  const handleClose = () => {
    if (winverWindow) {
      closeWindow(winverWindow.id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 select-none text-xs p-5 justify-between font-sans">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-0.5 w-10 h-10 shrink-0">
            <div className="bg-[#0078d4] rounded-[1px]" />
            <div className="bg-[#0078d4] rounded-[1px]" />
            <div className="bg-[#0078d4] rounded-[1px]" />
            <div className="bg-[#0078d4] rounded-[1px]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Windows 11</h1>
            <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">
              {verInfo.edition}
            </div>
          </div>
        </div>

        {/* Detailed OS Information */}
        <div className="py-4 space-y-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <div>
            Майкрософт Windows
            <br />
            Версия <strong>{verInfo.version}</strong> (сборка ОС <strong>{verInfo.build}</strong>)
            <br />
            <span className="text-[11px] text-zinc-400">{verInfo.experiencePack}</span>
          </div>

          <div className="pt-2 text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
            Операционная система Windows 11 и ее пользовательский интерфейс защищены законодательством о товарных знаках и правах интеллектуальной собственности в США и других странах.
          </div>

          <div className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-400">Лицензировано для:</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{settings.registeredOwner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Имя компьютера:</span>
              <span className="font-mono text-zinc-700 dark:text-zinc-200">{settings.computerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Режим загрузки:</span>
              <span className={bootMode !== 'normal' ? 'font-bold text-amber-500' : 'text-emerald-500'}>
                {bootMode === 'safemode'
                  ? 'Безопасный режим (Safe Mode)'
                  : bootMode === 'safemode_network'
                  ? 'Безопасный режим с сетью'
                  : bootMode === 'safemode_cmd'
                  ? 'Безопасный режим с командной строкой'
                  : 'Обычный режим (Normal Boot)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* OK Button */}
      <div className="flex justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={handleClose}
          className="px-6 py-1.5 rounded-md bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-xs transition-colors"
        >
          ОК
        </button>
      </div>
    </div>
  );
};
