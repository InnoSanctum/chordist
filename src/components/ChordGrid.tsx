'use client';

import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ChordPad } from './ChordPad';
import { ChordData } from '../types';

interface ChordGridProps {
  chords: ChordData[];
  padCount: 12 | 15;
  onPlayChord: (chord: ChordData) => void;
  onEditChord: (chord: ChordData, index: number) => void;
  onAddPad?: () => void;
  compact?: boolean; // narrower column layout for the lyrics split view
}

const DESKTOP_HOTKEYS = [
  'q', 'w', 'e', 'r', 't',
  'a', 's', 'd', 'f', 'g',
  'z', 'x', 'c', 'v', 'b',
];

export const ChordGrid: React.FC<ChordGridProps> = ({
  chords,
  padCount,
  onPlayChord,
  onEditChord,
  onAddPad,
  compact = false,
}) => {
  // Listen for physical keyboard hotkeys on PC/Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const keyIndex = DESKTOP_HOTKEYS.indexOf(key);

      if (keyIndex !== -1 && keyIndex < chords.length) {
        const chord = chords[keyIndex];
        if (chord) {
          onPlayChord(chord);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chords, onPlayChord]);

  // padCount (12 or 15) sets the grid shape and the minimum pad count; sections can hold more (page scrolls)
  const displayedChords = chords;

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6 select-none">
      <div
        className={`grid gap-2.5 sm:gap-3.5 md:gap-4 ${
          compact
            ? 'grid-cols-3 xl:grid-cols-4'
            : padCount === 12
            ? 'grid-cols-3 md:grid-cols-4'
            : 'grid-cols-3 md:grid-cols-5'
        }`}
      >
        {displayedChords.map((chord, index) => (
          <ChordPad
            key={chord.id || index}
            chord={chord}
            index={index}
            hotkey={DESKTOP_HOTKEYS[index]}
            onPlay={onPlayChord}
            onEdit={onEditChord}
          />
        ))}

        {onAddPad && (
          <button
            onClick={onAddPad}
            title="Add a pad to this section"
            className="aspect-square w-full rounded-2xl border border-dashed border-border-subtle text-text-secondary hover:text-accent-primary hover:border-accent-primary/60 flex flex-col items-center justify-center gap-1 transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[11px] font-semibold">Add Pad</span>
          </button>
        )}
      </div>
    </div>
  );
};
