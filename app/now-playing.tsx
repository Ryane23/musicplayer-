import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import AudioVisualizer from '@/components/AudioVisualizer';
import SeekBar from '@/components/SeekBar';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Spotify } from '@/constants/theme';
import { formatDuration } from '@/utils/format';
import { goBackOrHome } from '@/utils/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ART_SIZE = Math.min(SCREEN_WIDTH - 48, 340);

export default function NowPlayingScreen() {
  const router = useRouter();
  const {
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
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
    setShuffle,
    cycleRepeatMode,
    playTrack,
  } = useMusicPlayer();

  const [showQueue, setShowQueue] = useState(false);
  const [favorite, setFavorite] = useState(false);

  const handleClose = () => goBackOrHome(router);

  const track = currentTrack;
  const trackDuration = duration > 0 ? duration : track?.duration ?? 0;
  const progress = trackDuration > 0 ? Math.min((position / trackDuration) * 100, 100) : 0;

  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color={Spotify.textSecondary} />
          <ThemedText style={styles.emptyTitle}>Nothing playing</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Pick a song from your library</ThemedText>
          <TouchableOpacity style={styles.emptyButton} onPress={handleClose}>
            <ThemedText style={styles.emptyButtonText}>Go back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const repeatIcon =
    repeatMode === 'one' ? 'repeat' : 'repeat';
  const repeatColor = repeatMode !== 'off' ? Spotify.green : Spotify.textPrimary;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topGlow} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={handleClose}>
          <Ionicons name="chevron-down" size={28} color={Spotify.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerLabel}>PLAYING FROM</ThemedText>
          <ThemedText style={styles.headerAlbum} numberOfLines={1}>
            {track.album}
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowQueue(!showQueue)}>
          <Ionicons
            name={showQueue ? 'list' : 'ellipsis-horizontal'}
            size={22}
            color={Spotify.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        <View style={styles.artworkWrap}>
          {track.coverUri ? (
            <Image source={{ uri: track.coverUri }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkFallback]}>
              <Ionicons name="musical-notes" size={72} color={Spotify.green} />
            </View>
          )}
        </View>

        <View style={styles.trackRow}>
          <View style={styles.trackInfo}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {track.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {track.artist}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={() => setFavorite(!favorite)} style={styles.heartBtn}>
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={26}
              color={favorite ? '#E91429' : Spotify.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {showVisualizer ? <AudioVisualizer isPlaying={isPlaying} /> : null}

        <View style={styles.progressBlock}>
          <SeekBar
            progress={progress / 100}
            onSeek={(ratio) => void seekTo(ratio * trackDuration)}
            trackColor={Spotify.card}
            fillColor={Spotify.textPrimary}
            height={4}
          />
          <View style={styles.timeRow}>
            <ThemedText style={styles.time}>{formatDuration(position)}</ThemedText>
            <ThemedText style={styles.time}>{formatDuration(trackDuration)}</ThemedText>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={() => setShuffle(!shuffle)} style={styles.sideControl}>
            <Ionicons
              name="shuffle"
              size={22}
              color={shuffle ? Spotify.green : Spotify.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playPrevious} style={styles.skipControl}>
            <Ionicons name="play-skip-back" size={32} color={Spotify.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={36}
              color={Spotify.black}
              style={!isPlaying ? { marginLeft: 4 } : undefined}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.skipControl}>
            <Ionicons name="play-skip-forward" size={32} color={Spotify.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={cycleRepeatMode} style={styles.sideControl}>
            <Ionicons name={repeatIcon} size={22} color={repeatColor} />
            {repeatMode === 'one' ? (
              <View style={styles.repeatOneBadge}>
                <ThemedText style={styles.repeatOneText}>1</ThemedText>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.volumeRow}>
          <Ionicons name="volume-low" size={18} color={Spotify.textSecondary} />
          <SeekBar
            progress={volume}
            onSeek={(ratio) => void setVolume(ratio)}
            trackColor={Spotify.card}
            fillColor={Spotify.textSecondary}
            height={4}
            style={styles.volumeSeek}
          />
          <Ionicons name="volume-high" size={18} color={Spotify.textSecondary} />
        </View>

        <View style={styles.metaRow}>
          <ThemedText style={styles.metaText}>{playbackRate}x speed</ThemedText>
          <ThemedText style={styles.metaText}>{tracks.length} in queue</ThemedText>
        </View>
      </View>

      {showQueue ? (
        <View style={styles.queuePanel}>
          <ThemedText style={styles.queueTitle}>Up next</ThemedText>
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            style={styles.queueList}
            renderItem={({ item, index }) => {
              const active = index === currentIndex;
              return (
                <TouchableOpacity
                  style={[styles.queueItem, active && styles.queueItemActive]}
                  onPress={() => void playTrack(index)}
                >
                  <View style={styles.queueIndex}>
                    {active && isPlaying ? (
                      <Ionicons name="volume-medium" size={16} color={Spotify.green} />
                    ) : (
                      <ThemedText style={[styles.queueIndexText, active && styles.queueIndexActive]}>
                        {index + 1}
                      </ThemedText>
                    )}
                  </View>
                  <View style={styles.queueMeta}>
                    <ThemedText
                      style={[styles.queueTrackTitle, active && styles.queueTrackActive]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </ThemedText>
                    <ThemedText style={styles.queueArtist} numberOfLines={1}>
                      {item.artist}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.queueDuration}>
                    {formatDuration(item.duration)}
                  </ThemedText>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Spotify.black,
  },
  topGlow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.7,
    backgroundColor: Spotify.green,
    opacity: 0.07,
    borderRadius: SCREEN_WIDTH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Spotify.textSecondary,
    letterSpacing: 1,
  },
  headerAlbum: {
    fontSize: 13,
    fontWeight: '600',
    color: Spotify.textPrimary,
    marginTop: 2,
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  artworkWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  artwork: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: 8,
    boxShadow: '0px 16px 40px rgba(0,0,0,0.55)',
  },
  artworkFallback: {
    backgroundColor: Spotify.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  trackInfo: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Spotify.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  artist: {
    fontSize: 16,
    color: Spotify.textSecondary,
    marginTop: 6,
  },
  heartBtn: {
    padding: 8,
  },
  progressBlock: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: Spotify.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sideControl: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: Spotify.green,
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneText: {
    fontSize: 8,
    fontWeight: '800',
    color: Spotify.black,
  },
  skipControl: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Spotify.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  volumeSeek: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: Spotify.textMuted,
  },
  queuePanel: {
    maxHeight: 220,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Spotify.elevated,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Spotify.textPrimary,
    marginBottom: 8,
  },
  queueList: {
    flexGrow: 0,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  queueItemActive: {
    opacity: 1,
  },
  queueIndex: {
    width: 24,
    alignItems: 'center',
  },
  queueIndexText: {
    fontSize: 14,
    color: Spotify.textSecondary,
  },
  queueIndexActive: {
    color: Spotify.green,
    fontWeight: '700',
  },
  queueMeta: {
    flex: 1,
  },
  queueTrackTitle: {
    fontSize: 15,
    color: Spotify.textPrimary,
    fontWeight: '500',
  },
  queueTrackActive: {
    color: Spotify.green,
    fontWeight: '700',
  },
  queueArtist: {
    fontSize: 13,
    color: Spotify.textSecondary,
    marginTop: 2,
  },
  queueDuration: {
    fontSize: 12,
    color: Spotify.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Spotify.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Spotify.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 16,
    backgroundColor: Spotify.green,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: Spotify.black,
    fontWeight: '700',
    fontSize: 15,
  },
});
