'use client';

import React, { useState, useRef } from 'react';
import { Edit3 } from 'lucide-react';
import { ChordData } from '../types';
import { getChordColor } from '../lib/theory';

interface ChordPadProps {
  chord: ChordData;
  index: number;
  hotkey?: string;
  onPlay: (chord: ChordData) => void;
  onEdit: (chord: ChordData, index: number) => void;
}

export const ChordPad: React.FC<ChordPadProps> = ({
  chord,
  index,
  hotkey,
  onPlay,
  onEdit,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const padColor = chord.colorToken || getChordColor(chord.label);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0) return;

    setIsPressed(true);
    onPlay(chord);

    // Setup long press (450ms) to trigger edit
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      onEdit(chord, index);
    }, 550);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerCancel = () => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Format note list without octave numbers for clean display
  const noteListDisplay = chord.notes && chord.notes.length > 0
    ? chord.notes.map((n) => n.replace(/\d+$/, '')).join(' ')
    : 'Empty';

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => {
        e.preventDefault();
        onEdit(chord, index);
      }}
      style={{
        backgroundColor: padColor,
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.35) 100%)',
      }}
      className={`relative aspect-square w-full rounded-2xl p-2.5 md:p-3 flex flex-col justify-between items-center text-center cursor-pointer shadow-lg transition-transform duration-75 select-none border border-white/10 ${
        isPressed
          ? 'scale-95 shadow-[0_0_20px_rgba(255,255,255,0.6)] brightness-110'
          : 'hover:brightness-105 active:scale-95'
      }`}
    >
      {/* Top row: Hotkey badge (on desktop) & Edit button */}
      <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/80">
        {hotkey ? (
          <span className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-black/40 border border-white/20 font-bold uppercase">
            {hotkey}
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(chord, index);
          }}
          title="Edit Chord Pad"
          className="p-1 rounded-lg bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center: Main Chord Label */}
      <div className="my-auto flex flex-col items-center">
        <span className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          {chord.label || 'Empty'}
        </span>
      </div>

      {/* Bottom: Note List Subtitle */}
      <div className="w-full truncate">
        <span className="text-[10px] sm:text-[11px] md:text-xs font-mono font-medium text-white/85 tracking-wider drop-shadow">
          ({noteListDisplay})
        </span>
      </div>
    </div>
  );
};
