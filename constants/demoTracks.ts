import { Asset } from 'expo-asset';
import { MusicTrack } from '@/types/music';

const DEMO_AUDIO = require('@/assets/sounds/demo.wav');

const DEMO_TRACK_TEMPLATES: Omit<MusicTrack, 'uri'>[] = [
  {
    id: 'demo-1',
    title: 'Midnight Drive',
    artist: 'Neon Avenue',
    album: 'Night Pulse',
    duration: 3000,
    coverUri: 'https://placehold.co/400x400/1DB954/FFFFFF?text=MD',
  },
  {
    id: 'demo-2',
    title: 'City Lights',
    artist: 'Blue Static',
    album: 'Night Pulse',
    duration: 3000,
    coverUri: 'https://placehold.co/400x400/1ED760/FFFFFF?text=CL',
  },
  {
    id: 'demo-3',
    title: 'Soft Echo',
    artist: 'Tidewave',
    album: 'Open Space',
    duration: 3000,
    coverUri: 'https://placehold.co/400x400/509BF5/FFFFFF?text=SE',
  },
  {
    id: 'demo-4',
    title: 'Glass Roads',
    artist: 'Tidewave',
    album: 'Open Space',
    duration: 3000,
    coverUri: 'https://placehold.co/400x400/E91429/FFFFFF?text=GR',
  },
  {
    id: 'demo-5',
    title: 'Static Bloom',
    artist: 'Afterglow',
    album: 'Warm Signals',
    duration: 3000,
    coverUri: 'https://placehold.co/400x400/8D67AB/FFFFFF?text=SB',
  },
  {
    id: 'demo-6',
    title: 'Low Tide',
    artist: 'Afterglow',
    album: 'Warm Signals',
    duration: 3000,
    coverUri: 'https://placehold.co/400x400/F59B23/FFFFFF?text=LT',
  },
];

let cachedDemoTracks: MusicTrack[] | null = null;

/** Bundled demo tracks that work offline (no network required). */
export async function getDemoTracks(): Promise<MusicTrack[]> {
  if (cachedDemoTracks) {
    return cachedDemoTracks;
  }

  const asset = Asset.fromModule(DEMO_AUDIO);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;

  if (!uri) {
    throw new Error('Failed to resolve bundled demo audio URI');
  }

  cachedDemoTracks = DEMO_TRACK_TEMPLATES.map((track) => ({
    ...track,
    uri,
  }));

  return cachedDemoTracks;
}

/** Synchronous fallback before async demo resolution completes. */
export const DEMO_TRACKS_PLACEHOLDER: MusicTrack[] = DEMO_TRACK_TEMPLATES.map((track) => ({
  ...track,
  uri: '',
}));
