
import React, { useState, useRef } from 'react';
import { Heart, X, Star, MapPin, Sparkles } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
  location: string;
  compatibility: number;
}

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right' | 'super') => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    const newRotation = deltaX * 0.1;

    setDragOffset({ x: deltaX, y: deltaY });
    setRotation(newRotation);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      if (dragOffset.x > 0) {
        onSwipe('right');
      } else {
        onSwipe('left');
      }
    }

    setDragOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  const getSwipeDirection = () => {
    if (Math.abs(dragOffset.x) > 50) {
      return dragOffset.x > 0 ? 'right' : 'left';
    }
    return null;
  };

  const swipeDirection = getSwipeDirection();

  const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  const randomZodiac = zodiacSigns[Math.floor(Math.random() * zodiacSigns.length)];

  return (
    <div className="relative">
      <div
        ref={cardRef}
        className={`relative w-full h-[650px] glass-card rounded-[25px] cursor-grab overflow-hidden transition-all duration-300 ${
          isDragging ? 'scale-105' : 'scale-100'
        }`}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center rounded-[25px]"
          style={{ backgroundImage: `url(${profile.image})` }}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 rounded-[25px]" />

        {/* Floating emojis */}
        <div className="absolute top-4 left-4">
          <span className="text-2xl floating-emoji">✨</span>
        </div>
        <div className="absolute top-8 right-6">
          <span className="text-xl bubble-effect">👻</span>
        </div>

        {/* Swipe Indicators */}
        {swipeDirection === 'right' && (
          <div className="absolute top-20 left-8 right-8 flex justify-center">
            <div className="bg-gradient-to-r from-primary to-cyan-400 text-background px-8 py-4 rounded-3xl font-bold text-2xl border-4 border-primary/50 rotate-12 shadow-2xl flex items-center gap-2">
              💖 LIKE
            </div>
          </div>
        )}
        {swipeDirection === 'left' && (
          <div className="absolute top-20 left-8 right-8 flex justify-center">
            <div className="bg-secondary text-foreground px-8 py-4 rounded-3xl font-bold text-2xl border-4 border-muted -rotate-12 shadow-2xl flex items-center gap-2">
              👻 PASS
            </div>
          </div>
        )}

        {/* Compatibility Badge */}
        <div className="absolute top-6 right-6">
          <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full p-1">
            <div className="bg-background/90 rounded-full px-4 py-2 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-foreground font-bold text-sm">{profile.compatibility}%</span>
            </div>
          </div>
        </div>

        {/* Zodiac Sign */}
        <div className="absolute top-20 left-6">
          <div className="bg-background/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-2xl border border-primary/30">
            {randomZodiac}
          </div>
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-4xl font-bold mb-1 text-white">{profile.name}, {profile.age}</h2>
                <div className="flex items-center text-lg text-white/80">
                  <MapPin size={18} className="mr-2" />
                  <span>{profile.location}</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="bg-primary/20 backdrop-blur-sm rounded-full p-2 border border-primary/30">
                  <Heart size={24} className="text-primary" />
                </div>
              </div>
            </div>
            
            {/* Bio */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <p className="text-white/90 leading-relaxed text-base">{profile.bio}</p>
            </div>

            {/* Mood indicators */}
            <div className="flex gap-2 mt-3">
              <div className="tag-dark">
                😊 Happy
              </div>
              <div className="tag-dark">
                🌟 Spiritual
              </div>
            </div>
          </div>
        </div>

        {/* Floating hearts */}
        <div className="absolute bottom-32 right-6">
          <span className="text-primary text-lg floating-emoji">💫</span>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
