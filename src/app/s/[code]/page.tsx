'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Song, ChordData } from '@/types';
import { INITIAL_SONGS } from '@/lib/defaultSongs';
import { Header } from '@/components/Header';
import { SectionSwitcher } from '@/components/SectionSwitcher';
import { ChordGrid } from '@/components/ChordGrid';
import { audioEngine } from '@/lib/audioEngine';
import { ACTIVE_SONG_KEY, PENDING_FORK_KEY } from '@/lib/storageKeys';
import { ArrowLeft, GitFork, Check } from 'lucide-react';

export default function SharedSongPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const router = useRouter();
  const { code } = use(params);
  const [song, setSong] = useState<Song | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [forked, setForked] = useState(false);

  useEffect(() => {
    // Try cloud API
    fetch(`/api/share/${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok' && data.song) {
          setSong(data.song);
          setActiveSectionId(data.song.sections[0]?.id || '');
        } else {
          // Fallback to default
          setSong(INITIAL_SONGS[0]);
          setActiveSectionId(INITIAL_SONGS[0].sections[0].id);
        }
      })
      .catch(() => {
        setSong(INITIAL_SONGS[0]);
        setActiveSectionId(INITIAL_SONGS[0].sections[0].id);
      });
  }, [code]);

  if (!song) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center text-text-secondary text-sm">
        Loading shared song...
      </div>
    );
  }

  const activeSection =
    song.sections.find((s) => s.id === activeSectionId) || song.sections[0];

  const handlePlayChord = (chord: ChordData) => {
    if (!chord.notes || chord.notes.length === 0) return;
    if (audioEngine) {
      audioEngine.playChord(chord.notes, {
        instrument: song.instrument,
        playbackStyle: song.playbackStyle,
        strumSpeedMs: song.strumSpeedMs,
        fadeDuration: song.fadeDuration,
        sustain: song.sustain,
      });
    }
  };

  const handleForkSong = async () => {
    const forkedSong: Song = {
      ...song,
      id: `song-${Date.now()}`,
      title: `${song.title} (Forked)`,
    };
    try {
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forkedSong),
      });
      if (res.status === 401) {
        // Not logged in yet: the main page saves it right after login / sign-up
        localStorage.setItem(PENDING_FORK_KEY, JSON.stringify(forkedSong));
      } else {
        localStorage.setItem(ACTIVE_SONG_KEY, forkedSong.id);
      }
      setForked(true);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-app select-none">
      {/* Shared Banner */}
      <div className="bg-accent-primary/20 border-b border-accent-primary/30 px-4 py-2 flex items-center justify-between text-xs text-text-primary">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Songs</span>
          </button>
          <span>•</span>
          <span className="font-semibold text-accent-primary">
            Shared Song: {song.title}
          </span>
        </div>

        <button
          onClick={handleForkSong}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
            forked
              ? 'bg-emerald-600 text-white'
              : 'bg-accent-primary hover:bg-accent-hover text-white shadow-accent-primary/20'
          }`}
        >
          {forked ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Library!</span>
            </>
          ) : (
            <>
              <GitFork className="w-3.5 h-3.5" />
              <span>Save to My Songs</span>
            </>
          )}
        </button>
      </div>

      {/* Top App Bar */}
      <Header
        song={song}
        onOpenDrawer={() => router.push('/')}
        onOpenLibrary={() => {}}
        onOpenSettings={() => {}}
        onShare={() => {}}
      />

      {/* Section Switcher Tabs */}
      <SectionSwitcher
        sections={song.sections}
        activeSectionId={activeSectionId}
        onSelectSection={setActiveSectionId}
        onAddSection={() => {}}
        onRenameSection={() => {}}
        onDeleteSection={() => {}}
      />

      {/* Main Chord Pad Grid */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 sm:py-4">
        <ChordGrid
          chords={activeSection.chords}
          padCount={song.padCount}
          onPlayChord={handlePlayChord}
          onEditChord={() => {}}
        />
      </main>
    </div>
  );
}
