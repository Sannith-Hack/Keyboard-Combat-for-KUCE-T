import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import Entry from './pages/Entry';
import TypingArea from './components/TypingArea';
import Break from './components/Break';
import Results from './pages/Results';
import WaitingRoom from './components/WaitingRoom';
import BubbleWarmup from './components/BubbleWarmup';
import ParagraphWarmup from './components/ParagraphWarmup';
import { supabase } from './lib/supabase';
import { LEVEL_1_PARAGRAPHS, LEVEL_2_CODE, LEVEL_3_PRECISION } from './data/content';
import { updateStudent } from './lib/studentsApi';

function App() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const activeCompetition = useGameStore((state) => state.activeCompetition);
  const levelTexts = useGameStore((state) => state.levelTexts);
  const selectedWarmupMode = useGameStore((state) => state.selectedWarmupMode);
  const participant = useGameStore((state) => state.participant);
  const resetGame = useGameStore((state) => state.resetGame);

  // 1. Unified Sync & Ejection Logic
  useEffect(() => {
    const syncAndVerify = async () => {
      const now = new Date().toISOString();
      const state = useGameStore.getState();
      
      // CRITICAL: If user is in a competition session, verify THEIR competition status
      if (state.participant?.competition_id) {
        const { data: myComp } = await supabase
          .from('competitions')
          .select('*')
          .eq('id', state.participant.competition_id)
          .maybeSingle();

        if (myComp) {
          // If the competition I joined has ended, EJECT ME IMMEDIATELY
          if (myComp.status === 'ended') {
            console.log("Competition ended by admin. Ejecting...");
            resetGame();
            window.location.href = '/';
            return;
          }
          
          // Sync local state with real DB status
          useGameStore.getState().setActiveCompetition(myComp);
          
          // If my competition is now live and I'm still in waiting room/warmup, move to Level 1
          if (myComp.status === 'live' && (state.currentLevel === 1 || state.currentLevel === 2)) {
            useGameStore.setState({ currentLevel: 3 });
          }
        }
      }

      // 2. Global Status Sync (for Lobby/Practice Mode)
      // Check for any currently LIVE competition
      const { data: liveData } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'live')
        .maybeSingle();
      
      if (liveData) {
        if (!state.participant) {
            useGameStore.getState().setActiveCompetition(liveData as any);
        }
        return;
      }

      // Auto-Live logic: Check if a draft should be live
      const { data: upcoming } = await supabase
        .from('competitions')
        .select('*')
        .eq('status', 'draft')
        .lte('scheduled_start', now)
        .order('scheduled_start', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (upcoming) {
        await supabase.from('competitions').update({ status: 'live' }).eq('id', upcoming.id);
        return;
      }

      // If not in a session, sync with the next upcoming draft for the Lobby
      if (!state.participant) {
        const { data: draftData } = await supabase
          .from('competitions')
          .select('*')
          .eq('status', 'draft')
          .order('scheduled_start', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (draftData) {
          useGameStore.getState().setActiveCompetition(draftData as any);
        } else {
          useGameStore.getState().setActiveCompetition(null);
        }
      }
    };

    syncAndVerify();
    const interval = setInterval(syncAndVerify, 2500); // High frequency check

    const channel = supabase
      .channel('app-global-sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'competitions' }, syncAndVerify)
      .subscribe();

    return () => { 
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [resetGame]);

  // 2. Select Level Text in a Side Effect
  useEffect(() => {
    if (!levelTexts[currentLevel]) {
      let selectedText = "";
      if (currentLevel === 3) selectedText = LEVEL_1_PARAGRAPHS[Math.floor(Math.random() * LEVEL_1_PARAGRAPHS.length)];
      else if (currentLevel === 5) selectedText = LEVEL_2_CODE[Math.floor(Math.random() * LEVEL_2_CODE.length)];
      else if (currentLevel === 7) selectedText = LEVEL_3_PRECISION[Math.floor(Math.random() * LEVEL_3_PRECISION.length)];
      
      if (selectedText) {
        useGameStore.getState().setLevelText(currentLevel, selectedText);
      }
    }
  }, [currentLevel, levelTexts]);

  const handleComplete = (wpm: number, accuracy: number, timeTaken: number, combatScore: number) => {
    const store = useGameStore.getState();
    store.addAttempt({ level: currentLevel, wpm, accuracy, timeTaken, combatScore });

    const currentParticipant = store.participant;
    if (currentParticipant && currentParticipant.id) {
      if (currentLevel === 3) {
        updateStudent(currentParticipant.id, { level1_time: timeTaken, level1_wpm: wpm }).catch(console.error);
      } else if (currentLevel === 5) {
        updateStudent(currentParticipant.id, { level2_time: timeTaken, level2_wpm: wpm }).catch(console.error);
      }
    }

    store.nextLevel();
  };

  const renderCurrentStep = () => {
    const currentText = levelTexts[currentLevel];

    switch (currentLevel) {
      case 0: return <Entry />;
      case 1: return <WaitingRoom />;
      case 2: 
        return selectedWarmupMode === 'game' ? <BubbleWarmup /> : <ParagraphWarmup />;
      case 3:
        return currentText ? (
          <TypingArea key={`l1-${currentText.substring(0,5)}`} title="Level 1: Paragraphs" text={currentText} onComplete={handleComplete} duration={900} />
        ) : <div className="animate-pulse italic text-gray-500 px-10 text-center bg-gray-800/50 p-10 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Initializing Mission...</div>;
      case 4: return <Break onComplete={() => useGameStore.getState().nextLevel()} duration={60} />;
      case 5:
        return currentText ? (
          <TypingArea key={`l2-${currentText.substring(0,5)}`} title="Level 2: Code Typing" text={currentText} onComplete={handleComplete} duration={600} />
        ) : <div className="animate-pulse italic text-gray-500 px-10 text-center bg-gray-800/50 p-10 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Loading Code...</div>;
      case 6: return <Break onComplete={() => useGameStore.getState().nextLevel()} duration={60} />;
      case 7:
        return currentText ? (
          <TypingArea key={`l3-${currentText.substring(0,5)}`} title="Level 3: Precision" text={currentText} onComplete={handleComplete} duration={300} />
        ) : <div className="animate-pulse italic text-gray-500 px-10 text-center bg-gray-800/50 p-10 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Analyzing Symbols...</div>;
      case 8: return <Results />;
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
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white">
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
      <footer className="mt-12 text-gray-500 text-[10px] flex flex-col md:flex-row gap-8 items-center border-t border-gray-800 pt-8 w-full max-w-5xl">
        <div className="flex items-center gap-8">
          <img src="/assets/Naac_A+.png" alt="NAAC A+" className="h-10 grayscale opacity-50" />
          <div className="text-left text-gray-500">
            <p>© 2026 KU College of Engineering and Technology. All Rights Reserved.</p>
            <p className="mt-1">Developed by <span className="text-blue-500 font-bold italic uppercase tracking-wider">P. Sannith & M. Goutham</span></p>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-2 items-center bg-gray-950 px-4 py-2 rounded-full border border-gray-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-mono uppercase tracking-widest text-[8px] text-gray-500">System Online</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
