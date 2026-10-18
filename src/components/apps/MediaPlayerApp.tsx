import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Disc } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const MediaPlayerApp: React.FC = () => {
  const { settings } = useSystem();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(24);
  const animRef = useRef<number | null>(null);

  const tracks = [
    { title: 'Windows 11 Ambient Calm', artist: 'Windows Sound Studio', duration: '3:45' },
    { title: 'Cyber Ribbon Bloom', artist: 'Fluent Acoustic', duration: '4:12' },
    { title: 'System Recovery Lofi Chill', artist: 'WinRE Beats', duration: '2:58' },
  ];

  const currentTrack = tracks[trackIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((p) => (p >= 100 ? 0 : p + 1));
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    setTrackIndex((i) => (i + 1) % tracks.length);
    setProgress(0);
  };

  const prevTrack = () => {
    setTrackIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-white select-none text-xs p-6 items-center justify-between">
      {/* Vinyl / Cover Art */}
      <div className="flex flex-col items-center justify-center pt-4">
        <div
          className={`w-40 h-40 rounded-full border-4 border-zinc-800 bg-gradient-to-tr from-orange-600 via-rose-600 to-indigo-600 flex items-center justify-center shadow-2xl transition-transform duration-700 ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '8s' }}
        >
          <div className="w-12 h-12 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center">
            <Music size={18} className="text-zinc-400" />
          </div>
        </div>

        {/* Animated Sound Spectrum bars */}
        <div className="flex items-end gap-1.5 h-10 mt-6">
          {[16, 28, 45, 70, 35, 80, 50, 65, 30, 85, 40, 20].map((h, idx) => (
            <div
              key={idx}
              className="w-1.5 bg-gradient-to-t from-sky-500 to-indigo-400 rounded-t transition-all duration-200"
              style={{
                height: isPlaying ? `${Math.max(6, (h * ((idx % 3) + 1.2)) % 40)}px` : '4px',
              }}
            />
          ))}
        </div>

        <div className="text-center mt-3">
          <div className="text-sm font-semibold truncate max-w-xs">{currentTrack.title}</div>
          <div className="text-zinc-400 text-[11px] mt-0.5">{currentTrack.artist}</div>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="w-full max-w-sm flex flex-col gap-3 pb-2">
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span>1:12</span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden cursor-pointer">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <span>{currentTrack.duration}</span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button onClick={prevTrack} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300">
            <SkipBack size={18} />
          </button>
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="fill-current ml-0.5" />}
          </button>
          <button onClick={nextTrack} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300">
            <SkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
