import React, { useState, useEffect, useCallback } from 'react';
import { Delete, History, RotateCcw } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const Calculator: React.FC = () => {
  const { settings } = useSystem();
  const isDark = settings.theme === 'dark';

  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDot = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    setDisplay('0');
  }, []);

  const backspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display]);

  const performOperation = useCallback((nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operation === '+') newValue = currentValue + inputValue;
      else if (operation === '−' || operation === '-') newValue = currentValue - inputValue;
      else if (operation === '×' || operation === '*') newValue = currentValue * inputValue;
      else if (operation === '÷' || operation === '/') newValue = inputValue !== 0 ? currentValue / inputValue : 0;

      const record = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      setHistoryList((prev) => [record, ...prev].slice(0, 10));

      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOp === '=' ? null : nextOp);
  }, [display, operation, prevValue]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        inputDigit(e.key);
      } else if (e.key === '.') {
        inputDot();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const opMap: Record<string, string> = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        performOperation(opMap[e.key] || e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        performOperation('=');
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDot, performOperation, backspace, clearAll]);

  return (
    <div className="flex-1 flex flex-col h-full select-none text-xs">
      {/* Top Header */}
      <div className="h-8 px-3 flex items-center justify-between opacity-80">
        <span className="font-semibold text-xs">Обычный</span>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-1 rounded hover:bg-zinc-500/10 text-zinc-400 hover:text-current"
          title="Журнал"
        >
          <History size={14} />
        </button>
      </div>

      {/* Main Display */}
      <div className="px-4 py-2 flex flex-col items-end justify-center min-h-[70px]">
        <div className="text-[11px] text-zinc-400 h-4">
          {prevValue !== null && `${prevValue} ${operation || ''}`}
        </div>
        <div className="text-3xl font-light tracking-tight truncate max-w-full font-sans">
          {display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="flex-1 grid grid-cols-4 gap-1 p-2">
        <button onClick={clearEntry} className="btn-calc">CE</button>
        <button onClick={clearAll} className="btn-calc">C</button>
        <button onClick={backspace} className="btn-calc flex items-center justify-center">
          <Delete size={14} />
        </button>
        <button onClick={() => performOperation('÷')} className="btn-calc-op">÷</button>

        <button onClick={() => inputDigit('7')} className="btn-calc-num">7</button>
        <button onClick={() => inputDigit('8')} className="btn-calc-num">8</button>
        <button onClick={() => inputDigit('9')} className="btn-calc-num">9</button>
        <button onClick={() => performOperation('×')} className="btn-calc-op">×</button>

        <button onClick={() => inputDigit('4')} className="btn-calc-num">4</button>
        <button onClick={() => inputDigit('5')} className="btn-calc-num">5</button>
        <button onClick={() => inputDigit('6')} className="btn-calc-num">6</button>
        <button onClick={() => performOperation('−')} className="btn-calc-op">−</button>

        <button onClick={() => inputDigit('1')} className="btn-calc-num">1</button>
        <button onClick={() => inputDigit('2')} className="btn-calc-num">2</button>
        <button onClick={() => inputDigit('3')} className="btn-calc-num">3</button>
        <button onClick={() => performOperation('+')} className="btn-calc-op">+</button>

        <button
          onClick={() => {
            const num = parseFloat(display);
            setDisplay(String(-num));
          }}
          className="btn-calc-num"
        >
          ±
        </button>
        <button onClick={() => inputDigit('0')} className="btn-calc-num">0</button>
        <button onClick={inputDot} className="btn-calc-num">.</button>
        <button
          onClick={() => performOperation('=')}
          className="rounded font-medium text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-sm flex items-center justify-center text-sm"
        >
          =
        </button>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div
          className={`absolute inset-x-0 bottom-0 top-12 p-3 border-t z-10 overflow-y-auto flex flex-col justify-between ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="font-semibold text-xs mb-2">История вычислений</div>
            {historyList.length === 0 ? (
              <div className="text-zinc-400 py-4 text-center">Журнала пока нет</div>
            ) : (
              <div className="flex flex-col gap-2">
                {historyList.map((item, idx) => (
                  <div key={idx} className="p-2 rounded bg-zinc-500/10 text-right font-mono text-xs">
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
          {historyList.length > 0 && (
            <button
              onClick={() => setHistoryList([])}
              className="mt-3 py-1.5 px-3 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 text-center"
            >
              Очистить журнал
            </button>
          )}
        </div>
      )}

      {/* Inline styles for calculator buttons */}
      <style>{`
        .btn-calc {
          background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transition: background-color 0.15s;
        }
        .btn-calc:hover {
          background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
        }
        .btn-calc-num {
          background: ${isDark ? 'rgba(255,255,255,0.08)' : '#ffffff'};
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: background-color 0.15s;
        }
        .btn-calc-num:hover {
          background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'};
        }
        .btn-calc-op {
          background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'};
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          color: #0284c7;
          transition: background-color 0.15s;
        }
        .btn-calc-op:hover {
          background: ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)'};
        }
      `}</style>
    </div>
  );
};
