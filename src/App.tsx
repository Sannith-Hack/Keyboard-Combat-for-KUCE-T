import { useGameStore } from './store/useGameStore';
import Entry from './pages/Entry';
import TypingArea from './components/TypingArea';
import Break from './components/Break';
import Results from './pages/Results';
import { WARMUP_TEXT, LEVEL_1_PARAGRAPHS, LEVEL_2_CODE, LEVEL_3_PRECISION } from './data/content';

function App() {
  const { currentLevel, nextLevel, addAttempt } = useGameStore();

  const handleComplete = (wpm: number, accuracy: number, timeTaken: number, combatScore: number) => {
    addAttempt({ level: currentLevel, wpm, accuracy, timeTaken, combatScore });
    nextLevel();
  };

  const renderCurrentStep = () => {
    switch (currentLevel) {
      case 0:
        return <Entry />;
      case 1:
        return (
          <TypingArea
            title="Warmup"
            text={WARMUP_TEXT}
            onComplete={handleComplete}
            isWarmup
          />
        );
      case 2:
        return (
          <TypingArea
            title="Level 1: Paragraphs"
            text={LEVEL_1_PARAGRAPHS[Math.floor(Math.random() * LEVEL_1_PARAGRAPHS.length)]}
            onComplete={handleComplete}
          />
        );
      case 3:
        return <Break onComplete={nextLevel} duration={10} />;
      case 4:
        return (
          <TypingArea
            title="Level 2: Code Typing"
            text={LEVEL_2_CODE[Math.floor(Math.random() * LEVEL_2_CODE.length)]}
            onComplete={handleComplete}
          />
        );
      case 5:
        return <Break onComplete={nextLevel} duration={10} />;
      case 6:
        return (
          <TypingArea
            title="Level 3: Precision"
            text={LEVEL_3_PRECISION[Math.floor(Math.random() * LEVEL_3_PRECISION.length)]}
            onComplete={handleComplete}
          />
        );
      case 7:
        return <Results />;
      default:
        return <Entry />;
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
