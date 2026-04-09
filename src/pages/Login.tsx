import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useGameStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError('Invalid credentials. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4" style={{ backgroundImage: "url('/assets/college-campus.jpg')" }}>
      <div className="max-w-md w-full p-10 bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-700">
        <div className="text-center mb-10">
          <img src="/assets/ku-logo.png" alt="KU Logo" className="h-20 w-20 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-blue-500 uppercase tracking-tighter">Admin Portal</h2>
          <p className="text-gray-400 text-sm">Keyboard Combat Control Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Username</label>
            <input
              type="text"
              required
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-center text-sm font-bold">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-black text-lg transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
            Authorize Access
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
