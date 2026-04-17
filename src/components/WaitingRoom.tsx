import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const WaitingRoom: React.FC = () => {
  const { activeCompetition, setWarmupMode, selectedWarmupMode, nextLevel } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!activeCompetition?.scheduled_start) return;

      const now = new Date().getTime();
      const start = new Date(activeCompetition.scheduled_start).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setIsLocked(true);
        clearInterval(timer);
        // Move to Warmup automatically when timer ends
        nextLevel();
        return;
      }

      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCompetition]);

  return (
    <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8">
      {/* Left side: Instructions & Warmup */}
      <div className="flex-1 p-10 bg-gray-800/90 backdrop-blur-xl rounded-[2.5rem] border border-blue-500/10 shadow-2xl">
        <h3 className="text-xl font-black text-blue-400 uppercase italic mb-6 tracking-tight">Battle Instructions</h3>
        <ul className="space-y-4 text-sm text-gray-300">
          <li className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
            <p><span className="text-white font-bold">Accuracy is King:</span> Score is weighted by Accuracy squared. A 90% accuracy with 100 WPM is better than 70% with 150 WPM.</p>
          </li>
          <li className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
            <p><span className="text-white font-bold">3 Combat Levels:</span> Paragraphs, C++ Snippets, and Precision Symbols. Each level has a 1-minute break between them.</p>
          </li>
          <li className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
            <p><span className="text-white font-bold">Anti-Cheat:</span> Switching tabs or closing the window will trigger a disqualification alert. Keep the focus here!</p>
          </li>
        </ul>

        <div className="mt-10 pt-10 border-t border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Select Warmup Mode</h3>
            {isLocked && <span className="text-[10px] bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse border border-red-500/30">LOCKED</span>}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              disabled={isLocked}
              onClick={() => setWarmupMode('game')}
              className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                selectedWarmupMode === 'game' 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                : 'border-gray-700 hover:border-gray-600 grayscale opacity-60'
              } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-lg font-black mb-1">Bubble Pop</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-blue-400">Action Game</div>
            </button>
            <button
              disabled={isLocked}
              onClick={() => setWarmupMode('paragraph')}
              className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                selectedWarmupMode === 'paragraph' 
                ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                : 'border-gray-700 hover:border-gray-600 grayscale opacity-60'
              } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="text-lg font-black mb-1">Paragraph</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-green-400">Classic Practice</div>
            </button>
          </div>

          <button
            onClick={() => nextLevel()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-lg shadow-blue-500/20"
          >
            Enter Warmup Arena
          </button>
        </div>
      </div>

      {/* Right side: Countdown */}
      <div className="w-full md:w-[350px] p-10 bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] border border-blue-500/20 flex flex-col items-center justify-center text-center shadow-2xl">
        <div className="relative w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-10"></div>
          <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center border border-blue-500/30">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1">
          Lobby Ready
        </h2>
        <p className="text-blue-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-8">
          Waiting for Event Start
        </p>

        <div className="w-full bg-black/40 p-6 rounded-3xl border border-gray-800 mb-8">
          <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-3">T-Minus Countdown</div>
          <div className="text-4xl font-black font-mono tracking-wider text-white tabular-nums">
            {timeLeft || '--:--:--'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-400 text-[10px] italic">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Event: <span className="text-white font-bold not-italic">{activeCompetition?.name}</span>
          </div>
          <p className="text-gray-500 text-[9px] leading-relaxed">
            Competition will begin automatically. Do not refresh.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
