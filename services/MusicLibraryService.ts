import * as MediaLibrary from 'expo-media-library';
import { MusicTrack } from '../types/music';
import { canScanDeviceLibrary } from '../utils/runtime';

export class MusicLibraryService {
  /**
   * Request permission to access media files.
   * Returns false instead of throwing when permissions are unavailable (e.g. Expo Go on Android).
   */
  static async requestPermission(): Promise<boolean> {
    if (!canScanDeviceLibrary()) {
      return false;
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn(
        'Media library permission unavailable in this environment. Use a development build for full access.',
        error
      );
      return false;
    }
  }

  static async scanLocalMusic(): Promise<MusicTrack[]> {
    return this.getAllMusic();
  }

  /**
   * Load all audio files from the device
   */
  static async getAllMusic(): Promise<MusicTrack[]> {
    if (!canScanDeviceLibrary()) {
      return [];
    }

    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      return [];
    }

    try {
      let allAssets: MediaLibrary.Asset[] = [];
      let hasNextPage = true;
      let after: string | undefined = undefined;

      while (hasNextPage) {
        const result = await MediaLibrary.getAssetsAsync({
          mediaType: 'audio',
          first: 100,
          after,
          sortBy: [['creationTime', false]],
        });

        allAssets = [...allAssets, ...result.assets];
        hasNextPage = result.hasNextPage;
        after = result.endCursor;
      }

      return allAssets.map((asset) => ({
        id: asset.id,
        title: asset.filename.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: asset.duration ?? 0,
        uri: asset.uri,
        coverUri: undefined,
      }));
    } catch (error) {
      console.warn('Failed to read device music library:', error);
      return [];
    }
  }

  /**
   * Search tracks
   */
  static searchTracks(
    tracks: MusicTrack[],
    query: string
  ): MusicTrack[] {
    const search = query.toLowerCase();

    return tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(search) ||
        track.artist.toLowerCase().includes(search) ||
        track.album?.toLowerCase().includes(search)
    );
  }

  /**
   * Get track by ID
   */
  static getTrackById(
    tracks: MusicTrack[],
    id: string
  ): MusicTrack | undefined {
    return tracks.find((track) => track.id === id);
  }
}

export type { MusicTrack };
