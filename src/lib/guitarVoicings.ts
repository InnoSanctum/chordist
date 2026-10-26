// Standard 6-String Guitar Voicings (Strings: [0: High e, 1: B, 2: G, 3: D, 4: A, 5: Low E])
// Number = fret (0 = open), null = muted/unplayed

import { GUITAR_STRINGS, getGuitarFretNote, noteToMidi } from './theory';

export const STANDARD_GUITAR_VOICINGS: Record<string, (number | null)[]> = {
  // G Family
  'G': [3, 0, 0, 0, 2, 3],
  'Gmaj7': [2, 0, 0, 0, 2, 3],
  'G7': [1, 0, 0, 0, 2, 3],
  'Gm': [3, 3, 3, 5, 5, 3],
  'Gm7': [3, 3, 3, 3, 5, 3],
  'Gsus4': [3, 1, 0, 0, 3, 3],
  'G7sus4': [1, 1, 0, 0, 3, 3],
  'Gadd9': [3, 0, 2, 0, 2, 3],

  // C Family
  'C': [0, 1, 0, 2, 3, null],
  'Cmaj7': [0, 0, 0, 2, 3, null],
  'C7': [0, 1, 3, 2, 3, null],
  'Cm': [3, 4, 5, 5, 3, null],
  'Cm7': [3, 4, 3, 5, 3, null],
  'Csus4': [1, 1, 0, 3, 3, null],
  'Csus2': [3, 3, 0, null, 3, null],
  'Cadd9': [0, 3, 0, 2, 3, null],

  // D Family
  'D': [2, 3, 2, 0, null, null],
  'Dm': [1, 3, 2, 0, null, null],
  'D7': [2, 1, 2, 0, null, null],
  'Dmaj7': [2, 2, 2, 0, null, null],
  'Dm7': [1, 1, 2, 0, null, null],
  'Dm9': [0, 1, 2, 0, null, null],
  'Ddim7': [1, 0, 1, 0, null, null],
  'Dsus4': [3, 3, 2, 0, null, null],

  // A Family
  'A': [0, 2, 2, 2, 0, null],
  'Am': [0, 1, 2, 2, 0, null],
  'A7': [0, 2, 0, 2, 0, null],
  'Amaj7': [0, 2, 1, 2, 0, null],
  'Am7': [0, 1, 0, 2, 0, null],
  'A7b9': [0, 2, 3, 2, 0, null],
  'Asus4': [0, 3, 2, 2, 0, null],

  // E Family
  'E': [0, 0, 1, 2, 2, 0],
  'Em': [0, 0, 0, 2, 2, 0],
  'E7': [0, 0, 1, 0, 2, 0],
  'Emaj7': [0, 0, 1, 1, 2, 0],
  'Em7': [0, 0, 0, 0, 2, 0],
  'E7#9': [3, 0, 1, 0, 2, 0],

  // F Family
  'F': [1, 1, 2, 3, 3, 1],
  'Fm': [1, 1, 1, 3, 3, 1],
  'Fmaj7': [0, 1, 2, 3, null, null],
  'Fm6': [1, 1, 1, 0, null, null],
  'F7': [1, 1, 2, 1, 3, 1],

  // B Family
  'B': [2, 4, 4, 4, 2, null],
  'Bm': [2, 3, 4, 4, 2, null],
  'B7': [2, 0, 2, 1, 2, null],
  'Bm7': [2, 3, 2, 4, 2, null],
  'Bm7b5': [1, 3, 2, 3, 2, null],

  // Bb / A#
  'Bb': [1, 3, 3, 3, 1, null],
  'Bbm': [1, 2, 3, 3, 1, null],

  // Eb / D#
  'Eb': [3, 4, 3, 5, 6, null],
  'Ebmaj7': [3, 3, 3, 5, 6, null],

  // Ab / G#
  'Ab': [4, 4, 5, 6, 6, 4],
  'Abadd9': [4, 4, 3, null, null, 4],
};

/**
 * Finds or derives a 6-string guitar voicing for a chord.
 * Guarantees at most ONE note per string (no duplicate dots on same string).
 */
export function getVoicingForChord(chordLabel: string, chordNotes: string[]): (number | null)[] {
  const cleanLabel = chordLabel.trim();

  // 1. Direct standard lookup
  if (STANDARD_GUITAR_VOICINGS[cleanLabel]) {
    return [...STANDARD_GUITAR_VOICINGS[cleanLabel]];
  }

  // 2. Lookup without slash bass (e.g. "C/E" -> "C")
  const rootPart = cleanLabel.split('/')[0];
  if (STANDARD_GUITAR_VOICINGS[rootPart]) {
    return [...STANDARD_GUITAR_VOICINGS[rootPart]];
  }

  // 3. Fallback: Intelligent solver that assigns notes to unique strings (at most 1 per string)
  if (!chordNotes || chordNotes.length === 0) {
    return [null, null, null, null, null, null];
  }

  const result: (number | null)[] = [null, null, null, null, null, null];
  const targetMidis = chordNotes.map(noteToMidi);

  // For each string (from Low E up to High e), find if one of target MIDI notes falls on frets 0-5
  for (let sIdx = 5; sIdx >= 0; sIdx--) {
    let matchedFret: number | null = null;

    // Check open string first
    const openInfo = getGuitarFretNote(sIdx, 0);
    if (targetMidis.includes(openInfo.midi)) {
      matchedFret = 0;
    } else {
      // Check frets 1 to 5 (standard open chord box)
      for (let fret = 1; fret <= 5; fret++) {
        const info = getGuitarFretNote(sIdx, fret);
        if (targetMidis.includes(info.midi)) {
          matchedFret = fret;
          break;
        }
      }
    }

    result[sIdx] = matchedFret;
  }

  return result;
}

/**
 * Converts a 6-string guitar frets array into an array of note strings
 */
export function fretsToNotes(frets: (number | null)[]): string[] {
  const notes: string[] = [];
  // From low string to high string (String 5 to 0)
  for (let sIdx = 5; sIdx >= 0; sIdx--) {
    const fret = frets[sIdx];
    if (fret !== null && fret !== undefined) {
      const info = getGuitarFretNote(sIdx, fret);
      notes.push(info.note);
    }
  }
  return notes;
}

