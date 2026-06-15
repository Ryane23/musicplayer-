import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { musicPlayerService } from '../services/MusicPlayerService';
import { MusicTrack } from '../types/music';

interface MusicPlayerContextType {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  currentIndex: number;
  tracks: MusicTrack[];
  playTrack: (index: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  loadTracks: (tracks: MusicTrack[]) => Promise<void>;
  cleanup: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  useEffect(() => {
    const unsubscribe = musicPlayerService.subscribePlaybackState((state) => {
      setPosition(state.position);
      setDuration(state.duration);
      setIsPlaying(state.isPlaying);
    });

    const pollMs = Platform.OS === 'web' ? 250 : 500;
    const intervalId = setInterval(() => {
      void musicPlayerService.syncPlaybackState();
      const track = musicPlayerService.getCurrentTrack();
      setCurrentTrack(track);
      setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
    }, pollMs);

    setCurrentTrack(musicPlayerService.getCurrentTrack());
    setCurrentIndex(musicPlayerService.getCurrentTrackIndex());

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    return () => {
      musicPlayerService.cleanup().catch((error) => {
        console.warn('Error during music player cleanup:', error);
      });
    };
  }, []);

  const playTrack = async (index: number) => {
    try {
      await musicPlayerService.playTrack(index);
      setCurrentTrack(musicPlayerService.getCurrentTrack());
      setCurrentIndex(index);
      setIsPlaying(musicPlayerService.getIsPlaying());
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const togglePlayPause = async () => {
    try {
      await musicPlayerService.togglePlayPause();
      setIsPlaying(musicPlayerService.getIsPlaying());
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const playNext = async () => {
    try {
      await musicPlayerService.playNext();
      setCurrentTrack(musicPlayerService.getCurrentTrack());
      setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
      setIsPlaying(musicPlayerService.getIsPlaying());
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  };

  const playPrevious = async () => {
    try {
      await musicPlayerService.playPrevious();
      setCurrentTrack(musicPlayerService.getCurrentTrack());
      setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
      setIsPlaying(musicPlayerService.getIsPlaying());
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  };

  const seekTo = async (seekPosition: number) => {
    try {
      await musicPlayerService.seekTo(seekPosition);
      setPosition(seekPosition);
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  };

  const setVolumeAsync = async (vol: number) => {
    try {
      await musicPlayerService.setVolume(vol);
      setVolume(vol);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const loadTracks = async (newTracks: MusicTrack[]) => {
    try {
      await musicPlayerService.loadTracks(newTracks);
      setTracks([...newTracks]);
      setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
      setCurrentTrack(musicPlayerService.getCurrentTrack());
    } catch (error) {
      console.error('Error loading tracks:', error);
    }
  };

  const cleanup = async () => {
    try {
      await musicPlayerService.cleanup();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const contextValue: MusicPlayerContextType = {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    currentIndex,
    tracks,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume: setVolumeAsync,
    loadTracks,
    cleanup,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
