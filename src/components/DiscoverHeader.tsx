
import React from 'react';

const DiscoverHeader: React.FC = () => {
  return (
    <div className="p-6 flex items-center justify-between">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
          Discover
        </h1>
        <p className="text-slate-300 text-lg">Find your perfect match</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-3xl floating-emoji">🌟</span>
        <span className="text-2xl bubble-effect">💫</span>
      </div>
    </div>
  );
};

export default DiscoverHeader;
