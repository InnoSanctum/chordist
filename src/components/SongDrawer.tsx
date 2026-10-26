'use client';

import React, { useState } from 'react';
import { X, Plus, Music2, Copy, Check, Trash2, CopyPlus, Cloud, HardDrive, Share2, FileUp, LogOut } from 'lucide-react';
import { Song } from '../types';

interface SongDrawerProps {
  isOpen: boolean;
  songs: Song[];
  activeSongId: string;
  isTursoActive: boolean;
  onClose: () => void;
  onSelectSong: (id: string) => void;
  onCreateSong: () => void;
  onOpenImport: () => void;
  onDuplicateSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onOpenShareModal: (song: Song) => void;
  onLogout: () => void;
}

export const SongDrawer: React.FC<SongDrawerProps> = ({
  isOpen,
  songs,
  activeSongId,
  isTursoActive,
  onClose,
  onSelectSong,
  onCreateSong,
  onOpenImport,
  onDuplicateSong,
  onDeleteSong,
  onOpenShareModal,
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex select-none animate-fadeIn">
      {/* Drawer Panel */}
      <div className="w-80 sm:w-96 bg-bg-surface border-r border-border-subtle h-full flex flex-col justify-between p-4 shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">Song Library</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-2">
          {songs.map((s) => {
            const isActive = s.id === activeSongId;

            return (
              <div
                key={s.id}
                onClick={() => {
                  onSelectSong(s.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-accent-primary/15 border-accent-primary shadow-sm'
                    : 'bg-bg-elevated/60 hover:bg-bg-elevated border-border-subtle text-text-secondary'
                }`}
              >
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-bold truncate ${
                      isActive ? 'text-accent-primary' : 'text-text-primary'
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="text-[11px] text-text-secondary truncate">
                    {s.artist || 'Unknown Artist'} • {s.keySignature} • {s.bpm} BPM
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenShareModal(s);
                    }}
                    title="Share song"
                    className="p-1.5 rounded-lg hover:bg-accent-primary/20 hover:text-accent-primary text-text-secondary transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSong(s);
                    }}
                    title="Duplicate song"
                    className="p-1.5 rounded-lg hover:bg-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <CopyPlus className="w-3.5 h-3.5" />
                  </button>

                  {songs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${s.title}"?`)) {
                          onDeleteSong(s.id);
                        }
                      }}
                      title="Delete song"
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-text-secondary hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions & Database Status */}
        <div className="pt-3 border-t border-border-subtle flex flex-col gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onCreateSong();
                onClose();
              }}
              className="py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-accent-primary/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Song</span>
            </button>

            <button
              onClick={() => {
                onOpenImport();
                onClose();
              }}
              className="py-2.5 rounded-xl bg-bg-elevated hover:bg-border-subtle text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <FileUp className="w-4 h-4" />
              <span>Import Lyrics</span>
            </button>
          </div>

          {/* Database indicator & Logout */}
          <div className="flex items-center justify-between text-[11px] text-text-secondary px-1 pt-1">
            <span className="flex items-center gap-1.5">
              {isTursoActive ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-cyan-400 font-medium">Turso Synced</span>
                </>
              ) : (
                <>
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Offline Ready</span>
                </>
              )}
            </span>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              title="Lock / Logout"
              className="flex items-center gap-1 text-text-secondary hover:text-rose-400 p-1 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop click area */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
