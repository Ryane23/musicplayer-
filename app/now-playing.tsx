import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import AudioVisualizer from '@/components/AudioVisualizer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NowPlayingScreen = () => {
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration, 
    volume, 
    togglePlayPause, 
    playNext, 
    playPrevious, 
    seekTo,
    setVolume
  } = useMusicPlayer();
  
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [currentLyric, setCurrentLyric] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  // Animation for album art rotation
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 20000, // Full rotation in 20 seconds
          useNativeDriver: true,
        })
      ).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isPlaying]);

  // Pan responder for swiping gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dy > 0) {
        panY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dy > 100) {
        // Swipe down to close
        // This would typically navigate back
      } else {
        // Reset position
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = panY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-100, 0, 100],
  });

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          { 
            transform: [{ translateY }] 
          }
        ]}
        {...panResponder.panHandlers}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="close" size={24} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
          
          <View style={styles.trackInfoHeader}>
            {currentTrack?.title && (
              <ThemedText style={styles.trackTitleHeader} numberOfLines={1} type="defaultSemiBold">
                {currentTrack.title}
              </ThemedText>
            )}
            {currentTrack?.artist && (
              <ThemedText style={styles.trackArtistHeader} numberOfLines={1} type="default">
                {currentTrack.artist}
              </ThemedText>
            )}
          </View>
          
          <TouchableOpacity onPress={() => setShowQueue(!showQueue)}>
            <Ionicons name="list" size={24} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.mainContent}>
          {/* Album Art */}
          <Animated.View style={[
            styles.albumArtContainer,
            { transform: [{ rotate }] }
          ]}>
            {currentTrack?.coverUri ? (
              <Image source={{ uri: currentTrack.coverUri }} style={styles.albumArt} />
            ) : (
              <View style={styles.albumArtPlaceholder}>
                <Ionicons name="musical-notes" size={60} color="#FFFFFF" />
              </View>
            )}
          </Animated.View>

          {/* Track Info */}
          <View style={styles.trackInfo}>
            {currentTrack?.title && (
              <ThemedText style={styles.trackTitle} type="defaultSemiBold" numberOfLines={1}>
                {currentTrack.title}
              </ThemedText>
            )}
            {currentTrack?.artist && (
              <ThemedText style={styles.trackArtist} type="default" numberOfLines={1}>
                {currentTrack.artist}
              </ThemedText>
            )}
            {currentTrack?.album && (
              <ThemedText style={styles.trackAlbum} type="default" numberOfLines={1}>
                {currentTrack.album}
              </ThemedText>
            )}
          </View>

          {/* Audio Visualizer */}
          {showVisualizer && (
            <AudioVisualizer isPlaying={isPlaying} />
          )}

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ThemedText style={styles.timeText}>{formatTime(position)}</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${progress}%`,
                    backgroundColor: useThemeColor({}, 'tint')
                  }
                ]} 
              />
            </View>
            <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
          </View>

          {/* Playback Controls */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity onPress={() => {}} style={styles.controlButton}>
              <Ionicons name="shuffle" size={24} color={useThemeColor({}, 'text')} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={32} color={useThemeColor({}, 'text')} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={togglePlayPause} 
              style={[styles.playButton, { backgroundColor: useThemeColor({}, 'tint') }]}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={36} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={playNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={32} color={useThemeColor({}, 'text')} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {}}
              style={styles.controlButton}
            >
              <Ionicons 
                name="repeat" 
                size={24} 
                color={useThemeColor({}, 'text')} 
              />
            </TouchableOpacity>
          </View>

          {/* Additional Controls */}
          <View style={styles.additionalControls}>
            <TouchableOpacity 
              onPress={() => setShowLyrics(!showLyrics)}
              style={styles.additionalControlButton}
            >
              <Ionicons 
                name={showLyrics ? "reader" : "reader-outline"} 
                size={24} 
                color={showLyrics ? useThemeColor({}, 'tint') : useThemeColor({}, 'text')} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowVisualizer(!showVisualizer)}
              style={styles.additionalControlButton}
            >
              <Ionicons 
                name={showVisualizer ? "pulse" : "pulse-outline"} 
                size={24} 
                color={showVisualizer ? useThemeColor({}, 'tint') : useThemeColor({}, 'text')} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {}}
              style={styles.additionalControlButton}
            >
              <Ionicons 
                name="share-social" 
                size={24} 
                color={useThemeColor({}, 'text')} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {}}
              style={styles.additionalControlButton}
            >
              <Ionicons 
                name="heart-outline" 
                size={24} 
                color={useThemeColor({}, 'text')} 
              />
            </TouchableOpacity>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={20} color={useThemeColor({}, 'text')} />
            <View style={styles.volumeSlider}>
              <View 
                style={[
                  styles.volumeFill,
                  { 
                    width: `${volume * 100}%`,
                    backgroundColor: useThemeColor({}, 'tint')
                  }
                ]} 
              />
            </View>
            <Ionicons name="volume-high" size={20} color={useThemeColor({}, 'text')} />
          </View>

          {/* Playback Speed */}
          <View style={styles.speedContainer}>
            <TouchableOpacity 
              onPress={() => setPlaybackSpeed(playbackSpeed === 0.5 ? 1.0 : playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 1.5 : 0.5)}
              style={styles.speedButton}
            >
              <ThemedText style={styles.speedText}>Speed: {playbackSpeed}x</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Lyrics Panel */}
        {showLyrics && (
          <View style={styles.lyricsContainer}>
            <ScrollView style={styles.lyricsScroll}>
              <ThemedText style={styles.lyricLine} type="default">These are sample lyrics</ThemedText>
              <ThemedText style={styles.lyricLine} type="default">That would scroll in sync</ThemedText>
              <ThemedText style={styles.lyricLine} type="default">With the music</ThemedText>
              <ThemedText style={styles.lyricLine} type="default">As it plays</ThemedText>
              <ThemedText style={styles.lyricLine} type="default">Creating an immersive</ThemedText>
              <ThemedText style={styles.lyricLine} type="default">Listening experience</ThemedText>
            </ScrollView>
          </View>
        )}

        {/* Queue Panel */}
        {showQueue && (
          <View style={styles.queueContainer}>
            <ThemedText style={styles.queueTitle} type="defaultSemiBold">Up Next</ThemedText>
            <ScrollView style={styles.queueList}>
              {[1, 2, 3, 4, 5].map((item) => (
                <TouchableOpacity key={item} style={styles.queueItem}>
                  <ThemedText style={styles.queueItemText} type="default">Song {item}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  trackInfoHeader: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  trackTitleHeader: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtistHeader: {
    fontSize: 14,
    opacity: 0.7,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  albumArtContainer: {
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
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
    alignItems: 'center',
    marginBottom: 24,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 4,
  },
  trackAlbum: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timeText: {
    fontSize: 12,
    minWidth: 30,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  controlButton: {
    padding: 12,
  },
  playButton: {
    padding: 16,
    borderRadius: 50,
    marginHorizontal: 20,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
  },
  additionalControlButton: {
    padding: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  volumeSlider: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
  },
  speedContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  speedButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  speedText: {
    fontSize: 14,
  },
  lyricsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  lyricsScroll: {
    flex: 1,
  },
  lyricLine: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
  },
  queueContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  queueList: {
    flex: 1,
  },
  queueItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  queueItemText: {
    fontSize: 16,
  },
});

export default NowPlayingScreen;