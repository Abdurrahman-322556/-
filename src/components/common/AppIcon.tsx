import React from 'react';
import {
  Folder,
  Settings,
  Terminal,
  FileText,
  Calculator,
  Globe,
  Activity,
  ShoppingBag,
  Palette,
  Gamepad2,
  Cpu,
  Music,
  Code2,
  ShieldCheck,
  FileCode,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';

interface AppIconProps {
  icon: string;
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ icon, className = '', size = 24 }) => {
  switch (icon) {
    case 'explorer':
    case 'folder':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 ${className}`}>
          <Folder size={size} className="fill-amber-400 stroke-amber-600 drop-shadow-sm" />
        </div>
      );
    case 'settings':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-slate-500/10 text-slate-400 ${className}`}>
          <Settings size={size} className="text-slate-400 fill-slate-300/30" />
        </div>
      );
    case 'terminal':
    case 'cmd':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-black text-emerald-400 p-1 border border-zinc-800 shadow-sm ${className}`}>
          <Terminal size={size * 0.9} className="text-white" />
        </div>
      );
    case 'notepad':
    case 'file':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 ${className}`}>
          <FileText size={size} className="text-sky-500 fill-sky-100" />
        </div>
      );
    case 'calculator':
    case 'calc':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 ${className}`}>
          <Calculator size={size} className="text-emerald-500" />
        </div>
      );
    case 'edge':
    case 'globe':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-sm ${className}`}>
          <Globe size={size * 0.9} className="text-white" />
        </div>
      );
    case 'taskmgr':
    case 'activity':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 ${className}`}>
          <Activity size={size} className="text-emerald-500" />
        </div>
      );
    case 'store':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm ${className}`}>
          <ShoppingBag size={size * 0.85} className="text-white fill-white/20" />
        </div>
      );
    case 'paint':
    case 'palette':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-sm ${className}`}>
          <Palette size={size * 0.85} className="text-white" />
        </div>
      );
    case 'minesweeper':
    case 'gamepad':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-sm ${className}`}>
          <Gamepad2 size={size * 0.85} className="text-white" />
        </div>
      );
    case 'cpuz':
    case 'cpu':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm ${className}`}>
          <Cpu size={size * 0.85} className="text-cyan-400" />
        </div>
      );
    case 'mediaplayer':
    case 'music':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm ${className}`}>
          <Music size={size * 0.85} className="text-white" />
        </div>
      );
    case 'vscode':
    case 'code':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm ${className}`}>
          <Code2 size={size * 0.85} className="text-white" />
        </div>
      );
    case 'winre':
    case 'recovery':
      return (
        <div className={`flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm ${className}`}>
          <ShieldCheck size={size * 0.85} className="text-white" />
        </div>
      );
    case 'harddrive':
      return (
        <div className={`flex items-center justify-center text-slate-500 ${className}`}>
          <HardDrive size={size} className="text-slate-400" />
        </div>
      );
    default:
      return (
        <div className={`flex items-center justify-center rounded-lg bg-slate-500/10 text-slate-500 ${className}`}>
          <FileCode size={size} className="text-slate-400" />
        </div>
      );
  }
};
