'use client';

import React from 'react';
import { NOTE_NAMES, noteToMidi, midiToNote } from '../lib/theory';

interface PianoKeyboardProps {
  selectedNotes: string[];
  baseOctave: number;
  onToggleNote: (note: string) => void;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  selectedNotes,
  baseOctave,
  onToggleNote,
}) => {
  // Generate 2.5 - 3 octaves around baseOctave (e.g. octave baseOctave - 1 to baseOctave + 1)
  const startOctave = Math.max(1, baseOctave - 1);
  const endOctave = startOctave + 2; // 3 full octaves

  const selectedMidiSet = new Set(selectedNotes.map(noteToMidi));

  // Build key list
  const keys: {
    note: string;
    midi: number;
    isBlack: boolean;
    pitch: string;
    octave: number;
  }[] = [];

  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (let pIndex = 0; pIndex < 12; pIndex++) {
      const pitch = NOTE_NAMES[pIndex];
      const note = `${pitch}${oct}`;
      const midi = noteToMidi(note);
      const isBlack = pitch.includes('#');
      keys.push({ note, midi, isBlack, pitch, octave: oct });
    }
  }

  // Filter white keys to build columns
  const whiteKeys = keys.filter((k) => !k.isBlack);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 select-none">
      <div className="relative inline-flex h-44 sm:h-52 bg-bg-app border-2 border-border-subtle rounded-2xl p-1 shadow-inner min-w-[580px] sm:min-w-[700px]">
        {/* Render White Keys */}
        {whiteKeys.map((wKey) => {
          const isSelected = selectedMidiSet.has(wKey.midi);

          return (
            <div
              key={wKey.note}
              onClick={() => onToggleNote(wKey.note)}
              className={`relative flex-1 h-full rounded-b-lg border-r border-neutral-300 last:border-none flex flex-col justify-end items-center pb-2.5 cursor-pointer transition-all duration-75 select-none ${
                isSelected
                  ? 'bg-cyan-400 text-bg-app shadow-[0_0_14px_#00E5FF] font-bold z-10'
                  : 'bg-white hover:bg-neutral-100 text-neutral-600 active:bg-neutral-200'
              }`}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-bg-app mb-1 animate-pulse" />
              )}
              <span className="text-[11px] font-mono font-bold">{wKey.note}</span>
            </div>
          );
        })}

        {/* Render Black Keys Absolutely Positioned */}
        {keys.map((k) => {
          if (!k.isBlack) return null;

          const isSelected = selectedMidiSet.has(k.midi);

          // Find index of the preceding white key in whiteKeys array
          const precedingWhiteIndex = whiteKeys.findIndex((w) => w.midi === k.midi - 1);
          if (precedingWhiteIndex === -1) return null;

          // Position black key between preceding white key and next white key
          const whiteKeyWidthPercent = 100 / whiteKeys.length;
          const leftPercent = (precedingWhiteIndex + 1) * whiteKeyWidthPercent - (whiteKeyWidthPercent * 0.3);

          return (
            <div
              key={k.note}
              onClick={(e) => {
                e.stopPropagation();
                onToggleNote(k.note);
              }}
              style={{
                left: `${leftPercent}%`,
                width: `${whiteKeyWidthPercent * 0.6}%`,
              }}
              className={`absolute top-1 h-[62%] rounded-b-md flex flex-col justify-end items-center pb-2 cursor-pointer z-20 shadow-md transition-all duration-75 select-none ${
                isSelected
                  ? 'bg-cyan-400 text-bg-app shadow-[0_0_14px_#00E5FF] font-bold'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white/70 active:bg-neutral-950 border border-neutral-700'
              }`}
            >
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-bg-app mb-1 animate-pulse" />
              )}
              <span className="text-[9px] font-mono leading-none">{k.pitch}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
