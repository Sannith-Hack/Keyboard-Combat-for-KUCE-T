import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';

const Results: React.FC = () => {
  const { participant, attempts, resetGame, hasSaved, setHasSaved } = useGameStore();
  const [isSaving, setIsSaving] = useState(false);
  const hasAttemptedSave = useRef(false);

  useEffect(() => {
    // Prevent duplicate saves using ref
    if (hasAttemptedSave.current || hasSaved || !participant || attempts.length === 0) {
      return;
    }

    const saveResults = async () => {
      setIsSaving(true);
      try {
        const level1 = attempts.find(a => a.level === 1);
        const level2 = attempts.find(a => a.level === 3);
        const level3 = attempts.find(a => a.level === 5);

        const avgWpm = (attempts.reduce((acc, curr) => acc + curr.wpm, 0) / attempts.length);
        const avgAcc = (attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / attempts.length);
        const totalScore = attempts.reduce((acc, curr) => acc + curr.combatScore, 0);

        // 1. Save individual attempts
        const { error: attemptError } = await supabase.from('attempts').insert(
          attempts.map(a => ({
            participant_id: participant.id,
            competition_id: participant.competition_id,
            level: a.level,
            wpm: a.wpm,
            accuracy: a.accuracy,
            time_taken: a.timeTaken,
            combat_score: a.combatScore
          }))
        );

        if (attemptError) throw attemptError;

        // 2. Save final result summary
        const { error: resultError } = await supabase.from('results').insert([{
          participant_id: participant.id,
          competition_id: participant.competition_id,
          level1_wpm: level1?.wpm || 0,
          level2_wpm: level2?.wpm || 0,
          level3_wpm: level3?.wpm || 0,
          avg_wpm: avgWpm,
          avg_accuracy: avgAcc,
          total_score: totalScore
        }]);

        if (resultError) throw resultError;
        
        // Mark as saved LAST to prevent re-trigger
        setHasSaved(true);
        hasAttemptedSave.current = true;

      } catch (error: any) {
        console.error('Error saving results:', error);
        alert(`Failed to save results: ${error.message || 'Unknown error'}`);
        hasAttemptedSave.current = true;
      } finally {
        setIsSaving(false);
      }
    };

    saveResults();
  }, []); // Empty dependency array - only run once on mount

  const avgWpm = (attempts.reduce((acc, curr) => acc + curr.wpm, 0) / attempts.length).toFixed(2) || "0.00";
  const avgAcc = (attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / attempts.length).toFixed(2) || "0.00";
  const totalScore = attempts.reduce((acc, curr) => acc + curr.combatScore, 0).toFixed(2) || "0.00";

  return (
    <div className="max-w-2xl w-full p-10 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 text-center">
      <h2 className="text-5xl font-black text-blue-400 mb-2 uppercase italic tracking-tighter">Victory!</h2>
      <p className="text-gray-400 mb-10 italic">Great job, {participant?.name}. Transmission complete.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-gray-900 rounded-2xl border border-blue-500/30">
          <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Avg Speed</div>
          <div className="text-4xl font-black">{avgWpm} <span className="text-xs text-gray-600">WPM</span></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-2xl border border-green-500/30">
          <div className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Avg Accuracy</div>
          <div className="text-4xl font-black">{avgAcc}%</div>
        </div>
        <div className="p-6 bg-gray-900 rounded-2xl border border-yellow-500/30 shadow-lg shadow-yellow-500/5">
          <div className="text-yellow-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Combat Score</div>
          <div className="text-4xl font-black">{totalScore}</div>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        {attempts.map((attempt, index) => (
          <div key={index} className="flex justify-between items-center p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <span className="font-bold text-gray-400 uppercase text-xs tracking-widest">
              Level {attempt.level === 1 ? '1' : attempt.level === 3 ? '2' : '3'}
            </span>
            <div className="flex gap-6 font-mono text-sm items-center">
              <span className="text-blue-400">{attempt.wpm} <span className="text-[10px] text-gray-600">WPM</span></span>
              <span className="text-green-400">{attempt.accuracy}%</span>
              <span className="text-yellow-400 font-bold">{attempt.combatScore} <span className="text-[10px] text-gray-600">PTS</span></span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-12 py-5 bg-blue-600 hover:bg-blue-700 rounded-full font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-b-4 border-blue-800"
      >
        Complete Mission
      </button>
    </div>
  );
};

export default Results;
