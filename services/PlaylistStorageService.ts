import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { UserPlaylist } from '@/types/playlist';

const PLAYLISTS_FILE = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}playlists.json`
  : null;

let webCache: UserPlaylist[] | null = null;

class PlaylistStorageService {
  async load(): Promise<UserPlaylist[]> {
    try {
      if (!PLAYLISTS_FILE) {
        return webCache ?? [];
      }

      const info = await FileSystem.getInfoAsync(PLAYLISTS_FILE);
      if (!info.exists) {
        return [];
      }

      const raw = await FileSystem.readAsStringAsync(PLAYLISTS_FILE);
      const parsed = JSON.parse(raw) as UserPlaylist[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to load playlists:', error);
      return Platform.OS === 'web' ? webCache ?? [] : [];
    }
  }

  async save(playlists: UserPlaylist[]): Promise<void> {
    if (!PLAYLISTS_FILE) {
      webCache = playlists;
      return;
    }

    await FileSystem.writeAsStringAsync(PLAYLISTS_FILE, JSON.stringify(playlists));
  }
}

export const playlistStorageService = new PlaylistStorageService();
