import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  id: string;
  avg_wpm: number;
  level1_wpm: number;
  level2_wpm: number;
  level3_wpm: number;
  participants: {
    name: string;
    roll_number: string;
    email: string;
    college: string;
  };
}

const Admin: React.FC = () => {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: results, error } = await supabase
      .from('results')
      .select(`
        id,
        avg_wpm,
        level1_wpm,
        level2_wpm,
        level3_wpm,
        participants (
          name,
          roll_number,
          email,
          college
        )
      `)
      .order('avg_wpm', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
    } else {
      setData(results as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'results' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const exportCSV = () => {
    const headers = ['Name', 'Roll Number', 'Email', 'Level 1 WPM', 'Level 2 WPM', 'Level 3 WPM', 'Avg WPM'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.participants.name,
        row.participants.roll_number,
        row.participants.email,
        row.level1_wpm,
        row.level2_wpm,
        row.level3_wpm,
        row.avg_wpm
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'keyboard_combat_results.csv');
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-blue-500 uppercase italic">Command Center</h1>
          <p className="text-gray-400">Live Leaderboard & Coordinator Panel</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold"
          >
            Refresh
          </button>
          <button 
            onClick={exportCSV}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
          >
            Export CSV
          </button>
        </div>
      </header>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Rank</th>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Participant</th>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider">Roll Number</th>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-center">L1</th>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-center">L2</th>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-center">L3</th>
              <th className="p-4 font-bold text-gray-400 uppercase text-xs tracking-wider text-right">Avg WPM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500 animate-pulse italic">
                  Intercepting transmission...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-gray-500">
                  No data found. Start the competition!
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="p-4">
                    <span className={`
                      inline-block w-8 h-8 rounded-full text-center leading-8 font-black
                      ${index === 0 ? 'bg-yellow-500 text-black' : 
                        index === 1 ? 'bg-gray-300 text-black' : 
                        index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'}
                    `}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-blue-100">{row.participants.name}</div>
                    <div className="text-xs text-gray-500">{row.participants.email}</div>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-300">
                    {row.participants.roll_number}
                  </td>
                  <td className="p-4 text-center font-mono text-gray-400">{row.level1_wpm}</td>
                  <td className="p-4 text-center font-mono text-gray-400">{row.level2_wpm}</td>
                  <td className="p-4 text-center font-mono text-gray-400">{row.level3_wpm}</td>
                  <td className="p-4 text-right font-black text-blue-400 text-xl">{row.avg_wpm}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;
