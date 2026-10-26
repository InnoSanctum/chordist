'use client';

import React, { useEffect } from 'react';
import { ChordPad } from './ChordPad';
import { ChordData } from '../types';

interface ChordGridProps {
  chords: ChordData[];
  padCount: 12 | 15;
  onPlayChord: (chord: ChordData) => void;
  onEditChord: (chord: ChordData, index: number) => void;
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

  // Display either 12 or 15 pads
  const displayedChords = chords.slice(0, padCount);

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6 select-none">
      <div
        className={`grid gap-2.5 sm:gap-3.5 md:gap-4 ${
          padCount === 12
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
      </div>
    </div>
  );
};
