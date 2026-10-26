'use client';

import React, { useState } from 'react';
import { ArrowLeft, Check, Play, Trash2, Wand2, Music2 } from 'lucide-react';
import { ChordData, InstrumentType, PlaybackStyle } from '../types';
import { PianoKeyboard } from './PianoKeyboard';
import { GuitarFretboard } from './GuitarFretboard';
import { detectChordName, getChordColor } from '../lib/theory';
import { audioEngine } from '../lib/audioEngine';
import { getVoicingForChord, fretsToNotes } from '../lib/guitarVoicings';

interface ChordEditorModalProps {
  chord: ChordData;
  index: number;
  instrument: InstrumentType;
  playbackStyle: PlaybackStyle;
  strumSpeedMs: number;
  fadeDuration: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedChord: ChordData, index: number) => void;
  onOpenLibraryForPad?: () => void;
}

export const ChordEditorModal: React.FC<ChordEditorModalProps> = ({
  chord,
  index,
  instrument,
  playbackStyle,
  strumSpeedMs,
  fadeDuration,
  isOpen,
  onClose,
  onSave,
  onOpenLibraryForPad,
}) => {
  const [label, setLabel] = useState(chord.label);
  const [notes, setNotes] = useState<string[]>(chord.notes || []);
  const [baseOctave, setBaseOctave] = useState<number>(chord.baseOctave || 4);
  const [viewMode, setViewMode] = useState<'piano' | 'guitar'>(
    instrument === 'acoustic_guitar' ? 'guitar' : 'piano'
  );

  // 6 guitar strings state: [e, B, G, D, A, E]
  const [stringFrets, setStringFrets] = useState<(number | null)[]>(() => {
    if (chord.guitarFrets && chord.guitarFrets.length === 6) {
      return [...chord.guitarFrets];
    }
    return getVoicingForChord(chord.label, chord.notes || []);
  });

  if (!isOpen) return null;

  // Toggle note from Piano Keyboard
  const handleTogglePianoNote = (note: string) => {
    let newNotes: string[];
    if (notes.includes(note)) {
      newNotes = notes.filter((n) => n !== note);
    } else {
      if (notes.length >= 10) {
        alert('Maximum of 10 notes allowed per chord.');
        return;
      }
      newNotes = [...notes, note];

      // Audio preview for single key tap
      if (audioEngine) {
        audioEngine.playChord([note], {
          instrument,
          playbackStyle: 'block',
          strumSpeedMs: 0,
          fadeDuration: 1.2,
        });
      }
    }

    setNotes(newNotes);
    // Auto-update guitar frets to match new notes
    const newVoicing = getVoicingForChord(label, newNotes);
    setStringFrets(newVoicing);

    if (!label || label === 'Empty' || label.includes('Custom')) {
      const detected = detectChordName(newNotes);
      if (detected.name) {
        setLabel(detected.name);
      }
    }
  };

  // Change frets from Guitar Fretboard
  const handleChangeGuitarFrets = (newFrets: (number | null)[]) => {
    setStringFrets(newFrets);
    const newNotes = fretsToNotes(newFrets);
    setNotes(newNotes);

    if (newNotes.length > 0) {
      const detected = detectChordName(newNotes);
      if (detected.name && (!label || label === 'Empty' || label.includes('Custom'))) {
        setLabel(detected.name);
      }
    }
  };

  const handleRemoveNote = (noteToRemove: string) => {
    const newNotes = notes.filter((n) => n !== noteToRemove);
    setNotes(newNotes);
    setStringFrets(getVoicingForChord(label, newNotes));
  };

  const handleClearAll = () => {
    setNotes([]);
    setStringFrets([null, null, null, null, null, null]);
  };

  const handleAutoDetectName = () => {
    const detected = detectChordName(notes);
    setLabel(detected.name);
  };

  const handlePreviewPlay = () => {
    if (notes.length === 0) return;
    if (audioEngine) {
      audioEngine.playChord(notes, {
        instrument,
        playbackStyle,
        strumSpeedMs,
        fadeDuration,
      });
    }
  };

  const handleSave = () => {
    if (notes.length === 0) {
      alert('Please select at least 1 note for the chord.');
      return;
    }

    const detected = detectChordName(notes);
    const finalLabel = label.trim() || detected.name;
    const finalColor = getChordColor(finalLabel);

    const updated: ChordData = {
      ...chord,
      label: finalLabel,
      notes: [...notes],
      root: detected.root || 'C',
      chordType: detected.quality || 'Major',
      colorToken: finalColor,
      baseOctave,
      guitarFrets: [...stringFrets],
    };

    onSave(updated, index);
    onClose();
  };

  const slotIndices = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-y-auto select-none">
      {/* Top Bar */}
      <div className="h-14 bg-bg-surface border-b border-border-subtle px-4 md:px-6 flex items-center justify-between shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-xl bg-bg-elevated transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h2 className="text-sm md:text-base font-bold text-text-primary flex items-center gap-2">
          <span>Edit Pad: Button {index + 1}</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/30">
            {notes.length}/10 Notes
          </span>
        </h2>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/30 active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Save Pad</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
        {/* Header Data Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-bg-surface p-4 rounded-2xl border border-border-subtle">
          {/* Chord Name Input with Auto-detect button */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Chord Label
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Cmaj7"
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm font-mono font-bold text-text-primary outline-none focus:border-accent-primary"
              />
              <button
                onClick={handleAutoDetectName}
                title="Auto-detect chord name from selected notes"
                className="px-3 py-2 rounded-xl bg-bg-elevated hover:bg-border-subtle text-accent-primary border border-border-subtle text-xs font-medium flex items-center gap-1 shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Auto</span>
              </button>
            </div>
          </div>

          {/* Octave Step Counter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Base Octave
            </label>
            <div className="flex items-center justify-between bg-bg-elevated border border-border-subtle rounded-xl px-3 py-1.5 h-[42px]">
              <button
                onClick={() => setBaseOctave(Math.max(1, baseOctave - 1))}
                className="w-7 h-7 rounded-lg bg-bg-surface hover:bg-border-subtle text-text-primary font-bold flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-text-primary">
                Octave {baseOctave}
              </span>
              <button
                onClick={() => setBaseOctave(Math.min(6, baseOctave + 1))}
                className="w-7 h-7 rounded-lg bg-bg-surface hover:bg-border-subtle text-text-primary font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Input Interface
            </label>
            <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle h-[42px]">
              <button
                onClick={() => setViewMode('piano')}
                className={`flex-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'piano'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Piano Keyboard
              </button>
              <button
                onClick={() => setViewMode('guitar')}
                className={`flex-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'guitar'
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Guitar Fretboard
              </button>
            </div>
          </div>
        </div>

        {/* Instrument Visualizer Component */}
        <div className="bg-bg-surface p-4 rounded-2xl border border-border-subtle shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {viewMode === 'piano' ? 'Interactive Piano Keyboard' : 'Interactive Guitar Fretboard (One Fret Per String)'}
            </h3>
            <span className="text-[11px] text-text-secondary">
              {viewMode === 'piano'
                ? 'Tap keys to toggle notes'
                : 'Tap nut to open/mute, tap frets to position fingers'}
            </span>
          </div>

          {viewMode === 'piano' ? (
            <PianoKeyboard
              selectedNotes={notes}
              baseOctave={baseOctave}
              onToggleNote={handleTogglePianoNote}
            />
          ) : (
            <GuitarFretboard
              stringFrets={stringFrets}
              onChangeStringFrets={handleChangeGuitarFrets}
            />
          )}
        </div>

        {/* Selected Notes Slot Array (Up to 10) */}
        <div className="bg-bg-surface p-4 rounded-2xl border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Selected Notes Array ({notes.length}/10)
            </h3>
            {notes.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear Notes
              </button>
            )}
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {slotIndices.map((slotIdx) => {
              const note = notes[slotIdx];

              if (note) {
                return (
                  <div
                    key={slotIdx}
                    className="h-12 rounded-xl bg-accent-primary/20 border border-accent-primary/40 flex flex-col items-center justify-center relative group"
                  >
                    <span className="font-mono font-bold text-xs text-accent-primary">
                      {note}
                    </span>
                    <button
                      onClick={() => handleRemoveNote(note)}
                      title="Remove note"
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={slotIdx}
                  className="h-12 rounded-xl bg-bg-elevated/40 border border-dashed border-border-subtle flex items-center justify-center text-text-secondary/40 text-xs font-mono"
                >
                  +
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="h-16 bg-bg-surface border-t border-border-subtle px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviewPlay}
            disabled={notes.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Preview Chord</span>
          </button>

          {onOpenLibraryForPad && (
            <button
              onClick={onOpenLibraryForPad}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-primary text-xs font-medium border border-border-subtle transition-all"
            >
              <Music2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Library</span>
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/30 active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Apply to Pad</span>
        </button>
      </div>
    </div>
  );
};
