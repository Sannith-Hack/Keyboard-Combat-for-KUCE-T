import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { startStudent } from '../lib/studentsApi';

const Entry: React.FC = () => {
  const { setParticipant, activeCompetition, setWarmupMode } = useGameStore();
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    college: 'Kakatiya University of Engineering and Technology',
  });
  const [loading, setLoading] = useState(false);

  // Determine if we are "Online" (Draft/Live event scheduled) or "Offline"
  const isEventScheduled = activeCompetition?.status === 'draft' || activeCompetition?.status === 'live';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompetition) return;
    setLoading(true);

    try {
      const student = await startStudent({ ...formData, competition_id: activeCompetition.id });
      if (student) setParticipant(student);
    } catch (error: any) {
      console.error('Error registering participant:', error);
      alert(`Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const enterPractice = (mode: 'game' | 'paragraph') => {
    setWarmupMode(mode);
    // Move to Level 2 (Warmup) directly for practice
    useGameStore.setState({ currentLevel: 2 });
  };

  if (!isEventScheduled) {
    return (
      <div className="max-w-2xl w-full p-10 bg-gray-800/90 backdrop-blur-xl rounded-[3rem] border border-blue-500/10 shadow-3xl text-center">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="inline-block px-4 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-4 animate-pulse">
            System Offline
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">No Active Mission</h2>
          <p className="text-gray-400 font-bold text-sm italic text-center">The battle arena is closed for scheduled maintenance.</p>
        </div>

        <div className="bg-gray-950/50 p-8 rounded-[2rem] border border-gray-700">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Enter Practice Range</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => enterPractice('game')}
              className="p-6 bg-gray-900 hover:bg-blue-600/10 border border-gray-800 hover:border-blue-500 rounded-2xl transition-all group text-left"
            >
              <div className="text-xl font-black mb-1 group-hover:text-blue-400 uppercase italic">Bubble Pop</div>
              <p className="text-[10px] text-gray-500 group-hover:text-blue-300/70 font-bold uppercase tracking-widest leading-relaxed">Fast-paced character accuracy training</p>
            </button>
            <button
              onClick={() => enterPractice('paragraph')}
              className="p-6 bg-gray-900 hover:bg-green-600/10 border border-gray-800 hover:border-green-500 rounded-2xl transition-all group text-left"
            >
              <div className="text-xl font-black mb-1 group-hover:text-green-400 uppercase italic">Paragraph</div>
              <p className="text-[10px] text-gray-500 group-hover:text-green-300/70 font-bold uppercase tracking-widest leading-relaxed">Natural language typing and rhythm calibration</p>
            </button>
          </div>
        </div>

        <p className="mt-8 text-gray-500 text-[10px] uppercase font-black tracking-widest text-center">
          Registration will open automatically when an event is scheduled
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 text-left">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-center text-blue-400 uppercase italic tracking-tighter">Join the Combat</h2>
        <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">
          {activeCompetition.status === 'live' ? 'LIVE NOW: ' : 'UPCOMING: '} {activeCompetition.name}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Roll Number</label>
          <input
            type="text"
            required
            placeholder="e.g. 210330123"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email / Phone</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">College</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
            placeholder="Enter your college name"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors disabled:opacity-50 mt-4 text-white uppercase tracking-widest italic"
        >
          {loading ? 'Registering...' : 'Start Competition'}
        </button>
      </form>
    </div>
  );
};

export default Entry;
