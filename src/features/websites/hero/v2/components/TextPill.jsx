import React from 'react';

export default function TextPill({ content, bgClass, colorClass }) {
  return (
    <div 
      className={`flex h-[36px] md:h-[44px] items-center justify-center overflow-clip px-[14px] md:px-[20px] relative rounded-[200px] shadow-sm ${bgClass || 'bg-white'}`}
    >
      <span className={`font-semibold text-[14px] md:text-[16px] whitespace-nowrap ${colorClass || 'text-black'}`}>
        {content}
      </span>
    </div>
  );
}
