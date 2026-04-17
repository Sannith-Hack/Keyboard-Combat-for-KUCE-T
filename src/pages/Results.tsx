import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';
import { updateStudent } from '../lib/studentsApi';

const Results: React.FC = () => {
  const { participant, attempts, resetGame, hasSaved, setHasSaved } = useGameStore();
  const hasAttemptedSave = useRef(false);

  useEffect(() => {
    // Prevent duplicate saves
    if (hasAttemptedSave.current || hasSaved || !participant || attempts.length === 0) {
      return;
    }

    hasAttemptedSave.current = true;

    const saveResults = async () => {
      try {
        // Mapping for 8-step flow:
        // currentLevel 3 -> Level 1 (Para)
        // currentLevel 5 -> Level 2 (Code)
        // currentLevel 7 -> Level 3 (Precision)
        const level1 = attempts.find(a => a.level === 3);
        const level2 = attempts.find(a => a.level === 5);
        const level3 = attempts.find(a => a.level === 7);

        const avgWpm = (attempts.reduce((acc, curr) => acc + curr.wpm, 0) / attempts.length);
        const avgAcc = (attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / attempts.length);
        const totalScore = attempts.reduce((acc, curr) => acc + curr.combatScore, 0);

        // 1. Save individual attempts (history)
        // Using standard try-catch instead of .catch() to avoid Promise-like object limitations
        try {
          await supabase.from('attempts').insert(
            attempts.map(a => ({
              participant_id: participant.id,
              competition_id: participant.competition_id, // Added competition_id for better tracking
              level: a.level === 3 ? 1 : a.level === 5 ? 2 : 3,
              wpm: a.wpm,
              accuracy: a.accuracy,
              time_taken: a.timeTaken,
              combat_score: a.combatScore
            }))
          );
        } catch (attemptErr) {
          console.warn('Attempts table insertion failed (non-critical):', attemptErr);
        }

        // 2. Update the student's record - THIS IS WHAT THE ADMIN DASHBOARD SHOWS
        await updateStudent(participant.id, {
          level1_wpm: level1?.wpm || 0,
          level2_wpm: level2?.wpm || 0,
          level3_wpm: level3?.wpm || 0,
          avg_wpm: avgWpm,
          avg_accuracy: avgAcc,
          total_score: totalScore,
          status: 'completed'
        });

        setHasSaved(true);

      } catch (error: any) {
        console.error('Error saving results:', error);
        alert(`Failed to save results: ${error.message || 'Unknown error'}`);
      }
    };

    saveResults();
  }, [participant, attempts, hasSaved, setHasSaved]);

  const avgWpm = (attempts.reduce((acc, curr) => acc + curr.wpm, 0) / (attempts.length || 1)).toFixed(2);
  const avgAcc = (attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / (attempts.length || 1)).toFixed(2);
  const totalScore = attempts.reduce((acc, curr) => acc + curr.combatScore, 0).toFixed(2);

  return (
    <div className="max-w-2xl w-full p-10 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 text-center">
      <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
      <h2 className="text-5xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter text-center">Victory!</h2>
      <p className="text-gray-400 mb-10 italic text-center">Great job, {participant?.name}. Transmission complete.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-gray-900 rounded-2xl border border-blue-500/30">
          <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-center">Avg Speed</div>
          <div className="text-4xl font-black text-center text-white">{avgWpm} <span className="text-xs text-gray-600">WPM</span></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-2xl border border-green-500/30">
          <div className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-center">Avg Accuracy</div>
          <div className="text-4xl font-black text-center text-white">{avgAcc}%</div>
        </div>
        <div className="p-6 bg-gray-900 rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/5">
          <div className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-center">Combat Points</div>
          <div className="text-4xl font-black text-center text-white">{totalScore}</div>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        {attempts.map((attempt, index) => (
          <div key={index} className="flex justify-between items-center p-4 bg-gray-950/50 rounded-xl border border-gray-800">
            <span className="font-bold text-gray-500 uppercase text-xs tracking-widest">
              Level {attempt.level === 3 ? '1' : attempt.level === 5 ? '2' : '3'}
            </span>
            <div className="flex gap-6 font-mono text-sm items-center">
              <span className="text-blue-400">{attempt.wpm} <span className="text-[10px] text-gray-700">WPM</span></span>
              <span className="text-green-400">{attempt.accuracy}%</span>
              <span className="text-yellow-500 font-bold">{attempt.combatScore} <span className="text-[10px] text-gray-700">PTS</span></span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-full font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-b-4 border-blue-800 text-white"
      >
        Close Transmission
      </button>
    </div>
  );
};

export default Results;
