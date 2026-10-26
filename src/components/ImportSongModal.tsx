'use client';

import React, { useState, useMemo } from 'react';
import { X, FileText, Sparkles, Music, Check } from 'lucide-react';
import { Song, InstrumentType } from '../types';
import { parseSongText } from '../lib/chordParser';
import { getChordColor } from '../lib/theory';

interface ImportSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSong: (newSong: Song) => void;
}

const PLACEHOLDER_SAMPLE = `Title: Let It Be
Artist: The Beatles

[Verse 1]
C                G
When I find myself in times of trouble
Am            F
Mother Mary comes to me
C                G
Speaking words of wisdom
F       C
Let it be

[Chorus]
Am         C/G
Let it be, let it be
F          C
Let it be, let it be
G                F     C
Whisper words of wisdom, let it be`;

export const ImportSongModal: React.FC<ImportSongModalProps> = ({
  isOpen,
  onClose,
  onImportSong,
}) => {
  const [rawText, setRawText] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [instrument, setInstrument] = useState<InstrumentType>('acoustic_guitar');
  const [padCount, setPadCount] = useState<12 | 15>(15);

  // Live parsing
  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseSongText(rawText, padCount);
  }, [rawText, padCount]);

  if (!isOpen) return null;

  const handleApplyImport = () => {
    if (!parsed || parsed.sections.length === 0) {
      alert('Please paste some lyrics or chord lines to import.');
      return;
    }

    const title = customTitle.trim() || parsed.title || 'Imported Song';
    const artist = customArtist.trim() || parsed.artist || 'Unknown';

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title,
      artist,
      bpm: 110,
      keySignature: parsed.allUniqueChords[0] ? `${parsed.allUniqueChords[0]} Major` : 'C Major',
      instrument,
      padCount,
      playbackStyle: instrument === 'acoustic_guitar' ? 'strum_down' : 'block',
      strumSpeedMs: instrument === 'acoustic_guitar' ? 25 : 0,
      fadeDuration: 2.5,
      sections: parsed.sections,
      activeSectionId: parsed.sections[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onImportSong(newSong);
    onClose();
  };

  const handleLoadSample = () => {
    setRawText(PLACEHOLDER_SAMPLE);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-2xl w-full p-5 md:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">Import Song from Chords & Lyrics</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Metadata row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-text-secondary">Song Title</label>
              <input
                type="text"
                placeholder={parsed?.title || 'e.g. Let It Be'}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-secondary">Artist</label>
              <input
                type="text"
                placeholder={parsed?.artist || 'e.g. The Beatles'}
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          {/* Textarea for pasting lyrics + chords */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-text-secondary">
                Paste Song (Ultimate Guitar, ChordPro, or standard format)
              </label>
              {!rawText && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-[11px] text-accent-primary hover:underline"
                >
                  Load Example Sample
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste text with chords above lyrics or [bracketed] chords..."
              className="w-full bg-bg-app border border-border-subtle rounded-2xl p-3 font-mono text-xs text-text-primary outline-none focus:border-accent-primary resize-y"
            />
          </div>

          {/* Live Parser Analysis Card */}
          {parsed && parsed.totalChordsFound > 0 && (
            <div className="bg-bg-elevated/70 p-3.5 rounded-2xl border border-accent-primary/30 flex flex-col gap-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-accent-primary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Detected {parsed.allUniqueChords.length} Unique Chords ({parsed.totalChordsFound} total)</span>
                </span>
                <span className="text-text-secondary">{parsed.sections.length} Section(s)</span>
              </div>

              {/* Unique chord badges */}
              <div className="flex flex-wrap gap-1.5">
                {parsed.allUniqueChords.map((chord) => (
                  <span
                    key={chord}
                    style={{ backgroundColor: getChordColor(chord) }}
                    className="px-2 py-0.5 rounded-lg text-white font-mono font-bold text-xs shadow-sm"
                  >
                    {chord}
                  </span>
                ))}
              </div>

              {/* Sections Breakdown */}
              <div className="text-[11px] text-text-secondary flex flex-wrap gap-x-3 gap-y-1 pt-1 border-t border-border-subtle">
                {parsed.sections.map((s, idx) => {
                  const activeCount = s.chords.filter((c) => c.label !== 'Empty').length;
                  return (
                    <span key={idx} className="font-medium">
                      • <strong className="text-text-primary">{s.name}</strong> ({activeCount} chords)
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instrument & Grid Size Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-text-secondary">Instrument</label>
              <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle mt-1">
                <button
                  type="button"
                  onClick={() => setInstrument('acoustic_guitar')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    instrument === 'acoustic_guitar'
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Acoustic Guitar
                </button>
                <button
                  type="button"
                  onClick={() => setInstrument('grand_piano')}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    instrument === 'grand_piano'
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Grand Piano
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-text-secondary">Pad Layout</label>
              <div className="flex bg-bg-elevated p-1 rounded-xl border border-border-subtle mt-1">
                <button
                  type="button"
                  onClick={() => setPadCount(15)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    padCount === 15
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  15 Pads
                </button>
                <button
                  type="button"
                  onClick={() => setPadCount(12)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                    padCount === 12
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  12 Pads
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-secondary text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyImport}
            disabled={!parsed || parsed.totalChordsFound === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/25 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Create Song from Lyrics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

