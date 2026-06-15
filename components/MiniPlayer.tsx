import React, { useState, useEffect, Component, ReactNode } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Spotify } from '@/constants/theme';
import { TAB_BAR_HEIGHT, MINI_PLAYER_HEIGHT } from '@/utils/animation';

const HIDDEN_SEGMENTS = new Set(['splash', 'now-playing', 'welcome']);

const MiniPlayerComponent = () => {
  const router = useRouter();
  const segments = useSegments();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    togglePlayPause,
  } = useMusicPlayer();

  const tint = useThemeColor({}, 'tint');
  const textSecondary = useThemeColor({}, 'textSecondary');

  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOnTabScreen = segments[0] === '(tabs)';
  const isHiddenRoute = segments.some((segment) => HIDDEN_SEGMENTS.has(segment));

  useEffect(() => {
    setImageError(false);
  }, [currentTrack]);

  if (isHiddenRoute || !isOnTabScreen || !currentTrack?.title || !currentTrack?.artist) {
    return null;
  }

  const trackDuration = duration > 0 ? duration : currentTrack.duration;
  const progress = trackDuration > 0 ? Math.min((position / trackDuration) * 100, 100) : 0;

  const handleImageError = () => {
    setImageError(true);
  };

  const renderAlbumArt = () => {
    if (imageError) {
      return (
        <View style={styles.albumArtPlaceholder}>
          <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
        </View>
      );
    }

    if (imageLoading || !currentTrack.coverUri) {
      return (
        <View style={styles.albumArtPlaceholder}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      );
    }

    return (
      <Image
        source={{ uri: currentTrack.coverUri }}
        style={styles.albumArt}
        onError={handleImageError}
        onLoadStart={() => setImageLoading(true)}
        onLoadEnd={() => setImageLoading(false)}
      />
    );
  };

  return (
    <View style={[styles.container, { bottom: TAB_BAR_HEIGHT }]}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: tint }]} />
      </View>

      <View style={styles.playerContent}>
        <TouchableOpacity style={styles.albumArtContainer} onPress={() => router.push('/now-playing')}>
          {renderAlbumArt()}
        </TouchableOpacity>

        <TouchableOpacity style={styles.trackInfo} onPress={() => router.push('/now-playing')}>
          <ThemedText style={styles.trackTitle} numberOfLines={1} type="defaultSemiBold">
            {currentTrack.title}
          </ThemedText>
          <ThemedText style={[styles.trackArtist, { color: textSecondary }]} numberOfLines={1} type="default">
            {currentTrack.artist}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={Spotify.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    zIndex: 1000,
    elevation: 10,
    overflow: 'hidden',
    backgroundColor: Spotify.elevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  progressContainer: {
    height: 2,
    backgroundColor: Spotify.card,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  playerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  albumArtContainer: {
    width: 42,
    height: 42,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  albumArtPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 12,
  },
  controls: {
    marginRight: 8,
  },
  playButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('MiniPlayer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default function MiniPlayer() {
  return (
    <ErrorBoundary>
      <MiniPlayerComponent />
    </ErrorBoundary>
  );
}
