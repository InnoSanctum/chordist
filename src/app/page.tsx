'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from '../components/Header';
import { SectionSwitcher } from '../components/SectionSwitcher';
import { ChordGrid } from '../components/ChordGrid';
import { ChordEditorModal } from '../components/ChordEditorModal';
import { ChordLibraryModal } from '../components/ChordLibraryModal';
import { SettingsModal } from '../components/SettingsModal';
import { SongDrawer } from '../components/SongDrawer';
import { ShareModal } from '../components/ShareModal';
import { LoginModal, SessionUser } from '../components/LoginModal';
import { ImportSongModal } from '../components/ImportSongModal';
import { LyricsPanel, NextChordControls } from '../components/LyricsPanel';
import { ChordStrip } from '../components/ChordStrip';
import { parseLyricsSheet } from '../lib/lyricsSheet';
import { buildImportedChord } from '../lib/chordParser';
import { INITIAL_SONGS } from '../lib/defaultSongs';
import { Song, ChordData, SongSection } from '../types';
import { audioEngine } from '../lib/audioEngine';
import { getChordColor } from '../lib/theory';
import { songsCacheKey, ACTIVE_SONG_KEY, PENDING_FORK_KEY, LYRICS_MODE_KEY } from '../lib/storageKeys';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined); // undefined = checking session
  const [songsLoaded, setSongsLoaded] = useState(false);
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [activeSongId, setActiveSongId] = useState<string>(INITIAL_SONGS[0].id);
  const [isTursoActive, setIsTursoActive] = useState<boolean>(false);
  const [isLyricsMode, setIsLyricsMode] = useState(false);
  const [activeChordIndex, setActiveChordIndex] = useState(-1); // position in the lyrics sheet

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

  // Push a song to the server; a 401 means the session expired, so show the login screen
  const syncSong = useCallback((song: Song) => {
    return fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    })
      .then((res) => {
        if (res.status === 401) setUser(null);
        return res.json();
      })
      .then((data) => {
        if (data.status === 'ok') setIsTursoActive(true);
        return data.status === 'ok';
      })
      .catch(() => false);
  }, []);

  const loadUserSongs = useCallback(
    async (sessionUser: SessionUser) => {
      const cacheKey = songsCacheKey(sessionUser.id);
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSongs(parsed);
            setSongsLoaded(true);
          }
        }
        const savedActiveId = localStorage.getItem(ACTIVE_SONG_KEY);
        if (savedActiveId) setActiveSongId(savedActiveId);
      } catch {
        // Cache unavailable
      }

      let loaded: Song[] | null = null;
      try {
        const res = await fetch('/api/songs');
        if (res.status === 401) {
          setUser(null);
          return;
        }
        const data = await res.json();
        if (data.status === 'ok' && Array.isArray(data.songs) && data.songs.length > 0) {
          loaded = data.songs as Song[];
          setIsTursoActive(Boolean(data.cloud));
        }
      } catch {
        setIsTursoActive(false); // offline: keep using the cache
      }

      // Song saved from a share link before logging in
      try {
        const pending = localStorage.getItem(PENDING_FORK_KEY);
        if (pending && loaded) {
          const forked: Song = JSON.parse(pending);
          if (await syncSong(forked)) {
            loaded = [forked, ...loaded];
            setActiveSongId(forked.id);
            localStorage.setItem(ACTIVE_SONG_KEY, forked.id);
          }
          localStorage.removeItem(PENDING_FORK_KEY);
        }
      } catch {
        // Ignore a malformed pending fork
      }

      if (loaded) {
        setSongs(loaded);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(loaded));
        } catch {}
      }
      setSongsLoaded(true);
    },
    [syncSong]
  );

  // Check for an existing session on startup
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          loadUserSongs(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [loadUserSongs]);

  const handleLoginSuccess = (sessionUser: SessionUser) => {
    setUser(sessionUser);
    setSongsLoaded(false);
    loadUserSongs(sessionUser);
  };

  // Save to localStorage cache (callers sync to the server)
  const saveSongs = useCallback(
    (newSongs: Song[]) => {
      setSongs(newSongs);
      if (!user) return;
      try {
        localStorage.setItem(songsCacheKey(user.id), JSON.stringify(newSongs));
      } catch {
        // Storage error
      }
    },
    [user]
  );

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
      if (!chord.notes || chord.notes.length === 0 || chord.label === 'Empty') return;
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

  // ---- Lyrics / play-along view ----
  useEffect(() => {
    try {
      setIsLyricsMode(localStorage.getItem(LYRICS_MODE_KEY) === '1');
    } catch {}
  }, []);

  const toggleLyricsMode = () => {
    setIsLyricsMode((on) => {
      try {
        localStorage.setItem(LYRICS_MODE_KEY, on ? '0' : '1');
      } catch {}
      return !on;
    });
  };

  useEffect(() => setActiveChordIndex(-1), [currentSong.id]);

  const sheet = useMemo(() => parseLyricsSheet(currentSong.sourceText || ''), [currentSong.sourceText]);

  // Chord names in the text play the song's own pads (so pad edits apply); unknown names are built on the fly
  const resolveChord = useMemo(() => {
    const pads = new Map<string, ChordData>();
    [activeSection, ...currentSong.sections].forEach((sec) =>
      sec.chords.forEach((c) => {
        if (c.notes?.length && c.label !== 'Empty' && !pads.has(c.label)) pads.set(c.label, c);
      })
    );
    const built = new Map<string, ChordData>();
    return (name: string): ChordData => {
      const pad = pads.get(name);
      if (pad) return pad;
      if (!built.has(name)) built.set(name, buildImportedChord(name, `sheet-${name}`));
      return built.get(name)!;
    };
  }, [currentSong.sections, activeSection]);

  const stripChords = useMemo(
    () =>
      sheet.uniqueChords.length > 0
        ? sheet.uniqueChords.map(resolveChord).filter((c) => c.notes.length > 0)
        : activeSection.chords.filter((c) => c.notes?.length && c.label !== 'Empty'),
    [sheet, resolveChord, activeSection]
  );

  const playSheetChord = (index: number) => {
    const name = sheet.chords[index];
    if (name === undefined) return;
    handlePlayChord(resolveChord(name));
    setActiveChordIndex(index);
  };

  const stepSheetChord = (delta: 1 | -1) => {
    const next = activeChordIndex + delta;
    if (next >= 0 && next < sheet.chords.length) playSheetChord(next);
  };

  // PC: arrow keys / space step through the song's chords
  useEffect(() => {
    if (!isLyricsMode) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        stepSheetChord(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepSheetChord(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // A pad played while following along moves the cursor to that chord's next occurrence
  const handlePlayAndFollow = (chord: ChordData) => {
    handlePlayChord(chord);
    if (!isLyricsMode) return;
    const next = sheet.chords.indexOf(chord.label, activeChordIndex + 1);
    if (next !== -1) setActiveChordIndex(next);
  };

  // Update current song fields
  const handleUpdateCurrentSong = (fields: Partial<Song>) => {
    const updated = songs.map((s) => (s.id === currentSong.id ? { ...s, ...fields } : s));
    saveSongs(updated);

    // Sync to Turso in background
    const updatedSong = { ...currentSong, ...fields };
    syncSong(updatedSong);
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

  const handleAddPad = () => {
    const newPad: ChordData = {
      id: `pad-${Date.now()}`,
      label: 'Empty',
      notes: [],
      root: 'C',
      chordType: 'Empty',
      colorToken: getChordColor('Empty'),
      baseOctave: 4,
    };
    const updatedSections = currentSong.sections.map((sec) =>
      sec.id === activeSection.id ? { ...sec, chords: [...sec.chords, newPad] } : sec
    );
    handleUpdateCurrentSong({ sections: updatedSections });
    setEditingChordState({ chord: newPad, index: activeSection.chords.length });
  };

  const handleRemovePad = (index: number) => {
    const updatedSections = currentSong.sections.map((sec) =>
      sec.id === activeSection.id ? { ...sec, chords: sec.chords.filter((_, i) => i !== index) } : sec
    );
    handleUpdateCurrentSong({ sections: updatedSections });
    setEditingChordState(null);
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

  // Apply dictionary chord to target pad or editing pad
  const handleApplyDictionaryChord = (chord: ChordData, targetIndex?: number) => {
    let indexToUse = 0;
    if (targetIndex !== undefined && targetIndex !== null) {
      indexToUse = targetIndex;
    } else if (editingChordState) {
      indexToUse = editingChordState.index;
    } else {
      // Find the first Empty pad in active section
      const emptyIdx = activeSection.chords.findIndex((c) => c.label === 'Empty');
      if (emptyIdx !== -1) {
        indexToUse = emptyIdx;
      }
    }

    handleSaveChord(chord, indexToUse);
    setEditingChordState(null);
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
    syncSong(newSong);
  };

  // Import song from lyrics & chords parser
  const handleImportSongFromLyrics = (newSong: Song) => {
    const newSongs = [newSong, ...songs];
    saveSongs(newSongs);
    setActiveSongId(newSong.id);

    // Sync to Turso
    syncSong(newSong);
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

    syncSong(duplicated);
  };

  const handleDeleteSong = (id: string) => {
    if (songs.length <= 1) return;
    const filtered = songs.filter((s) => s.id !== id);
    saveSongs(filtered);
    setActiveSongId(filtered[0].id);

    fetch(`/api/songs?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 401) setUser(null);
      })
      .catch(() => {});
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    setSongsLoaded(false);
    setSongs(INITIAL_SONGS);
    setIsTursoActive(false);
  };

  if (user === undefined || (user && !songsLoaded)) {
    return (
      <div className="flex flex-1 min-h-screen items-center justify-center bg-bg-app text-text-secondary">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-bg-app">
        <LoginModal isOpen onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-bg-app select-none ${
        isLyricsMode ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Top App Bar */}
      <Header
        song={currentSong}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onShare={() => setIsShareOpen(true)}
        isLyricsMode={isLyricsMode}
        onToggleLyrics={toggleLyricsMode}
      />

      {/* Section Switcher Tabs (phones in lyrics mode use the chord strip instead) */}
      <div className={isLyricsMode ? 'hidden md:block' : ''}>
        <SectionSwitcher
          sections={currentSong.sections}
          activeSectionId={currentSong.activeSectionId}
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
          onRenameSection={handleRenameSection}
          onDeleteSection={handleDeleteSection}
        />
      </div>

      {isLyricsMode ? (
        // Phones: lyrics + chord strip. Tablets / PC: lyrics beside the pad grid.
        <main className="flex-1 min-h-0 flex flex-col md:flex-row">
          <LyricsPanel
            className="flex-1 md:w-1/2 md:flex-none md:border-r md:border-border-subtle"
            sheet={sheet}
            sourceText={currentSong.sourceText || ''}
            activeIndex={activeChordIndex}
            chordColor={(name) => resolveChord(name).colorToken || getChordColor(name)}
            onTapChord={playSheetChord}
            onStep={stepSheetChord}
            onSaveText={(text) => {
              setActiveChordIndex(-1);
              handleUpdateCurrentSong({ sourceText: text });
            }}
          />
          <div className="hidden md:block md:w-1/2 overflow-y-auto">
            <ChordGrid
              chords={activeSection.chords}
              padCount={currentSong.padCount}
              compact
              onPlayChord={handlePlayAndFollow}
              onEditChord={handleEditChord}
              onAddPad={handleAddPad}
            />
          </div>
          <ChordStrip
            className="md:hidden"
            chords={stripChords}
            onPlay={handlePlayAndFollow}
            leading={
              sheet.chords.length > 0 && (
                <NextChordControls sheet={sheet} activeIndex={activeChordIndex} onStep={stepSheetChord} />
              )
            }
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-col justify-center items-center py-2 sm:py-4">
          <ChordGrid
            chords={activeSection.chords}
            padCount={currentSong.padCount}
            onPlayChord={handlePlayChord}
            onEditChord={handleEditChord}
            onAddPad={handleAddPad}
          />
        </main>
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
          onRemovePad={
            activeSection.chords.length > currentSong.padCount ? handleRemovePad : undefined
          }
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
        padCount={Math.max(currentSong.padCount, activeSection.chords.length)}
        targetPadIndex={editingChordState?.index}
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
        userEmail={user.email}
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
