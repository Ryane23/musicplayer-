import { Audio, AVPlaybackStatus } from 'expo-av';
import { MusicTrack } from '../types/music';

class MusicPlayerService {
  private soundObject: Audio.Sound | null = null;
  private tracks: MusicTrack[] = [];
  private currentTrackIndex: number = -1;
  private isPlaying: boolean = false;
  private positionMillis: number = 0;
  private durationMillis: number = 0;

  private handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }

    this.isPlaying = status.isPlaying;
    this.positionMillis = status.positionMillis ?? 0;
    this.durationMillis = status.durationMillis ?? 0;

    if (status.didJustFinish && !status.isLooping) {
      void this.playNext();
    }
  };

  async loadTracks(tracks: MusicTrack[]) {
    this.tracks = tracks;
    if (tracks.length > 0 && this.currentTrackIndex === -1) {
      this.currentTrackIndex = 0;
    }
  }

  async playTrack(index: number) {
    if (index >= 0 && index < this.tracks.length) {
      // Unload current sound if exists
      if (this.soundObject) {
        try {
          await this.soundObject.unloadAsync();
        } catch (error) {
          console.warn('Error unloading previous sound:', error);
        }
      }
      
      this.currentTrackIndex = index;
      const track = this.tracks[index];

      try {
        if (!track.uri) {
          throw new Error('Missing track.uri');
        }

        const source =
          track.uri.startsWith('file://') ||
          track.uri.startsWith('content://') ||
          track.uri.startsWith('http')
            ? { uri: track.uri }
            : { uri: track.uri };

        const { sound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: true },
          this.handlePlaybackStatusUpdate
        );
        this.soundObject = sound;
        this.isPlaying = true;
      } catch (error) {
        console.error('Error creating sound object (track uri may be invalid):', {
          error,
          trackUri: track.uri,
          trackId: track.id,
          trackTitle: track.title,
        });
        // Ensure we don’t leave the service in a half-initialized state
        if (this.soundObject) {
          try {
            await this.soundObject.unloadAsync();
          } catch {
            // ignore
          }
        }
        this.soundObject = null;
        this.isPlaying = false;
      }
    }
  }

  async togglePlayPause() {
    if (!this.soundObject) {
      // If no sound is loaded but we have a current track, try to play it
      if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.tracks.length) {
        await this.playTrack(this.currentTrackIndex);
        return;
      }
      return;
    }

    try {
      if (this.isPlaying) {
        await this.soundObject.pauseAsync();
        this.isPlaying = false;
      } else {
        await this.soundObject.playAsync();
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  async stop() {
    if (this.soundObject) {
      try {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
      } catch (error) {
        console.warn('Error stopping/unloading sound:', error);
      }
      this.soundObject = null;
      this.isPlaying = false;
    }
  }

  async seekTo(position: number) {
    if (this.soundObject) {
      try {
        await this.soundObject.setPositionAsync(position);
      } catch (error) {
        console.error('Error seeking to position:', error);
      }
    }
  }

  getCurrentTrack(): MusicTrack | null {
    if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.tracks.length) {
      return this.tracks[this.currentTrackIndex];
    }
    return null;
  }

  getTracks(): MusicTrack[] {
    return [...this.tracks];
  }

  getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getPlaybackPosition(): number {
    return this.positionMillis;
  }

  getDuration(): number {
    return this.durationMillis;
  }

  async playNext() {
    if (this.tracks.length === 0) return;

    let nextIndex = this.currentTrackIndex + 1;
    if (nextIndex >= this.tracks.length) {
      nextIndex = 0; // Loop back to first track
    }

    await this.playTrack(nextIndex);
  }

  async playPrevious() {
    if (this.tracks.length === 0) return;

    let prevIndex = this.currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.tracks.length - 1; // Go to last track
    }

    await this.playTrack(prevIndex);
  }

  async setVolume(volume: number) {
    if (this.soundObject) {
      try {
        await this.soundObject.setVolumeAsync(volume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }

  subscribeToPlaybackUpdates(listener: (position: number, duration: number) => void) {
    if (this.soundObject) {
      this.soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          listener(status.positionMillis || 0, status.durationMillis || 0);
        }
      });
    }
  }

  // Clean up resources
  async cleanup() {
    if (this.soundObject) {
      try {
        await this.soundObject.unloadAsync();
      } catch (error) {
        console.warn('Error during cleanup:', error);
      }
      this.soundObject = null;
    }
  }
}

export const musicPlayerService = new MusicPlayerService();
export type { MusicTrack };
