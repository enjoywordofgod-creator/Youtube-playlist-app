import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { Message } from '../types';
import { Search, Menu, X } from 'lucide-react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  title: string;
  onBack?: () => void;
  latestMessages?: Message[];
  onMessageClick?: (msg: Message) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  onBack,
  latestMessages = [],
  onMessageClick,
  searchQuery = '',
  onSearchChange,
  children
}) => {

  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // check if admin logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session);
    });

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(!!session);
      });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 flex-1">

            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ←
              </button>
            )}

            <h1 className="text-2xl font-bold text-slate-800">
              {title}
            </h1>

            {/* ADMIN BUTTON */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Admin
              </button>
            )}

          </div>

          {/* Search */}
          {onSearchChange && (
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* Mobile search */}
        {onSearchChange && (
          <div className="px-6 pb-4 sm:hidden">
            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

            </div>
          </div>
        )}

      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setMenuOpen(false)}
        >

          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-lg p-6 space-y-4">

            <button
              onClick={() =>
                setLanguage(language === 'ta' ? 'en' : 'ta')
              }
              className="w-full text-left px-4 py-2 hover:bg-slate-100 rounded-lg"
            >
              {language === 'ta'
                ? '🇬🇧 English'
                : '🇮🇳 Tamil'}
            </button>

            <hr />

            <a
              href="#home"
              className="block px-4 py-2 hover:bg-slate-100 rounded-lg"
            >
              {t.home}
            </a>

            <a
              href="#about"
              className="block px-4 py-2 hover:bg-slate-100 rounded-lg"
            >
              {t.menu?.about || 'About'}
            </a>

          </div>

        </div>
      )}

    </div>
  );
};

export default Layout;