import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { supabase } from '../lib/supabase';

const Entry: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    college: 'Kakatiya University of Engineering and Technology',
  });
  const [loading, setLoading] = useState(false);
  const setParticipant = useGameStore((state) => state.setParticipant);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setParticipant(data);
      }
    } catch (error) {
      console.error('Error registering participant:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Join the Combat</h2>
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
