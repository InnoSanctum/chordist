// Music Theory Utilities and Chord Color Categorization

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export const CHORD_COLORS = {
  major: '#FF5252',     // Crimson Red
  minor: '#FF7A00',     // Deep Orange
  dom7: '#FFD600',      // Vibrant Yellow
  maj7: '#00E676',      // Emerald Green
  min7: '#00E5FF',      // Cyan / Turquoise
  dim: '#2979FF',       // Royal Blue
  aug: '#AA00FF',       // Deep Purple
  custom: '#EC407A',    // Hot Pink
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
 * Determines chord category color from chord name / root / quality
 */
export function getChordColor(chordName: string): string {
  const clean = chordName.toLowerCase();
  
  if (clean.includes('dim') || clean.includes('°') || clean.includes('m7b5')) {
    return CHORD_COLORS.dim;
  }
  if (clean.includes('aug') || clean.includes('+')) {
    return CHORD_COLORS.aug;
  }
  if (clean.includes('maj7') || clean.includes('m7+') || clean.includes('^7') || clean.includes('maj9')) {
    return CHORD_COLORS.maj7;
  }
  if (clean.includes('m7') || clean.includes('min7') || clean.includes('m9') || clean.includes('m11')) {
    return CHORD_COLORS.min7;
  }
  if (clean.includes('7') && !clean.includes('maj') && !clean.includes('m')) {
    return CHORD_COLORS.dom7;
  }
  if (clean.includes('m') && !clean.includes('maj')) {
    return CHORD_COLORS.minor;
  }
  if (clean.includes('sus') || clean.includes('add') || clean.includes('alt')) {
    return CHORD_COLORS.custom;
  }
  
  return CHORD_COLORS.major;
}

/**
 * Auto-detects chord name from an array of notes
 * Matches common chord structures (triads, 7ths, extensions)
 */
export function detectChordName(notes: string[]): { name: string; root: string; quality: string; color: string } {
  if (!notes || notes.length === 0) {
    return { name: 'Empty', root: '', quality: '', color: CHORD_COLORS.custom };
  }

  // Get distinct pitch classes (0 to 11) sorted relative to lowest note
  const midiNotes = notes.map(noteToMidi).sort((a, b) => a - b);
  const pitchClasses = Array.from(new Set(midiNotes.map((m) => ((m % 12) + 12) % 12)));

  if (pitchClasses.length === 1) {
    const rootName = NOTE_NAMES[pitchClasses[0]];
    return { name: rootName, root: rootName, quality: 'single', color: CHORD_COLORS.major };
  }

  // Try each pitch class as potential root
  for (const rootPC of pitchClasses) {
    const rootName = NOTE_NAMES[rootPC];
    // Intervals relative to this root
    const intervals = pitchClasses
      .map((pc) => ((pc - rootPC + 12) % 12))
      .sort((a, b) => a - b);
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
      if (intSet.has(2)) {
        return { name: `${rootName}add9`, root: rootName, quality: 'add9', color: CHORD_COLORS.custom };
      }
      if (intSet.has(9)) {
        return { name: `${rootName}6`, root: rootName, quality: '6', color: CHORD_COLORS.major };
      }
      return { name: rootName, root: rootName, quality: 'Major', color: CHORD_COLORS.major };
    }

    // Minor Triad (0, 3, 7)
    if (intSet.has(3) && intSet.has(7)) {
      if (intSet.has(11)) {
        return { name: `${rootName}m(maj7)`, root: rootName, quality: 'm(maj7)', color: CHORD_COLORS.min7 };
      }
      if (intSet.has(10)) {
        if (intSet.has(2)) return { name: `${rootName}m9`, root: rootName, quality: 'm9', color: CHORD_COLORS.min7 };
        if (intSet.has(5)) return { name: `${rootName}m11`, root: rootName, quality: 'm11', color: CHORD_COLORS.min7 };
        return { name: `${rootName}m7`, root: rootName, quality: 'm7', color: CHORD_COLORS.min7 };
      }
      if (intSet.has(2)) {
        return { name: `${rootName}m(add9)`, root: rootName, quality: 'm(add9)', color: CHORD_COLORS.minor };
      }
      return { name: `${rootName}m`, root: rootName, quality: 'Minor', color: CHORD_COLORS.minor };
    }

    // Diminished (0, 3, 6)
    if (intSet.has(3) && intSet.has(6)) {
      if (intSet.has(9)) {
        return { name: `${rootName}dim7`, root: rootName, quality: 'dim7', color: CHORD_COLORS.dim };
      }
      if (intSet.has(10)) {
        return { name: `${rootName}m7b5`, root: rootName, quality: 'm7b5', color: CHORD_COLORS.dim };
      }
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

  // Fallback to lowest note
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
