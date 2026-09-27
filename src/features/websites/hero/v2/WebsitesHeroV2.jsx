import React from 'react';
import StackPile from './components/StackPile';

export default function WebsitesHeroV2() {
  return (
    <section 
      className="relative mb-24 overflow-hidden bg-[#FAFAFA]" 
      style={{ minHeight: '760px' }}
    >
      
      {/* ── Background Stacked Objects (Pile) ── */}
      <StackPile />

      {/* ── Hero text — constrained above the pile ── */}
      <div className="relative z-10 pointer-events-none">
        <div
          className="max-w-[1440px] mx-auto px-8 lg:px-8"
          style={{ paddingLeft: '32px', paddingRight: '32px' }}
        >
          <div className="flex flex-col pointer-events-auto" style={{ paddingTop: '160px', paddingBottom: '48px' }}>
            <h1 className="max-w-[15em] text-balance text-4xl md:text-5xl lg:text-6xl font-bold text-[#29256E] tracking-tight">
              <span className="sr-only">WebInspoo - </span>
              The right SaaS reference. Found fast.
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-lg text-[#666666] lg:text-xl">
              Browse 1,200+ curated SaaS websites and find references fast with filters for category, typography, color palette, and technology stack.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
