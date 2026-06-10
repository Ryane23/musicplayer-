import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { musicPlayerService } from '../services/MusicPlayerService';
import { MusicTrack, MusicPlayerState } from '../types/music';

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

  // Initialize the music player service
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Update current track when it changes
    const updateCurrentTrack = () => {
      const track = musicPlayerService.getCurrentTrack();
      setCurrentTrack(track);
      setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
    };

    // Subscribe to playback updates
    intervalId = setInterval(async () => {
      try {
        const pos = await musicPlayerService.getPlaybackPosition();
        const dur = await musicPlayerService.getDuration();
        setPosition(pos);
        setDuration(dur);
        
        // Check if playing state has changed
        const currentTrackIndex = musicPlayerService.getCurrentTrackIndex();
        if (currentTrackIndex !== currentIndex) {
          updateCurrentTrack();
        }
      } catch (error) {
        console.error('Error updating playback status:', error);
      }
    }, 1000);

    // Initial update
    updateCurrentTrack();
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentIndex]);

  const playTrack = async (index: number) => {
    try {
      await musicPlayerService.playTrack(index);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const togglePlayPause = async () => {
    try {
      await musicPlayerService.togglePlayPause();
      // We'll update the isPlaying state through the interval effect instead
      // to ensure consistency with the actual playback state
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const playNext = async () => {
    try {
      await musicPlayerService.playNext();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  };

  const playPrevious = async () => {
    try {
      await musicPlayerService.playPrevious();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing previous track:', error);
    }
  };

  const seekTo = async (position: number) => {
    try {
      await musicPlayerService.seekTo(position);
      // Position will be updated by the interval effect
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