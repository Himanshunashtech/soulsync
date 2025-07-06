
import React from 'react';

const UniverseTags: React.FC = () => {
  return (
    <div className="px-6 mb-6">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
        <h3 className="font-semibold mb-3 text-lg text-white">Popular Universes</h3>
        <div className="flex flex-wrap gap-2 text-white">
          <span className="bg-white/5 border border-white/20 px-3 py-1 rounded-xl text-sm">#music <span className="text-pink-400">11M souls</span></span>
          <span className="bg-white/5 border border-white/20 px-3 py-1 rounded-xl text-sm">#gaming <span className="text-pink-400">9.5M souls</span></span>
          <span className="bg-white/5 border border-white/20 px-3 py-1 rounded-xl text-sm">#movies <span className="text-pink-400">8.1M souls</span></span>
          <span className="bg-white/5 border border-white/20 px-3 py-1 rounded-xl text-sm">#anime <span className="text-pink-400">6.7M souls</span></span>
        </div>
      </div>
    </div>
  );
};

export default UniverseTags;
