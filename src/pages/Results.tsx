import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';

const Results: React.FC = () => {
  const { participant, attempts, resetGame, hasSaved, setHasSaved } = useGameStore();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saveResults = async () => {
      if (!participant || attempts.length === 0 || isSaving || hasSaved) return;
      
      setIsSaving(true);
      try {
        const level1 = attempts.find(a => a.level === 2);
        const level2 = attempts.find(a => a.level === 4);
        const level3 = attempts.find(a => a.level === 6);

        const avgWpm = Math.round(
          ( (level1?.wpm || 0) + (level2?.wpm || 0) + (level3?.wpm || 0) ) / 
          [level1, level2, level3].filter(Boolean).length
        );

        const { error: attemptError } = await supabase.from('attempts').insert(
          attempts.map(a => ({
            participant_id: participant.id,
            competition_id: participant.competition_id,
            level: a.level,
            wpm: a.wpm,
            accuracy: a.accuracy,
            time_taken: a.timeTaken
          }))
        );

        if (attemptError) throw attemptError;

        const { error: resultError } = await supabase.from('results').insert([{
          participant_id: participant.id,
          competition_id: participant.competition_id,
          level1_wpm: level1?.wpm || 0,
          level2_wpm: level2?.wpm || 0,
          level3_wpm: level3?.wpm || 0,
          avg_wpm: avgWpm
        }]);

        if (resultError) throw resultError;
        setHasSaved(true);

      } catch (error) {
        console.error('Error saving results:', error);
      } finally {
        setIsSaving(false);
      }
    };

    saveResults();
  }, [participant, attempts, hasSaved]);

  const avgWpm = (attempts.reduce((acc, curr) => acc + curr.wpm, 0) / attempts.length).toFixed(2) || "0.00";
  const avgAcc = (attempts.reduce((acc, curr) => acc + curr.accuracy, 0) / attempts.length).toFixed(2) || "0.00";
  const totalScore = attempts.reduce((acc, curr) => acc + curr.combatScore, 0).toFixed(2) || "0.00";

  return (
    <div className="max-w-2xl w-full p-10 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 text-center">
      <h2 className="text-5xl font-black text-blue-400 mb-2">Victory!</h2>
      <p className="text-gray-400 mb-10 italic">Great job, {participant?.name}. Here's your breakdown:</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 bg-gray-900 rounded-2xl border border-blue-500/30">
          <div className="text-blue-400 text-sm font-bold uppercase mb-2">Avg. Speed</div>
          <div className="text-4xl font-black">{avgWpm} <span className="text-lg text-gray-500">WPM</span></div>
        </div>
        <div className="p-6 bg-gray-900 rounded-2xl border border-green-500/30">
          <div className="text-green-400 text-sm font-bold uppercase mb-2">Avg. Accuracy</div>
          <div className="text-4xl font-black">{avgAcc}%</div>
        </div>
        <div className="p-6 bg-gray-900 rounded-2xl border border-yellow-500/30">
          <div className="text-yellow-400 text-sm font-bold uppercase mb-2">Combat Score</div>
          <div className="text-4xl font-black">{totalScore}</div>
        </div>
      </div>

      <div className="space-y-4 mb-12">
        {attempts.map((attempt, index) => (
          <div key={index} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl">
            <span className="font-bold text-gray-300">
              {attempt.level === 1 ? 'Warmup' : 
               attempt.level === 2 ? 'Level 1: Paragraph' :
               attempt.level === 4 ? 'Level 2: Code' : 'Level 3: Precision'}
            </span>
            <div className="flex gap-6 font-mono text-sm">
              <span className="text-blue-400">{attempt.wpm} WPM</span>
              <span className="text-green-400">{attempt.accuracy}%</span>
              <span className="text-yellow-400 font-bold">{attempt.combatScore} pts</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={resetGame}
        className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-full font-black transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
      >
        Finish & Exit
      </button>
    </div>
  );
};

export default Results;
