import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import Entry from './pages/Entry';
import TypingArea from './components/TypingArea';
import Break from './components/Break';
import Results from './pages/Results';
import WaitingRoom from './components/WaitingRoom';
import { supabase } from './lib/supabase';
import { LEVEL_1_PARAGRAPHS, LEVEL_2_CODE, LEVEL_3_PRECISION } from './data/content';
import { updateStudent } from './lib/studentsApi';

function App() {
  const { currentLevel, nextLevel, addAttempt, setActiveCompetition, activeCompetition, levelTexts, setLevelText } = useGameStore();

  // 1. Sync Competition Status & Auto-Live Logic
  useEffect(() => {
    const syncAndAutoLive = async () => {
      // Check for any scheduled competition that should be live by now
      const now = new Date().toISOString();
      const { data: upcoming } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'draft')
        .lte('scheduled_start', now)
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (upcoming) {
        // Auto-Live: Update status to live in DB
        await supabase.from('competitions').update({ status: 'live' }).eq('id', upcoming.id);
      }

      // Fetch the current Live competition
      const { data: liveData } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'live')
        .maybeSingle();
      
      if (liveData) {
        setActiveCompetition(liveData as any);
        return;
      }

      // If no live, fetch the next draft
      const { data: draftData } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'draft')
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .maybeSingle();

      setActiveCompetition(draftData as any);
    };

    syncAndAutoLive();
    const interval = setInterval(syncAndAutoLive, 10000); // Check every 10s for auto-live

    const channel = supabase
      .channel('public:competitions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, syncAndAutoLive)
      .subscribe();

    return () => { 
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [setActiveCompetition]);

  // 2. Select Level Text in a Side Effect (Fixes the "Cannot update App while rendering" error)
  useEffect(() => {
    if (currentLevel === 0 || currentLevel % 2 === 0) return; // Only for typing levels (1, 3, 5)

    if (!levelTexts[currentLevel]) {
      let selectedText = "";
      if (currentLevel === 1) selectedText = LEVEL_1_PARAGRAPHS[Math.floor(Math.random() * LEVEL_1_PARAGRAPHS.length)];
      else if (currentLevel === 3) selectedText = LEVEL_2_CODE[Math.floor(Math.random() * LEVEL_2_CODE.length)];
      else if (currentLevel === 5) selectedText = LEVEL_3_PRECISION[Math.floor(Math.random() * LEVEL_3_PRECISION.length)];
      
      if (selectedText) setLevelText(currentLevel, selectedText);
    }
  }, [currentLevel, levelTexts, setLevelText]);

  const handleComplete = (wpm: number, accuracy: number, timeTaken: number, combatScore: number) => {
    addAttempt({ level: currentLevel, wpm, accuracy, timeTaken, combatScore });

    // Persist per-level progress to the student's record (if available)
    const participant = useGameStore.getState().participant;
    if (participant && participant.id) {
      try {
        if (currentLevel === 1) {
          updateStudent(participant.id, { level1_time: timeTaken, level1_wpm: wpm }).catch(console.error);
        } else if (currentLevel === 3) {
          updateStudent(participant.id, { level2_time: timeTaken, level2_wpm: wpm }).catch(console.error);
        }
      } catch (err) {
        console.error('Failed to persist level progress:', err);
      }
    }

    nextLevel();
  };

  const renderCurrentStep = () => {
    if (currentLevel === 1 && activeCompetition?.status !== 'live') {
      return <WaitingRoom />;
    }

    const currentText = levelTexts[currentLevel];

    switch (currentLevel) {
      case 0: return <Entry />;
      case 1:
        return currentText ? (
          <TypingArea key={`l1-${currentText.substring(0,5)}`} title="Level 1: Paragraphs" text={currentText} onComplete={handleComplete} />
        ) : <div className="animate-pulse italic text-gray-500">Loading Paragraph...</div>;
      case 2: return <Break onComplete={nextLevel} duration={10} />;
      case 3:
        return currentText ? (
          <TypingArea key={`l2-${currentText.substring(0,5)}`} title="Level 2: Code Typing" text={currentText} onComplete={handleComplete} />
        ) : <div className="animate-pulse italic text-gray-500">Loading Code...</div>;
      case 4: return <Break onComplete={nextLevel} duration={10} />;
      case 5:
        return currentText ? (
          <TypingArea key={`l3-${currentText.substring(0,5)}`} title="Level 3: Precision" text={currentText} onComplete={handleComplete} />
        ) : <div className="animate-pulse italic text-gray-500">Loading Symbols...</div>;
      case 6: return <Results />;
      default: return <Entry />;
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-blend-overlay bg-black/60"
      style={{ backgroundImage: "url('/assets/college-campus.jpg')" }}
    >
      <header className="mb-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img src="/assets/ku-logo.png" alt="KU Logo" className="h-16 w-16" />
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Keyboard <span className="text-blue-500">Combat</span>
          </h1>
          <img src="/assets/ku-college-logo.png" alt="KU College Logo" className="h-16 w-16" />
        </div>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">
          Kakatiya University of Engineering and Technology
        </p>
      </header>
      <main className="w-full max-w-5xl flex justify-center">
        {renderCurrentStep()}
      </main>
      <footer className="mt-12 text-gray-500 text-xs flex gap-8 items-center">
        <img src="/assets/Naac_A+.png" alt="NAAC A+" className="h-10 grayscale opacity-50" />
        <p>© 2026 KU College of Engineering and Technology. All Rights Reserved.</p>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>System Online</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
