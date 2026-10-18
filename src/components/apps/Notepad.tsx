import React, { useState, useEffect } from 'react';
import { Save, FilePlus, Copy, Check, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { ElevationLevel } from '../../types/system';

interface NotepadProps {
  fileId?: string;
  elevationLevel?: ElevationLevel;
}

export const Notepad: React.FC<NotepadProps> = ({ fileId, elevationLevel = 'user' }) => {
  const { files, updateFileContent, createFile, settings } = useSystem();
  const isDark = settings.theme === 'dark';

  const [currentFileId, setCurrentFileId] = useState<string | undefined>(fileId);
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('Безымянный.txt');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setCurrentFileId(fileId);
  }, [fileId]);

  useEffect(() => {
    if (currentFileId) {
      const file = files.find((f) => f.id === currentFileId);
      if (file) {
        setContent(file.content || '');
        setFileName(file.name);
        setIsSaved(true);
      }
    }
  }, [currentFileId, files]);

  const handleSave = () => {
    if (currentFileId) {
      updateFileContent(currentFileId, content);
      setIsSaved(true);
    } else {
      // Save new file to desktop
      const newFile = createFile('C:/Users/User/Desktop', fileName, content);
      setCurrentFileId(newFile.id);
      setIsSaved(true);
    }
  };

  const handleNew = () => {
    setCurrentFileId(undefined);
    setContent('');
    setFileName('Новый документ.txt');
    setIsSaved(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Cursor position line / col
  const lines = content.split('\n').length;
  const chars = content.length;

  return (
    <div className="flex-1 flex flex-col h-full text-xs">
      {/* Menu / Toolbar */}
      <div
        className={`h-9 px-3 flex items-center justify-between border-b ${
          isDark ? 'bg-zinc-800/50 border-zinc-700/60' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-500/10 transition-colors"
          >
            <FilePlus size={13} />
            <span>Создать</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
          >
            <Save size={13} />
            <span>Сохранить</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-zinc-500/10 transition-colors"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className={`px-2 py-0.5 rounded border text-right ${
              isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
          <span>{!isSaved && '● Не сохранено'}</span>
        </div>
      </div>

      {/* Elevation Banner if elevated */}
      {elevationLevel === 'trustedinstaller' && (
        <div className="px-3 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
          <ShieldCheck size={14} className="text-amber-500 shrink-0" />
          <span><strong>Режим TrustedInstaller:</strong> Полный доступ к защищенным системным файлам и обход блокировок.</span>
        </div>
      )}
      {elevationLevel === 'system' && (
        <div className="px-3 py-1.5 bg-purple-500/15 border-b border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] flex items-center gap-2">
          <ShieldAlert size={14} className="text-purple-500 shrink-0" />
          <span><strong>Режим СИСТЕМА:</strong> Запущено с привилегиями ядра NT AUTHORITY\SYSTEM.</span>
        </div>
      )}
      {elevationLevel === 'admin' && (
        <div className="px-3 py-1 bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] flex items-center gap-2">
          <Shield size={13} className="text-blue-500 shrink-0" />
          <span>Запущено от имени администратора</span>
        </div>
      )}

      {/* Editor Body */}
      <div className="flex-1 p-2 relative">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Введите текст здесь..."
          className={`w-full h-full p-3 font-mono text-[13px] leading-relaxed resize-none outline-none rounded border ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
          }`}
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div
        className={`h-6 px-3 flex items-center justify-between border-t text-[10px] text-zinc-400 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <div className="flex gap-4">
          <span>Строк: {lines}</span>
          <span>Символов: {chars}</span>
        </div>
        <div>UTF-8 · Windows (CRLF)</div>
      </div>
    </div>
  );
};
