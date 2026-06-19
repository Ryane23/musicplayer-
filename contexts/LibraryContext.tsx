import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getDemoTracks } from '@/constants/demoTracks';
import { MusicLibraryService } from '@/services/MusicLibraryService';
import { MusicTrack } from '@/types/music';
import { canScanDeviceLibrary } from '@/utils/runtime';

export type ScanStatus = 'pending' | 'scanning' | 'complete';

interface LibraryContextType {
  tracks: MusicTrack[];
  isLoading: boolean;
  scanStatus: ScanStatus;
  scanMessage: string;
  hasPermission: boolean;
  isDemo: boolean;
  libraryNote: string | null;
  refresh: () => Promise<MusicTrack[]>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scanStatus, setScanStatus] = useState<ScanStatus>('pending');
  const [scanMessage, setScanMessage] = useState('Preparing library scan...');
  const [hasPermission, setHasPermission] = useState(false);
  const [isDemo, setIsDemo] = useState(true);
  const [libraryNote, setLibraryNote] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<MusicTrack[]> => {
    setIsLoading(true);
    setScanStatus('scanning');
    setScanMessage('Checking library access...');

    try {
      const demoTracks = await getDemoTracks();

      if (!canScanDeviceLibrary()) {
        setHasPermission(false);
        setTracks(demoTracks);
        setIsDemo(true);
        setLibraryNote(
          'Expo Go on Android cannot access your music library. Create a development build to scan device songs.'
        );
        setScanMessage(`Loaded ${demoTracks.length} demo tracks`);
        return demoTracks;
      }

      setScanMessage('Requesting media permission...');
      const granted = await MusicLibraryService.requestPermission();
      setHasPermission(granted);

      if (!granted) {
        setTracks(demoTracks);
        setIsDemo(true);
        setLibraryNote('Library access not granted — playing bundled demo tracks.');
        setScanMessage(`Permission denied — using ${demoTracks.length} demo tracks`);
        return demoTracks;
      }

      setScanMessage('Scanning device for music...');
      const localTracks = await MusicLibraryService.getAllMusic((count) => {
        setScanMessage(`Scanning device... ${count} songs found`);
      });

      if (localTracks.length > 0) {
        setTracks(localTracks);
        setIsDemo(false);
        setLibraryNote(null);
        setScanMessage(`Found ${localTracks.length} songs on device`);
        return localTracks;
      }

      setTracks(demoTracks);
      setIsDemo(true);
      setLibraryNote('No audio files found on device — playing bundled demo tracks.');
      setScanMessage(`No local songs — loaded ${demoTracks.length} demo tracks`);
      return demoTracks;
    } catch (error) {
      console.warn('Failed to load music library, using demo tracks:', error);
      const demoTracks = await getDemoTracks();
      setTracks(demoTracks);
      setIsDemo(true);
      setLibraryNote('Could not load library — playing bundled demo tracks.');
      setHasPermission(false);
      setScanMessage('Scan failed — using demo tracks');
      return demoTracks;
    } finally {
      setIsLoading(false);
      setScanStatus('complete');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <LibraryContext.Provider
      value={{
        tracks,
        isLoading,
        scanStatus,
        scanMessage,
        hasPermission,
        isDemo,
        libraryNote,
        refresh,
      }}
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
