import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const WaitingRoom: React.FC = () => {
  const { activeCompetition } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      if (!activeCompetition?.scheduled_start) return;

      const now = new Date().getTime();
      const start = new Date(activeCompetition.scheduled_start).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
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
    <div className="max-w-2xl w-full p-12 bg-gray-800/90 backdrop-blur-xl rounded-[3rem] shadow-3xl border border-blue-500/20 text-center">
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
        <div className="relative bg-gray-900 rounded-full w-full h-full flex items-center justify-center border border-blue-500/50">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">
        Ready for Battle?
      </h2>
      <p className="text-blue-400 font-bold uppercase text-xs tracking-[0.3em] mb-10">
        Waiting for Coordinator to Signal Start
      </p>

      <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-700 mb-8">
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Estimated Countdown</div>
        <div className="text-6xl font-black font-mono tracking-widest text-white tabular-nums">
          {timeLeft || '--:--:--'}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 text-gray-400 text-sm italic">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Registered for: <span className="text-white font-bold not-italic">{activeCompetition?.name}</span>
        </div>
        <p className="text-gray-500 text-xs max-w-sm">
          Keep this tab open. The challenge will begin automatically the moment the coordinator clicks "GO LIVE".
        </p>
      </div>
    </div>
  );
};

export default WaitingRoom;
