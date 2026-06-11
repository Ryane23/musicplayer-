import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import AudioVisualizer from '@/components/AudioVisualizer';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { MusicTrack } from '@/types/music';

const fallbackTrack: MusicTrack = {
  id: 'preview',
  title: 'Select a Track',
  artist: 'Your local library',
  album: 'Offline Music',
  duration: 240000,
  uri: '',
  coverUri: 'https://placehold.co/600x600/111827/F8FAFC?text=LOCAL',
};

const speedOptions = [0.75, 1, 1.25, 1.5];

function formatTime(millis: number) {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function NowPlayingScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');
  const surface = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.9)';
  const borderColor = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)';
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    togglePlayPause,
    playNext,
    playPrevious,
  } = useMusicPlayer();

  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pulse = useRef(new Animated.Value(0)).current;

  const track = currentTrack ?? fallbackTrack;
  const trackDuration = duration || track.duration;
  const progress = trackDuration > 0 ? Math.min((position / trackDuration) * 100, 100) : 0;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const ambientOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.34],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <Animated.View style={[styles.ambientLayer, { backgroundColor: tint, opacity: ambientOpacity }]} />
      <View style={[styles.ambientLayerSecondary, { backgroundColor: favorite ? '#db2777' : '#0f766e' }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: surface, borderColor }]} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={22} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <ThemedText type="defaultSemiBold" style={styles.headerEyebrow}>
              Now Playing
            </ThemedText>
            <ThemedText type="default" style={styles.headerSubtext} numberOfLines={1}>
              {track.album}
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: surface, borderColor }]} onPress={() => setShowQueue(!showQueue)}>
            <Ionicons name={showQueue ? 'list-circle' : 'list'} size={22} color={showQueue ? tint : textColor} />
          </TouchableOpacity>
        </View>

        <View style={styles.artworkStage}>
          <View style={[styles.artworkShadow, { backgroundColor: tint }]} />
          {track.coverUri ? (
            <Image source={{ uri: track.coverUri }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkFallback, { backgroundColor: tint }]}>
              <Ionicons name="musical-notes" size={58} color="#fff" />
            </View>
          )}
        </View>

        <View style={styles.trackBlock}>
          <ThemedText type="title" style={styles.trackTitle} numberOfLines={2}>
            {track.title}
          </ThemedText>
          <ThemedText type="default" style={styles.trackArtist} numberOfLines={1}>
            {track.artist}
          </ThemedText>
        </View>

        {showVisualizer ? <AudioVisualizer isPlaying={isPlaying} /> : null}

        <View style={[styles.progressPanel, { backgroundColor: surface, borderColor }]}>
          <View style={styles.timeRow}>
            <ThemedText type="default" style={styles.timeText}>
              {formatTime(position)}
            </ThemedText>
            <ThemedText type="default" style={styles.timeText}>
              {formatTime(trackDuration)}
            </ThemedText>
          </View>
          <View style={[styles.progressRail, { backgroundColor: borderColor }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: tint }]} />
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.secondaryControl} onPress={() => setShuffle(!shuffle)}>
            <Ionicons name="shuffle" size={22} color={shuffle ? tint : textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipControl} onPress={playPrevious}>
            <Ionicons name="play-skip-back" size={30} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryControl, { backgroundColor: tint }]} onPress={togglePlayPause}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipControl} onPress={playNext}>
            <Ionicons name="play-skip-forward" size={30} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryControl} onPress={() => setRepeat(!repeat)}>
            <Ionicons name="repeat" size={22} color={repeat ? tint : textColor} />
          </TouchableOpacity>
        </View>

        <View style={[styles.toolPanel, { backgroundColor: surface, borderColor }]}>
          <TouchableOpacity style={styles.toolButton} onPress={() => setFavorite(!favorite)}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? '#db2777' : textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowLyrics(!showLyrics)}>
            <Ionicons name={showLyrics ? 'reader' : 'reader-outline'} size={22} color={showLyrics ? tint : textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolButton} onPress={() => setShowVisualizer(!showVisualizer)}>
            <Ionicons name={showVisualizer ? 'pulse' : 'pulse-outline'} size={22} color={showVisualizer ? tint : textColor} />
          </TouchableOpacity>
          <View style={styles.volumeBlock}>
            <Ionicons name="volume-medium" size={18} color={textColor} />
            <View style={[styles.volumeRail, { backgroundColor: borderColor }]}>
              <View style={[styles.volumeFill, { width: `${volume * 100}%`, backgroundColor: tint }]} />
            </View>
          </View>
        </View>

        <View style={styles.speedRow}>
          {speedOptions.map((option) => {
            const selected = speed === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.speedChip,
                  {
                    backgroundColor: selected ? tint : surface,
                    borderColor: selected ? tint : borderColor,
                  },
                ]}
                onPress={() => setSpeed(option)}
              >
                <ThemedText type="defaultSemiBold" style={{ color: selected ? '#fff' : textColor }}>
                  {option}x
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {showLyrics ? (
          <View style={[styles.panel, { backgroundColor: surface, borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.panelTitle}>
              Lyrics
            </ThemedText>
            <ThemedText type="default" style={styles.panelText}>
              Synced local lyrics will appear here when available.
            </ThemedText>
          </View>
        ) : null}

        {showQueue ? (
          <View style={[styles.panel, { backgroundColor: surface, borderColor }]}>
            <ThemedText type="defaultSemiBold" style={styles.panelTitle}>
              Up Next
            </ThemedText>
            <ThemedText type="default" style={styles.panelText}>
              Queue controls are ready for your local playlist flow.
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ambientLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
  },
  ambientLayerSecondary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '34%',
    opacity: 0.08,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  headerEyebrow: {
    fontSize: 14,
  },
  headerSubtext: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  artworkStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  artworkShadow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 28,
    transform: [{ rotate: '8deg' }],
    opacity: 0.22,
  },
  artwork: {
    width: '88%',
    maxWidth: 330,
    aspectRatio: 1,
    borderRadius: 30,
  },
  artworkFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBlock: {
    alignItems: 'center',
    marginBottom: 6,
  },
  trackTitle: {
    textAlign: 'center',
    lineHeight: 36,
  },
  trackArtist: {
    textAlign: 'center',
    opacity: 0.72,
    marginTop: 6,
  },
  progressPanel: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.72,
  },
  progressRail: {
    height: 9,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 24,
  },
  secondaryControl: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipControl: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryControl: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPanel: {
    borderWidth: 1,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  toolButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  volumeRail: {
    flex: 1,
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 999,
  },
  speedRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  speedChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 14,
  },
  panelTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  panelText: {
    opacity: 0.72,
    lineHeight: 21,
  },
});
