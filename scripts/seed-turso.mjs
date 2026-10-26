import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_TOKEN || process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

async function seed() {
  console.log('Seeding initial songs into Turso...');

  const initialSongs = [
    {
      id: 'song-midnight-city',
      title: 'Midnight City',
      artist: 'M83',
      bpm: 105,
      keySignature: 'C Major',
      instrument: 'acoustic_guitar',
      padCount: 15,
      playbackStyle: 'strum_down',
      strumSpeedMs: 25,
      fadeDuration: 2.5,
      sections: [
        {
          id: 'section-verse',
          name: 'Verse',
          chords: [
            { id: 'c1', label: 'Cmaj7', notes: ['C3', 'G3', 'B3', 'E4'], root: 'C', chordType: 'maj7', baseOctave: 4, colorToken: '#00E676' },
            { id: 'c2', label: 'Am7', notes: ['A2', 'E3', 'G3', 'C4'], root: 'A', chordType: 'min7', baseOctave: 4, colorToken: '#00E5FF' },
            { id: 'c3', label: 'Dm9', notes: ['D3', 'F3', 'A3', 'C4', 'E4'], root: 'D', chordType: 'min7', baseOctave: 4, colorToken: '#00E5FF' },
            { id: 'c4', label: 'G7', notes: ['G2', 'D3', 'F3', 'B3'], root: 'G', chordType: '7', baseOctave: 4, colorToken: '#FFD600' },
            { id: 'c5', label: 'Em7', notes: ['E2', 'B2', 'D3', 'G3'], root: 'E', chordType: 'min7', baseOctave: 4, colorToken: '#00E5FF' },
            { id: 'c6', label: 'Fmaj7', notes: ['F2', 'C3', 'E3', 'A3'], root: 'F', chordType: 'maj7', baseOctave: 4, colorToken: '#00E676' },
            { id: 'c7', label: 'Bb', notes: ['A#2', 'D3', 'F3', 'A#3'], root: 'Bb', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
            { id: 'c8', label: 'Csus4', notes: ['C3', 'F3', 'G3', 'C4'], root: 'C', chordType: 'sus4', baseOctave: 4, colorToken: '#EC407A' },
            { id: 'c9', label: 'A7b9', notes: ['A2', 'C#3', 'G3', 'A#3'], root: 'A', chordType: '7b9', baseOctave: 4, colorToken: '#FFD600' },
            { id: 'c10', label: 'Ddim7', notes: ['D3', 'F3', 'G#3', 'B3'], root: 'D', chordType: 'dim7', baseOctave: 4, colorToken: '#2979FF' },
            { id: 'c11', label: 'E7#9', notes: ['E2', 'G#2', 'D3', 'G3'], root: 'E', chordType: '7#9', baseOctave: 4, colorToken: '#FFD600' },
            { id: 'c12', label: 'Fm', notes: ['F2', 'C3', 'G#3', 'C4'], root: 'F', chordType: 'Minor', baseOctave: 4, colorToken: '#FF7A00' },
            { id: 'c13', label: 'Bm7b5', notes: ['B2', 'D3', 'F3', 'A3'], root: 'B', chordType: 'm7b5', baseOctave: 4, colorToken: '#2979FF' },
            { id: 'c14', label: 'Ebmaj7', notes: ['D#3', 'G3', 'A#3', 'D4'], root: 'Eb', chordType: 'maj7', baseOctave: 4, colorToken: '#00E676' },
            { id: 'c15', label: 'Abadd9', notes: ['G#2', 'C3', 'D#3', 'A#3'], root: 'Ab', chordType: 'add9', baseOctave: 4, colorToken: '#EC407A' },
          ],
        },
      ],
    },
    {
      id: 'song-pop-standard',
      title: 'Pop 4-Chord Standard',
      artist: 'Axis of Awesome',
      bpm: 120,
      keySignature: 'C Major',
      instrument: 'grand_piano',
      padCount: 15,
      playbackStyle: 'block',
      strumSpeedMs: 0,
      fadeDuration: 3.0,
      sections: [
        {
          id: 'pop-s1',
          name: 'Main Progression',
          chords: [
            { id: 'p1', label: 'C', notes: ['C3', 'G3', 'C4', 'E4'], root: 'C', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
            { id: 'p2', label: 'G', notes: ['G2', 'D3', 'G3', 'B3'], root: 'G', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
            { id: 'p3', label: 'Am', notes: ['A2', 'E3', 'A3', 'C4'], root: 'A', chordType: 'Minor', baseOctave: 4, colorToken: '#FF7A00' },
            { id: 'p4', label: 'F', notes: ['F2', 'C3', 'F3', 'A3'], root: 'F', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
            { id: 'p5', label: 'C/E', notes: ['E2', 'G3', 'C4', 'E4'], root: 'C', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
            { id: 'p6', label: 'G/B', notes: ['B2', 'G3', 'D4'], root: 'G', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
            { id: 'p7', label: 'Am7', notes: ['A2', 'E3', 'G3', 'C4'], root: 'A', chordType: 'min7', baseOctave: 4, colorToken: '#00E5FF' },
            { id: 'p8', label: 'Fadd9', notes: ['F2', 'C3', 'G3', 'A3'], root: 'F', chordType: 'add9', baseOctave: 4, colorToken: '#EC407A' },
            { id: 'p9', label: 'Dm', notes: ['D3', 'A3', 'D4', 'F4'], root: 'D', chordType: 'Minor', baseOctave: 4, colorToken: '#FF7A00' },
            { id: 'p10', label: 'Em', notes: ['E2', 'B2', 'E3', 'G3'], root: 'E', chordType: 'Minor', baseOctave: 4, colorToken: '#FF7A00' },
            { id: 'p11', label: 'Fmaj7', notes: ['F2', 'C3', 'E3', 'A3'], root: 'F', chordType: 'maj7', baseOctave: 4, colorToken: '#00E676' },
            { id: 'p12', label: 'Gsus4', notes: ['G2', 'D3', 'C4', 'G4'], root: 'G', chordType: 'sus4', baseOctave: 4, colorToken: '#EC407A' },
            { id: 'p13', label: 'G7', notes: ['G2', 'D3', 'F3', 'B3'], root: 'G', chordType: '7', baseOctave: 4, colorToken: '#FFD600' },
            { id: 'p14', label: 'Csus2', notes: ['C3', 'G3', 'D4', 'G4'], root: 'C', chordType: 'sus2', baseOctave: 4, colorToken: '#EC407A' },
            { id: 'p15', label: 'C', notes: ['C3', 'E3', 'G3', 'C4'], root: 'C', chordType: 'Major', baseOctave: 4, colorToken: '#FF5252' },
          ],
        },
      ],
    },
  ];

  const now = new Date().toISOString();

  for (const s of initialSongs) {
    await client.execute({
      sql: `
        INSERT INTO songs (
          id, creator_id, title, artist, bpm, key_signature,
          instrument, pad_count, playback_style, strum_speed_ms,
          fade_duration, is_public, share_code, sections_json,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          artist = excluded.artist,
          bpm = excluded.bpm,
          key_signature = excluded.key_signature,
          instrument = excluded.instrument,
          pad_count = excluded.pad_count,
          playback_style = excluded.playback_style,
          strum_speed_ms = excluded.strum_speed_ms,
          fade_duration = excluded.fade_duration,
          sections_json = excluded.sections_json,
          updated_at = excluded.updated_at;
      `,
      args: [
        s.id,
        'user_anonymous',
        s.title,
        s.artist,
        s.bpm,
        s.keySignature,
        s.instrument,
        s.padCount,
        s.playbackStyle,
        s.strumSpeedMs,
        s.fadeDuration,
        1,
        s.id,
        JSON.stringify(s.sections),
        now,
        now,
      ],
    });
  }

  console.log('Successfully seeded songs into Turso!');
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});

