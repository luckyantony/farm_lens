import React from 'react';
import { Leaf } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-green-700 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">FarmLens</h1>
            <p className="text-xs text-green-100 opacity-90">Sustainable Plant Health Advisor</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;