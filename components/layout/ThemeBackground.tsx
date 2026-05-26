import React from 'react';

export default function ThemeBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-brand-cloud">
      {/* Noise/Grain Overlay */}
      <div className="noise-overlay" />

      {/* Comic Pattern Halftone Backdrop */}
      <div className="absolute inset-0 bg-halftone-black opacity-30 pointer-events-none" />
      
      {/* Abstract comic background shapes */}
      <div className="absolute top-12 left-12 w-64 h-64 bg-brand-pink/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-[450px] h-[450px] bg-brand-orange/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Huge Tilted AARAMBH 26 Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[120vw] text-center opacity-[0.04]">
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(3rem, 8vw, 8rem)', fontWeight: 900, color: '#030404', lineHeight: 0.8, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            AARAMBH&apos;26
          </h1>
        </div>
      </div>
    </div>
  );
}
