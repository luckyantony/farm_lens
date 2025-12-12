import React from 'react';
import { Leaf, Globe } from 'lucide-react';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  return (
    <header className="bg-green-700 text-white p-4 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-green-700/95">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <Leaf className="w-6 h-6 text-green-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FarmLens</h1>
            <p className="text-[10px] text-green-100 uppercase tracking-wider opacity-90">Sustainable Plant Health Advisor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 pl-3">
          <Globe size={14} className="text-green-100" />
          <div className="flex">
            <button
              onClick={() => setLanguage(Language.ENGLISH)}
              className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                language === Language.ENGLISH 
                  ? 'bg-white text-green-800 shadow-sm' 
                  : 'text-green-100 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage(Language.SWAHILI)}
              className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                language === Language.SWAHILI 
                  ? 'bg-white text-green-800 shadow-sm' 
                  : 'text-green-100 hover:text-white'
              }`}
            >
              SW
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;