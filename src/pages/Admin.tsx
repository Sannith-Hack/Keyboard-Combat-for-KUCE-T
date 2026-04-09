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
  avg_accuracy: number;
  total_score: number;
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
    if (!isAdminAuthenticated) navigate('/login');
  }, [isAdminAuthenticated, navigate]);

  const fetchData = async () => {
    // 1. Fetch Competitions
    const { data: comps } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false });
    
    setCompetitions(comps || []);

    // 2. Fetch Leaderboard for active view
    if (activeCompetition) {
      const { data: results } = await supabase
        .from('results')
        .select(`
          id,
          avg_wpm,
          avg_accuracy,
          total_score,
          competition_id,
          participants ( name, roll_number )
        `)
        .eq('competition_id', activeCompetition.id)
        .order('total_score', { ascending: false }); // Sort by score now
      
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
    const isoTime = new Date(newCompTime).toISOString();
    const { error } = await supabase
      .from('competitions')
      .insert([{ name: newCompName, scheduled_start: isoTime }]);

    if (!error) {
      setShowScheduleModal(false);
      setNewCompName('');
      setNewCompTime('');
      fetchData();
    }
  };

  const updateStatus = async (id: string, status: 'draft' | 'live' | 'ended') => {
    if (status === 'live') {
      await supabase.from('competitions').update({ status: 'ended' }).eq('status', 'live');
    }
    const { error } = await supabase.from('competitions').update({ status }).eq('id', id);
    if (error) alert('Error: ' + error.message);
    fetchData();
  };

  if (!isAdminAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <header className="flex justify-between items-center mb-12 bg-gray-900/50 p-6 rounded-3xl border border-gray-800 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center gap-6">
          <img src="/assets/ku-logo.png" alt="KU Logo" className="h-12 w-12" />
          <div>
            <h1 className="text-3xl font-black text-blue-500 uppercase italic tracking-tighter">Command Center</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">High Performance Monitoring</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowScheduleModal(true)} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/10">+ Schedule Event</button>
          <button onClick={logout} className="px-6 py-3 bg-gray-800 hover:bg-red-600 rounded-xl font-bold transition-all">Logout</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Competition Management */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-sm font-black uppercase text-gray-500 mb-4 px-2 tracking-widest">Scheduled Events</h2>
          <div className="space-y-4">
            {competitions.map((comp) => (
              <div 
                key={comp.id} 
                className={`p-5 rounded-2xl border transition-all text-left ${activeCompetition?.id === comp.id ? 'bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-500/5' : 'bg-gray-900 border-gray-800 hover:border-gray-700'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-sm uppercase">{comp.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">{new Date(comp.scheduled_start).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                    comp.status === 'live' ? 'bg-green-500 text-black animate-pulse' : 
                    comp.status === 'ended' ? 'bg-gray-700 text-gray-400' : 'bg-yellow-600 text-black'
                  }`}>{comp.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button onClick={() => updateStatus(comp.id, 'live')} className="py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-20 rounded-md text-[9px] font-black tracking-tighter uppercase transition-all">Live</button>
                  <button onClick={() => updateStatus(comp.id, 'ended')} className="py-1.5 bg-red-600 hover:bg-red-500 rounded-md text-[9px] font-black tracking-tighter uppercase transition-all">End</button>
                  <button onClick={() => setActiveCompetition(comp)} className="py-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-[9px] font-black tracking-tighter uppercase transition-all">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Leaderboard */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-end mb-4 px-2">
            <div className="text-left">
              <h2 className="text-sm font-black uppercase text-gray-500 tracking-widest">Global Standings</h2>
              <p className="text-xl text-blue-400 font-black italic uppercase tracking-tighter">{activeCompetition?.name || 'Selection Pending...'}</p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[9px] tracking-[0.2em]">Rank</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[9px] tracking-[0.2em]">Combatant</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[9px] tracking-[0.2em]">Roll Number</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[9px] tracking-[0.2em] text-center">Avg Speed</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[9px] tracking-[0.2em] text-center">Avg Acc</th>
                  <th className="p-5 font-bold text-gray-500 uppercase text-[9px] tracking-[0.2em] text-right">Combat Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className={`${index === 0 ? 'bg-yellow-500/5' : ''} hover:bg-white/[0.02] transition-colors`}>
                    <td className="p-5">
                      <span className={`inline-block w-7 h-7 rounded-lg text-center leading-7 font-black text-xs ${
                        index === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 
                        index === 1 ? 'bg-gray-300 text-black' : 
                        index === 2 ? 'bg-orange-600 text-white' : 'text-gray-600'
                      }`}>{index + 1}</span>
                    </td>
                    <td className="p-5 text-left"><div className="font-black text-gray-100 uppercase tracking-tighter">{entry.participants.name}</div></td>
                    <td className="p-5 font-mono text-xs text-gray-500 text-left">{entry.participants.roll_number}</td>
                    <td className="p-5 text-center font-black text-blue-400/80 text-sm tracking-tighter">{entry.avg_wpm.toFixed(2)} <span className="text-[8px] opacity-50">WPM</span></td>
                    <td className="p-5 text-center font-black text-green-400/80 text-sm tracking-tighter">{entry.avg_accuracy.toFixed(2)}%</td>
                    <td className="p-5 text-right font-black text-yellow-500 text-2xl tracking-tighter">{entry.total_score.toFixed(2)}</td>
                  </tr>
                ))}
                {!activeCompetition && <tr><td colSpan={6} className="p-20 text-center text-gray-700 italic font-bold uppercase tracking-widest text-[10px]">Select a session to initialize monitoring</td></tr>}
                {activeCompetition && leaderboard.length === 0 && <tr><td colSpan={6} className="p-20 text-center text-gray-700 italic font-bold uppercase tracking-widest text-[10px]">Awaiting incoming transmissions...</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 max-w-md w-full shadow-3xl text-left">
            <h2 className="text-2xl font-black text-blue-500 uppercase italic mb-8 tracking-tighter">Initialize Event</h2>
            <form onSubmit={handleCreateCompetition} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">Mission Codename</label>
                <input type="text" required placeholder="e.g. ROUND_01_MORNING" className="w-full p-4 bg-gray-950 border border-gray-800 rounded-2xl focus:border-blue-500 outline-none transition-all uppercase font-black text-sm tracking-widest" value={newCompName} onChange={(e) => setNewCompName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">T-Minus Start Time</label>
                <input type="datetime-local" required className="w-full p-4 bg-gray-950 border border-gray-800 rounded-2xl focus:border-blue-500 outline-none transition-all font-mono text-sm" value={newCompTime} onChange={(e) => setNewCompTime(e.target.value)} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black transition-all tracking-widest uppercase text-xs">Authorize</button>
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-black transition-all tracking-widest uppercase text-xs">Abort</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
