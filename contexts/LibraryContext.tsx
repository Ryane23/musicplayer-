import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getDemoTracks } from '@/constants/demoTracks';
import { MusicLibraryService } from '@/services/MusicLibraryService';
import { MusicTrack } from '@/types/music';
import { canScanDeviceLibrary } from '@/utils/runtime';

interface LibraryContextType {
  tracks: MusicTrack[];
  isLoading: boolean;
  hasPermission: boolean;
  isDemo: boolean;
  libraryNote: string | null;
  refresh: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  const [libraryNote, setLibraryNote] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const demoTracks = await getDemoTracks();

      if (!canScanDeviceLibrary()) {
        setHasPermission(false);
        setTracks(demoTracks);
        setIsDemo(true);
        setLibraryNote(
          'Expo Go on Android cannot access your music library. Create a development build to scan device songs.'
        );
        return;
      }

      const granted = await MusicLibraryService.requestPermission();
      setHasPermission(granted);

      if (!granted) {
        setTracks(demoTracks);
        setIsDemo(true);
        setLibraryNote('Library access not granted — playing bundled demo tracks.');
        return;
      }

      const localTracks = await MusicLibraryService.getAllMusic();
      if (localTracks.length > 0) {
        setTracks(localTracks);
        setIsDemo(false);
        setLibraryNote(null);
      } else {
        setTracks(demoTracks);
        setIsDemo(true);
        setLibraryNote('No audio files found on device — playing bundled demo tracks.');
      }
    } catch (error) {
      console.warn('Failed to load music library, using demo tracks:', error);
      const demoTracks = await getDemoTracks();
      setTracks(demoTracks);
      setIsDemo(true);
      setLibraryNote('Could not load library — playing bundled demo tracks.');
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <LibraryContext.Provider
      value={{ tracks, isLoading, hasPermission, isDemo, libraryNote, refresh }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextType {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
