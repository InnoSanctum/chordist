'use client';

import React from 'react';
import { ChordData } from '../types';
import { getChordColor } from '../lib/theory';

interface ChordStripProps {
  chords: ChordData[];
  onPlay: (chord: ChordData) => void;
  leading?: React.ReactNode; // e.g. the Next-chord controls
  className?: string;
}

/** Compact, horizontally scrolling row of pads pinned under the lyrics on phones */
export const ChordStrip: React.FC<ChordStripProps> = ({ chords, onPlay, leading, className = '' }) => (
  <div
    className={`flex items-center gap-2 px-3 py-2 border-t border-border-subtle bg-bg-surface pb-[max(0.5rem,env(safe-area-inset-bottom))] ${className}`}
  >
    {leading}
    <div className="flex-1 min-w-0 overflow-x-auto flex gap-1.5 [scrollbar-width:none]">
      {chords.map((chord) => (
        <button
          key={chord.id}
          onPointerDown={(e) => {
            if (e.button === 0) onPlay(chord);
          }}
          style={{
            backgroundColor: chord.colorToken || getChordColor(chord.label),
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.35) 100%)',
          }}
          className="h-11 min-w-[3.25rem] px-2 shrink-0 rounded-xl border border-white/10 font-mono font-extrabold text-sm text-white drop-shadow active:scale-90 transition-transform"
        >
          {chord.label}
        </button>
      ))}
    </div>
  </div>
);
