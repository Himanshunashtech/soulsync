
import React from 'react';
import { Heart, Users, Home, User } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'discover', icon: Heart, label: 'Discover' },
    { id: 'matches', icon: Users, label: 'Matches' },
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/5 border-t border-white/20 shadow-[0_-2px_30px_rgba(255,255,255,0.05)] h-20">
      <div className="flex items-center justify-around px-4 py-6 h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 select-none focus:outline-none ${
                isActive
                  ? 'bg-gradient-to-tr from-purple-600/40 to-pink-500/30 border border-purple-500/60 shadow-[0_0_15px_2px_rgba(168,85,247,0.5)] scale-110'
                  : 'hover:bg-white/10 hover:scale-105'
              }`}
            >
              <Icon
                size={24}
                className={`mb-1 transition-all duration-300 ${
                  isActive ? 'text-purple-400 drop-shadow-[0_0_4px_rgba(192,132,252,0.8)]' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-semibold transition-all duration-300 ${
                  isActive ? 'text-purple-300' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
