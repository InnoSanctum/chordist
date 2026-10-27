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
  'Bb7': [1, 3, 1, 3, 1, null],
  'Bbmaj7': [1, 3, 2, 3, 1, null],

  // Eb / D#
  'Eb': [3, 4, 3, 5, 6, null],
  'Ebmaj7': [3, 3, 3, 5, 6, null],
  'Eb7': [3, 2, 3, 1, null, null],

  // Ab / G#
  'Ab': [4, 4, 5, 6, 6, 4],
  'Abadd9': [4, 4, 3, null, null, 4],

  // Common Diminished & Half-Diminished
  'Cdim': [null, 4, 5, 4, 3, null],
  'Cdim7': [2, 4, 2, 4, 3, null],
  'Cm7b5': [null, 4, 3, 4, 3, null],
  'Ddim': [1, 3, 1, 0, null, null],
  'Edim': [0, 2, 0, 2, 1, 0],
  'Edim7': [0, 2, 0, 2, 1, 0],
  'F#dim7': [2, 1, 2, 1, null, 2],
  'G#dim7': [4, 3, 4, 3, null, 4],
  'Adim7': [null, 1, 2, 1, 0, null],
  'Am7b5': [null, 1, 2, 1, 0, null],

  // Extended & Altered 9ths, 13ths, Add9
  'C9': [3, 3, 3, 2, 3, null],
  'Cmaj9': [0, 3, 4, 2, 3, null],
  'Cm9': [3, 3, 3, 1, 3, null],
  'G9': [2, 0, 2, 0, null, 3],
  'G13': [0, 0, 0, 3, null, 3],
  'C13': [5, 3, 3, 2, 3, null],
  'A9': [0, 0, 0, 2, 0, null],
  'A13': [2, 2, 0, 2, 0, null],
  'E9': [2, 0, 1, 0, 2, 0],
  'E13': [0, 2, 1, 0, 2, 0],
  'D9': [0, 1, 2, 0, null, null],
  'Dadd9': [0, 3, 2, 0, null, null],
  'Aadd9': [0, 0, 2, 2, 0, null],
  'Eadd9': [2, 0, 1, 2, 2, 0],
  'Fadd9': [3, 1, 2, 3, null, null],
  'Asus2': [0, 0, 2, 2, 0, null],
  'Dsus2': [0, 3, 2, 0, null, null],
  'Esus4': [0, 0, 2, 2, 2, 0],
};

const pitchClass = (midi: number) => ((midi % 12) + 12) % 12;

/**
 * Re-voices a chord shape so the given bass note is the lowest sounding string,
 * using low E or A within the first 5 frets (e.g. Dm + C -> x32231, C + G -> 332010).
 */
function applySlashBass(frets: (number | null)[], bass: string): (number | null)[] {
  const bassPc = pitchClass(noteToMidi(`${bass}3`));
  const result = [...frets];

  // Already the lowest sounding note?
  for (let sIdx = 5; sIdx >= 0; sIdx--) {
    const fret = result[sIdx];
    if (fret === null || fret === undefined) continue;
    if (pitchClass(getGuitarFretNote(sIdx, fret).midi) === bassPc) return result;
    break;
  }

  for (const sIdx of [5, 4]) {
    for (let fret = 0; fret <= 5; fret++) {
      if (pitchClass(getGuitarFretNote(sIdx, fret).midi) === bassPc) {
        result[sIdx] = fret;
        if (sIdx === 4) result[5] = null;
        return result;
      }
    }
  }
  return result;
}

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

  // 2. Slash chords: standard shape of the upper chord with the bass moved underneath (e.g. "Dm/C")
  const [rootPart, bass] = cleanLabel.split('/');
  if (STANDARD_GUITAR_VOICINGS[rootPart]) {
    const shape = [...STANDARD_GUITAR_VOICINGS[rootPart]];
    return bass ? applySlashBass(shape, bass) : shape;
  }

  // 3. Fallback: Intelligent solver that assigns chord tones to unique strings (at most 1 per string)
  if (!chordNotes || chordNotes.length === 0) {
    return [null, null, null, null, null, null];
  }

  const result: (number | null)[] = [null, null, null, null, null, null];
  const targetPcs = chordNotes.map((n) => pitchClass(noteToMidi(n)));
  const lowestPc = targetPcs[0];
  let bassFound = false;

  // From Low E up to High e, take the lowest fret (0-5) that plays any chord tone;
  // strings below the chord's lowest note stay muted so the bass is correct
  for (let sIdx = 5; sIdx >= 0; sIdx--) {
    for (let fret = 0; fret <= 5; fret++) {
      const pc = pitchClass(getGuitarFretNote(sIdx, fret).midi);
      if (bassFound ? targetPcs.includes(pc) : pc === lowestPc) {
        result[sIdx] = fret;
        bassFound = true;
        break;
      }
    }
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

