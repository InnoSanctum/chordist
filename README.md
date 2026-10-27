# Chordist 🎵
> Multi-platform musical chord pad player and song manager for Android phones, tablets, and desktop PC. Built with Next.js 15, Tailwind CSS, Turso (libSQL), Web Audio API, and PWA capabilities.

---

## ✨ Features

- **Responsive Chord Pad Matrix**:
  - Displays **15 square buttons** (or **12 buttons**, selectable in Settings).
  - Dynamic chord family color coding (Crimson for Major, Orange for Minor, Cyan for Minor 7th, Emerald for Maj7, etc.).
  - Instant touch / mouse / physical keyboard triggers (`QWE...` hotkeys on desktop).
  - Responsive layouts: $3 \times 5$ on phones (Pixel 7 target), $5 \times 3$ on tablets and desktop.

- **High-Fidelity Web Audio Engine**:
  - **Clean Acoustic Guitar** (Karplus-Strong physical modeling plucked string synthesis with wooden soundboard resonance).
  - **Grand Piano** (Dynamic multi-harmonic hammer attack and sustained acoustic decay).
  - **Rhodes Electric Piano** & **Ambient Synth Pad**.
  - Configurable envelope: decay/release fade-out duration ($0.5\text{ s} - 6.0\text{ s}$).
  - Configurable strumming: Block chords, Strum Down, Strum Up, Arpeggio, with $0 - 50\text{ ms}$ inter-note delay.

- **Human-Friendly Dual Chord Editor**:
  - Configure from **1 to 10 notes** per chord pad.
  - **Interactive Piano Keyboard**: 3-octave span with glowing touch keys.
  - **Interactive Guitar Fretboard**: 6 standard strings ($E_2 - E_4$), 0–15 frets, authentic fret inlay markers ($3, 5, 7, 9, 12, 15$).
  - **Auto Chord Name Detection**: Instant harmonic recognition proposing chord labels (e.g. `Cmaj7`, `Dm9`, `A7b9`).
  - 10-slot note array with quick remove badges.

- **Song & Section Manager**:
  - Create and save songs with multiple sections: `Verse`, `Chorus`, `Bridge`, `Outro`, etc.
  - All chords and sound parameters are automatically preloaded when choosing a song from the library drawer.

- **Chord Library & Progressions**:
  - Standard progressions: Pop 4-Chord (`I - V - vi - IV`), Jazz 2-5-1 (`ii - V - I`), Neo-Soul, 12-Bar Blues, Andalusian Cadence.
  - Searchable chord dictionary: pick root ($C \dots B$) and quality (Major, Minor, 7th, maj7, dim7, sus4, add9).

- **Cloud Sync & Sharing (Turso + Vercel)**:
  - Backed by **Turso (libSQL)** SQLite edge database.
  - One-click share links (`/s/[shareCode]`) and QR code dialog.
  - Friends can open the link in any mobile browser or PWA, play the pads, and click **"Save to My Songs"** to fork it.

- **Progressive Web App (PWA)**:
  - Add to Home Screen on Android and PC.
  - Standalone full-screen mode with touch-action optimizations (no accidental double-tap zoom).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Turso Database
Create a free database at [turso.tech](https://turso.tech) and add your credentials in `.env`:
```env
TURSO_URL="libsql://your-database-name.turso.io"
TURSO_TOKEN="your-turso-auth-token"
ADMIN_EMAIL="you@example.com"   # this account inherits songs created before user accounts existed
```

### 3. Initialize & Seed Database Schema
```bash
node --env-file=.env scripts/setup-turso.mjs
node --env-file=.env scripts/seed-turso.mjs
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In Vercel Project Settings → **Environment Variables**, add:
   - `TURSO_URL`
   - `TURSO_TOKEN`
   - `ADMIN_EMAIL`
4. Click **Deploy**!

---

## 👤 Accounts

- Anyone can create an account with email + password (no email confirmation). Each user sees only their own songs; new accounts start with the two starter songs.
- Sessions last a year, so an installed PWA stays logged in.
- Forgotten password (there's no email recovery):
  ```bash
  node --env-file=.env scripts/reset-password.mjs friend@example.com NewPassword123
  ```

