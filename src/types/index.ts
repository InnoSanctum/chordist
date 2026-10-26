export type InstrumentType = 'acoustic_guitar' | 'grand_piano' | 'rhodes' | 'synth_pad';

export type PlaybackStyle = 'block' | 'strum_down' | 'strum_up' | 'arpeggio';

export interface ChordData {
  id: string;
  label: string;
  notes: string[]; // e.g. ["C4", "E4", "G4", "B4"] (1 to 10 notes)
  root: string;    // e.g. "C"
  chordType: string; // e.g. "maj7"
  colorToken?: string;
  baseOctave: number; // default 4
  guitarFrets?: (number | null)[]; // 6 strings: [e4, B3, G3, D3, A2, E2] frets (0=open, null=muted)
}

export interface SongSection {
  id: string;
  name: string; // e.g. "Verse", "Chorus", "Bridge", "Outro"
  chords: ChordData[]; // 12 or 15 chord pads
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  keySignature: string;
  instrument: InstrumentType;
  padCount: 12 | 15;
  playbackStyle: PlaybackStyle;
  strumSpeedMs: number; // 0 - 50ms
  fadeDuration: number; // 0.5s - 6.0s
  sections: SongSection[];
  activeSectionId: string;
  isPublic?: boolean;
  shareCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SoundEngineSettings {
  instrument: InstrumentType;
  playbackStyle: PlaybackStyle;
  strumSpeedMs: number;
  fadeDuration: number;
  masterVolume: number;
}

export interface ChordProgressionPreset {
  id: string;
  name: string;
  category: 'Pop' | 'Jazz' | 'Rock' | 'Neo-Soul' | 'Basic' | 'Blues';
  description: string;
  chords: {
    label: string;
    notes: string[];
    root: string;
    chordType: string;
  }[];
}

export interface ChordDictionaryEntry {
  root: string;
  type: string;
  name: string;
  notes: string[];
  inversion?: string;
}
