import { MusicTrack } from '@/types/music';
import { UserPlaylist } from '@/types/playlist';
import { base64Encode } from '@/utils/base64';

type SpotifyPlaylistTrack = {
  title: string;
  artist: string;
};

type SpotifyTokenResponse = {
  access_token: string;
  expires_in: number;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseSpotifyPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/playlist\/([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) {
    return match[1];
  }

  if (/^[a-zA-Z0-9]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function matchSpotifyTrackToLibrary(
  spotifyTrack: SpotifyPlaylistTrack,
  library: MusicTrack[]
): MusicTrack | null {
  const title = normalize(spotifyTrack.title);
  const artist = normalize(spotifyTrack.artist);

  const exact = library.find(
    (track) => normalize(track.title) === title && normalize(track.artist) === artist
  );
  if (exact) {
    return exact;
  }

  const fuzzy = library.find((track) => {
    const localTitle = normalize(track.title);
    const localArtist = normalize(track.artist);
    const titleMatch =
      localTitle.includes(title) || title.includes(localTitle) || localTitle === title;
    const artistMatch =
      !artist ||
      localArtist.includes(artist) ||
      artist.includes(localArtist) ||
      localArtist === artist;
    return titleMatch && artistMatch;
  });

  return fuzzy ?? null;
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Spotify API keys are not configured. Add EXPO_PUBLIC_SPOTIFY_CLIENT_ID and EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET to your .env file.'
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const credentials = base64Encode(`${clientId}:${clientSecret}`);
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Could not authenticate with Spotify. Check your API credentials.');
  }

  const data = (await response.json()) as SpotifyTokenResponse;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  };
  return data.access_token;
}

async function fetchPlaylistMeta(playlistId: string, token: string) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,description,images`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Could not load that Spotify playlist. Make sure the link is public.');
  }

  return response.json() as Promise<{
    name: string;
    description: string | null;
    images?: { url: string }[];
  }>;
}

async function fetchPlaylistTracks(playlistId: string, token: string): Promise<SpotifyPlaylistTrack[]> {
  const tracks: SpotifyPlaylistTrack[] = [];
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(name,artists(name)))`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error('Could not read tracks from the Spotify playlist.');
    }

    const data = (await response.json()) as {
      items: { track: { name: string; artists: { name: string }[] } | null }[];
      next: string | null;
    };

    for (const item of data.items) {
      if (!item.track?.name) {
        continue;
      }
      tracks.push({
        title: item.track.name,
        artist: item.track.artists[0]?.name ?? 'Unknown Artist',
      });
    }

    url = data.next;
  }

  return tracks;
}

export async function importSpotifyPlaylist(
  input: string,
  library: MusicTrack[]
): Promise<{ playlist: Omit<UserPlaylist, 'id' | 'createdAt' | 'updatedAt'>; matched: MusicTrack[]; missing: string[] }> {
  const playlistId = parseSpotifyPlaylistId(input);
  if (!playlistId) {
    throw new Error('Paste a valid Spotify playlist link or ID.');
  }

  const token = await getAccessToken();
  const [meta, spotifyTracks] = await Promise.all([
    fetchPlaylistMeta(playlistId, token),
    fetchPlaylistTracks(playlistId, token),
  ]);

  const matched: MusicTrack[] = [];
  const missing: string[] = [];
  const seen = new Set<string>();

  for (const spotifyTrack of spotifyTracks) {
    const local = matchSpotifyTrackToLibrary(spotifyTrack, library);
    if (local && !seen.has(local.id)) {
      seen.add(local.id);
      matched.push(local);
      continue;
    }

    if (!local) {
      missing.push(`${spotifyTrack.title} — ${spotifyTrack.artist}`);
    }
  }

  return {
    playlist: {
      name: meta.name,
      description: meta.description ?? `Imported from Spotify`,
      trackIds: matched.map((track) => track.id),
      coverUri: meta.images?.[0]?.url,
      source: 'spotify',
      spotifyPlaylistId: playlistId,
      spotifyUrl: `https://open.spotify.com/playlist/${playlistId}`,
    },
    matched,
    missing,
  };
}
