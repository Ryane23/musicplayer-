import { useEffect, useRef } from 'react';
import { useLibrary } from '@/contexts/LibraryContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

/** Keeps the player queue in sync with the scanned library. */
export default function LibraryPlayerSync() {
  const { tracks, isLoading } = useLibrary();
  const { loadTracks, tracks: playerTracks } = useMusicPlayer();
  const initialSyncDone = useRef(false);

  useEffect(() => {
    if (isLoading || tracks.length === 0) {
      return;
    }

    if (!initialSyncDone.current && playerTracks.length === 0) {
      initialSyncDone.current = true;
      void loadTracks(tracks);
      return;
    }

    initialSyncDone.current = true;
  }, [isLoading, tracks, playerTracks.length, loadTracks]);

  return null;
}
