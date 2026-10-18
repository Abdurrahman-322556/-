import React, { useState, useEffect } from 'react';
import { ArrowRight, Wifi, Battery, Volume2 } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { USER_AVATAR } from '../../utils/initialData';
import { playSound } from '../../utils/sound';

export const LockScreen: React.FC = () => {
  const { setSystemStatus, settings } = useSystem();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.soundEnabled) {
      playSound('startup', settings.volume / 100);
    }
    setSystemStatus('desktop');
  };

  return (
    <div
      onClick={() => !isUnlocked && setIsUnlocked(true)}
      className="fixed inset-0 z-50 flex flex-col justify-between p-8 text-white select-none cursor-pointer overflow-hidden"
      style={{
        backgroundImage: `url(${settings.wallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      {/* Top / Center Clock Area */}
      {!isUnlocked ? (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center -mt-16 animate-in fade-in duration-300">
          <div className="text-7xl font-extralight tracking-tight mb-2 font-sans drop-shadow-md">
            {timeString}
          </div>
          <div className="text-xl font-normal capitalize opacity-90 drop-shadow-md">
            {dateString}
          </div>
          <div className="text-xs text-white/70 mt-12 animate-pulse">
            Нажмите в любом месте для входа
          </div>
        </div>
      ) : (
        /* Login Prompt Form */
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200"
        >
          <img
            src={USER_AVATAR}
            alt="User"
            className="w-24 h-24 rounded-full object-cover border-2 border-white/50 shadow-2xl mb-4"
          />
          <h2 className="text-xl font-medium mb-4">{settings.registeredOwner}</h2>

          <form onSubmit={handleLogin} className="flex items-center gap-2">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN-код или нажмите Войти"
              autoFocus
              className="px-4 py-2 rounded-lg bg-black/40 border border-white/30 text-white placeholder:text-white/50 outline-none text-xs w-56 backdrop-blur-md focus:border-sky-400"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-colors shadow-md"
              title="Войти"
            >
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="text-[11px] text-white/70 mt-3">Пароль не требуется (демо-режим)</div>
        </div>
      )}

      {/* Bottom Tray */}
      <div className="relative z-10 flex items-center justify-end gap-3 text-white/80">
        <Wifi size={16} />
        <Volume2 size={16} />
        <Battery size={16} />
      </div>
    </div>
  );
};
