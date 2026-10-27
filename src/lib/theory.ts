// Music Theory Utilities and Chord Color Categorization
import { Chord, Note } from 'tonal';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const PAD_COLOR_PRESETS = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Sky Blue', hex: '#0EA5E9' },
  { name: 'Royal Blue', hex: '#3B82F6' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Violet', hex: '#A855F7' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Crimson', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Teal', hex: '#14B8A6' },
] as const;

export const ALL_CHORD_ROOTS = [
  { root: 'C', display: 'C' },
  { root: 'C#', display: 'C# / Db' },
  { root: 'D', display: 'D' },
  { root: 'D#', display: 'D# / Eb' },
  { root: 'E', display: 'E' },
  { root: 'F', display: 'F' },
  { root: 'F#', display: 'F# / Gb' },
  { root: 'G', display: 'G' },
  { root: 'G#', display: 'G# / Ab' },
  { root: 'A', display: 'A' },
  { root: 'A#', display: 'A# / Bb' },
  { root: 'B', display: 'B' },
] as const;

export interface ChordQualityDef {
  id: string;
  name: string;
  symbol: string;
  category: 'Triads' | '7ths' | 'Add & 6ths' | 'Extended' | 'Altered';
  tonalSymbol?: string;
}

export const ALL_CHORD_QUALITIES: ChordQualityDef[] = [
  // Triads
  { id: 'maj', name: 'Major', symbol: '', category: 'Triads', tonalSymbol: 'M' },
  { id: 'm', name: 'Minor', symbol: 'm', category: 'Triads', tonalSymbol: 'm' },
  { id: 'dim', name: 'Diminished', symbol: 'dim', category: 'Triads', tonalSymbol: 'dim' },
  { id: 'aug', name: 'Augmented', symbol: 'aug', category: 'Triads', tonalSymbol: 'aug' },
  { id: 'sus2', name: 'Suspended 2nd', symbol: 'sus2', category: 'Triads', tonalSymbol: 'sus2' },
  { id: 'sus4', name: 'Suspended 4th', symbol: 'sus4', category: 'Triads', tonalSymbol: 'sus4' },
  { id: '5', name: 'Power Chord (5th)', symbol: '5', category: 'Triads', tonalSymbol: '5' },

  // 7th Chords
  { id: '7', name: 'Dominant 7th', symbol: '7', category: '7ths', tonalSymbol: '7' },
  { id: 'maj7', name: 'Major 7th', symbol: 'maj7', category: '7ths', tonalSymbol: 'maj7' },
  { id: 'm7', name: 'Minor 7th', symbol: 'm7', category: '7ths', tonalSymbol: 'm7' },
  { id: 'mMaj7', name: 'Minor Major 7th', symbol: 'mMaj7', category: '7ths', tonalSymbol: 'mMaj7' },
  { id: 'dim7', name: 'Diminished 7th', symbol: 'dim7', category: '7ths', tonalSymbol: 'dim7' },
  { id: 'm7b5', name: 'Half-Diminished', symbol: 'm7b5', category: '7ths', tonalSymbol: 'm7b5' },
  { id: '7sus4', name: '7th Sus4', symbol: '7sus4', category: '7ths', tonalSymbol: '7sus4' },
  { id: '7#5', name: 'Augmented 7th', symbol: '7#5', category: '7ths', tonalSymbol: '7#5' },

  // Add & 6ths
  { id: 'add9', name: 'Add 9th', symbol: 'add9', category: 'Add & 6ths', tonalSymbol: 'add9' },
  { id: 'madd9', name: 'Minor Add 9th', symbol: 'madd9', category: 'Add & 6ths', tonalSymbol: 'madd9' },
  { id: '6', name: 'Major 6th', symbol: '6', category: 'Add & 6ths', tonalSymbol: '6' },
  { id: 'm6', name: 'Minor 6th', symbol: 'm6', category: 'Add & 6ths', tonalSymbol: 'm6' },
  { id: '69', name: '6/9', symbol: '6/9', category: 'Add & 6ths', tonalSymbol: '6/9' },

  // Extended
  { id: '9', name: 'Dominant 9th', symbol: '9', category: 'Extended', tonalSymbol: '9' },
  { id: 'maj9', name: 'Major 9th', symbol: 'maj9', category: 'Extended', tonalSymbol: 'maj9' },
  { id: 'm9', name: 'Minor 9th', symbol: 'm9', category: 'Extended', tonalSymbol: 'm9' },
  { id: '11', name: 'Dominant 11th', symbol: '11', category: 'Extended', tonalSymbol: '11' },
  { id: 'm11', name: 'Minor 11th', symbol: 'm11', category: 'Extended', tonalSymbol: 'm11' },
  { id: '13', name: 'Dominant 13th', symbol: '13', category: 'Extended', tonalSymbol: '13' },
  { id: 'maj13', name: 'Major 13th', symbol: 'maj13', category: 'Extended', tonalSymbol: 'maj13' },
  { id: 'm13', name: 'Minor 13th', symbol: 'm13', category: 'Extended', tonalSymbol: 'm13' },

  // Altered
  { id: '7b9', name: '7 Flat 9', symbol: '7b9', category: 'Altered', tonalSymbol: '7b9' },
  { id: '7#9', name: '7 Sharp 9 (Hendrix)', symbol: '7#9', category: 'Altered', tonalSymbol: '7#9' },
  { id: '7b5', name: '7 Flat 5', symbol: '7b5', category: 'Altered', tonalSymbol: '7b5' },
];

export const CHORD_COLORS = {
  major: '#EF4444',     // Crimson Red
  minor: '#F97316',     // Deep Orange
  dom7: '#F59E0B',      // Vibrant Amber / Gold
  maj7: '#10B981',      // Emerald Green
  min7: '#06B6D4',      // Cyan / Turquoise
  dim: '#3B82F6',       // Royal Blue
  aug: '#8B5CF6',       // Purple
  custom: '#EC4899',    // Pink
} as const;

// Guitar Standard Tuning (String 1 High E down to String 6 Low E)
export const GUITAR_STRINGS = [
  { index: 0, name: 'e', note: 'E4', midi: 64 },
  { index: 1, name: 'B', note: 'B3', midi: 59 },
  { index: 2, name: 'G', note: 'G3', midi: 55 },
  { index: 3, name: 'D', note: 'D3', midi: 50 },
  { index: 4, name: 'A', note: 'A2', midi: 45 },
  { index: 5, name: 'E', note: 'E2', midi: 40 },
] as const;

export const GUITAR_FRETS_COUNT = 16; // Frets 0 through 15
export const GUITAR_INLAYS = [3, 5, 7, 9, 12, 15];

/**
 * Converts a note string (e.g. "C4", "F#3", "Bb4") to MIDI number
 */
export function noteToMidi(noteStr: string): number {
  if (!noteStr) return 60;
  
  // Normalize flats to sharps
  let normalized = noteStr.trim();
  normalized = normalized.replace('Db', 'C#')
    .replace('Eb', 'D#')
    .replace('Gb', 'F#')
    .replace('Ab', 'G#')
    .replace('Bb', 'A#');

  const match = normalized.match(/^([A-Ga-g]#?)(\d+)$/);
  if (!match) return 60;

  const pitch = match[1].toUpperCase();
  const octave = parseInt(match[2], 10);

  const pitchIndex = NOTE_NAMES.indexOf(pitch as typeof NOTE_NAMES[number]);
  if (pitchIndex === -1) return 60;

  return (octave + 1) * 12 + pitchIndex;
}

/**
 * Converts MIDI number to note name string (e.g. 60 -> "C4")
 */
export function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const pitchIndex = ((midi % 12) + 12) % 12;
  return `${NOTE_NAMES[pitchIndex]}${octave}`;
}

/**
 * Converts MIDI number to exact Frequency (Hz)
 */
export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Returns pitch name without octave (e.g. "C#4" -> "C#")
 */
export function getPitchOnly(noteStr: string): string {
  return noteStr.replace(/\d+$/, '');
}

/**
 * Calculates note on guitar string at specific fret
 */
export function getGuitarFretNote(stringIndex: number, fret: number): { note: string; midi: number; pitch: string } {
  const baseMidi = GUITAR_STRINGS[stringIndex].midi;
  const noteMidi = baseMidi + fret;
  const noteName = midiToNote(noteMidi);
  return {
    note: noteName,
    midi: noteMidi,
    pitch: getPitchOnly(noteName),
  };
}

/**
 * Normalizes raw tonal chord names into clean musician-friendly labels
 */
export function cleanChordName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^([A-G][#b]?)Madd9/, '$1add9')
    .replace(/^([A-G][#b]?)M7$/, '$1maj7')
    .replace(/^([A-G][#b]?)M9$/, '$1maj9')
    .replace(/^([A-G][#b]?)M11$/, '$1maj11')
    .replace(/^([A-G][#b]?)M13$/, '$1maj13')
    .replace(/^([A-G][#b]?)M$/, '$1');
}

/**
 * Determines chord category color from chord name / root / quality
 */
export function getChordColor(chordName: string): string {
  if (!chordName || chordName === 'Empty') return '#64748B'; // slate gray for empty
  const clean = chordName.toLowerCase();
  
  if (clean.includes('dim') || clean.includes('°') || clean.includes('m7b5') || clean.includes('o7')) {
    return CHORD_COLORS.dim;
  }
  if (clean.includes('aug') || clean.includes('+') || clean.includes('7#5')) {
    return CHORD_COLORS.aug;
  }
  if (clean.includes('maj7') || clean.includes('m7+') || clean.includes('^7') || clean.includes('maj9') || clean.includes('maj13')) {
    return CHORD_COLORS.maj7;
  }
  if (clean.includes('m7') || clean.includes('min7') || clean.includes('m9') || clean.includes('m11') || clean.includes('m13')) {
    return CHORD_COLORS.min7;
  }
  if (clean.includes('7') && !clean.includes('maj') && !clean.includes('m')) {
    return CHORD_COLORS.dom7;
  }
  if (clean.includes('9') && !clean.includes('maj') && !clean.includes('add')) {
    return CHORD_COLORS.dom7;
  }
  if (clean.includes('13') && !clean.includes('maj')) {
    return CHORD_COLORS.dom7;
  }
  if (clean.includes('m') && !clean.includes('maj')) {
    return CHORD_COLORS.minor;
  }
  if (clean.includes('sus') || clean.includes('add') || clean.includes('6') || clean.includes('alt')) {
    return CHORD_COLORS.custom;
  }
  
  return CHORD_COLORS.major;
}

/**
 * Advanced Chord Auto-Detection using Tonal.js with smart fallback
 * Matches complex harmonies, inversions, diminished, altered, and extended chords.
 */
export function detectChordName(notes: string[]): { name: string; root: string; quality: string; color: string } {
  if (!notes || notes.length === 0) {
    return { name: 'Empty', root: '', quality: '', color: '#64748B' };
  }

  if (notes.length === 1) {
    const singlePitch = getPitchOnly(notes[0]);
    return { name: singlePitch, root: singlePitch, quality: 'Single Note', color: CHORD_COLORS.major };
  }

  // 1. Try Tonal Chord.detect
  try {
    const detected = Chord.detect(notes);
    if (detected && detected.length > 0) {
      // Prefer direct chord over slash chord inversion if available
      const nonSlash = detected.find((n) => !n.includes('/'));
      const chosen = nonSlash || detected[0];
      const cleaned = cleanChordName(chosen);
      const chordInfo = Chord.get(cleaned);

      return {
        name: cleaned,
        root: chordInfo.tonic || getPitchOnly(notes[0]),
        quality: chordInfo.type || 'Chord',
        color: getChordColor(cleaned),
      };
    }
  } catch {
    // Continue to interval fallback
  }

  // 2. Interval-based detection fallback
  const midiNotes = notes.map(noteToMidi).sort((a, b) => a - b);
  const pitchClasses = Array.from(new Set(midiNotes.map((m) => ((m % 12) + 12) % 12)));

  for (const rootPC of pitchClasses) {
    const rootName = NOTE_NAMES[rootPC];
    const intervals = pitchClasses.map((pc) => ((pc - rootPC + 12) % 12)).sort((a, b) => a - b);
    const intSet = new Set(intervals);

    // Major Triad (0, 4, 7)
    if (intSet.has(4) && intSet.has(7)) {
      if (intSet.has(11)) {
        if (intSet.has(2)) return { name: `${rootName}maj9`, root: rootName, quality: 'maj9', color: CHORD_COLORS.maj7 };
        return { name: `${rootName}maj7`, root: rootName, quality: 'maj7', color: CHORD_COLORS.maj7 };
      }
      if (intSet.has(10)) {
        if (intSet.has(2)) return { name: `${rootName}9`, root: rootName, quality: '9', color: CHORD_COLORS.dom7 };
        if (intSet.has(1)) return { name: `${rootName}7b9`, root: rootName, quality: '7b9', color: CHORD_COLORS.dom7 };
        if (intSet.has(3)) return { name: `${rootName}7#9`, root: rootName, quality: '7#9', color: CHORD_COLORS.dom7 };
        return { name: `${rootName}7`, root: rootName, quality: '7', color: CHORD_COLORS.dom7 };
      }
      if (intSet.has(2)) return { name: `${rootName}add9`, root: rootName, quality: 'add9', color: CHORD_COLORS.custom };
      if (intSet.has(9)) return { name: `${rootName}6`, root: rootName, quality: '6', color: CHORD_COLORS.major };
      return { name: rootName, root: rootName, quality: 'Major', color: CHORD_COLORS.major };
    }

    // Minor Triad (0, 3, 7)
    if (intSet.has(3) && intSet.has(7)) {
      if (intSet.has(11)) return { name: `${rootName}m(maj7)`, root: rootName, quality: 'm(maj7)', color: CHORD_COLORS.min7 };
      if (intSet.has(10)) {
        if (intSet.has(2)) return { name: `${rootName}m9`, root: rootName, quality: 'm9', color: CHORD_COLORS.min7 };
        if (intSet.has(5)) return { name: `${rootName}m11`, root: rootName, quality: 'm11', color: CHORD_COLORS.min7 };
        return { name: `${rootName}m7`, root: rootName, quality: 'm7', color: CHORD_COLORS.min7 };
      }
      if (intSet.has(2)) return { name: `${rootName}m(add9)`, root: rootName, quality: 'm(add9)', color: CHORD_COLORS.minor };
      return { name: `${rootName}m`, root: rootName, quality: 'Minor', color: CHORD_COLORS.minor };
    }

    // Diminished (0, 3, 6)
    if (intSet.has(3) && intSet.has(6)) {
      if (intSet.has(9)) return { name: `${rootName}dim7`, root: rootName, quality: 'dim7', color: CHORD_COLORS.dim };
      if (intSet.has(10)) return { name: `${rootName}m7b5`, root: rootName, quality: 'm7b5', color: CHORD_COLORS.dim };
      return { name: `${rootName}dim`, root: rootName, quality: 'dim', color: CHORD_COLORS.dim };
    }

    // Augmented (0, 4, 8)
    if (intSet.has(4) && intSet.has(8)) {
      if (intSet.has(10)) return { name: `${rootName}7#5`, root: rootName, quality: '7#5', color: CHORD_COLORS.aug };
      return { name: `${rootName}aug`, root: rootName, quality: 'aug', color: CHORD_COLORS.aug };
    }

    // Sus4 (0, 5, 7)
    if (intSet.has(5) && intSet.has(7)) {
      if (intSet.has(10)) return { name: `${rootName}7sus4`, root: rootName, quality: '7sus4', color: CHORD_COLORS.custom };
      return { name: `${rootName}sus4`, root: rootName, quality: 'sus4', color: CHORD_COLORS.custom };
    }

    // Sus2 (0, 2, 7)
    if (intSet.has(2) && intSet.has(7)) {
      return { name: `${rootName}sus2`, root: rootName, quality: 'sus2', color: CHORD_COLORS.custom };
    }

    // Power chord (0, 7)
    if (intSet.has(7) && intSet.size === 2) {
      return { name: `${rootName}5`, root: rootName, quality: '5', color: CHORD_COLORS.major };
    }
  }

  // 3. Fallback to bass note
  const bassMidi = midiNotes[0];
  const bassNote = midiToNote(bassMidi).replace(/\d+$/, '');
  const chordName = `${bassNote} Custom`;
  return {
    name: chordName,
    root: bassNote,
    quality: 'custom',
    color: CHORD_COLORS.custom,
  };
}

/**
 * Builds note voicings, colors, and labels from any root + quality symbol
 */
export function buildChordFromRootAndQuality(
  root: string,
  qualityDef: ChordQualityDef,
  baseOctave = 3
): {
  label: string;
  notes: string[];
  color: string;
  root: string;
  chordType: string;
} {
  const label = `${root}${qualityDef.symbol}`;
  const tonalLookup = `${root}${qualityDef.tonalSymbol ?? qualityDef.symbol}`;
  const chordInfo = Chord.get(tonalLookup);

  let notes: string[] = [];
  if (chordInfo && chordInfo.intervals && chordInfo.intervals.length > 0) {
    const rootWithOctave = `${root}${baseOctave}`;
    notes = chordInfo.intervals.map((iv) => Note.transpose(rootWithOctave, iv));
  } else {
    notes = [`${root}${baseOctave}`];
  }

  // Max 10 notes limit
  if (notes.length > 10) notes = notes.slice(0, 10);

  return {
    label,
    notes,
    color: getChordColor(label),
    root,
    chordType: qualityDef.name,
  };
}

/**
 * Parses freeform chord queries (e.g. "F#m7b5", "Bb9", "E7#9", "Dmaj13", "Cdim7")
 */
export function parseAndBuildChord(
  query: string,
  baseOctave = 3
): {
  label: string;
  notes: string[];
  color: string;
  root: string;
  chordType: string;
} | null {
  const clean = query.trim();
  if (!clean) return null;

  const chordInfo = Chord.get(clean);
  if (!chordInfo || chordInfo.empty || !chordInfo.tonic || !chordInfo.intervals || chordInfo.intervals.length === 0) {
    return null;
  }

  const root = chordInfo.tonic;
  const rootWithOctave = `${root}${baseOctave}`;
  const notes = chordInfo.intervals.map((iv) => Note.transpose(rootWithOctave, iv)).slice(0, 10);
  const cleanLabel = cleanChordName(clean);

  return {
    label: cleanLabel,
    notes,
    color: getChordColor(cleanLabel),
    root,
    chordType: chordInfo.type || 'Custom',
  };
}
