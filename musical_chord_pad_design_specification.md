# Musical Chord Pad & Song Manager: Design Specification System

This document provides complete, actionable visual and UI/UX design specifications for a multi-platform (Android phones, tablets, and Desktop/PC) chord player and editor application. 

The specification uses **Android Pixel 7 (412 × 915 dp, 20:9 ratio, ~422 ppi)** as the base target reference while specifying responsive scaling behavior across tablets and desktop.

---

## 1. Design System & Style Guide

### 1.1 Color Palette & Theme Tokens

The application uses a dark-first UI theme to ensure high contrast against the bright, color-coded chord buttons and music input interfaces.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ COLOR PALETTE TOKENS                                                     │
├──────────────────┬─────────────┬────────────────────────────────────────┤
│ Token Name       │ Hex Code    │ Usage / Role                           │
├──────────────────┼─────────────┼────────────────────────────────────────┤
│ --bg-app         │ #0F1117     │ Main app background                     │
│ --bg-surface     │ #1A1D26     │ Cards, bottom sheets, navigation bar   │
│ --bg-elevated    │ #252936     │ Modal dialogs, key surfaces            │
│ --border-subtle  │ #2E3445     │ Dividers, inactive borders             │
│ --text-primary   │ #F0F3FA     │ Titles, primary chord captions         │
│ --text-secondary │ #9DA4B4     │ Subtitles, secondary note lists        │
│ --accent-primary │ #6C5CE7     │ Primary actions, active states         │
└──────────────────┴─────────────┴────────────────────────────────────────┘
```

#### Chord Category Color Mapping (Functional Palette)
Chord buttons are color-coded dynamically by root note or chord family to enable instant visual scanning during live performance.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ CHORD FAMILY COLOR TOKENS                                                │
├───────────────┬───────────┬─────────────┬───────────────────────────────┤
│ Family/Root   │ Token     │ Color Hex   │ Visual Indicator              │
├───────────────┼───────────┼─────────────┼───────────────────────────────┤
│ Major         │ --chord-C │ #FF5252     │ Crimson Red                   │
│ Minor         │ --chord-D │ #FF7A00     │ Deep Orange                   │
│ Dominant 7th  │ --chord-E │ #FFD600     │ Vibrant Yellow                │
│ Major 7th     │ --chord-F │ #00E676     │ Emerald Green                 │
│ Minor 7th     │ --chord-G │ #00E5FF     │ Cyan / Turquoise              │
│ Diminished    │ --chord-A │ #2979FF     │ Royal Blue                    │
│ Augmented     │ --chord-B │ #AA00FF     │ Deep Purple                   │
│ Custom / Alt  │ --chord-X │ #EC407A     │ Hot Pink                      │
└───────────────┴───────────┴─────────────┴───────────────────────────────┘
```

### 1.2 Typography System
* **Primary Font**: `Inter` or `Roboto` (System Fallback)
* **Chord Label Font**: `JetBrains Mono` or `Fira Code` (Monospaced, high legibility for musical symbols like `♯`, `♭`, `maj7`, `dim7`, `add9`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TYPOGRAPHY SCALE                                                        │
├─────────────────┬───────────┬──────────┬─────────────┬──────────────────┤
│ Style           │ Size (sp) │ Weight   │ Line Height │ Usage            │
├─────────────────┼───────────┼──────────┼─────────────┼──────────────────┤
│ Display Hero    │ 32sp      │ Bold     │ 40sp        │ Active Chord Pad │
│ Header Large    │ 22sp      │ SemiBold │ 28sp        │ Top Bar Title    │
│ Header Medium   │ 18sp      │ Medium   │ 24sp        │ Section Titles   │
│ Body Regular    │ 14sp      │ Regular  │ 20sp        │ Key details, list│
│ Caption         │ 12sp      │ Regular  │ 16sp        │ Sub-note labels  │
└─────────────────┴───────────┴──────────┴─────────────┴──────────────────┘
```

---

## 2. Screen 1: Main Performance Screen (Song Chord Grid)

### 2.1 Layout Wireframe (Pixel 7 Portrait — 412 × 915 dp)

```
┌──────────────────────────────────────────────────────────────┐ (0, 0)
│ [≡]  Midnight City - M83                    [Library]  [⚙]  │ Top App Bar (56dp)
├──────────────────────────────────────────────────────────────┤
│ ◀ [Verse]   (Chorus)   [Bridge]   [Outro]   [+]             │ Song Section Switcher
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │   Cmaj7      │ │     Am7      │ │     Dm9      │            │
│ │  (C E G B)   │ │  (A C E G)   │ │ (D F A C E)  │            │ Grid Row 1
│ └──────────────┘ └──────────────┘ └──────────────┘            │ (3 × 5 Viewport)
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │     G7       │ │    Em7       │ │   Fmaj7      │            │
│ │  (G B D F)   │ │  (E G B D)   │ │  (F A C E)   │            │ Grid Row 2
│ └──────────────┘ └──────────────┘ └──────────────┘            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │     Bb       │ │   Csus4      │ │   A7b9       │            │
│ │ (A# D F)     │ │  (C F G)     │ │ (A C# E G A#)│            │ Grid Row 3
│ └──────────────┘ └──────────────┘ └──────────────┘            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │    Ddim7     │ │    E7#9      │ │     Fm       │            │
│ │ (D F G# B)   │ │ (E G# B D G) │ │   (F G# C)   │            │ Grid Row 4
│ └──────────────┘ └──────────────┘ └──────────────┘            │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │    Bm7b5     │ │    Ebmaj7    │ │    Abadd9    │            │
│ │ (B D F A)    │ │ (D# G A# D)  │ │ (G# C D# A#) │            │ Grid Row 5
│ └──────────────┘ └──────────────┘ └──────────────┘            │
│ ~ ~ ~ ~ ~ ~ ~ ~ ~ Scrollable Content Below ~ ~ ~ ~ ~ ~ ~ ~ ~ │
├──────────────────────────────────────────────────────────────┤
│ [Song Manager]          [Edit Current Grid]                 │ Bottom Bar (64dp)
└──────────────────────────────────────────────────────────────┘ (412, 915)
```

### 2.2 Detailed Visual Specifications (Pixel 7 Default)

* **Top App Bar (56dp)**:
  * Left: Hamburger Icon `[≡]` (opens song drawer)
  * Center: Current Song Title (18sp, Bold, `#F0F3FA`) + Tempo/Key Subtitle (12sp, `#9DA4B4`)
  * Right: Quick Library Icon `[Library]`, Settings Icon `[⚙]`
* **Section Tab Bar (48dp)**:
  * Horizontal scrollable chips: Verse, Chorus, Bridge, Outro, Custom section `[+]`
  * Active Tab: `#6C5CE7` fill, white text; Inactive Tab: `#252936` fill, `#9DA4B4` text.
* **3x5 Grid Layout Parameters**:
  * Total Grid Width: `388dp` (12dp margin left/right)
  * Column Width: `118dp` per square
  * Spacing: `12dp` vertical and horizontal gap between squares
  * Square Dimensions: Exact `1:1` aspect ratio (`118dp × 118dp`)
  * Corner Radius: `16dp`
* **Chord Square Interior Styling**:
  * **Background**: Color token derived from root/family (e.g., `#FF5252` for C family) with subtle gradient overlay (`linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.3) 100%)`).
  * **Main Text**: Monospaced 22sp, Bold, White, centered in upper half.
  * **Secondary Text (Note list)**: 11sp Regular, semi-transparent white (`rgba(255,255,255,0.7)`), centered below the main text showing current notes (e.g., `C E G B`).
  * **Touch Interaction**:
    * **Pressed State**: Scale down to `0.95x`, outer glow `#FFFFFF` (4dp spread, 50% opacity), instant audio playback trigger.
    * **Long Press State**: Trigger context menu: "Edit Chord Pad", "Duplicate Pad", "Reorder Pad", "Delete Pad".

---

## 3. Screen 2: Chord Preset Editor Screen

This screen allows configuring up to 10 notes for a single chord pad using an interactive piano or guitar interface.

### 3.1 Layout Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ [← Back]          Edit Pad: Button 4 (Chorus)    [Save Check]│ Top Bar
├──────────────────────────────────────────────────────────────┤
│ CHORD NAME        OCTAVE SETTING      ACTIVE NOTES (4/10)    │
│ [ Cmaj7        ]  [ - ] Octave 4 [ + ] C4, E4, G4, B4        │ Header Data Block
├──────────────────────────────────────────────────────────────┤
│ VIEW MODE: (•) Piano Keyboard    ( ) Guitar Fretboard         │ Toggle Selector
├──────────────────────────────────────────────────────────────┤
│ PIANO INTERFACE MODE                                         │
│ ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐ │
│ │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │
│ │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │
│ │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │█│ │█│ │█│ │ │█│ │█│ │ │
│ │ └─┘ └─┘ │ │ └─┘ └─┘ └─┘ │ └─┘ └─┘ │ └─┘ └─┘ └─┘ │ └─┘ └─┘ │ │
│ │  C4   E4│ │   G4        │  B4     │             │         │ (Selected Keys Glow)
│ └─────────┴─┴─────────────┴─────────┴─────────────┴─────────┘ │
├──────────────────────────────────────────────────────────────┤
│ GUITAR FRETBOARD MODE (SWAPPED VIEW)                         │
│ Nut  Fret 1   Fret 2   Fret 3   Fret 4   Fret 5   Fret 6     │
│ E ║───┼────────┼────────┼───●────┼────────┼────────┼───────  │
│ B ║───┼────────┼────────┼────────┼───●────┼────────┼───────  │
│ G ║───┼────────┼────────┼────────┼────────┼────────┼───────  │
│ D ║───┼────────┼───●────┼────────┼────────┼────────┼───────  │
│ A ║───┼────────┼────────┼───●────┼────────┼────────┼───────  │
│ E ║───┼────────┼────────┼────────┼────────┼────────┼───────  │
├──────────────────────────────────────────────────────────────┤
│ SELECTED NOTES SLOT ARRAY (Up to 10)                         │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ...  │
│ │ C4 │ │ E4 │ │ G4 │ │ B4 │ │ +  │ │ +  │ │ +  │ │ +  │      │
│ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘      │
├──────────────────────────────────────────────────────────────┤
│ [Preview Play]      [Clear All]      [Auto-Detect Name]     │ Action Footer
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Component Details & Mechanics

1. **Header Data Block**:
   * **Chord Name Input Field**: Editable text field with dynamic chord analyzer. As notes are tapped on the piano/guitar, the app calculates and suggests alphabetical notation names (e.g., `Cmaj7`, `Am/G`).
   * **Octave Selector**: Step counter (`-` / `+`) setting the base pitch layer for selected notes.
2. **Interactive Instrument Visualizers**:
   * **Piano Keyboard Component**:
     * Displays a 2 to 3 octave span with horizontal drag pan.
     * Selected white and black keys highlight in glowing vibrant cyan (`#00E5FF`) with a visual touch dot indicator.
     * Touch area optimization: Minimum touch target width `32dp` for white keys, `24dp` for black keys.
   * **Guitar Fretboard Component**:
     * Shows 6 standard tuning strings (E2, A2, D3, G3, B3, E4).
     * Frets 0 through 15 are accessible via horizontal scrolling.
     * Markers (Inlays) on frets 3, 5, 7, 9, 12 (double dot), 15.
     * Tapping a string/fret node places a colored dot displaying the pitch (e.g., `C4`).
3. **Selected Notes Slots Container**:
   * Horizontally scrollable row containing 10 slots.
   * Active slots display note name + octave (e.g., `G#4`), with an `×` button to strip the note.
   * Empty slots show an outline box with a `+` icon.
   * Constraint Rules: Minimum 1 note, Maximum 10 notes. If 10 notes are populated, key selection temporarily locks until a note is deleted.

---

## 4. Screen 3: Song Settings & Structure Manager

This screen handles full song setup, section sequencing, chord slot assignments, and global audio parameters.

### 4.1 Layout Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ [← Main]             Song Configuration             [Save]   │
├──────────────────────────────────────────────────────────────┤
│ SONG METADATA                                                │
│ Title:  [ Midnight City                                   ] │
│ Artist: [ M83                                             ] │
│ BPM:    [ 105 ] (-) (+)    Key Signature: [ C Major    ▼ ]   │
├──────────────────────────────────────────────────────────────┤
│ SONG SECTIONS & CHORD ASSIGNMENTS                            │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ≡ Verse 1 (8 Chords)                       [Edit] [🗑]   │ │
│ │   [ Cmaj7 ]  [ Am7 ]  [ Dm9 ]  [ G7 ]                    │ │
│ │   [ Em7 ]    [ Fmaj7 ] [ Bb ]   [ Csus4 ]                 │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ ≡ Chorus (6 Chords)                        [Edit] [🗑]   │ │
│ │   [ A7b9 ]   [ Ddim7 ] [ E7#9 ] [ Fm ]                     │ │
│ │   [ Bm7b5 ]  [ Ebmaj7 ]                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│ [ + Add New Song Section ]                                   │
├──────────────────────────────────────────────────────────────┤
│ SOUND ENGINE & OUTPUT SETTINGS                               │
│ Instrument Sound: [ Grand Piano                     ▼ ]      │
│ Playback Style:   (•) Strummed Pad   ( ) Arpeggio   ( ) Block│
│ Output Device:    [ Default System Audio Output     ▼ ]      │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Interaction Specifications
* **Drag-and-Drop Reordering**: Long press on the drag handle `≡` allows changing the structure sequence of sections (Verse → Chorus → Bridge).
* **Section Expansion**: Each section card is collapsable to show/hide its associated chord square previews.
* **Sound Engine Selector**: Dropdown options for output engine sound presets: `Grand Piano`, `Electric Piano (Rhodes)`, `Acoustic Guitar`, `Synth Pad`, `Hammond Organ`.

---

## 5. Screen 4: Preset Chord Library (Optional Screen)

Allows importing pre-made chord progressions and industry-standard chord shapes directly into active song slots.

### 5.1 Layout Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ Chord Library Search               [🔍 Search Chords...   ]  │
├──────────────────────────────────────────────────────────────┤
│ CATEGORY FILTERS                                             │
│ [ All ]  [ Jazz ]  [ Pop ]  [ Rock ]  [ Neo-Soul ]  [ Basic ]│
├──────────────────────────────────────────────────────────────┤
│ CHORD PROGRESSION PRESETS                                    │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 2-5-1 Jazz Progression in C                              │ │
│ │ Chords: [ Dm7 ] -> [ G7 ] -> [ Cmaj7 ]                   │ │
│ │ [ + Import to Song ]                                     │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Pop 4-Chord Standard (Axis of Awesome)                   │ │
│ │ Chords: [ C ] -> [ G ] -> [ Am ] -> [ F ]                │ │
│ │ [ + Import to Song ]                                     │ │
│ └──────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ DICTIONARY LOOKUP BY ROOT                                    │
│ Root: [ C ]  Type: [ Major 7th (maj7)                    ▼ ] │
│ Diagrams:                                                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │ Cmaj7 (Root) │ │ Cmaj7 (Inv 1)│ │ Cmaj7 (Drop 2)│            │
│ │  C-E-G-B     │ │  E-G-B-C     │ │  C-G-B-E     │            │
│ │ [ Add Slot ] │ │ [ Add Slot ] │ │ [ Add Slot ] │            │
│ └──────────────┘ └──────────────┘ └──────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Multi-Device Responsive Scaling Specifications

To ensure seamless performance across Android Phones, Tablets, and PC / Desktop screens, use the following layout adapter rules:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ MULTI-DEVICE RESPONSIVE ADAPTATION                                                       │
├──────────────────┬──────────────────────┬──────────────────────┬─────────────────────────┤
│ Target Platform  │ Viewport / Breakpoint│ Grid Layout (Screen 1)│ Editor View (Screen 2)  │
├──────────────────┼──────────────────────┼──────────────────────┼─────────────────────────┤
│ Android Phone    │ Width < 600dp        │ 3 Columns × 5 Rows   │ Stacked Controls        │
│ (e.g. Pixel 7)   │ (Portrait orientation)│ Vertical Scroll      │ Piano & Fretboard Toggle│
├──────────────────┼──────────────────────┼──────────────────────┼─────────────────────────┤
│ Tablet           │ 600dp ≤ Width < 1024dp│ 5 Columns × 3 Rows   │ Split View:             │
│ (Portrait/Land)  │                      │ Side-by-Side Panel   │ Left Control, Right Key │
├──────────────────┼──────────────────────┼──────────────────────┼─────────────────────────┤
│ PC / Desktop /   │ Width ≥ 1024dp       │ 5 Columns × N Rows   │ Dual View:              │
│ Large Window     │                      │ Full Screen Matrix   │ Piano AND Fretboard     │
│                  │                      │ + Sidebar Navigation │ Shown simultaneously    │
└──────────────────┴──────────────────────┴──────────────────────┴─────────────────────────┘
```

### 6.1 Desktop / PC Keyboard & MIDI Mapping Blueprint
When rendered on PC or connected to an external controller:
* **Keyboard Hotkeys**:
  * Top Row Chords (1-3): `Q`, `W`, `E`
  * Row 2 Chords (4-6): `A`, `S`, `D`
  * Row 3 Chords (7-9): `Z`, `X`, `C`
  * Row 4 Chords (10-12): `R`, `T`, `Y`
  * Row 5 Chords (13-15): `F`, `G`, `H`
* **MIDI In Mapping**: Standard MIDI CC or Note triggers maps 1:1 to the 15 active chord pad buttons for low-latency live performance triggering.