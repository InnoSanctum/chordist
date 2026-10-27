'use client';

import React, { useState } from 'react';
import { X, Play, Plus, BookOpen, Sparkles, Search, Check } from 'lucide-react';
import { CHORD_PROGRESSIONS } from '../lib/defaultSongs';
import { ChordData, InstrumentType, PlaybackStyle } from '../types';
import {
  getChordColor,
  ALL_CHORD_ROOTS,
  ALL_CHORD_QUALITIES,
  ChordQualityDef,
  buildChordFromRootAndQuality,
} from '../lib/theory';
import { audioEngine } from '../lib/audioEngine';
import { getVoicingForChord } from '../lib/guitarVoicings';

interface ChordLibraryModalProps {
  isOpen: boolean;
  instrument: InstrumentType;
  playbackStyle: PlaybackStyle;
  strumSpeedMs: number;
  fadeDuration: number;
  padCount?: number;
  targetPadIndex?: number | null;
  onClose: () => void;
  onImportProgression: (chords: ChordData[]) => void;
  onSelectDictionaryChord?: (chord: ChordData, targetPadIndex?: number) => void;
}

export const ChordLibraryModal: React.FC<ChordLibraryModalProps> = ({
  isOpen,
  instrument,
  playbackStyle,
  strumSpeedMs,
  fadeDuration,
  padCount = 15,
  targetPadIndex,
  onClose,
  onImportProgression,
  onSelectDictionaryChord,
}) => {
  const [activeTab, setActiveTab] = useState<'dictionary' | 'progressions'>('dictionary');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [progressionSearchQuery, setProgressionSearchQuery] = useState<string>('');

  // Dictionary state
  const [dictRoot, setDictRoot] = useState<string>('C');
  const [dictCategory, setDictCategory] = useState<ChordQualityDef['category']>('Triads');
  const [selectedQuality, setSelectedQuality] = useState<ChordQualityDef>(ALL_CHORD_QUALITIES[0]);
  const [dictSearchQuery, setDictSearchQuery] = useState<string>('');
  const [chosenPadIndex, setChosenPadIndex] = useState<number>(
    targetPadIndex !== null && targetPadIndex !== undefined ? targetPadIndex : 0
  );

  if (!isOpen) return null;

  const categories = ['All', 'Jazz', 'Pop', 'Rock', 'Neo-Soul', 'Blues'];
  const qualityCategories: ChordQualityDef['category'][] = [
    'Triads',
    '7ths',
    'Add & 6ths',
    'Extended',
    'Altered',
  ];

  const filteredProgressions = CHORD_PROGRESSIONS.filter((prog) => {
    const matchesCategory = selectedCategory === 'All' || prog.category === selectedCategory;
    const matchesSearch =
      prog.name.toLowerCase().includes(progressionSearchQuery.toLowerCase()) ||
      prog.description.toLowerCase().includes(progressionSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered qualities in Dictionary
  const filteredQualities = ALL_CHORD_QUALITIES.filter((q) => {
    const matchesCategory = dictSearchQuery.trim() !== '' || q.category === dictCategory;
    const matchesSearch =
      dictSearchQuery.trim() === '' ||
      q.name.toLowerCase().includes(dictSearchQuery.toLowerCase()) ||
      q.symbol.toLowerCase().includes(dictSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayChord = (notes: string[]) => {
    if (audioEngine && notes.length > 0) {
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

  // Build the currently selected chord from root and quality
  const currentBuiltChord = buildChordFromRootAndQuality(dictRoot, selectedQuality, 3);
  const currentVoicing = getVoicingForChord(currentBuiltChord.label, currentBuiltChord.notes);

  const handleApplyDictChord = () => {
    const newChord: ChordData = {
      id: `chord-${Date.now()}`,
      label: currentBuiltChord.label,
      notes: [...currentBuiltChord.notes],
      root: currentBuiltChord.root,
      chordType: currentBuiltChord.chordType,
      colorToken: currentBuiltChord.color,
      baseOctave: 3,
      guitarFrets: currentVoicing,
    };

    if (onSelectDictionaryChord) {
      onSelectDictionaryChord(newChord, chosenPadIndex);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-between overflow-y-auto select-none">
      {/* Top Header */}
      <div className="h-14 bg-bg-surface border-b border-border-subtle px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-text-primary">Chord Library & Builder</h2>
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
            onClick={() => setActiveTab('dictionary')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dictionary'
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Chord Dictionary & Builder
          </button>
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
        </div>

        {activeTab === 'progressions' ? (
          <input
            type="text"
            placeholder="Search progressions..."
            value={progressionSearchQuery}
            onChange={(e) => setProgressionSearchQuery(e.target.value)}
            className="bg-bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary w-40 sm:w-56"
          />
        ) : (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quality (e.g. dim, 13, add)..."
              value={dictSearchQuery}
              onChange={(e) => setDictSearchQuery(e.target.value)}
              className="bg-bg-surface border border-border-subtle rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary w-40 sm:w-64"
            />
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-y-auto">
        {activeTab === 'dictionary' ? (
          /* Chord Dictionary & Builder Tab */
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex flex-col gap-5">
            {/* 1. All 12 Roots */}
            <div>
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                1. Select Root Note ({dictRoot})
              </h3>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                {ALL_CHORD_ROOTS.map((r) => (
                  <button
                    key={r.root}
                    onClick={() => {
                      setDictRoot(r.root);
                      handlePlayChord(
                        buildChordFromRootAndQuality(r.root, selectedQuality, 3).notes
                      );
                    }}
                    className={`h-10 rounded-xl font-mono text-xs font-bold transition-all ${
                      dictRoot === r.root
                        ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/30 scale-105'
                        : 'bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary border border-border-subtle'
                    }`}
                  >
                    {r.display}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Quality Categories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  2. Select Chord Quality
                </h3>
                {dictSearchQuery && (
                  <span className="text-[11px] text-accent-primary font-medium">
                    Showing search results
                  </span>
                )}
              </div>

              {!dictSearchQuery && (
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {qualityCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setDictCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                        dictCategory === cat
                          ? 'bg-cyan-500 text-bg-app font-bold shadow-sm'
                          : 'bg-bg-elevated text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Qualities Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                {filteredQualities.map((q) => {
                  const isSelected = selectedQuality.id === q.id;
                  const label = `${dictRoot}${q.symbol}`;
                  const chordColor = getChordColor(label);

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuality(q);
                        handlePlayChord(
                          buildChordFromRootAndQuality(dictRoot, q, 3).notes
                        );
                      }}
                      className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                        isSelected
                          ? 'bg-accent-primary/20 border-accent-primary shadow-md scale-[1.02]'
                          : 'bg-bg-elevated/70 hover:bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isSelected ? 'text-accent-primary' : 'text-text-primary'
                          }`}
                        >
                          {label}
                        </span>
                        <div
                          style={{ backgroundColor: chordColor }}
                          className="w-2.5 h-2.5 rounded-full"
                        />
                      </div>
                      <span className="text-[11px] text-text-secondary truncate">
                        {q.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Chord Detail & Target Pad Bar */}
            <div className="mt-2 bg-bg-elevated p-4 rounded-2xl border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div
                  style={{ backgroundColor: currentBuiltChord.color }}
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-mono font-extrabold text-lg shadow-lg shrink-0"
                >
                  {currentBuiltChord.label}
                </div>
                <div>
                  <h4 className="font-mono font-bold text-base text-text-primary">
                    {dictRoot} {selectedQuality.name}
                  </h4>
                  <span className="text-xs font-mono text-cyan-400 block truncate max-w-xs sm:max-w-md">
                    Notes: {currentBuiltChord.notes.join(' - ')}
                  </span>
                </div>
              </div>

              {/* Target Pad Selector & Actions */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {/* Target pad selector */}
                <div className="flex items-center gap-1.5 bg-bg-surface px-2.5 py-1.5 rounded-xl border border-border-subtle">
                  <span className="text-[11px] text-text-secondary font-semibold">Pad:</span>
                  <select
                    value={chosenPadIndex}
                    onChange={(e) => setChosenPadIndex(Number(e.target.value))}
                    className="bg-transparent text-xs font-bold text-text-primary outline-none cursor-pointer"
                  >
                    {Array.from({ length: padCount }, (_, idx) => (
                      <option key={idx} value={idx} className="bg-bg-surface text-text-primary">
                        Button {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handlePlayChord(currentBuiltChord.notes)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={handleApplyDictChord}
                  className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-accent-primary/30 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Pad {chosenPadIndex + 1}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Curated Progressions Tab */
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
                    <span>Import to Current Section</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
