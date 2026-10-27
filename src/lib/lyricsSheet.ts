// Turns a raw chord sheet (the text pasted on import) into renderable lines
// where every chord occurrence is addressable, so it can be tapped and followed.
import { SECTION_REGEX, isChordLine, isChordToken } from './chordParser';

export interface SheetSegment {
  chord?: string;      // text shown above the lyric fragment (a chord, or a label like "x2")
  chordIndex?: number; // position in LyricsSheet.chords when the chord is playable
  text: string;        // lyric fragment that starts under the chord
}

export type SheetLine =
  | { kind: 'section'; name: string }
  | { kind: 'line'; segments: SheetSegment[] }
  | { kind: 'blank' };

export interface LyricsSheet {
  lines: SheetLine[];
  chords: string[];       // every chord occurrence, in reading order
  uniqueChords: string[]; // first-appearance order
}

const META_REGEX = /^(?:title|song|artist):/i;
const BRACKET_ONLY_REGEX = /^\[([^\]]+)\]$/;
const INLINE_CHORD_REGEX = /\[([^\]]+)\]/; // no /g: also used with .test()

export function parseLyricsSheet(raw: string): LyricsSheet {
  const rows = raw.replace(/\t/g, '    ').split(/\r?\n/);
  const lines: SheetLine[] = [];
  const chords: string[] = [];

  const chordSegment = (token: string, text: string): SheetSegment => {
    const clean = token.replace(/^[(|]+|[)|]+$/g, '');
    if (!isChordToken(clean)) return { chord: token, text };
    chords.push(clean);
    return { chord: clean, chordIndex: chords.length - 1, text };
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i].replace(/\s+$/, '');
    const trimmed = row.trim();

    if (!trimmed) {
      if (lines.length > 0 && lines[lines.length - 1].kind !== 'blank') lines.push({ kind: 'blank' });
      continue;
    }
    if (META_REGEX.test(trimmed)) continue;

    // Section headers: "[Verse 1]", "Chorus:", or any bracketed label that isn't a chord
    const bracketOnly = trimmed.match(BRACKET_ONLY_REGEX);
    if (SECTION_REGEX.test(trimmed) || (bracketOnly && !isChordToken(bracketOnly[1].trim()))) {
      lines.push({ kind: 'section', name: trimmed.replace(/[\[\]:]/g, '').trim() });
      continue;
    }

    // ChordPro inline chords: "[C]Hey [G]Jude"
    if (INLINE_CHORD_REGEX.test(trimmed)) {
      const segments: SheetSegment[] = [];
      const parts = row.split(INLINE_CHORD_REGEX); // text, chord, text, chord, ...
      if (parts[0]) segments.push({ text: parts[0] });
      for (let p = 1; p < parts.length; p += 2) {
        segments.push(chordSegment(parts[p].trim(), parts[p + 1] ?? ''));
      }
      lines.push({ kind: 'line', segments });
      continue;
    }

    // Chords-over-lyrics: split the lyric under each chord's column
    if (isChordLine(row)) {
      const next = rows[i + 1]?.replace(/\s+$/, '') ?? '';
      const nextTrimmed = next.trim();
      const hasLyric =
        nextTrimmed !== '' &&
        !isChordLine(next) &&
        !SECTION_REGEX.test(nextTrimmed) &&
        !BRACKET_ONLY_REGEX.test(nextTrimmed);
      const lyric = hasLyric ? next : '';
      const tokens = Array.from(row.matchAll(/\S+/g));

      const segments: SheetSegment[] = [];
      if (hasLyric && tokens[0].index! > 0) segments.push({ text: lyric.slice(0, tokens[0].index) });
      tokens.forEach((t, k) => {
        const start = t.index!;
        const end = k + 1 < tokens.length ? tokens[k + 1].index! : undefined;
        segments.push(chordSegment(t[0], hasLyric ? lyric.slice(start, end) : ''));
      });

      lines.push({ kind: 'line', segments });
      if (hasLyric) i++;
      continue;
    }

    lines.push({ kind: 'line', segments: [{ text: row }] });
  }

  return { lines, chords, uniqueChords: Array.from(new Set(chords)) };
}
