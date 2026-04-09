import React, { useState, useEffect } from 'react';

interface BreakProps {
  onComplete: () => void;
  duration?: number;
}

const Break: React.FC<BreakProps> = ({ onComplete, duration = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-lg w-full">
      <h2 className="text-4xl font-bold text-yellow-400 mb-4">Intermission</h2>
      <p className="text-gray-400 text-lg mb-8 text-center">Take a breather. Next level starts in:</p>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-700"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={502.4}
            strokeDashoffset={502.4 - (502.4 * timeLeft) / duration}
            className="text-yellow-500 transition-all duration-1000 ease-linear"
          />
        </svg>
        <span className="absolute text-5xl font-mono font-bold text-white">
          {timeLeft}s
        </span>
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={onComplete}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm font-semibold transition-colors"
        >
          Skip Break
        </button>
      </div>
    </div>
  );
};

export default Break;
