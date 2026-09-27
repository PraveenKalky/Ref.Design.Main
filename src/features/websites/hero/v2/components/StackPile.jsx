import React, { useEffect, useState } from 'react';
import TextPill from './TextPill';
import CircularToken from './CircularToken';
import { PILE_ITEMS } from '../data/pileConfig';

export default function StackPile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    // Trigger animation after short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const renderItem = (item) => {
    switch (item.type) {
      case 'text':
      case 'pill':
        return <TextPill content={item.content} bgClass={item.bgClass} colorClass={item.colorClass} />;
      case 'token':
        return <CircularToken src={item.src} innerBgClass={item.innerBgClass} />;
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
      <div className="relative w-full h-full max-w-[1440px] mx-auto">
        {PILE_ITEMS.map((item) => {
          const config = isMobile ? item.mobile : item.desktop;
          
          // Initial style: high above and rotated, opacity 0
          // Animated style: final config position and rotation, opacity 1
          const isActive = isMounted;
          
          const transformString = isActive 
            ? `translate3d(0, 0, 0) rotate(${config.rotate}deg)`
            : `translate3d(0, -600px, 0) rotate(${config.rotate + (Math.random() * 40 - 20)}deg)`;

          return (
            <div
              key={item.id}
              className="absolute pointer-events-auto transition-all duration-[800ms] hover:z-50 group"
              style={{
                left: `${(config.left / 1440) * 100}%`,
                top: `${(config.top / 960) * 100}%`,
                transform: transformString,
                opacity: isActive ? 1 : 0,
                transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.25)',
                transitionDelay: isActive ? `${item.delay}ms` : '0ms',
                zIndex: Math.floor(Math.random() * 10) + 1,
              }}
            >
              <div className="transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105 cursor-pointer">
                {renderItem(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
