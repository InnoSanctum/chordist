'use client';

import React from 'react';
import {
  GUITAR_STRINGS,
  GUITAR_FRETS_COUNT,
  GUITAR_INLAYS,
  getGuitarFretNote,
} from '../lib/theory';
import { audioEngine } from '../lib/audioEngine';

interface GuitarFretboardProps {
  stringFrets: (number | null)[]; // 6 values: [str0(e), str1(B), str2(G), str3(D), str4(A), str5(E)]
  onChangeStringFrets: (newFrets: (number | null)[]) => void;
}

export const GuitarFretboard: React.FC<GuitarFretboardProps> = ({
  stringFrets,
  onChangeStringFrets,
}) => {
  // frets: [0, 1, ..., 15]
  const frets = Array.from({ length: GUITAR_FRETS_COUNT }, (_, i) => i);

  const handleNutClick = (strIdx: number) => {
    const current = stringFrets[strIdx];
    const newFrets = [...stringFrets];

    // Toggle: if currently open (0), mute it (null); otherwise set open (0)
    if (current === 0) {
      newFrets[strIdx] = null;
    } else {
      newFrets[strIdx] = 0;
      // Audio preview for open string
      const info = getGuitarFretNote(strIdx, 0);
      if (audioEngine) {
        audioEngine.playChord([info.note], {
          instrument: 'acoustic_guitar',
          playbackStyle: 'block',
          strumSpeedMs: 0,
          fadeDuration: 1.5,
        });
      }
    }

    onChangeStringFrets(newFrets);
  };

  const handleFretClick = (strIdx: number, fret: number) => {
    const current = stringFrets[strIdx];
    const newFrets = [...stringFrets];

    // If already on this fret, toggle off (mute string)
    if (current === fret) {
      newFrets[strIdx] = null;
    } else {
      // Set string to this fret
      newFrets[strIdx] = fret;

      // Audio preview for this string note
      const info = getGuitarFretNote(strIdx, fret);
      if (audioEngine) {
        audioEngine.playChord([info.note], {
          instrument: 'acoustic_guitar',
          playbackStyle: 'block',
          strumSpeedMs: 0,
          fadeDuration: 1.5,
        });
      }
    }

    onChangeStringFrets(newFrets);
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-3 select-none">
      <div className="inline-block min-w-[760px] bg-[#1E222D] border-2 border-border-subtle rounded-2xl p-4 shadow-xl">
        {/* Fretboard Header: Nut & Fret numbers */}
        <div className="flex border-b border-border-subtle pb-2 text-[11px] font-mono font-semibold text-text-secondary">
          <div className="w-14 text-center text-accent-primary">Nut / Open</div>
          {frets.slice(1).map((f) => (
            <div key={f} className="flex-1 text-center">
              Fret {f}
            </div>
          ))}
        </div>

        {/* 6 Guitar Strings */}
        <div className="relative py-2 flex flex-col gap-3">
          {GUITAR_STRINGS.map((strObj) => {
            const activeFretOnThisString = stringFrets[strObj.index];
            const isOpen = activeFretOnThisString === 0;
            const isMuted = activeFretOnThisString === null || activeFretOnThisString === undefined;
            const stringThicknessPx = 1 + strObj.index * 0.45;

            return (
              <div key={strObj.index} className="relative flex items-center h-8">
                {/* Horizontal String Line */}
                <div
                  style={{ height: `${stringThicknessPx}px` }}
                  className="absolute left-14 right-0 bg-neutral-400 shadow-sm z-0 pointer-events-none"
                />

                {/* Nut / Open String Column */}
                <div className="w-14 flex items-center justify-center z-10">
                  <button
                    onClick={() => handleNutClick(strObj.index)}
                    title={`String ${strObj.name}: ${isOpen ? 'Open (Click to Mute)' : isMuted ? 'Muted (Click to Open)' : 'Fretted (Click to Open)'}`}
                    className={`w-8 h-8 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all ${
                      isOpen
                        ? 'bg-cyan-400 text-bg-app shadow-[0_0_12px_#00E5FF] scale-105'
                        : isMuted
                        ? 'bg-bg-elevated/70 text-rose-400 hover:text-white hover:bg-border-subtle border border-border-subtle'
                        : 'bg-bg-elevated text-text-secondary hover:text-white border border-border-subtle'
                    }`}
                  >
                    {isOpen ? strObj.name : isMuted ? '✕' : strObj.name}
                  </button>
                </div>

                {/* Frets 1 through 15 */}
                {frets.slice(1).map((fret) => {
                  const fretInfo = getGuitarFretNote(strObj.index, fret);
                  const isSelected = activeFretOnThisString === fret;

                  return (
                    <div
                      key={fret}
                      className="flex-1 flex items-center justify-center relative border-r border-neutral-600/60 h-full z-10 cursor-pointer group"
                      onClick={() => handleFretClick(strObj.index, fret)}
                    >
                      {/* Active Dot: only ONE dot can exist per string */}
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-cyan-400 text-bg-app font-mono font-bold text-[10px] flex items-center justify-center shadow-[0_0_12px_#00E5FF] scale-110 z-20">
                          {fretInfo.pitch}
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 bg-white/20 hover:bg-cyan-400/50 transition-opacity" />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Fretboard Inlays (Dots on Frets 3, 5, 7, 9, 12, 15) */}
          <div className="flex pt-2 text-center text-xs">
            <div className="w-14" />
            {frets.slice(1).map((fret) => {
              const isInlay = GUITAR_INLAYS.includes(fret);
              const isDouble = fret === 12;

              return (
                <div key={fret} className="flex-1 flex justify-center items-center h-4">
                  {isInlay && (
                    <div className="flex gap-1.5 items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-neutral-500/60" />
                      {isDouble && <div className="w-2 h-2 rounded-full bg-neutral-500/60" />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
