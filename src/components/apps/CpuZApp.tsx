import React, { useState } from 'react';
import { Cpu, Server, CircuitBoard, Layers } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const CpuZApp: React.FC = () => {
  const { settings } = useSystem();
  const [tab, setTab] = useState<'cpu' | 'mainboard' | 'memory'>('cpu');

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 text-xs select-none">
      {/* Tab Header */}
      <div className="flex border-b border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-950 p-1 gap-1">
        <button
          onClick={() => setTab('cpu')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
            tab === 'cpu' ? 'bg-white dark:bg-zinc-800 text-sky-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          CPU
        </button>
        <button
          onClick={() => setTab('mainboard')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
            tab === 'mainboard' ? 'bg-white dark:bg-zinc-800 text-sky-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Mainboard
        </button>
        <button
          onClick={() => setTab('memory')}
          className={`px-3 py-1 rounded text-[11px] font-medium transition-colors ${
            tab === 'memory' ? 'bg-white dark:bg-zinc-800 text-sky-500 shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          Memory
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-[11px]">
        {tab === 'cpu' && (
          <div className="space-y-3">
            <div className="p-3 rounded border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <div className="text-sky-500 font-bold mb-2">Processor</div>
              <div className="grid grid-cols-2 gap-1.5">
                <span className="text-zinc-400">Name:</span>
                <span className="font-semibold">Intel Core i9 13900K</span>
                <span className="text-zinc-400">Code Name:</span>
                <span>Raptor Lake</span>
                <span className="text-zinc-400">Package:</span>
                <span>Socket LGA1700</span>
                <span className="text-zinc-400">Technology:</span>
                <span>Intel 7 (10nm)</span>
                <span className="text-zinc-400">Cores / Threads:</span>
                <span>24 Cores (8P + 16E) / 32 Threads</span>
              </div>
            </div>

            <div className="p-3 rounded border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-800/60">
              <div className="text-sky-500 font-bold mb-2">Clocks (Core #0)</div>
              <div className="grid grid-cols-2 gap-1.5">
                <span className="text-zinc-400">Core Speed:</span>
                <span className="text-emerald-500 font-bold">5798.2 MHz</span>
                <span className="text-zinc-400">Multiplier:</span>
                <span>x 58.0 (8-58)</span>
                <span className="text-zinc-400">Bus Speed:</span>
                <span>100.0 MHz</span>
              </div>
            </div>
          </div>
        )}

        {tab === 'mainboard' && (
          <div className="p-3 rounded border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 space-y-2">
            <div className="text-sky-500 font-bold mb-2">Motherboard</div>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="text-zinc-400">Manufacturer:</span>
              <span>ASUSTeK COMPUTER INC.</span>
              <span className="text-zinc-400">Model:</span>
              <span>ROG MAXIMUS Z790 HERO</span>
              <span className="text-zinc-400">Chipset:</span>
              <span>Intel Z790 (Raptor Lake-S)</span>
              <span className="text-zinc-400">BIOS Version:</span>
              <span>2102 (UEFI x64)</span>
            </div>
          </div>
        )}

        {tab === 'memory' && (
          <div className="p-3 rounded border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 space-y-2">
            <div className="text-sky-500 font-bold mb-2">General</div>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="text-zinc-400">Type:</span>
              <span>DDR5 Dual Channel</span>
              <span className="text-zinc-400">Size:</span>
              <span>32 GBytes</span>
              <span className="text-zinc-400">DRAM Frequency:</span>
              <span>3000.0 MHz (DDR5-6000)</span>
              <span className="text-zinc-400">CAS# Latency (CL):</span>
              <span>30.0 clocks</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-6 px-3 border-t border-zinc-300 dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-950 flex items-center justify-between text-[10px] text-zinc-500">
        <span>Version 2.08.0.x64</span>
        <span className="text-emerald-500">Hardware OK</span>
      </div>
    </div>
  );
};
