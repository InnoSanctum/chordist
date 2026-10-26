'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { SectionSwitcher } from '../components/SectionSwitcher';
import { ChordGrid } from '../components/ChordGrid';
import { ChordEditorModal } from '../components/ChordEditorModal';
import { ChordLibraryModal } from '../components/ChordLibraryModal';
import { SettingsModal } from '../components/SettingsModal';
import { SongDrawer } from '../components/SongDrawer';
import { ShareModal } from '../components/ShareModal';
import { LoginModal } from '../components/LoginModal';
import { ImportSongModal } from '../components/ImportSongModal';
import { INITIAL_SONGS } from '../lib/defaultSongs';
import { Song, ChordData, SongSection } from '../types';
import { audioEngine } from '../lib/audioEngine';
import { getChordColor } from '../lib/theory';
import { isAuthenticated, setAuthenticated } from '../lib/auth';

const STORAGE_KEY = 'chordist_songs_v1';
const ACTIVE_SONG_KEY = 'chordist_active_song_id';

export default function Home() {
  const [isAuthed, setIsAuthed] = useState<boolean>(true); // start optimistic, check in effect
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [activeSongId, setActiveSongId] = useState<string>(INITIAL_SONGS[0].id);
  const [isTursoActive, setIsTursoActive] = useState<boolean>(false);

  // Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingChordState, setEditingChordState] = useState<{
    chord: ChordData;
    index: number;
  } | null>(null);

  // Auth and initial loading
  useEffect(() => {
    // Check auth status
    const authed = isAuthenticated();
    setIsAuthed(authed);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSongs(parsed);
        }
      }

      const savedActiveId = localStorage.getItem(ACTIVE_SONG_KEY);
      if (savedActiveId) {
        setActiveSongId(savedActiveId);
      }
    } catch {
      // Fallback
    }

    // Try fetching from Turso backend
    fetch('/api/songs')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok' && Array.isArray(data.songs) && data.songs.length > 0) {
          setIsTursoActive(true);
        }
      })
      .catch(() => {
        setIsTursoActive(false);
      });
  }, []);

  // Save to localStorage and sync to Turso
  const saveSongs = useCallback((newSongs: Song[]) => {
    setSongs(newSongs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSongs));
    } catch {
      // Storage error
    }
  }, []);

  const currentSong = songs.find((s) => s.id === activeSongId) || songs[0];

  // Active section
  const activeSection =
    currentSong.sections.find((sec) => sec.id === currentSong.activeSectionId) ||
    currentSong.sections[0] || {
      id: 'default',
      name: 'Default',
      chords: [],
    };

  // Play a chord
  const handlePlayChord = useCallback(
    (chord: ChordData) => {
      if (!chord.notes || chord.notes.length === 0) return;
      if (audioEngine) {
        audioEngine.playChord(chord.notes, {
          instrument: currentSong.instrument,
          playbackStyle: currentSong.playbackStyle,
          strumSpeedMs: currentSong.strumSpeedMs,
          fadeDuration: currentSong.fadeDuration,
        });
      }
    },
    [currentSong]
  );

  // Update current song fields
  const handleUpdateCurrentSong = (fields: Partial<Song>) => {
    const updated = songs.map((s) => (s.id === currentSong.id ? { ...s, ...fields } : s));
    saveSongs(updated);

    // Sync to Turso in background
    const updatedSong = { ...currentSong, ...fields };
    fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSong),
    }).catch(() => {});
  };

  // Section actions
  const handleSelectSection = (sectionId: string) => {
    handleUpdateCurrentSong({ activeSectionId: sectionId });
  };

  const handleAddSection = (name: string) => {
    const newSection: SongSection = {
      id: `section-${Date.now()}`,
      name,
      chords: Array.from({ length: currentSong.padCount }, (_, i) => ({
        id: `c-${Date.now()}-${i}`,
        label: i === 0 ? 'C' : i === 1 ? 'G' : i === 2 ? 'Am' : i === 3 ? 'F' : 'Empty',
        notes: i === 0 ? ['C3', 'E3', 'G3', 'C4'] : i === 1 ? ['G2', 'B2', 'D3', 'G3'] : i === 2 ? ['A2', 'E3', 'A3', 'C4'] : i === 3 ? ['F2', 'C3', 'F3', 'A3'] : ['C4'],
        root: 'C',
        chordType: 'Major',
        colorToken: getChordColor(i === 0 ? 'C' : i === 1 ? 'G' : i === 2 ? 'Am' : i === 3 ? 'F' : 'Empty'),
        baseOctave: 4,
      })),
    };

    const updatedSections = [...currentSong.sections, newSection];
    handleUpdateCurrentSong({
      sections: updatedSections,
      activeSectionId: newSection.id,
    });
  };

  const handleRenameSection = (id: string, newName: string) => {
    const updatedSections = currentSong.sections.map((sec) =>
      sec.id === id ? { ...sec, name: newName } : sec
    );
    handleUpdateCurrentSong({ sections: updatedSections });
  };

  const handleDeleteSection = (id: string) => {
    if (currentSong.sections.length <= 1) return;
    const filtered = currentSong.sections.filter((s) => s.id !== id);
    const newActiveId = filtered[0].id;
    handleUpdateCurrentSong({
      sections: filtered,
      activeSectionId: newActiveId,
    });
  };

  // Chord pad edit & save
  const handleEditChord = (chord: ChordData, index: number) => {
    setEditingChordState({ chord, index });
  };

  const handleSaveChord = (updatedChord: ChordData, index: number) => {
    const newChords = [...activeSection.chords];
    newChords[index] = updatedChord;

    const updatedSections = currentSong.sections.map((sec) =>
      sec.id === activeSection.id ? { ...sec, chords: newChords } : sec
    );

    handleUpdateCurrentSong({ sections: updatedSections });
  };

  // Import progression from chord library
  const handleImportProgression = (importedChords: ChordData[]) => {
    const newChords = [...importedChords];
    while (newChords.length < currentSong.padCount) {
      const idx = newChords.length;
      newChords.push({
        id: `pad-fill-${Date.now()}-${idx}`,
        label: 'Empty',
        notes: ['C4'],
        root: 'C',
        chordType: 'Major',
        colorToken: getChordColor('Empty'),
        baseOctave: 4,
      });
    }

    const updatedSections = currentSong.sections.map((sec) =>
      sec.id === activeSection.id ? { ...sec, chords: newChords } : sec
    );

    handleUpdateCurrentSong({ sections: updatedSections });
  };

  // Apply dictionary chord to editing pad
  const handleApplyDictionaryChord = (chord: ChordData) => {
    if (editingChordState) {
      handleSaveChord(chord, editingChordState.index);
      setEditingChordState(null);
    }
  };

  // Song Drawer actions
  const handleSelectSong = (id: string) => {
    setActiveSongId(id);
    localStorage.setItem(ACTIVE_SONG_KEY, id);
  };

  const handleCreateSong = () => {
    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: 'New Chord Song',
      artist: 'Custom',
      bpm: 110,
      keySignature: 'C Major',
      instrument: 'acoustic_guitar',
      padCount: 15,
      playbackStyle: 'strum_down',
      strumSpeedMs: 25,
      fadeDuration: 2.5,
      activeSectionId: 'sec-1',
      sections: [
        {
          id: 'sec-1',
          name: 'Verse',
          chords: Array.from({ length: 15 }, (_, i) => ({
            id: `c-new-${i}`,
            label: i === 0 ? 'C' : i === 1 ? 'G' : i === 2 ? 'Am' : i === 3 ? 'F' : 'Empty',
            notes: i === 0 ? ['C3', 'E3', 'G3', 'C4'] : i === 1 ? ['G2', 'B2', 'D3', 'G3'] : i === 2 ? ['A2', 'E3', 'A3', 'C4'] : i === 3 ? ['F2', 'C3', 'F3', 'A3'] : ['C4'],
            root: 'C',
            chordType: 'Major',
            colorToken: getChordColor(i === 0 ? 'C' : i === 1 ? 'G' : i === 2 ? 'Am' : i === 3 ? 'F' : 'Empty'),
            baseOctave: 4,
          })),
        },
      ],
    };

    const newSongs = [...songs, newSong];
    saveSongs(newSongs);
    setActiveSongId(newSong.id);

    // Sync to Turso
    fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSong),
    }).catch(() => {});
  };

  // Import song from lyrics & chords parser
  const handleImportSongFromLyrics = (newSong: Song) => {
    const newSongs = [newSong, ...songs];
    saveSongs(newSongs);
    setActiveSongId(newSong.id);

    // Sync to Turso
    fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSong),
    }).catch(() => {});
  };

  const handleDuplicateSong = (sourceSong: Song) => {
    const duplicated: Song = {
      ...sourceSong,
      id: `song-${Date.now()}`,
      title: `${sourceSong.title} (Copy)`,
    };
    const newSongs = [...songs, duplicated];
    saveSongs(newSongs);
    setActiveSongId(duplicated.id);
  };

  const handleDeleteSong = (id: string) => {
    if (songs.length <= 1) return;
    const filtered = songs.filter((s) => s.id !== id);
    saveSongs(filtered);
    setActiveSongId(filtered[0].id);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setIsAuthed(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-app select-none">
      {/* Top App Bar */}
      <Header
        song={currentSong}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onShare={() => setIsShareOpen(true)}
      />

      {/* Section Switcher Tabs */}
      <SectionSwitcher
        sections={currentSong.sections}
        activeSectionId={currentSong.activeSectionId}
        onSelectSection={handleSelectSection}
        onAddSection={handleAddSection}
        onRenameSection={handleRenameSection}
        onDeleteSection={handleDeleteSection}
      />

      {/* Main Chord Pad Grid (12 or 15 buttons) */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 sm:py-4">
        <ChordGrid
          chords={activeSection.chords}
          padCount={currentSong.padCount}
          onPlayChord={handlePlayChord}
          onEditChord={handleEditChord}
        />
      </main>

      {/* Login Gate Modal */}
      {!isAuthed && (
        <LoginModal
          isOpen={!isAuthed}
          onSuccess={() => setIsAuthed(true)}
        />
      )}

      {/* Modals & Dialogs */}
      {editingChordState && (
        <ChordEditorModal
          chord={editingChordState.chord}
          index={editingChordState.index}
          instrument={currentSong.instrument}
          playbackStyle={currentSong.playbackStyle}
          strumSpeedMs={currentSong.strumSpeedMs}
          fadeDuration={currentSong.fadeDuration}
          isOpen={Boolean(editingChordState)}
          onClose={() => setEditingChordState(null)}
          onSave={handleSaveChord}
          onOpenLibraryForPad={() => {
            setIsLibraryOpen(true);
          }}
        />
      )}

      <ImportSongModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSong={handleImportSongFromLyrics}
      />

      <ChordLibraryModal
        isOpen={isLibraryOpen}
        instrument={currentSong.instrument}
        playbackStyle={currentSong.playbackStyle}
        strumSpeedMs={currentSong.strumSpeedMs}
        fadeDuration={currentSong.fadeDuration}
        onClose={() => setIsLibraryOpen(false)}
        onImportProgression={handleImportProgression}
        onSelectDictionaryChord={handleApplyDictionaryChord}
      />

      <SettingsModal
        song={currentSong}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSong={handleUpdateCurrentSong}
      />

      <SongDrawer
        isOpen={isDrawerOpen}
        songs={songs}
        activeSongId={currentSong.id}
        isTursoActive={isTursoActive}
        onClose={() => setIsDrawerOpen(false)}
        onSelectSong={handleSelectSong}
        onCreateSong={handleCreateSong}
        onOpenImport={() => setIsImportOpen(true)}
        onDuplicateSong={handleDuplicateSong}
        onDeleteSong={handleDeleteSong}
        onOpenShareModal={(s) => {
          setActiveSongId(s.id);
          setIsShareOpen(true);
        }}
        onLogout={handleLogout}
      />

      <ShareModal
        song={currentSong}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
