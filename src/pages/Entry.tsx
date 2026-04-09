import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';

const Entry: React.FC = () => {
  const { setParticipant, activeCompetition } = useGameStore();
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    college: 'Kakatiya University of Engineering and Technology',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompetition) {
      alert('No live competition found. Please wait for the coordinator to start the session.');
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{ ...formData, competition_id: activeCompetition.id }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setParticipant(data);
      }
    } catch (error: any) {
      console.error('Error registering participant:', error);
      alert(`Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!activeCompetition) {
    return (
      <div className="max-w-md w-full p-10 bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-700 text-center">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <h2 className="text-2xl font-black text-white uppercase mb-2">System Offline</h2>
        <p className="text-gray-400 text-sm italic">The competition hasn't started yet. Please wait for the announcement.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
      <div className="mb-6">
        <h2 className="text-3xl font-black text-center text-blue-400 uppercase italic tracking-tighter">Join the Combat</h2>
        <p className="text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Live: {activeCompetition.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
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
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
            value={formData.roll_number}
            onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email / Phone</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">College</label>
          <input
            type="text"
            required
            readOnly
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 opacity-70 cursor-not-allowed"
            value={formData.college}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? 'Registering...' : 'Start Competition'}
        </button>
      </form>
    </div>
  );
};

export default Entry;
