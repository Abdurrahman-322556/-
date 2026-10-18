import React, { useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { BootMode } from '../../types/system';

export const StartupSettingsScreen: React.FC = () => {
  const { bootIntoSafeMode, exitWinREToDesktop } = useSystem();

  const handleSelectOption = (key: number) => {
    switch (key) {
      case 4:
        bootIntoSafeMode('safemode');
        break;
      case 5:
        bootIntoSafeMode('safemode_network');
        break;
      case 6:
        bootIntoSafeMode('safemode_cmd');
        break;
      case 1:
      case 2:
      case 3:
      case 7:
      case 8:
      case 9:
      default:
        exitWinREToDesktop();
        break;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleSelectOption(num);
      } else if (e.key === 'Escape' || e.key === 'Enter') {
        exitWinREToDesktop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#005a9e] text-white font-sans flex flex-col justify-center p-8 sm:p-16 select-none overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Параметры загрузки</h1>
          <p className="text-sm text-blue-200">
            Нажмите цифру 1-9 или кликните мышью для выбора нужного режима загрузки:
          </p>
        </div>

        <div className="space-y-2 text-sm pt-2">
          <div
            onClick={() => handleSelectOption(1)}
            className="p-2.5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
          >
            <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs">1</span>
            <span>Включить отладку</span>
          </div>

          <div
            onClick={() => handleSelectOption(2)}
            className="p-2.5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
          >
            <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs">2</span>
            <span>Включить ведение журнала загрузки</span>
          </div>

          <div
            onClick={() => handleSelectOption(3)}
            className="p-2.5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
          >
            <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs">3</span>
            <span>Включить видеорежим с низким разрешением</span>
          </div>

          {/* SAFE MODE 4 */}
          <div
            onClick={() => handleSelectOption(4)}
            className="p-3 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer flex items-center gap-3 font-semibold text-white transition-colors border border-white/30"
          >
            <span className="w-6 h-6 rounded bg-amber-400 text-black flex items-center justify-center font-bold text-xs">4</span>
            <div className="flex-1">
              <div>Включить безопасный режим (Safe Mode)</div>
              <div className="text-xs text-blue-100 font-normal">
                Запуск Windows с минимальным набором драйверов и служб
              </div>
            </div>
          </div>

          {/* SAFE MODE WITH NETWORKING 5 */}
          <div
            onClick={() => handleSelectOption(5)}
            className="p-3 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer flex items-center gap-3 font-semibold text-white transition-colors border border-white/30"
          >
            <span className="w-6 h-6 rounded bg-amber-400 text-black flex items-center justify-center font-bold text-xs">5</span>
            <div className="flex-1">
              <div>Включить безопасный режим с загрузкой сетевых драйверов</div>
              <div className="text-xs text-blue-100 font-normal">
                Безопасный режим с доступом к сети Интернет
              </div>
            </div>
          </div>

          {/* SAFE MODE WITH CMD 6 */}
          <div
            onClick={() => handleSelectOption(6)}
            className="p-3 rounded-lg bg-white/20 hover:bg-white/30 cursor-pointer flex items-center gap-3 font-semibold text-white transition-colors border border-white/30"
          >
            <span className="w-6 h-6 rounded bg-amber-400 text-black flex items-center justify-center font-bold text-xs">6</span>
            <div className="flex-1">
              <div>Включить безопасный режим с поддержкой командной строки</div>
              <div className="text-xs text-blue-100 font-normal">
                Безопасный режим с приоритетным запуском терминала CMD
              </div>
            </div>
          </div>

          <div
            onClick={() => handleSelectOption(7)}
            className="p-2.5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors text-white/80"
          >
            <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs">7</span>
            <span>Отключить обязательную проверку подписи драйверов</span>
          </div>

          <div
            onClick={() => handleSelectOption(8)}
            className="p-2.5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors text-white/80"
          >
            <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs">8</span>
            <span>Отключить ранний запуск антивредоносной защиты</span>
          </div>

          <div
            onClick={() => handleSelectOption(9)}
            className="p-2.5 rounded hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors text-white/80"
          >
            <span className="w-6 h-6 rounded bg-white/20 flex items-center justify-center font-bold text-xs">9</span>
            <span>Отключить автоматический перезапуск после сбоя</span>
          </div>
        </div>

        <div className="pt-4 border-t border-white/20 flex justify-between items-center text-xs text-blue-200">
          <span>Нажмите Enter или кликните ниже для возврата в обычный режим</span>
          <button
            onClick={exitWinREToDesktop}
            className="px-4 py-2 rounded bg-white text-blue-900 font-semibold hover:bg-blue-50 transition-colors"
          >
            Обычная загрузка
          </button>
        </div>
      </div>
    </div>
  );
};
