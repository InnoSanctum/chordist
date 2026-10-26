'use client';

import React from 'react';
import { X, Volume2, Music, Sliders, Play, LayoutGrid } from 'lucide-react';
import { Song, InstrumentType, PlaybackStyle } from '../types';
import { audioEngine } from '../lib/audioEngine';

interface SettingsModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSong: (updatedFields: Partial<Song>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  song,
  isOpen,
  onClose,
  onUpdateSong,
}) => {
  if (!isOpen) return null;

  const handleTestAudio = () => {
    if (audioEngine) {
      audioEngine.playChord(['C3', 'G3', 'C4', 'E4'], {
        instrument: song.instrument,
        playbackStyle: song.playbackStyle,
        strumSpeedMs: song.strumSpeedMs,
        fadeDuration: song.fadeDuration,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto select-none">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-lg w-full p-5 md:p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">Settings & Sound Engine</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-1">
          {/* Song Metadata */}
          <div className="bg-bg-elevated/60 p-3.5 rounded-2xl border border-border-subtle flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Song Metadata
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-text-secondary">Title</label>
                <input
                  type="text"
                  value={song.title}
                  onChange={(e) => onUpdateSong({ title: e.target.value })}
                  className="w-full bg-bg-surface border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-secondary">Artist</label>
                <input
                  type="text"
                  value={song.artist}
                  onChange={(e) => onUpdateSong({ artist: e.target.value })}
                  className="w-full bg-bg-surface border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-text-secondary">Tempo (BPM)</label>
                <input
                  type="number"
                  min="40"
                  max="240"
                  value={song.bpm}
                  onChange={(e) => onUpdateSong({ bpm: parseInt(e.target.value, 10) || 120 })}
                  className="w-full bg-bg-surface border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
              <div>
                <label className="text-[11px] text-text-secondary">Key Signature</label>
                <input
                  type="text"
                  value={song.keySignature}
                  onChange={(e) => onUpdateSong({ keySignature: e.target.value })}
                  className="w-full bg-bg-surface border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Sound Timbre */}
          <div className="bg-bg-elevated/60 p-3.5 rounded-2xl border border-border-subtle flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-accent-primary" />
              <span>Instrument Sound Output</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'acoustic_guitar', label: 'Clean Acoustic Guitar' },
                { id: 'grand_piano', label: 'Grand Piano' },
                { id: 'rhodes', label: 'Rhodes EP' },
                { id: 'synth_pad', label: 'Ambient Synth Pad' },
              ].map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => onUpdateSong({ instrument: inst.id as InstrumentType })}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold text-left transition-all ${
                    song.instrument === inst.id
                      ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20'
                      : 'bg-bg-surface hover:bg-border-subtle text-text-secondary'
                  }`}
                >
                  {inst.label}
                </button>
              ))}
            </div>
          </div>

          {/* Playback Envelope & Fade-out Duration */}
          <div className="bg-bg-elevated/60 p-3.5 rounded-2xl border border-border-subtle flex flex-col gap-3">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Sound Envelope & Strumming
            </h3>

            {/* Playback style */}
            <div className="flex bg-bg-surface p-1 rounded-xl border border-border-subtle">
              {[
                { id: 'strum_down', label: 'Strum Down' },
                { id: 'strum_up', label: 'Strum Up' },
                { id: 'block', label: 'Block Chord' },
                { id: 'arpeggio', label: 'Arpeggio' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => onUpdateSong({ playbackStyle: st.id as PlaybackStyle })}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    song.playbackStyle === st.id
                      ? 'bg-accent-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Strum Speed Slider */}
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Strum Speed / Delay</span>
                <span className="font-mono text-text-primary">{song.strumSpeedMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={song.strumSpeedMs}
                onChange={(e) => onUpdateSong({ strumSpeedMs: parseInt(e.target.value, 10) })}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>

            {/* Fade Duration Slider */}
            <div>
              <div className="flex justify-between text-xs text-text-secondary mb-1">
                <span>Chord Fade-Out Duration</span>
                <span className="font-mono text-text-primary">{song.fadeDuration.toFixed(1)} s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={song.fadeDuration}
                onChange={(e) => onUpdateSong({ fadeDuration: parseFloat(e.target.value) })}
                className="w-full accent-accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Pad Grid Size: 12 vs 15 */}
          <div className="bg-bg-elevated/60 p-3.5 rounded-2xl border border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-accent-primary" />
              <div>
                <h4 className="text-xs font-bold text-text-primary">Main Screen Pad Count</h4>
                <p className="text-[11px] text-text-secondary">
                  Choose between 15 pads (3x5) or 12 pads (3x4)
                </p>
              </div>
            </div>

            <div className="flex bg-bg-surface p-1 rounded-xl border border-border-subtle">
              <button
                onClick={() => onUpdateSong({ padCount: 15 })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  song.padCount === 15
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                15 Pads
              </button>
              <button
                onClick={() => onUpdateSong({ padCount: 12 })}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  song.padCount === 12
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                12 Pads
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <button
            onClick={handleTestAudio}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Sound Output</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
