'use client';

import React from 'react';
import { Menu, BookOpen, Settings, Share2, FileUp, ScrollText } from 'lucide-react';
import { Song } from '../types';

interface HeaderProps {
  song: Song;
  onOpenDrawer: () => void;
  onOpenLibrary: () => void;
  onOpenSettings: () => void;
  onOpenImport?: () => void;
  onShare: () => void;
  isLyricsMode?: boolean;
  onToggleLyrics?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  song,
  onOpenDrawer,
  onOpenLibrary,
  onOpenSettings,
  onOpenImport,
  onShare,
  isLyricsMode = false,
  onToggleLyrics,
}) => {
  const getInstrumentName = () => {
    switch (song.instrument) {
      case 'acoustic_guitar':
        return 'Acoustic Guitar';
      case 'grand_piano':
        return 'Grand Piano';
      case 'rhodes':
        return 'Rhodes EP';
      case 'synth_pad':
        return 'Synth Pad';
      default:
        return 'Piano';
    }
  };

  return (
    <header className="h-14 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-3 md:px-5 sticky top-0 z-30 select-none">
      {/* Left: Drawer Hamburger & Quick Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenDrawer}
          aria-label="Open song list"
          className="w-10 h-10 rounded-xl bg-bg-elevated hover:bg-border-subtle flex items-center justify-center text-text-primary transition-all active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col text-left min-w-0">
          <h1 className="text-base md:text-lg font-bold text-text-primary leading-tight line-clamp-1">
            {song.title}
          </h1>
          <span className="text-xs text-text-secondary hidden sm:flex items-center gap-1.5">
            <span className="text-accent-primary font-medium">{song.keySignature}</span>
            <span>•</span>
            <span>{song.bpm} BPM</span>
            <span>•</span>
            <span className="capitalize">{getInstrumentName()}</span>
          </span>
        </div>
      </div>

      {/* Right: Actions (Import, Share, Library, Settings) */}
      <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
        {onToggleLyrics && (
          <button
            onClick={onToggleLyrics}
            title={isLyricsMode ? 'Back to pads' : 'Show lyrics & play along'}
            aria-pressed={isLyricsMode}
            className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all active:scale-95 ${
              isLyricsMode
                ? 'bg-amber-500 text-black border-amber-400'
                : 'bg-bg-elevated hover:bg-border-subtle text-amber-400 border-amber-500/20'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span className="hidden sm:inline">Lyrics</span>
          </button>
        )}
        {onOpenImport && (
          <button
            onClick={onOpenImport}
            title="Import song from lyrics & chords"
            className="h-9 px-3 rounded-xl bg-bg-elevated hover:bg-border-subtle text-cyan-400 border border-cyan-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
        )}

        <button
          onClick={onShare}
          title="Share song with friends"
          className="h-9 px-3 rounded-xl bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary border border-accent-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={onOpenLibrary}
          title="Open chord library"
          className="h-9 px-3 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-primary text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95"
        >
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Library</span>
        </button>

        <button
          onClick={onOpenSettings}
          title="Sound & Pad Settings"
          className="w-9 h-9 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-primary flex items-center justify-center transition-all active:scale-95"
        >
          <Settings className="w-4 h-4 text-text-secondary hover:text-text-primary" />
        </button>
      </div>
    </header>
  );
};
