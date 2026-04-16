import React, { useState, useEffect, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollHandler = () => {
      const container = containerRef.current;
      const cursor = container?.querySelector('.active-cursor') as HTMLElement;
      
      if (container && cursor) {
        // OffsetTop is relative to containerRef because the inner div is not positioned
        const containerHeight = container.offsetHeight;
        const cursorTop = cursor.offsetTop;
        const cursorHeight = cursor.offsetHeight;
        
        const targetScroll = cursorTop - (containerHeight / 2) + (cursorHeight / 2);
        container.scrollTop = targetScroll;
      }
    };

    scrollHandler();
    const raf = requestAnimationFrame(scrollHandler);
    return () => cancelAnimationFrame(raf);
  }, [userInput]);

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
    const rawWpm = timeTakenMinutes > 0 ? (wordsTyped / timeTakenMinutes) : 0;
    const accuracy = userInput.length > 0 ? ((userInput.length - mistakes) / userInput.length) * 100 : 100;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (!startTime) setStartTime(Date.now());

      const tabSize = 4;
      let currentInput = userInput;
      let currentMistakes = mistakes;

      for (let i = 0; i < tabSize; i++) {
        if (currentInput.length >= text.length) break;

        const nextChar = " ";
        const expectedChar = text[currentInput.length];

        if (nextChar !== expectedChar) {
          currentMistakes++;
        }
        currentInput += nextChar;
      }

      setMistakes(currentMistakes);
      setUserInput(currentInput);

      if (currentInput.length === text.length) {
        setIsFinished(true);
        // Calculate final stats manually for immediate completion call
        const timeTakenSeconds = (Date.now() - (startTime || Date.now())) / 1000;
        const timeTakenMinutes = timeTakenSeconds / 60;
        const wordsTyped = currentInput.length / 5;
        const rawWpm = timeTakenMinutes > 0 ? (wordsTyped / timeTakenMinutes) : 0;
        const accuracy = ((currentInput.length - currentMistakes) / currentInput.length) * 100;
        const combatScore = rawWpm * Math.pow(accuracy / 100, 2);

        onComplete(
          Number(rawWpm.toFixed(2)),
          Number(Math.max(0, accuracy).toFixed(2)),
          Number(timeTakenSeconds.toFixed(1)),
          Number(combatScore.toFixed(2))
        );
      }
    }
  };

  const renderText = () => {
    const tokens = text.split(/(\s+)/);
    let globalIndex = 0;

    return (
      <>
        {tokens.map((token, tIdx) => {
          if (/^\s+$/.test(token)) {
            return token.split('').map((char, cIdx) => {
              const index = globalIndex++;
              const isCurrent = index === userInput.length;
              const color = index < userInput.length
                ? (userInput[index] === char ? 'text-green-400' : 'text-red-500 bg-red-900/30')
                : 'text-gray-400';

              if (char === '\n') {
                return (
                  <span key={`nl-${tIdx}-${cIdx}`} className={`block relative h-[1.5em] ${isCurrent ? 'active-cursor' : ''} ${color}`}>
                    {isCurrent && (
                      <span className="absolute left-0 top-0 w-[2px] h-full bg-blue-500 animate-pulse" />
                    )}
                    <span className="opacity-30">↵</span>
                  </span>
                );
              }

              return (
                <span key={`sp-${tIdx}-${cIdx}`} className={`relative inline-block ${isCurrent ? 'active-cursor' : ''}`}>
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

          const chars = token.split('').map((char, cIdx) => {
            const index = globalIndex++;
            const isCurrent = index === userInput.length;
            const color = index < userInput.length
              ? (userInput[index] === char ? 'text-green-400' : 'text-red-500 bg-red-900/30')
              : 'text-gray-400';

            return (
              <span key={`w-${tIdx}-${cIdx}`} className={`relative inline-block ${isCurrent ? 'active-cursor' : ''}`}>
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

        {userInput.length === text.length && !isFinished && (
          <span className="active-cursor relative inline-block w-[2px] h-[1.2em] bg-blue-500 animate-pulse align-middle ml-1" />
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
        ref={containerRef}
        className="relative h-[320px] p-0 bg-gray-900 rounded-lg font-mono text-xl leading-relaxed whitespace-pre-wrap select-none overflow-y-auto no-scrollbar"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="z-10 py-[140px] px-6">
          {renderText()}
        </div>
        
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
