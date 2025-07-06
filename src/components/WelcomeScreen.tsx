import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, LogIn, UserPlus } from 'lucide-react';

// Splash Loading Screen Component
const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20); // Update every 20ms for smooth animation (2000ms total / 100 = 20ms per percent)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black z-50">
      <div className="text-center w-full max-w-xs px-4">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-fuchsia-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-xl">
          <Heart size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
          SoulSync
        </h1>
        
        {/* Loading Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full transition-all duration-100 ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-sm">Loading your experience...</p>
      </div>
    </div>
  );
};

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-md mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-fuchsia-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <Heart size={40} className="text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-md">
            <Sparkles size={16} className="text-black" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-md">
          Find Your Perfect Match
        </h1>
        
        <p className="text-slate-300 text-lg mb-12 leading-relaxed">
          Connect with like-minded people through personality compatibility and shared interests.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-pink-500/40 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Get Started</span>
          </button>

          <button
            onClick={onLogin}
            className="w-full bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <LogIn size={20} />
            <span>Log In</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm">
          Join thousands of people finding meaningful connections
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;