import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, RotateCcw, Download, Palette, Check } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

export const PaintApp: React.FC = () => {
  const { createFile, addNotification, settings } = useSystem();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const [color, setColor] = useState('#0078d4');
  const [lineWidth, setLineWidth] = useState(3);
  const [savedStatus, setSavedStatus] = useState(false);

  const colors = [
    '#000000', '#ffffff', '#7f7f7f', '#c3c3c3',
    '#880015', '#b97a57', '#ed1c24', '#ffaec9',
    '#ff7f27', '#ffc90e', '#fff200', '#efe4b0',
    '#22b14c', '#b5e61d', '#00a2e8', '#99d9ea',
    '#3f48cc', '#7092be', '#a349a4', '#c8bfe7'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 4 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fileName = `Рисунок_${Date.now().toString().slice(-4)}.txt`;
    createFile('C:/Users/User/Desktop', fileName, `[Файл изображения Paint]: Создан в Windows 11 Paint в ${new Date().toLocaleTimeString()}`);
    setSavedStatus(true);
    addNotification('Рисунок сохранен', `Файл ${fileName} сохранен на рабочем столе.`, 'Paint');
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100 dark:bg-zinc-900 text-xs select-none overflow-hidden">
      {/* Ribbon */}
      <div className="h-16 px-4 flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80">
        {/* Tools */}
        <div className="flex items-center gap-1 border-r pr-3 border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pencil' ? 'bg-sky-500 text-white' : 'hover:bg-zinc-500/10'
            }`}
            title="Карандаш"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-sky-500 text-white' : 'hover:bg-zinc-500/10'
            }`}
            title="Ластик"
          >
            <Eraser size={16} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg hover:bg-zinc-500/10 transition-colors text-zinc-500"
            title="Очистить холст"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Thickness */}
        <div className="flex flex-col gap-1 border-r pr-3 border-zinc-200 dark:border-zinc-700 w-24">
          <span className="text-[10px] text-zinc-400">Толщина: {lineWidth}px</span>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Colors Palette */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          <div
            className="w-8 h-8 rounded-lg border-2 border-zinc-400 shrink-0 shadow-inner"
            style={{ backgroundColor: color }}
            title="Текущий цвет"
          />
          <div className="grid grid-rows-2 grid-flow-col gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  setTool('pencil');
                }}
                className={`w-4 h-4 rounded border transition-transform ${
                  color === c ? 'scale-125 border-sky-500 z-10' : 'border-zinc-300 dark:border-zinc-700'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={saveDrawing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors shadow-xs"
        >
          {savedStatus ? <Check size={14} /> : <Download size={14} />}
          <span>{savedStatus ? 'Сохранено' : 'Сохранить'}</span>
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-zinc-200 dark:bg-zinc-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={550}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="bg-white rounded-lg shadow-xl cursor-crosshair max-w-full max-h-full border border-zinc-300 dark:border-zinc-700"
        />
      </div>
    </div>
  );
};
