import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { musicPlayerService, RepeatMode } from '../services/MusicPlayerService';
import { MusicTrack } from '../types/music';

interface MusicPlayerContextType {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  volume: number;
  currentIndex: number;
  tracks: MusicTrack[];
  shuffle: boolean;
  repeatMode: RepeatMode;
  playbackRate: number;
  showVisualizer: boolean;
  sleepTimerMinutes: number;
  sleepTimerRemainingSec: number;
  playTrack: (index: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setShuffle: (enabled: boolean) => void;
  cycleRepeatMode: () => void;
  setPlaybackRate: (rate: number) => Promise<void>;
  setShowVisualizer: (enabled: boolean) => void;
  setSleepTimerMinutes: (minutes: number) => void;
  loadTracks: (tracks: MusicTrack[]) => Promise<void>;
  cleanup: () => Promise<void>;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [shuffle, setShuffleState] = useState(false);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('off');
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState(0);
  const [sleepTimerEndsAt, setSleepTimerEndsAt] = useState<number | null>(null);
  const [sleepTimerRemainingSec, setSleepTimerRemainingSec] = useState(0);

  useEffect(() => {
    const unsubscribe = musicPlayerService.subscribePlaybackState((state) => {
      setPosition(state.position);
      setDuration(state.duration);
      setIsPlaying(state.isPlaying);
    });

    const pollMs = Platform.OS === 'web' ? 250 : 500;
    const intervalId = setInterval(() => {
      void musicPlayerService.syncPlaybackState();
      setCurrentTrack(musicPlayerService.getCurrentTrack());
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
    if (!sleepTimerEndsAt) {
      setSleepTimerRemainingSec(0);
      return;
    }

    const tick = () => {
      const remainingMs = sleepTimerEndsAt - Date.now();
      if (remainingMs <= 0) {
        void musicPlayerService.stop().then(() => {
          setIsPlaying(false);
        });
        setSleepTimerEndsAt(null);
        setSleepTimerMinutesState(0);
        setSleepTimerRemainingSec(0);
        return;
      }

      setSleepTimerRemainingSec(Math.ceil(remainingMs / 1000));
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [sleepTimerEndsAt]);

  const setSleepTimerMinutes = (minutes: number) => {
    if (minutes <= 0) {
      setSleepTimerEndsAt(null);
      setSleepTimerMinutesState(0);
      setSleepTimerRemainingSec(0);
      return;
    }

    setSleepTimerEndsAt(Date.now() + minutes * 60 * 1000);
    setSleepTimerMinutesState(minutes);
    setSleepTimerRemainingSec(minutes * 60);
  };

  useEffect(() => {
    return () => {
      musicPlayerService.cleanup().catch((error) => {
        console.warn('Error during music player cleanup:', error);
      });
    };
  }, []);

  const playTrack = async (index: number) => {
    await musicPlayerService.playTrack(index);
    setCurrentTrack(musicPlayerService.getCurrentTrack());
    setCurrentIndex(index);
    setIsPlaying(musicPlayerService.getIsPlaying());
  };

  const togglePlayPause = async () => {
    await musicPlayerService.togglePlayPause();
    setIsPlaying(musicPlayerService.getIsPlaying());
  };

  const playNext = async () => {
    await musicPlayerService.playNext();
    setCurrentTrack(musicPlayerService.getCurrentTrack());
    setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
    setIsPlaying(musicPlayerService.getIsPlaying());
  };

  const playPrevious = async () => {
    await musicPlayerService.playPrevious();
    setCurrentTrack(musicPlayerService.getCurrentTrack());
    setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
    setIsPlaying(musicPlayerService.getIsPlaying());
  };

  const seekTo = async (seekPosition: number) => {
    await musicPlayerService.seekTo(seekPosition);
    setPosition(seekPosition);
  };

  const setVolumeAsync = async (vol: number) => {
    await musicPlayerService.setVolume(vol);
    setVolume(musicPlayerService.getVolume());
  };

  const setShuffle = (enabled: boolean) => {
    musicPlayerService.setShuffle(enabled);
    setShuffleState(enabled);
  };

  const cycleRepeatMode = () => {
    const next = musicPlayerService.cycleRepeatMode();
    setRepeatModeState(next);
  };

  const setPlaybackRate = async (rate: number) => {
    await musicPlayerService.setPlaybackRate(rate);
    setPlaybackRateState(rate);
  };

  const loadTracks = async (newTracks: MusicTrack[]) => {
    await musicPlayerService.loadTracks(newTracks);
    setTracks([...newTracks]);
    setCurrentIndex(musicPlayerService.getCurrentTrackIndex());
    setCurrentTrack(musicPlayerService.getCurrentTrack());
  };

  const cleanup = async () => {
    await musicPlayerService.cleanup();
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        position,
        duration,
        volume,
        currentIndex,
        tracks,
        shuffle,
        repeatMode,
        playbackRate,
        showVisualizer,
        sleepTimerMinutes,
        sleepTimerRemainingSec,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setVolume: setVolumeAsync,
        setShuffle,
        cycleRepeatMode,
        setPlaybackRate,
        setShowVisualizer,
        setSleepTimerMinutes,
        loadTracks,
        cleanup,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};

export type { RepeatMode };
