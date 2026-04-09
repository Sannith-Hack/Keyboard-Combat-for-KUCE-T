import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/useGameStore';

interface Competition {
  id: string;
  name: string;
  status: 'draft' | 'live' | 'ended';
  scheduled_start: string;
}

interface LeaderboardEntry {
  id: string;
  avg_wpm: number;
  participants: {
    name: string;
    roll_number: string;
  };
  competition_id: string;
}

const Admin: React.FC = () => {
  const { isAdminAuthenticated, logout, activeCompetition, setActiveCompetition } = useGameStore();
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompTime, setNewCompTime] = useState('');

  // Security Guard
  useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/login');
    }
  }, [isAdminAuthenticated, navigate]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch Competitions
    const { data: comps } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setCompetitions(comps || []);

    // Fetch Leaderboard for active competition
    if (activeCompetition) {
      const { data: results } = await supabase
        .from('results')
        .select(`
          id,
          avg_wpm,
          competition_id,
          participants ( name, roll_number )
        `)
        .eq('competition_id', activeCompetition.id)
        .order('avg_wpm', { ascending: false });
      
      setLeaderboard(results as any || []);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeCompetition]);

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('competitions')
      .insert([{ name: newCompName, scheduled_start: newCompTime }])
      .select()
      .single();

    if (!error) {
      setShowScheduleModal(false);
      setNewCompName('');
      fetchData();
    }
  };

  const updateStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    await supabase.from('competitions').update({ status }).eq('id', id);
    if (status === 'live') {
      const comp = competitions.find(c => c.id === id);
      if (comp) setActiveCompetition({ ...comp, status });
    } else if (status === 'ended' && activeCompetition?.id === id) {
      setActiveCompetition(null);
    }
    fetchData();
  };

  if (!isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12 bg-gray-900/50 p-6 rounded-3xl border border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <img src="/assets/ku-logo.png" alt="KU Logo" className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-black text-blue-500 uppercase italic tracking-tighter">Command Center</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">System Operational • Live Monitoring</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10"
          >
            + Schedule Event
          </button>
          <button 
            onClick={logout}
            className="px-6 py-3 bg-gray-800 hover:bg-red-600 rounded-xl font-bold transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Competition Management */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-black uppercase text-gray-400 mb-4 px-2">Scheduled Events</h2>
          <div className="space-y-4">
            {competitions.map((comp) => (
              <div 
                key={comp.id} 
                className={`p-6 rounded-2xl border transition-all ${activeCompetition?.id === comp.id ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/5' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-lg">{comp.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {new Date(comp.scheduled_start).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    comp.status === 'live' ? 'bg-green-500 text-black animate-pulse' : 
                    comp.status === 'ended' ? 'bg-gray-700 text-gray-400' : 'bg-yellow-600 text-black'
                  }`}>
                    {comp.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    disabled={comp.status === 'live'}
                    onClick={() => updateStatus(comp.id, 'live')}
                    className="py-2 bg-green-600 hover:bg-green-500 disabled:opacity-30 rounded-lg text-xs font-bold transition-all"
                  >
                    GO LIVE
                  </button>
                  <button 
                    onClick={() => updateStatus(comp.id, 'ended')}
                    className="py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-all"
                  >
                    END
                  </button>
                  <button 
                    onClick={() => setActiveCompetition(comp)}
                    className="py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-bold transition-all"
                  >
                    VIEW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Leaderboard */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-4 px-2">
            <div>
              <h2 className="text-xl font-black uppercase text-gray-400">Leaderboard</h2>
              <p className="text-sm text-blue-400 font-bold">{activeCompetition?.name || 'Select a competition to view'}</p>
            </div>
            {activeCompetition && (
              <button className="text-xs font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest">
                Full Screen Broadcast ↗
              </button>
            )}
          </div>

          <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em]">Rank</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em]">Participant</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em]">Roll Number</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em] text-right">Avg WPM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className={`${index === 0 ? 'bg-yellow-500/5' : ''} hover:bg-gray-800/30 transition-colors`}>
                    <td className="p-5">
                      <span className={`inline-block w-8 h-8 rounded-lg text-center leading-8 font-black ${
                        index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 
                        index === 1 ? 'bg-gray-300 text-black' : 
                        index === 2 ? 'bg-orange-600 text-white' : 'text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-gray-100">{entry.participants.name}</div>
                    </td>
                    <td className="p-5 font-mono text-sm text-gray-400">{entry.participants.roll_number}</td>
                    <td className="p-5 text-right font-black text-blue-400 text-2xl tracking-tighter">{entry.avg_wpm.toFixed(2)}</td>
                  </tr>
                ))}
                {!activeCompetition && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-gray-600 italic">No competition selected</td>
                  </tr>
                )}
                {activeCompetition && leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-gray-600 italic">Waiting for submissions...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 max-w-md w-full shadow-3xl">
            <h2 className="text-2xl font-black text-blue-500 uppercase italic mb-6">Schedule Competition</h2>
            <form onSubmit={handleCreateCompetition} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Competition Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Round 1: Morning Shift"
                  className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-blue-500 outline-none transition-all"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Start Time</label>
                <input 
                  type="datetime-local" 
                  required
                  className="w-full p-4 bg-gray-950 border border-gray-800 rounded-xl focus:border-blue-500 outline-none transition-all"
                  value={newCompTime}
                  onChange={(e) => setNewCompTime(e.target.value)}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black transition-all"
                >
                  CREATE
                </button>
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-black transition-all"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
