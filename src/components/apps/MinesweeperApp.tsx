import React, { useState, useEffect } from 'react';
import { Flag, Smile, Frown, Meh, Trophy } from 'lucide-react';

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const ROWS = 9;
const COLS = 9;
const MINES = 10;

export const MinesweeperApp: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Initialize game
  const initBoard = () => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < ROWS; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }

    // Place mines randomly
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!newGrid[r][c].isMine) {
        newGrid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameStatus('playing');
    setFlagsLeft(MINES);
    setTimer(0);
    setTimerActive(false);
  };

  useEffect(() => {
    initBoard();
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && gameStatus === 'playing') {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, gameStatus]);

  const revealCell = (r: number, c: number) => {
    if (gameStatus !== 'playing') return;
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    if (!timerActive) setTimerActive(true);

    const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

    if (cell.isMine) {
      // Game Over: reveal all mines
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (newGrid[row][col].isMine) {
            newGrid[row][col].isRevealed = true;
          }
        }
      }
      setGrid(newGrid);
      setGameStatus('lost');
      return;
    }

    // Flood fill revealing
    const flood = (row: number, col: number) => {
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
      if (newGrid[row][col].isRevealed || newGrid[row][col].isFlagged || newGrid[row][col].isMine) return;

      newGrid[row][col].isRevealed = true;
      if (newGrid[row][col].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            flood(row + dr, col + dc);
          }
        }
      }
    };

    flood(r, c);

    // Check Win
    let unrevealedSafe = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newGrid[row][col].isMine && !newGrid[row][col].isRevealed) {
          unrevealedSafe++;
        }
      }
    }

    if (unrevealedSafe === 0) {
      setGameStatus('won');
    }

    setGrid(newGrid);
  };

  const toggleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    const newGrid = grid.map((row) => row.map((c) => ({ ...c })));
    const target = newGrid[r][c];

    if (!target.isFlagged && flagsLeft > 0) {
      target.isFlagged = true;
      setFlagsLeft((f) => f - 1);
    } else if (target.isFlagged) {
      target.isFlagged = false;
      setFlagsLeft((f) => f + 1);
    }

    setGrid(newGrid);
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '',
      'text-blue-500 font-bold',
      'text-emerald-500 font-bold',
      'text-red-500 font-bold',
      'text-indigo-700 font-bold',
      'text-amber-700 font-bold',
      'text-teal-600 font-bold',
      'text-purple-600 font-bold',
      'text-zinc-600 font-bold',
    ];
    return colors[num] || '';
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-100 dark:bg-zinc-900 select-none text-xs">
      <div className="p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl flex flex-col gap-4">
        {/* Header Display */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 text-white font-mono text-sm">
          {/* Mines Left */}
          <div className="w-12 text-red-500 font-bold text-center">
            {String(flagsLeft).padStart(3, '0')}
          </div>

          {/* Reset Face */}
          <button
            onClick={initBoard}
            className="p-1 rounded-full hover:bg-zinc-800 text-amber-400 transition-colors"
          >
            {gameStatus === 'won' ? (
              <Trophy size={20} className="text-yellow-400" />
            ) : gameStatus === 'lost' ? (
              <Frown size={20} className="text-red-400" />
            ) : (
              <Smile size={20} />
            )}
          </button>

          {/* Timer */}
          <div className="w-12 text-red-500 font-bold text-center">
            {String(Math.min(999, timer)).padStart(3, '0')}
          </div>
        </div>

        {/* Minesweeper Grid */}
        <div className="grid grid-cols-9 gap-1 p-2 rounded-lg bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => revealCell(r, c)}
                onContextMenu={(e) => toggleFlag(e, r, c)}
                className={`w-7 h-7 rounded text-xs flex items-center justify-center font-bold transition-colors ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-300 dark:bg-zinc-700'
                    : 'bg-zinc-400/80 hover:bg-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 shadow-xs'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                  ) : (
                    ''
                  )
                ) : cell.isFlagged ? (
                  <Flag size={13} className="text-red-500 fill-red-500" />
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
