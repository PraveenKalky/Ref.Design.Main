import React from 'react';

export default function CircularToken({ src, innerBgClass, icon: Icon, iconClass }) {
  return (
    <div className="bg-[#dad8d8] overflow-clip relative rounded-[200px] w-[70px] h-[70px] md:w-[105px] md:h-[105px] flex items-center justify-center shadow-sm">
      <div className={`flex items-center justify-center rounded-[200px] w-[60px] h-[60px] md:w-[92px] md:h-[92px] border-[1.7px] border-[#321b05] overflow-clip ${innerBgClass || 'bg-white'}`}>
        {src && <img alt="" className="object-cover pointer-events-none w-full h-full" src={src} />}
        {Icon && <Icon className={`w-8 h-8 md:w-12 md:h-12 ${iconClass || 'text-black'}`} />}
      </div>
    </div>
  );
}
