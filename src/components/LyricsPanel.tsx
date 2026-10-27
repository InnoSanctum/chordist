'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Minus,
  Plus,
  Pencil,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { LyricsSheet, SheetSegment } from '../lib/lyricsSheet';

const FONT_KEY = 'chordist_lyrics_font';
const SCROLL_SPEEDS = [8, 14, 22, 32, 45, 60]; // px per second

interface LyricsPanelProps {
  sheet: LyricsSheet;
  sourceText: string;
  activeIndex: number; // current chord occurrence, -1 = none yet
  chordColor: (name: string) => string;
  onTapChord: (index: number) => void; // tap on a chord in the text
  onStep: (delta: 1 | -1) => void;     // prev / next chord
  onSaveText: (text: string) => void;
  className?: string;
}

/** Splits a line into word-sized groups so wrapping never separates a chord from its syllable */
function groupSegments(segments: SheetSegment[]): SheetSegment[][] {
  const groups: SheetSegment[][] = [];
  segments.forEach((seg, i) => {
    const prev = segments[i - 1];
    const joinsPrev = prev && prev.text && !/\s$/.test(prev.text) && seg.text && !/^\s/.test(seg.text);
    if (joinsPrev) groups[groups.length - 1].push(seg);
    else groups.push([seg]);
  });
  return groups;
}

export const NextChordControls: React.FC<{
  sheet: LyricsSheet;
  activeIndex: number;
  onStep: (delta: 1 | -1) => void;
  className?: string;
}> = ({ sheet, activeIndex, onStep, className = '' }) => {
  const nextChord = sheet.chords[activeIndex + 1];
  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      <button
        onClick={() => onStep(-1)}
        disabled={activeIndex <= 0}
        aria-label="Previous chord"
        className="h-11 w-9 rounded-xl bg-bg-elevated hover:bg-border-subtle disabled:opacity-30 text-text-primary flex items-center justify-center active:scale-95 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => onStep(1)}
        disabled={!nextChord}
        title="Play the next chord in the song"
        className="h-11 min-w-[5.5rem] px-3 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-40 text-white font-bold flex items-center justify-center gap-1.5 shadow-md shadow-accent-primary/30 active:scale-95 transition-all"
      >
        <span className="text-[10px] uppercase tracking-wider opacity-80">Next</span>
        <span className="font-mono text-base">{nextChord ?? '—'}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export const LyricsPanel: React.FC<LyricsPanelProps> = ({
  sheet,
  sourceText,
  activeIndex,
  chordColor,
  onTapChord,
  onStep,
  onSaveText,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(15);
  const [autoScroll, setAutoScroll] = useState(false);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(FONT_KEY));
      if (saved >= 11 && saved <= 28) setFontSize(saved);
    } catch {}
  }, []);

  const changeFont = (delta: number) => {
    setFontSize((f) => {
      const next = Math.min(28, Math.max(11, f + delta));
      try {
        localStorage.setItem(FONT_KEY, String(next));
      } catch {}
      return next;
    });
  };

  // Keep the current chord in view when stepping through the song
  useEffect(() => {
    if (activeIndex < 0 || autoScroll) return;
    scrollRef.current
      ?.querySelector(`[data-chord-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeIndex, autoScroll]);

  // Auto-scroll; fractional progress is accumulated because scrollTop is rounded
  useEffect(() => {
    if (!autoScroll) return;
    const el = scrollRef.current;
    if (!el) return;
    let frame = 0;
    let last = performance.now();
    let position = el.scrollTop;
    const tick = (now: number) => {
      if (Math.abs(el.scrollTop - position) > 2) position = el.scrollTop; // user dragged
      position += (SCROLL_SPEEDS[speedLevel] * (now - last)) / 1000;
      last = now;
      el.scrollTop = position;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        setAutoScroll(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoScroll, speedLevel]);

  const activeLine = useMemo(
    () =>
      sheet.lines.findIndex(
        (l) => l.kind === 'line' && l.segments.some((s) => s.chordIndex === activeIndex)
      ),
    [sheet, activeIndex]
  );

  const startEditing = () => {
    setDraft(sourceText);
    setIsEditing(true);
    setAutoScroll(false);
  };

  const toolbarButton =
    'h-8 w-8 rounded-lg bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center active:scale-95 transition-all disabled:opacity-30';

  return (
    <section className={`flex flex-col min-h-0 min-w-0 bg-bg-app ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border-subtle bg-bg-surface/60">
        {isEditing ? (
          <>
            <span className="text-xs font-semibold text-text-secondary">Edit chord sheet</span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsEditing(false)} className={toolbarButton} aria-label="Cancel">
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  onSaveText(draft);
                  setIsEditing(false);
                }}
                className="h-8 px-3 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <NextChordControls
              sheet={sheet}
              activeIndex={activeIndex}
              onStep={onStep}
              className="hidden md:flex [&_button]:h-8"
            />
            <div className="flex items-center gap-1 md:ml-auto">
              <button
                onClick={() => setAutoScroll((v) => !v)}
                disabled={!sourceText}
                title={autoScroll ? 'Pause auto-scroll' : 'Auto-scroll'}
                className={`${toolbarButton} ${autoScroll ? '!bg-accent-primary !text-white' : ''}`}
              >
                {autoScroll ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setSpeedLevel((s) => Math.max(0, s - 1))}
                disabled={speedLevel === 0}
                title="Scroll slower"
                className={toolbarButton}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-4 text-center text-[11px] font-mono text-text-secondary">{speedLevel + 1}</span>
              <button
                onClick={() => setSpeedLevel((s) => Math.min(SCROLL_SPEEDS.length - 1, s + 1))}
                disabled={speedLevel === SCROLL_SPEEDS.length - 1}
                title="Scroll faster"
                className={toolbarButton}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => changeFont(-1)} title="Smaller text" className={toolbarButton}>
                <span className="text-[11px] font-bold">A-</span>
              </button>
              <button onClick={() => changeFont(1)} title="Larger text" className={toolbarButton}>
                <span className="text-sm font-bold">A+</span>
              </button>
              <button onClick={startEditing} title="Edit chord sheet text" className={toolbarButton}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Sheet */}
      {isEditing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          placeholder={'[Verse 1]\nC                G\nWhen I find myself in times of trouble'}
          className="flex-1 min-h-0 w-full resize-none bg-bg-app p-4 font-mono text-sm text-text-primary outline-none select-text"
        />
      ) : !sourceText.trim() ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <FileText className="w-8 h-8 text-text-secondary/60" />
          <p className="text-sm text-text-secondary max-w-xs">
            This song has no lyrics yet. Paste a chord sheet (chords above lyrics, or ChordPro) to play along.
          </p>
          <button
            onClick={startEditing}
            className="h-9 px-4 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center gap-1.5 active:scale-95"
          >
            <Pencil className="w-4 h-4" />
            Add Lyrics
          </button>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onPointerDown={() => setAutoScroll(false)}
          className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-24 font-mono select-text"
          style={{ fontSize }}
        >
          {sheet.lines.map((line, li) => {
            if (line.kind === 'blank') return <div key={li} className="h-[1em]" />;
            if (line.kind === 'section') {
              return (
                <div key={li} className="mt-3 mb-1 font-sans text-[0.75em] font-bold uppercase tracking-wider text-accent-primary">
                  {line.name}
                </div>
              );
            }
            const hasChords = line.segments.some((s) => s.chord);
            return (
              <div
                key={li}
                className={`rounded-lg -mx-2 px-2 transition-colors ${li === activeLine ? 'bg-accent-primary/10' : ''}`}
              >
                {groupSegments(line.segments).map((group, gi) => (
                  <span key={gi} className="inline-flex align-top max-w-full">
                    {group.map((seg, si) => (
                      <span key={si} className="inline-flex flex-col min-w-0">
                        {hasChords && (
                          <span className="h-[1.6em] pr-[0.5ch] whitespace-pre leading-[1.6em]">
                            {seg.chord === undefined ? (
                              ' '
                            ) : seg.chordIndex === undefined ? (
                              <span className="text-text-secondary">{seg.chord}</span>
                            ) : (
                              <button
                                data-chord-index={seg.chordIndex}
                                onClick={() => onTapChord(seg.chordIndex!)}
                                style={{ color: chordColor(seg.chord) }}
                                className={`font-bold rounded-md px-[0.25ch] -mx-[0.25ch] transition-all active:scale-90 ${
                                  seg.chordIndex === activeIndex ? 'ring-2 ring-current bg-white/10' : 'hover:bg-white/10'
                                }`}
                              >
                                {seg.chord}
                              </button>
                            )}
                          </span>
                        )}
                        <span className="whitespace-pre-wrap break-words text-text-primary leading-snug">
                          {seg.text || (hasChords ? '' : ' ')}
                        </span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
