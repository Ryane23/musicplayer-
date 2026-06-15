import { Audio, AVPlaybackStatus } from 'expo-av';
import { Platform } from 'react-native';
import { MusicTrack } from '../types/music';

type PlaybackListener = (state: {
  position: number;
  duration: number;
  isPlaying: boolean;
}) => void;

class MusicPlayerService {
  private soundObject: Audio.Sound | null = null;
  private tracks: MusicTrack[] = [];
  private currentTrackIndex: number = -1;
  private isPlaying: boolean = false;
  private positionMillis: number = 0;
  private durationMillis: number = 0;
  private listeners = new Set<PlaybackListener>();
  private audioModeReady = false;

  private notifyListeners() {
    const snapshot = {
      position: this.positionMillis,
      duration: this.durationMillis,
      isPlaying: this.isPlaying,
    };
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!this.soundObject || !status.isLoaded) {
      return;
    }

    this.isPlaying = status.isPlaying;
    this.positionMillis = status.positionMillis ?? 0;
    this.durationMillis = status.durationMillis ?? 0;
    this.notifyListeners();

    if (status.didJustFinish && !status.isLooping) {
      void this.playNext();
    }
  };

  private async ensureAudioMode() {
    if (this.audioModeReady) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      this.audioModeReady = true;
    } catch (error) {
      console.warn('Failed to set audio mode:', error);
    }
  }

  private async unloadSound() {
    const sound = this.soundObject;
    this.soundObject = null;

    if (!sound) {
      return;
    }

    try {
      await sound.setOnPlaybackStatusUpdate(null);
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch (error) {
      console.warn('Error unloading sound:', error);
    }
  }

  subscribePlaybackState(listener: PlaybackListener) {
    this.listeners.add(listener);
    listener({
      position: this.positionMillis,
      duration: this.durationMillis,
      isPlaying: this.isPlaying,
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  async syncPlaybackState() {
    if (!this.soundObject) {
      return;
    }

    try {
      const status = await this.soundObject.getStatusAsync();
      if (!status.isLoaded || !this.soundObject) {
        return;
      }

      this.isPlaying = status.isPlaying;
      this.positionMillis = status.positionMillis ?? 0;
      this.durationMillis = status.durationMillis ?? 0;
      this.notifyListeners();
    } catch {
      // Sound may have been unloaded between calls (common on web).
    }
  }

  async loadTracks(tracks: MusicTrack[]) {
    this.tracks = tracks;
    if (tracks.length > 0 && this.currentTrackIndex === -1) {
      this.currentTrackIndex = 0;
    }
  }

  async playTrack(index: number) {
    if (index < 0 || index >= this.tracks.length) {
      return;
    }

    await this.ensureAudioMode();
    await this.unloadSound();

    this.currentTrackIndex = index;
    const track = this.tracks[index];

    try {
      if (!track.uri) {
        throw new Error('Missing track.uri');
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: true,
          progressUpdateIntervalMillis: Platform.OS === 'web' ? 250 : 500,
        },
        this.handlePlaybackStatusUpdate
      );

      this.soundObject = sound;
      this.isPlaying = true;

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        this.positionMillis = status.positionMillis ?? 0;
        this.durationMillis =
          status.durationMillis && status.durationMillis > 0
            ? status.durationMillis
            : track.duration;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error creating sound object (track uri may be invalid):', {
        error,
        trackUri: track.uri,
        trackId: track.id,
        trackTitle: track.title,
      });
      this.soundObject = null;
      this.isPlaying = false;
      this.positionMillis = 0;
      this.durationMillis = track.duration ?? 0;
      this.notifyListeners();
    }
  }

  async togglePlayPause() {
    if (!this.soundObject) {
      if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.tracks.length) {
        await this.playTrack(this.currentTrackIndex);
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
      this.notifyListeners();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  }

  async stop() {
    await this.unloadSound();
    this.isPlaying = false;
    this.positionMillis = 0;
    this.notifyListeners();
  }

  async seekTo(position: number) {
    if (!this.soundObject) {
      return;
    }

    try {
      await this.soundObject.setPositionAsync(position);
      this.positionMillis = position;
      this.notifyListeners();
    } catch (error) {
      console.error('Error seeking to position:', error);
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
      nextIndex = 0;
    }

    await this.playTrack(nextIndex);
  }

  async playPrevious() {
    if (this.tracks.length === 0) return;

    let prevIndex = this.currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = this.tracks.length - 1;
    }

    await this.playTrack(prevIndex);
  }

  async setVolume(volume: number) {
    if (!this.soundObject) {
      return;
    }

    try {
      await this.soundObject.setVolumeAsync(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  async cleanup() {
    await this.unloadSound();
    this.isPlaying = false;
    this.positionMillis = 0;
    this.durationMillis = 0;
    this.notifyListeners();
  }
}

export const musicPlayerService = new MusicPlayerService();
export type { MusicTrack };
