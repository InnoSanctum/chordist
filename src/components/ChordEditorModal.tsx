'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Play,
  Trash2,
  Wand2,
  Music2,
  Palette,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { ChordData, InstrumentType, PlaybackStyle } from '../types';
import { PianoKeyboard } from './PianoKeyboard';
import { GuitarFretboard } from './GuitarFretboard';
import {
  detectChordName,
  getChordColor,
  PAD_COLOR_PRESETS,
  ALL_CHORD_ROOTS,
  ALL_CHORD_QUALITIES,
  ChordQualityDef,
  buildChordFromRootAndQuality,
  parseAndBuildChord,
} from '../lib/theory';
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
  onRemovePad?: (index: number) => void; // only passed for pads beyond the base 12/15 grid
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
  onRemovePad,
}) => {
  const [label, setLabel] = useState(chord.label);
  const [notes, setNotes] = useState<string[]>(chord.notes || []);
  const [baseOctave, setBaseOctave] = useState<number>(chord.baseOctave || 4);
  const [colorToken, setColorToken] = useState<string>(
    chord.colorToken || getChordColor(chord.label)
  );
  const [viewMode, setViewMode] = useState<'piano' | 'guitar'>(
    instrument === 'acoustic_guitar' ? 'guitar' : 'piano'
  );

  // Quick Builder state
  const [isBuilderOpen, setIsBuilderOpen] = useState(true);
  const [selectedRoot, setSelectedRoot] = useState<string>(chord.root || 'C');
  const [activeQualityCategory, setActiveQualityCategory] = useState<
    ChordQualityDef['category']
  >('Triads');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

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
    const newVoicing = getVoicingForChord(label, newNotes);
    setStringFrets(newVoicing);

    if (!label || label === 'Empty' || label.includes('Custom')) {
      const detected = detectChordName(newNotes);
      if (detected.name) {
        setLabel(detected.name);
        setColorToken(detected.color);
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
        setColorToken(detected.color);
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
    setColorToken(detected.color);
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

  // Quick Builder: Apply Root + Quality
  const handleSelectQuality = (qualityDef: ChordQualityDef) => {
    const built = buildChordFromRootAndQuality(selectedRoot, qualityDef, baseOctave);
    setLabel(built.label);
    setNotes(built.notes);
    setColorToken(built.color);
    const voicing = getVoicingForChord(built.label, built.notes);
    setStringFrets(voicing);

    // Audio preview
    if (audioEngine && built.notes.length > 0) {
      audioEngine.playChord(built.notes, {
        instrument,
        playbackStyle,
        strumSpeedMs,
        fadeDuration,
      });
    }
  };

  // Quick Builder: Freeform Search Load (e.g. "C#m7b5", "Bb9", "E7#9")
  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearchQuery.trim()) return;

    const built = parseAndBuildChord(quickSearchQuery, baseOctave);
    if (built) {
      setLabel(built.label);
      setNotes(built.notes);
      setColorToken(built.color);
      setSelectedRoot(built.root);
      const voicing = getVoicingForChord(built.label, built.notes);
      setStringFrets(voicing);

      if (audioEngine && built.notes.length > 0) {
        audioEngine.playChord(built.notes, {
          instrument,
          playbackStyle,
          strumSpeedMs,
          fadeDuration,
        });
      }
      setQuickSearchQuery('');
    } else {
      alert(`Could not parse chord "${quickSearchQuery}". Try e.g. "G7", "C#m7", "Fadd9", "Bdim7", "E13".`);
    }
  };

  const handleSave = () => {
    if (notes.length === 0) {
      alert('Please select at least 1 note for the chord.');
      return;
    }

    const detected = detectChordName(notes);
    const finalLabel = label.trim() || detected.name;
    const finalColor = colorToken || getChordColor(finalLabel);

    const updated: ChordData = {
      ...chord,
      label: finalLabel,
      notes: [...notes],
      root: detected.root || selectedRoot || 'C',
      chordType: detected.quality || 'Major',
      colorToken: finalColor,
      baseOctave,
      guitarFrets: [...stringFrets],
    };

    onSave(updated, index);
    onClose();
  };

  const slotIndices = Array.from({ length: 10 }, (_, i) => i);
  const categories: ChordQualityDef['category'][] = [
    'Triads',
    '7ths',
    'Add & 6ths',
    'Extended',
    'Altered',
  ];

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
          <span>Edit Pad {index + 1}</span>
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
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col gap-4">
        {/* Top Configuration & Live Preview Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-bg-surface p-4 rounded-2xl border border-border-subtle items-center">
          {/* Chord Name Input with Auto-detect */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
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
                <span>Auto</span>
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

          {/* Live Pad Preview */}
          <div className="flex flex-col gap-1.5 items-center justify-center">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider text-center">
              Pad Preview
            </label>
            <div
              style={{ backgroundColor: colorToken }}
              className="w-full h-[42px] rounded-xl flex items-center justify-center text-white font-mono font-bold text-sm shadow-md transition-colors"
            >
              <span>{label || 'Empty'}</span>
            </div>
          </div>
        </div>

        {/* Pad Color Selector Bar */}
        <div className="bg-bg-surface p-4 rounded-2xl border border-border-subtle flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5 text-accent-primary" />
              <span>Pad Color</span>
            </div>
            <button
              onClick={() => setColorToken(getChordColor(label))}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Reset to Theory Color
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {PAD_COLOR_PRESETS.map((preset) => (
              <button
                key={preset.hex}
                onClick={() => setColorToken(preset.hex)}
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
                className={`w-7 h-7 rounded-lg shadow-sm transition-all transform hover:scale-110 ${
                  colorToken.toLowerCase() === preset.hex.toLowerCase()
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-surface scale-110'
                    : 'opacity-85 hover:opacity-100'
                }`}
              />
            ))}

            {/* Custom color picker */}
            <label
              title="Custom Hex Color"
              className="relative flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-elevated border border-border-subtle text-[11px] font-mono text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            >
              <input
                type="color"
                value={colorToken.startsWith('#') ? colorToken : '#10B981'}
                onChange={(e) => setColorToken(e.target.value)}
                className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
              />
              <span className="uppercase">{colorToken}</span>
            </label>
          </div>
        </div>

        {/* Quick Chord Builder & Library section */}
        <div className="bg-bg-surface rounded-2xl border border-border-subtle overflow-hidden">
          {/* Header toggle */}
          <div
            onClick={() => setIsBuilderOpen(!isBuilderOpen)}
            className="p-3.5 bg-bg-surface hover:bg-bg-elevated cursor-pointer flex items-center justify-between border-b border-border-subtle transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Quick Chord Builder & Library
              </h3>
              <span className="text-[10px] text-text-secondary font-medium">
                (Generate 7th, 9th, 13th, Dim, Add for any root)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenLibraryForPad && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLibraryForPad();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-bg-elevated hover:bg-border-subtle text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Music2 className="w-3 h-3" />
                  <span>Full Library</span>
                </button>
              )}
              {isBuilderOpen ? (
                <ChevronUp className="w-4 h-4 text-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              )}
            </div>
          </div>

          {isBuilderOpen && (
            <div className="p-4 flex flex-col gap-3.5 bg-bg-elevated/40">
              {/* Freeform Search Bar */}
              <form onSubmit={handleQuickSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={quickSearchQuery}
                    onChange={(e) => setQuickSearchQuery(e.target.value)}
                    placeholder="Type any chord (e.g. C#m7b5, Bbadd9, E7#9, G13, F#dim7)..."
                    className="w-full bg-bg-surface border border-border-subtle rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-text-primary outline-none focus:border-accent-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                >
                  Load Chord
                </button>
              </form>

              {/* 1. All 12 Chromatic Roots */}
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  1. Root Note
                </span>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                  {ALL_CHORD_ROOTS.map((r) => (
                    <button
                      key={r.root}
                      onClick={() => setSelectedRoot(r.root)}
                      className={`h-9 rounded-xl font-mono text-xs font-bold transition-all ${
                        selectedRoot === r.root
                          ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/30 scale-105'
                          : 'bg-bg-surface hover:bg-border-subtle text-text-secondary hover:text-text-primary border border-border-subtle'
                      }`}
                    >
                      {r.display}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Quality Category Switcher */}
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  2. Chord Quality ({selectedRoot}...)
                </span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar mb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveQualityCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                        activeQualityCategory === cat
                          ? 'bg-cyan-500 text-bg-app font-bold'
                          : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border-subtle'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Qualities Grid */}
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CHORD_QUALITIES.filter(
                    (q) => q.category === activeQualityCategory
                  ).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuality(q)}
                      className="px-2.5 py-1.5 rounded-xl bg-bg-surface hover:bg-accent-primary/20 hover:border-accent-primary border border-border-subtle text-text-primary hover:text-accent-primary transition-all text-xs font-mono font-medium flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                      <span className="font-bold text-white">
                        {selectedRoot}
                        {q.symbol}
                      </span>
                      <span className="text-[10px] text-text-secondary opacity-75">
                        ({q.name})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Interface Switcher (Piano / Guitar) */}
        <div className="flex items-center justify-between bg-bg-surface px-4 py-2.5 rounded-2xl border border-border-subtle">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Edit Notes Manually
          </span>
          <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle">
            <button
              onClick={() => setViewMode('piano')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'piano'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Piano Keyboard
            </button>
            <button
              onClick={() => setViewMode('guitar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'guitar'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Guitar Fretboard
            </button>
          </div>
        </div>

        {/* Instrument Visualizer Component */}
        <div className="bg-bg-surface p-4 rounded-2xl border border-border-subtle shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              {viewMode === 'piano'
                ? 'Interactive Piano Keyboard'
                : 'Interactive Guitar Fretboard (One Fret Per String)'}
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
          {onRemovePad && (
            <button
              onClick={() => onRemovePad(index)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/15 text-xs font-bold transition-all active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Pad</span>
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
