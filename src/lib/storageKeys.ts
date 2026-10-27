// Per-user offline cache of songs; the server is the source of truth
export const songsCacheKey = (userId: string) => `chordist_songs_${userId}`;
export const ACTIVE_SONG_KEY = 'chordist_active_song_id';
// Set by the shared-song page when "Save to My Songs" is tapped while logged out
export const PENDING_FORK_KEY = 'chordist_pending_fork';
