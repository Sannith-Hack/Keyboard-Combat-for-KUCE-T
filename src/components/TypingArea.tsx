import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

interface TypingAreaProps {
  text: string;
  onComplete: (wpm: number, accuracy: number, timeTaken: number, combatScore: number) => void;
  title: string;
  isWarmup?: boolean;
}

const TypingArea: React.FC<TypingAreaProps> = ({ text, onComplete, title, isWarmup }) => {
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleVisibilityChange = () => {
      if (document.hidden && !isFinished) {
        alert('Cheat detected! Do not switch tabs during the competition.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isFinished]);

  const calculateStats = () => {
    const timeTakenSeconds = (Date.now() - (startTime || Date.now())) / 1000;
    const timeTakenMinutes = timeTakenSeconds / 60;
    const wordsTyped = userInput.length / 5;
    
    // Exact WPM calculation
    const rawWpm = timeTakenMinutes > 0 ? (wordsTyped / timeTakenMinutes) : 0;
    
    // Accuracy as floating point
    const accuracy = userInput.length > 0 ? ((userInput.length - mistakes) / userInput.length) * 100 : 100;
    
    // COMBAT SCORE SCHEMA:
    // We weight Accuracy more heavily than speed to prevent "spamming".
    // Score = (WPM * 10) * (Accuracy / 100)^2
    // This penalizes mistakes significantly.
    const combatScore = rawWpm * Math.pow(accuracy / 100, 2);

    return { 
      wpm: Number(rawWpm.toFixed(2)), 
      accuracy: Number(Math.max(0, accuracy).toFixed(2)), 
      timeTaken: Number(timeTakenSeconds.toFixed(1)),
      combatScore: Number(combatScore.toFixed(2))
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    
    const value = e.target.value;
    if (!startTime) setStartTime(Date.now());

    // Check for mistakes
    if (value.length > userInput.length) {
      const lastChar = value[value.length - 1];
      if (lastChar !== text[value.length - 1]) {
        setMistakes((m) => m + 1);
      }
    }

    setUserInput(value);

    if (value.length === text.length) {
      setIsFinished(true);
      const stats = calculateStats();
      onComplete(stats.wpm, stats.accuracy, stats.timeTaken, stats.combatScore);
    }
  };

  const renderText = () => {
    // Prevent breaking words across lines by grouping characters into word tokens.
    const tokens = text.split(/(\s+)/); // keep whitespace tokens
    let globalIndex = 0;

    return (
      <>
        {tokens.map((token, tIdx) => {
          // Whitespace token (spaces, newlines)
          if (/^\s+$/.test(token)) {
            return token.split('').map((char, cIdx) => {
              const index = globalIndex++;
              const isCurrent = index === userInput.length;
              const color = index < userInput.length
                ? (userInput[index] === char ? 'text-green-400' : 'text-red-500 bg-red-900/30')
                : 'text-gray-400';

              if (char === '\n') {
                return (
                  <span key={`nl-${tIdx}-${cIdx}`} className={`block relative ${color}`}>
                    {isCurrent && (
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-blue-500 animate-pulse" />
                    )}
                    <span>↵</span>
                  </span>
                );
              }

              // Regular space — allow line break here (so no nowrap)
              return (
                <span key={`sp-${tIdx}-${cIdx}`} className="relative inline">
                  {isCurrent && (
                    <span className="absolute left-0 top-0 w-[2px] h-full bg-blue-500 animate-pulse" />
                  )}
                  <span className={`${color} transition-colors duration-100 inline-block min-w-[0.6em]`}>
                    {'\u00A0'}
                  </span>
                </span>
              );
            });
          }

          // Non-whitespace token (a word) — make the whole word non-breakable.
          const chars = token.split('').map((char, cIdx) => {
            const index = globalIndex++;
            const isCurrent = index === userInput.length;
            const color = index < userInput.length
              ? (userInput[index] === char ? 'text-green-400' : 'text-red-500 bg-red-900/30')
              : 'text-gray-400';

            return (
              <span key={`w-${tIdx}-${cIdx}`} className="relative inline">
                {isCurrent && (
                  <span className="absolute left-0 top-0 w-[2px] h-full bg-blue-500 animate-pulse" />
                )}
                <span className={`${color} transition-colors duration-100 inline-block min-w-[0.6em]`}>
                  {char}
                </span>
              </span>
            );
          });

          return (
            <span key={`word-${tIdx}`} className="inline-block whitespace-nowrap">
              {chars}
            </span>
          );
        })}

        {/* Cursor at the end of text */}
        {userInput.length === text.length && !isFinished && (
          <span className="relative inline-block w-[2px] h-[1.2em] bg-blue-500 animate-pulse align-middle ml-1" />
        )}
      </>
    );
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-400">{title} {isWarmup && <span className="text-sm font-normal text-gray-500">(Warmup)</span>}</h2>
        {startTime && !isFinished && (
          <div className="flex gap-4 text-sm font-mono">
            <span className="text-green-400">WPM: {calculateStats().wpm}</span>
            <span className="text-yellow-400">Acc: {calculateStats().accuracy}%</span>
            <span className="text-blue-400 font-bold">PTS: {calculateStats().combatScore}</span>
          </div>
        )}
      </div>

      <div 
        className="relative min-h-[200px] p-6 bg-gray-900 rounded-lg font-mono text-xl leading-relaxed whitespace-pre-wrap select-none overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative z-10">
          {renderText()}
        </div>
        
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleChange}
          onPaste={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
          className="absolute inset-0 w-full h-full opacity-0 cursor-default resize-none z-0"
          autoFocus
        />
      </div>

      <div className="mt-4 text-gray-500 text-sm italic">
        Keep typing. Accuracy is key!
      </div>
    </div>
  );
};

export default TypingArea;
