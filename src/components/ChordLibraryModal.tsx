'use client';

import React, { useState } from 'react';
import { X, Play, Plus, BookOpen, Sparkles } from 'lucide-react';
import {
  CHORD_PROGRESSIONS,
  CHORD_DICTIONARY,
} from '../lib/defaultSongs';
import { ChordData, InstrumentType, PlaybackStyle } from '../types';
import { getChordColor } from '../lib/theory';
import { audioEngine } from '../lib/audioEngine';

interface ChordLibraryModalProps {
  isOpen: boolean;
  instrument: InstrumentType;
  playbackStyle: PlaybackStyle;
  strumSpeedMs: number;
  fadeDuration: number;
  onClose: () => void;
  onImportProgression: (chords: ChordData[]) => void;
  onSelectDictionaryChord?: (chord: ChordData) => void;
}

export const ChordLibraryModal: React.FC<ChordLibraryModalProps> = ({
  isOpen,
  instrument,
  playbackStyle,
  strumSpeedMs,
  fadeDuration,
  onClose,
  onImportProgression,
  onSelectDictionaryChord,
}) => {
  const [activeTab, setActiveTab] = useState<'progressions' | 'dictionary'>('progressions');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dictionary state
  const [dictRoot, setDictRoot] = useState<string>('C');
  const [dictType, setDictType] = useState<string>('maj7');

  if (!isOpen) return null;

  const categories = ['All', 'Jazz', 'Pop', 'Rock', 'Neo-Soul', 'Blues'];

  const filteredProgressions = CHORD_PROGRESSIONS.filter((prog) => {
    const matchesCategory = selectedCategory === 'All' || prog.category === selectedCategory;
    const matchesSearch =
      prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayChord = (notes: string[]) => {
    if (audioEngine) {
      audioEngine.playChord(notes, {
        instrument,
        playbackStyle,
        strumSpeedMs,
        fadeDuration,
      });
    }
  };

  const handleApplyProgression = (prog: typeof CHORD_PROGRESSIONS[0]) => {
    const formattedChords: ChordData[] = prog.chords.map((c, idx) => ({
      id: `prog-${Date.now()}-${idx}`,
      label: c.label,
      notes: [...c.notes],
      root: c.root,
      chordType: c.chordType,
      colorToken: getChordColor(c.label),
      baseOctave: 4,
    }));

    onImportProgression(formattedChords);
    onClose();
  };

  const currentDictNotes = CHORD_DICTIONARY[dictRoot]?.[dictType] || ['C3', 'E3', 'G3', 'C4'];
  const currentDictLabel = `${dictRoot}${dictType === 'Major' ? '' : dictType}`;

  const handleApplyDictChord = () => {
    const newChord: ChordData = {
      id: `dict-${Date.now()}`,
      label: currentDictLabel,
      notes: [...currentDictNotes],
      root: dictRoot,
      chordType: dictType,
      colorToken: getChordColor(currentDictLabel),
      baseOctave: 4,
    };

    if (onSelectDictionaryChord) {
      onSelectDictionaryChord(newChord);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-y-auto select-none">
      {/* Top Header */}
      <div className="h-14 bg-bg-surface border-b border-border-subtle px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-text-primary">Chord Library & Progressions</h2>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-bg-app border-b border-border-subtle px-4 md:px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle">
          <button
            onClick={() => setActiveTab('progressions')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'progressions'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Curated Progressions
          </button>
          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dictionary'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Chord Dictionary & Voicings
          </button>
        </div>

        {activeTab === 'progressions' && (
          <input
            type="text"
            placeholder="Search progressions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary w-40 sm:w-56"
          />
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-y-auto">
        {activeTab === 'progressions' ? (
          <div className="flex flex-col gap-4">
            {/* Category Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-accent-primary text-white'
                      : 'bg-bg-surface hover:bg-bg-elevated text-text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Progressions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredProgressions.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-bg-surface border border-border-subtle rounded-2xl p-4 flex flex-col justify-between hover:border-accent-primary/50 transition-all shadow-md group"
                >
                  <div className="flex flex-col gap-1.5 mb-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                        {prog.name}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary border border-border-subtle">
                        {prog.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {prog.description}
                    </p>
                  </div>

                  {/* Chord sequence pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {prog.chords.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handlePlayChord(c.notes)}
                        title={`Listen to ${c.label}`}
                        style={{ backgroundColor: getChordColor(c.label) }}
                        className="px-2.5 py-1 rounded-lg text-white font-mono font-bold text-xs flex items-center gap-1 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Import button */}
                  <button
                    onClick={() => handleApplyProgression(prog)}
                    className="w-full py-2 rounded-xl bg-accent-primary/20 hover:bg-accent-primary text-accent-primary hover:text-white border border-accent-primary/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Import to Section</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Chord Dictionary Tab */
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex flex-col gap-5">
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                1. Select Root Note
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CHORD_DICTIONARY).map((root) => (
                  <button
                    key={root}
                    onClick={() => setDictRoot(root)}
                    className={`w-10 h-10 rounded-xl font-mono font-bold text-sm transition-all ${
                      dictRoot === root
                        ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/30 scale-105'
                        : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-border-subtle'
                    }`}
                  >
                    {root}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                2. Select Chord Quality
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(CHORD_DICTIONARY[dictRoot] || {}).map((q) => (
                  <button
                    key={q}
                    onClick={() => setDictType(q)}
                    className={`px-3.5 py-2 rounded-xl font-mono text-xs font-semibold transition-all ${
                      dictType === q
                        ? 'bg-cyan-500 text-bg-app shadow-md shadow-cyan-500/30 font-bold scale-105'
                        : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-border-subtle'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Chord Card Preview */}
            <div className="mt-2 bg-bg-elevated p-4 rounded-xl border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: getChordColor(currentDictLabel) }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-mono font-extrabold text-xl shadow-lg"
                >
                  {currentDictLabel}
                </div>
                <div>
                  <h4 className="font-mono font-bold text-base text-text-primary">
                    {dictRoot} {dictType}
                  </h4>
                  <span className="text-xs font-mono text-cyan-400">
                    Notes: {currentDictNotes.join(' - ')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handlePlayChord(currentDictNotes)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview</span>
                </button>

                {onSelectDictionaryChord && (
                  <button
                    onClick={handleApplyDictChord}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-accent-primary/30 transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Apply to Pad</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
