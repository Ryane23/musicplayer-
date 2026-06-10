import { Audio } from 'expo-av';
import { MusicTrack } from '../types/music';

class MusicPlayerService {
  private soundObject: Audio.Sound | null = null;
  private tracks: MusicTrack[] = [];
  private currentTrackIndex: number = -1;
  private isPlaying: boolean = false;

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
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.uri },
          { shouldPlay: true },
          this.handlePlaybackStatusUpdate
        );
        this.soundObject = sound;
        this.isPlaying = true;
      } catch (error) {
        console.error('Error creating sound object:', error);
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

  private handlePlaybackStatusUpdate = async (status: any) => {
    if (status.isLoaded && status.didJustFinish) {
      // Automatically play next track when current finishes
      await this.playNext();
    }
  };

  async getPlaybackPosition(): Promise<number> {
    if (this.soundObject) {
      try {
        const status = await this.soundObject.getStatusAsync();
        if (status.isLoaded) {
          return status.positionMillis || 0;
        }
      } catch (error) {
        console.error('Error getting playback position:', error);
      }
    }
    return 0;
  }

  async getDuration(): Promise<number> {
    if (this.soundObject) {
      try {
        const status = await this.soundObject.getStatusAsync();
        if (status.isLoaded) {
          return status.durationMillis || 0;
        }
      } catch (error) {
        console.error('Error getting duration:', error);
      }
    }
    return 0;
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
}

export const musicPlayerService = new MusicPlayerService();
export type { MusicTrack };