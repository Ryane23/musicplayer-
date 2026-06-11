import * as MediaLibrary from 'expo-media-library';
import { MusicTrack } from '../types/music';

export class MusicLibraryService {
  /**
   * Request permission to access media files
   */
  static async requestPermission(): Promise<boolean> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scanLocalMusic(): Promise<MusicTrack[]> {
    return this.getAllMusic();
  }

  /**
   * Load all audio files from the device
   */
  static async getAllMusic(): Promise<MusicTrack[]> {
    const hasPermission = await this.requestPermission();

    if (!hasPermission) {
      throw new Error('Media library permission denied');
    }

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
