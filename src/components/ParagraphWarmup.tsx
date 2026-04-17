import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import TypingArea from './TypingArea';
import { LEVEL_1_PARAGRAPHS } from '../data/content';

const ParagraphWarmup: React.FC = () => {
  const { activeCompetition } = useGameStore();
  const [isFinished, setIsFinished] = useState(false);
  const [globalTimeLeft, setGlobalTimeLeft] = useState<string>('');
  const text = LEVEL_1_PARAGRAPHS[0];

  // Global Sync with Competition Start
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

  const handleBack = () => {
    if (activeCompetition?.status === 'draft') {
      useGameStore.setState({ currentLevel: 1 });
    } else {
      useGameStore.getState().resetGame();
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl w-full p-12 bg-gray-800/90 backdrop-blur-xl rounded-[3rem] text-center border border-green-500/20 shadow-2xl">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-white">Warmup Done</h2>
        <p className="text-gray-400 mb-8 font-bold italic">You're sharp!</p>
        
        {activeCompetition?.status === 'draft' ? (
            <>
                <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 mb-8 inline-block px-12">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2 text-center">Launching In</div>
                    <div className="text-4xl font-black font-mono text-blue-500 tracking-widest">{globalTimeLeft || '00:00'}</div>
                </div>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={handleBack}
                        className="px-10 py-4 bg-gray-900 hover:bg-black border border-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-gray-500"
                    >
                        Back to Lobby
                    </button>
                </div>
            </>
        ) : (
            <button 
                onClick={handleBack}
                className="px-10 py-4 bg-gray-900 hover:bg-black border border-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all text-gray-500"
            >
                Exit Practice
            </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex justify-between items-center w-full max-w-4xl px-6 bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
        <div className="text-left text-white">
          <h2 className="text-2xl font-black text-blue-400 uppercase italic tracking-tighter">Practice Module</h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Calibration Phase (Scores Discarded)</p>
        </div>
        <div className="text-right">
            <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-1 text-right">
                {activeCompetition?.status === 'draft' ? 'Combat Start In' : 'Practice Mode'}
            </div>
            <div className="text-3xl font-mono font-black text-white tabular-nums tracking-widest text-right">
                {activeCompetition?.status === 'draft' ? globalTimeLeft || '00:00' : '∞'}
            </div>
        </div>
      </div>
      
      <TypingArea 
        title="Warmup Paragraph" 
        text={text} 
        onComplete={() => setIsFinished(true)}
        isWarmup={true}
      />

      <button 
        onClick={handleBack}
        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-gray-400 hover:text-white"
      >
        {activeCompetition?.status === 'draft' ? 'Back to Lobby' : 'Exit Practice'}
      </button>
    </div>
  );
};

export default ParagraphWarmup;
