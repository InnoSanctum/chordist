// Comprehensive Chords & Lyrics Parser
import { ChordData, SongSection } from '../types';
import { getChordColor, parseAndBuildChord, noteToMidi } from './theory';
import { getVoicingForChord, fretsToNotes } from './guitarVoicings';

// Common English words that could look like chord letters
const NON_CHORD_WORDS = new Set([
  'A', 'I', 'IN', 'AT', 'AM', 'AN', 'AS', 'BE', 'BY', 'DO', 'GO', 'HE', 'IF', 'IS', 'IT',
  'ME', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE', 'THE', 'AND', 'FOR', 'YOU'
]);

// Strict musical chord regex
// Matches: C, C#, Db, Cmaj7, Dm7b5, F#m, Asus4, G/B, E7#9, Bbadd9, etc.
const CHORD_REGEX = /\b([A-G][b#]?(?:m|min|maj|dim|aug|sus|add|M)?(?:[0-9]{1,2})?(?:[b#][0-9])?(?:sus[24]?)?(?:alt)?(?:\/[A-G][b#]?)?)\b/g;

// Bracketed chord regex e.g. [C], [G/B], [F#m7]
const BRACKET_CHORD_REGEX = /\[([A-G][b#]?[^\]]*)\]/g;

// Section header regex e.g. [Verse 1], Verse:, [Chorus], Chorus 2:, [Bridge], Intro:
const SECTION_REGEX = /^(?:\[|\b)(intro|verse|chorus|bridge|outro|solo|pre-chorus|hook|interlude)(?:\s*\d*|\b)(?:\]|:)?/i;

export interface ParsedSongResult {
  title: string;
  artist: string;
  sections: SongSection[];
  totalChordsFound: number;
  allUniqueChords: string[];
}

/**
 * Checks if a text line is predominantly chords (rather than lyrics)
 */
function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // If it starts with brackets or has bracketed chords, check those separately
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return false; // likely section marker
  }

  // Tokenize by spaces
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;

  let chordCount = 0;
  for (const token of tokens) {
    // Strip common punctuation around chord
    const cleanToken = token.replace(/^[(),|/]+|[(),|/]+$/g, '');
    if (!cleanToken) continue;

    // Reject common English words unless specifically formatted
    if (NON_CHORD_WORDS.has(cleanToken.toUpperCase()) && cleanToken !== 'A' && cleanToken !== 'Am') {
      continue;
    }

    // Test with chord regex
    const matches = cleanToken.match(/^([A-G][b#]?(?:m|min|maj|dim|aug|sus|add|M)?(?:[0-9]{1,2})?(?:[b#][0-9])?(?:sus[24]?)?(?:alt)?(?:\/[A-G][b#]?)?)$/);
    if (matches) {
      chordCount++;
    }
  }

  // If more than 50% of tokens are valid chords, it's a chord line
  return chordCount / tokens.length >= 0.5;
}

/**
 * Turns a chord name into a pad: a real guitar shape when one covers every chord tone,
 * otherwise the theoretical voicing. Unknown names / missing slots become silent empty pads.
 */
export function buildImportedChord(label: string | undefined, id: string): ChordData {
  const built = label ? parseAndBuildChord(label, 3) : null;
  if (!label || !built) {
    return {
      id,
      label: label || 'Empty',
      notes: [],
      root: 'C',
      chordType: 'Empty',
      colorToken: getChordColor('Empty'),
      baseOctave: 3,
    };
  }

  const pcs = (notes: string[]) => new Set(notes.map((n) => noteToMidi(n) % 12));
  const frets = getVoicingForChord(label, built.notes);
  const fretNotes = fretsToNotes(frets);
  const wanted = pcs(built.notes);
  const got = pcs(fretNotes);
  // Guitar shapes routinely drop the perfect 5th of 4+ note chords (e.g. open C7)
  if (wanted.size >= 4) wanted.delete((noteToMidi(`${built.root}3`) + 7) % 12);
  const coversChord = fretNotes.length >= 3 && Array.from(wanted).every((pc) => got.has(pc));

  return {
    id,
    label,
    notes: coversChord ? fretNotes : built.notes,
    root: built.root,
    chordType: built.chordType,
    colorToken: getChordColor(label),
    baseOctave: 3,
    guitarFrets: coversChord ? frets : undefined,
  };
}

/**
 * Parses raw chord notation & lyrics text into structured sections and chords
 */
export function parseSongText(rawText: string, defaultPadCount: 12 | 15 = 15): ParsedSongResult {
  const lines = rawText.split(/\r?\n/);

  let detectedTitle = 'Imported Song';
  let detectedArtist = '';

  const sectionChordsMap: { name: string; chords: string[] }[] = [];
  let currentSectionName = 'Verse';
  let currentSectionChords: string[] = [];

  const uniqueChordsSet = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check for explicit title/artist metadata line e.g. "Title: Yesterday" or "Artist: Beatles"
    const titleMatch = trimmed.match(/^(?:title|song):\s*(.+)$/i);
    if (titleMatch) {
      detectedTitle = titleMatch[1].trim();
      continue;
    }

    const artistMatch = trimmed.match(/^artist:\s*(.+)$/i);
    if (artistMatch) {
      detectedArtist = artistMatch[1].trim();
      continue;
    }

    // Check for section header
    const sectionMatch = trimmed.match(SECTION_REGEX);
    if (sectionMatch) {
      // Save existing section if it has chords
      if (currentSectionChords.length > 0) {
        sectionChordsMap.push({
          name: currentSectionName,
          chords: [...currentSectionChords],
        });
        currentSectionChords = [];
      }

      // Format section name (e.g. "Verse 1", "Chorus")
      const rawSec = trimmed.replace(/[\[\]:]/g, '').trim();
      currentSectionName = rawSec.charAt(0).toUpperCase() + rawSec.slice(1);
      continue;
    }

    // Check for ChordPro bracketed chords within lyrics e.g. [C]Hey [G]Jude
    const bracketMatches = Array.from(trimmed.matchAll(BRACKET_CHORD_REGEX));
    if (bracketMatches.length > 0) {
      for (const m of bracketMatches) {
        const chordName = m[1].trim();
        if (chordName) {
          currentSectionChords.push(chordName);
          uniqueChordsSet.add(chordName);
        }
      }
      continue;
    }

    // Check if line is a standard chord line above lyrics
    if (isChordLine(trimmed)) {
      const chordMatches = Array.from(trimmed.matchAll(CHORD_REGEX));
      for (const m of chordMatches) {
        const chordName = m[1].trim();
        if (chordName && !NON_CHORD_WORDS.has(chordName.toUpperCase())) {
          currentSectionChords.push(chordName);
          uniqueChordsSet.add(chordName);
        }
      }
    }
  }

  // Push final section
  if (currentSectionChords.length > 0) {
    sectionChordsMap.push({
      name: currentSectionName,
      chords: [...currentSectionChords],
    });
  }

  // Fallback: If no section was created but we found unique chords
  if (sectionChordsMap.length === 0) {
    const allChords = Array.from(uniqueChordsSet);
    sectionChordsMap.push({
      name: 'Main Section',
      chords: allChords.length > 0 ? allChords : ['C', 'G', 'Am', 'F'],
    });
  }

  // Pads are a palette of the chords to play, not a timeline: one pad per unique chord.
  // First tab holds every chord in the song; then one tab per distinct song part.
  const uniqueInOrder = (chords: string[]) => Array.from(new Set(chords));
  const allChords = uniqueInOrder(sectionChordsMap.flatMap((sec) => sec.chords));

  const tabs: { name: string; chords: string[] }[] = [];
  const addTabs = (name: string, chords: string[]) => {
    for (let start = 0, part = 1; start < chords.length; start += defaultPadCount, part++) {
      tabs.push({
        name: part === 1 ? name : `${name} (${part})`,
        chords: chords.slice(start, start + defaultPadCount),
      });
    }
  };

  addTabs('All Chords', allChords);
  if (sectionChordsMap.length > 1) {
    const seen = new Set<string>([allChords.join(' ')]);
    for (const sec of sectionChordsMap) {
      const chords = uniqueInOrder(sec.chords);
      const key = chords.join(' ');
      if (seen.has(key)) continue; // repeated chorus, verse identical to an earlier one, etc.
      seen.add(key);
      addTabs(sec.name, chords);
    }
  }

  const stamp = Date.now();
  const finalSections: SongSection[] = tabs.map((tab, secIdx) => ({
    id: `sec-imported-${secIdx}-${stamp}`,
    name: tab.name,
    chords: Array.from({ length: defaultPadCount }, (_, pIdx) =>
      buildImportedChord(tab.chords[pIdx], `import-${secIdx}-${pIdx}-${stamp}`)
    ),
  }));

  const totalChordsFound = sectionChordsMap.reduce((acc, s) => acc + s.chords.length, 0);

  return {
    title: detectedTitle,
    artist: detectedArtist,
    sections: finalSections,
    totalChordsFound,
    allUniqueChords: Array.from(uniqueChordsSet),
  };
}
