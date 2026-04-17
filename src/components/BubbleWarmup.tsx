import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

interface Bubble {
  id: number;
  char: string;
  x: number;
  y: number;
  speed: number;
  size: number;
}

const BubbleWarmup: React.FC = () => {
  const { activeCompetition } = useGameStore();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<string>('');
  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);

  // 1. Global Sync with Competition Start (Only if in an actual competition)
  useEffect(() => {
    if (activeCompetition?.status !== 'draft') return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(activeCompetition.scheduled_start).getTime();
      const diff = start - now;

      if (diff <= 0) {
        clearInterval(timer);
        useGameStore.setState({ currentLevel: 3 });
        return;
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setGlobalTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCompetition]);

  // 2. Game Loop
  const spawnBubble = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      char: chars.charAt(Math.floor(Math.random() * chars.length)),
      x: Math.random() * 80 + 10,
      y: 110,
      speed: Math.random() * 0.2 + 0.1,
      size: Math.random() * 20 + 50,
    };
    setBubbles((prev) => [...prev, newBubble]);
  };

  const update = (time: number) => {
    if (time - lastSpawnRef.current > 800) {
      spawnBubble();
      lastSpawnRef.current = time;
    }

    setBubbles((prev) => 
      prev
        .map((b) => ({ ...b, y: b.y - b.speed }))
        .filter((b) => b.y > -20)
    );

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      setBubbles((prev) => {
        const index = prev.findIndex((b) => b.char === key);
        if (index !== -1) {
          setScore((s) => s + 1);
          const newBubbles = [...prev];
          newBubbles.splice(index, 1);
          return newBubbles;
        }
        return prev;
      });
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleFinish = () => {
    if (activeCompetition?.status === 'draft') {
      useGameStore.setState({ currentLevel: 1 }); // Back to waiting room
    } else {
      useGameStore.getState().resetGame(); // Back to entry
    }
  };

  return (
    <div className="relative w-full max-w-4xl h-[550px] bg-gray-900 rounded-[2.5rem] border-2 border-blue-500/30 overflow-hidden select-none shadow-2xl">
      {/* Header */}
      <div className="absolute top-8 left-10 z-10">
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Warmup Points</div>
        <div className="text-4xl font-black text-white italic tracking-tighter">{score}</div>
      </div>

      <div className="absolute top-8 right-10 z-10 text-right">
        <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1 text-right">
          {activeCompetition?.status === 'draft' ? 'Combat Start In' : 'Practice Mode'}
        </div>
        <div className="text-4xl font-mono font-black text-white tabular-nums tracking-widest">
          {activeCompetition?.status === 'draft' ? globalTimeLeft || '00:00' : '∞'}
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <h1 className="text-[15rem] font-black uppercase italic -rotate-12">ARENA</h1>
      </div>

      {/* Bubbles */}
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute flex items-center justify-center rounded-full border-2 border-blue-400/50 bg-blue-500/10 text-white font-black shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-transform backdrop-blur-sm"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            fontSize: `${bubble.size * 0.4}px`,
          }}
        >
          {bubble.char}
        </div>
      ))}

      {/* Footer */}
      <div className="absolute bottom-6 w-full text-center flex flex-col items-center gap-3">
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
          Type characters to pop bubbles • Keep hands ready
        </p>
        <div className="flex gap-4">
          <button 
            onClick={handleFinish}
            className="px-6 py-2 bg-gray-950 hover:bg-black border border-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-500 hover:text-white"
          >
            {activeCompetition?.status === 'draft' ? 'Back to Lobby' : 'Exit Practice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BubbleWarmup;
