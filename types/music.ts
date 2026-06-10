export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in milliseconds
  uri: string; // URL or local path to the audio file
  coverUri?: string; // URL or local path to the album cover
}

export interface MusicPlayerState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  position: number; // in milliseconds
  duration: number; // in milliseconds
  volume: number;
  currentIndex: number;
  tracks: MusicTrack[];
}