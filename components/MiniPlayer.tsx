import React, { useState, useEffect, Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const MiniPlayerComponent = () => {
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    togglePlayPause, 
    playNext,
    playPrevious
  } = useMusicPlayer();
  
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  // State for image loading and error handling
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reset error state when currentTrack changes
  useEffect(() => {
    setImageError(false);
  }, [currentTrack]);
  
  const progress = duration > 0 ? (position / duration) * 100 : 0;

  // Handle missing or invalid track data
  if (!currentTrack || !currentTrack.title || !currentTrack.artist) {
    return null; // Don't render if essential track info is missing
  }
  
  // Handle invalid image
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
    <ThemedView style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: tint }]} />
      </View>
      
      <View style={styles.playerContent}>
        <TouchableOpacity style={styles.albumArtContainer}>
          {renderAlbumArt()}
        </TouchableOpacity>
        
        <View style={styles.trackInfo}>
          <ThemedText style={styles.trackTitle} numberOfLines={1} type="defaultSemiBold">
            {currentTrack.title || 'Unknown Title'}
          </ThemedText>
          <ThemedText style={styles.trackArtist} numberOfLines={1} type="default">
            {currentTrack.artist || 'Unknown Artist'}
          </ThemedText>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={24} 
              color={tint} 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.expandButton}>
          <Ionicons 
            name="musical-notes" 
            size={20} 
            color={textColor} 
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  albumArtContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
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
    backgroundColor: '#333',
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
    opacity: 0.7,
  },
  controls: {
    marginRight: 16,
  },
  playButton: {
    padding: 8,
  },
  expandButton: {
    padding: 8,
  },
});

// Error boundary component to handle JavaScript errors
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<{children: ReactNode}, ErrorBoundaryState> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log error to an error reporting service
    console.error("MiniPlayer error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <ThemedView style={styles.container}>
          <View style={styles.playerContent}>
            <View style={styles.albumArtPlaceholder}>
              <Ionicons name="warning" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.trackInfo}>
              <ThemedText style={styles.trackTitle}>Error loading track</ThemedText>
              <ThemedText style={styles.trackArtist}>Please try again</ThemedText>
            </View>
          </View>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

export default function MiniPlayer(props: {}) {
  return (
    <ErrorBoundary>
      <MiniPlayerComponent {...props} />
    </ErrorBoundary>
  );
}