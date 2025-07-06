
import React, { useRef, useEffect } from 'react';

const ThreeBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Create floating hearts animation with CSS
    const createHeart = () => {
      const heart = document.createElement('div');
      heart.innerHTML = '💜';
      heart.className = 'floating-heart';
      heart.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 20 + 10}px;
        left: ${Math.random() * 100}%;
        animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
        pointer-events: none;
        z-index: 1;
      `;
      
      mountRef.current?.appendChild(heart);
      
      setTimeout(() => {
        heart.remove();
      }, 5000);
    };

    const interval = setInterval(createHeart, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      ref={mountRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-indigo-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
    </div>
  );
};

export default ThreeBackground;
