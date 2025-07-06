
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface InfoScreenProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ title, onBack, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <div className="p-4 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center space-x-4 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
      </div>
      <div className="p-6 text-slate-300">
        {children}
      </div>
    </div>
  );
};

export default InfoScreen;
