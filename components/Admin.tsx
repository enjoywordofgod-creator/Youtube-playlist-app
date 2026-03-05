import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Lock } from 'lucide-react';

const Admin: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('YOUTUBE_API_KEY') || '');
  const [playlistId, setPlaylistId] = useState(localStorage.getItem('PLAYLIST_ID') || '');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword] = useState('admin123'); // Change this to your actual password
  const { t, language } = useLanguage();

  const handleLogin = () => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
    } else {
      alert(t.invalidPassword);
    }
  };

  const handleSave = () => {
    localStorage.setItem('YOUTUBE_API_KEY', apiKey);
    localStorage.setItem('PLAYLIST_ID', playlistId);
    alert(t.save + '!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Lock size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800">{t.login}</h2>
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t.login}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">{t.admin}</h1>

      <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm border border-slate-200">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{t.audioLink}</label>
          <input
            type="text"
            placeholder="YouTube API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">{t.playlist}</label>
          <input
            type="text"
            placeholder="Playlist ID"
            value={playlistId}
            onChange={(e) => setPlaylistId(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {t.save}
        </button>
      </div>
    </div>
  );
};

export default Admin;