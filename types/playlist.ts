export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  coverUri?: string;
  createdAt: number;
  updatedAt: number;
  source?: 'local' | 'spotify';
  spotifyPlaylistId?: string;
  spotifyUrl?: string;
}

export type SpotifyImportResult = {
  playlist: UserPlaylist;
  matched: number;
  total: number;
  missing: string[];
};
