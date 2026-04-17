import React, { useState, useEffect } from 'react';

interface BreakProps {
  onComplete: () => void;
  duration?: number;
}

const Break: React.FC<BreakProps> = ({ onComplete, duration = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Small delay before completing to prevent double-firing in some React versions
          setTimeout(() => onComplete(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800/90 backdrop-blur-xl rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-700 max-w-lg w-full">
      <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
      </div>
      
      <h2 className="text-4xl font-black text-white mb-2 uppercase italic tracking-tighter">Intermission</h2>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-10">Neural Recharge in Progress</p>
      
      <div className="relative w-56 h-56 flex items-center justify-center mb-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            cx="112"
            cy="112"
            r="100"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={628.3}
            strokeDashoffset={628.3 - (628.3 * timeLeft) / (duration || 60)}
            strokeLinecap="round"
            className="text-yellow-500 transition-all duration-1000 ease-linear shadow-[0_0_15px_rgba(234,179,8,0.5)]"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-mono font-black text-white tabular-nums tracking-tighter">
            {timeLeft}
            </span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-[-5px]">Seconds</span>
        </div>
      </div>

      <button 
        onClick={onComplete}
        className="px-10 py-3 bg-gray-900 hover:bg-black border border-gray-800 hover:border-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-500 hover:text-white"
      >
        Bypass Intermission
      </button>
    </div>
  );
};

export default Break;
