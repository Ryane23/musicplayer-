import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { playlistStorageService } from '@/services/PlaylistStorageService';
import { importSpotifyPlaylist } from '@/services/SpotifyImportService';
import { MusicTrack } from '@/types/music';
import { SpotifyImportResult, UserPlaylist } from '@/types/playlist';

type CreatePlaylistInput = {
  name: string;
  description?: string;
  trackIds: string[];
  coverUri?: string;
};

type UpdatePlaylistInput = Partial<CreatePlaylistInput>;

interface PlaylistContextType {
  playlists: UserPlaylist[];
  isLoading: boolean;
  createPlaylist: (input: CreatePlaylistInput) => Promise<UserPlaylist>;
  updatePlaylist: (id: string, input: UpdatePlaylistInput) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  importFromSpotify: (url: string, library: MusicTrack[]) => Promise<SpotifyImportResult>;
  resolvePlaylistTracks: (playlist: UserPlaylist, library: MusicTrack[]) => MusicTrack[];
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

function createId() {
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const stored = await playlistStorageService.load();
      setPlaylists(stored);
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next: UserPlaylist[]) => {
    setPlaylists(next);
    await playlistStorageService.save(next);
  }, []);

  const createPlaylist = useCallback(
    async (input: CreatePlaylistInput) => {
      const now = Date.now();
      const playlist: UserPlaylist = {
        id: createId(),
        name: input.name.trim(),
        description: input.description?.trim() || undefined,
        trackIds: input.trackIds,
        coverUri: input.coverUri ?? undefined,
        createdAt: now,
        updatedAt: now,
        source: 'local',
      };

      const next = [playlist, ...playlists];
      await persist(next);
      return playlist;
    },
    [persist, playlists]
  );

  const updatePlaylist = useCallback(
    async (id: string, input: UpdatePlaylistInput) => {
      const next = playlists.map((playlist) => {
        if (playlist.id !== id) {
          return playlist;
        }

        return {
          ...playlist,
          name: input.name?.trim() ?? playlist.name,
          description:
            input.description !== undefined ? input.description.trim() || undefined : playlist.description,
          trackIds: input.trackIds ?? playlist.trackIds,
          coverUri: input.coverUri !== undefined ? input.coverUri : playlist.coverUri,
          updatedAt: Date.now(),
        };
      });

      await persist(next);
    },
    [persist, playlists]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      await persist(playlists.filter((playlist) => playlist.id !== id));
    },
    [persist, playlists]
  );

  const importFromSpotify = useCallback(
    async (url: string, library: MusicTrack[]): Promise<SpotifyImportResult> => {
      const result = await importSpotifyPlaylist(url, library);
      const now = Date.now();
      const playlist: UserPlaylist = {
        id: createId(),
        createdAt: now,
        updatedAt: now,
        ...result.playlist,
      };

      const next = [playlist, ...playlists];
      await persist(next);

      return {
        playlist,
        matched: result.matched.length,
        total: result.matched.length + result.missing.length,
        missing: result.missing,
      };
    },
    [persist, playlists]
  );

  const resolvePlaylistTracks = useCallback((playlist: UserPlaylist, library: MusicTrack[]) => {
    const byId = new Map(library.map((track) => [track.id, track]));
    return playlist.trackIds
      .map((id) => byId.get(id))
      .filter((track): track is MusicTrack => Boolean(track));
  }, []);

  const value = useMemo(
    () => ({
      playlists,
      isLoading,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      importFromSpotify,
      resolvePlaylistTracks,
    }),
    [
      playlists,
      isLoading,
      createPlaylist,
      updatePlaylist,
      deletePlaylist,
      importFromSpotify,
      resolvePlaylistTracks,
    ]
  );

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
}

export function usePlaylists(): PlaylistContextType {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
}
