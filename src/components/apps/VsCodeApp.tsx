import React, { useState } from 'react';
import { Play, FileCode, Check, RefreshCw } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const VsCodeApp: React.FC = () => {
  const { createFile, addNotification } = useSystem();

  const [code, setCode] = useState<string>(`// Windows 11 Virtual JavaScript Environment
function calculatePerformance(specs) {
  console.log("Initializing CPU benchmark test on " + specs.cpu + "...");
  const iterations = 500000;
  let score = 0;
  for (let i = 0; i < iterations; i++) {
    score += Math.sqrt(i) * 0.001;
  }
  return "Completed! Score: " + Math.round(score) + " pts. WinRE recovery module verified.";
}

const result = calculatePerformance({ cpu: "Intel Core i9-13900K", ram: "32GB" });
console.log(result);
`);

  const [output, setOutput] = useState<string[]>([]);

  const runCode = () => {
    setOutput([]);
    const logs: string[] = [];
    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      },
      error: (...args: unknown[]) => {
        logs.push('[ERROR]: ' + args.join(' '));
      }
    };

    try {
      // Safe execution sandbox
      const fn = new Function('console', code);
      fn(customConsole);
      setOutput(logs.length ? logs : ['(Программа завершилась без вывода)']);
    } catch (err) {
      setOutput([`Ошибка выполнения: ${(err as Error).message}`]);
    }
  };

  const saveScript = () => {
    createFile('C:/Users/User/Desktop', 'benchmark.js', code);
    addNotification('Файл сохранен', 'Скрипт benchmark.js сохранен на рабочий стол.', 'VS Code');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs overflow-hidden select-none">
      {/* Top Action Bar */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-[#333333] bg-[#252526]">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-sky-400" />
          <span className="text-[11px] text-zinc-300">benchmark.js</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs transition-colors shadow-xs"
          >
            <Play size={12} className="fill-current" />
            <span>Запустить</span>
          </button>
          <button
            onClick={saveScript}
            className="px-2.5 py-1 rounded bg-[#333333] hover:bg-[#444444] text-xs font-sans transition-colors"
          >
            Сохранить файл
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 p-2 overflow-hidden flex flex-col">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full p-2 bg-[#1e1e1e] text-[#9cdcfe] font-mono text-xs leading-relaxed outline-none resize-none border-none selection:bg-[#264f78]"
            spellCheck={false}
          />
        </div>

        {/* Output Console */}
        <div className="h-40 sm:h-auto sm:w-72 border-t sm:border-t-0 sm:border-l border-[#333333] bg-[#181818] p-3 flex flex-col">
          <div className="text-[11px] font-sans font-semibold text-zinc-400 pb-2 border-b border-[#333333] mb-2 flex justify-between items-center">
            <span>Консоль вывода</span>
            <button onClick={() => setOutput([])} className="hover:text-white">
              <RefreshCw size={11} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 text-[11px] font-mono select-text">
            {output.length === 0 ? (
              <span className="text-zinc-600">Нажмите «Запустить» для выполнения кода...</span>
            ) : (
              output.map((line, i) => (
                <div key={i} className={line.startsWith('Completed') ? 'text-emerald-400' : line.startsWith('Ошибка') ? 'text-red-400' : 'text-zinc-300'}>
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-6 px-3 bg-[#007acc] text-white flex items-center justify-between text-[10px] font-sans">
        <span>JavaScript · UTF-8</span>
        <span>Строк: {code.split('\n').length}</span>
      </div>
    </div>
  );
};
