import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Spotify } from '@/constants/theme';
import { getGreeting } from '@/utils/format';

const SHORTCUT_COLORS = ['#450AF5', '#8D67AB', '#E91429', '#1DB954', '#509BF5', '#F59B23'];

type Shortcut = {
  id: string;
  title: string;
  tracks: MusicTrack[];
  coverUri?: string;
  color: string;
};

export default function MusicHubScreen() {
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const { tracks, isLoading, isDemo, libraryNote } = useLibrary();
  const { loadTracks, playTrack } = useMusicPlayer();

  const shortcuts: Shortcut[] = useMemo(() => {
    const liked = tracks.slice(0, 8);
    const recent = tracks.slice(0, 6);
    const fresh = tracks.slice(2, 8);

    return [
      { id: 'liked', title: 'Liked Songs', tracks: liked, color: '#450AF5', coverUri: tracks[0]?.coverUri },
      { id: 'recent', title: 'Recently Played', tracks: recent, color: '#1DB954', coverUri: tracks[1]?.coverUri },
      { id: 'fresh', title: 'Fresh Finds', tracks: fresh, color: '#E91429', coverUri: tracks[2]?.coverUri },
      { id: 'all', title: 'Your Library', tracks, color: '#509BF5', coverUri: tracks[3]?.coverUri },
    ];
  }, [tracks]);

  const madeForYou = useMemo(() => {
    const albums = new Map<string, MusicTrack[]>();
    tracks.forEach((track) => {
      const key = track.album;
      if (!albums.has(key)) albums.set(key, []);
      albums.get(key)!.push(track);
    });
    return Array.from(albums.entries()).slice(0, 8).map(([album, albumTracks], index) => ({
      id: `album-${album}`,
      title: album,
      subtitle: albumTracks[0]?.artist ?? 'Unknown Artist',
      tracks: albumTracks,
      coverUri: albumTracks[0]?.coverUri,
      color: SHORTCUT_COLORS[index % SHORTCUT_COLORS.length],
    }));
  }, [tracks]);

  const handlePlay = async (playlistTracks: MusicTrack[]) => {
    if (playlistTracks.length === 0) return;
    await loadTracks(playlistTracks);
    await playTrack(0);
    router.push('/now-playing');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerIcon, { backgroundColor: card }]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="notifications-outline" size={20} color={Spotify.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerIcon, { backgroundColor: card }]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="time-outline" size={20} color={Spotify.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: tint }]}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="person" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={tint} style={styles.loader} />
        ) : null}

        {libraryNote ? (
          <View style={[styles.demoBanner, { backgroundColor: card }]}>
            <Ionicons name="information-circle-outline" size={16} color={textSecondary} />
            <ThemedText style={[styles.demoText, { color: textSecondary }]}>
              {libraryNote}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.shortcutGrid}>
          {shortcuts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.shortcutCard, { backgroundColor: card }]}
              onPress={() => handlePlay(item.tracks)}
              activeOpacity={0.8}
            >
              {item.coverUri ? (
                <Image source={{ uri: item.coverUri }} style={styles.shortcutArt} />
              ) : (
                <View style={[styles.shortcutArt, { backgroundColor: item.color }]}>
                  <Ionicons name="musical-notes" size={18} color="#fff" />
                </View>
              )}
              <ThemedText style={styles.shortcutTitle} numberOfLines={2}>
                {item.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <SectionHeader title="Made for you" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {madeForYou.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.wideCard}
              onPress={() => handlePlay(item.tracks)}
              activeOpacity={0.85}
            >
              {item.coverUri ? (
                <Image source={{ uri: item.coverUri }} style={styles.wideCardImage} />
              ) : (
                <View style={[styles.wideCardImage, { backgroundColor: item.color }]}>
                  <Ionicons name="albums" size={40} color="rgba(255,255,255,0.9)" />
                </View>
              )}
              <ThemedText style={styles.wideCardTitle} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={[styles.wideCardSubtitle, { color: textSecondary }]} numberOfLines={1}>
                {item.subtitle}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="Recently played" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {tracks.slice(0, 10).map((track, index) => (
            <TouchableOpacity
              key={track.id}
              style={styles.circleCard}
              onPress={() => handlePlay([track])}
              activeOpacity={0.85}
            >
              {track.coverUri ? (
                <Image source={{ uri: track.coverUri }} style={styles.circleImage} />
              ) : (
                <View
                  style={[
                    styles.circleImage,
                    { backgroundColor: SHORTCUT_COLORS[index % SHORTCUT_COLORS.length] },
                  ]}
                >
                  <Ionicons name="musical-note" size={28} color="#fff" />
                </View>
              )}
              <ThemedText style={styles.circleTitle} numberOfLines={2}>
                {track.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="Jump back in" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {tracks.slice(0, 6).map((track, index) => (
            <TouchableOpacity
              key={`jump-${track.id}`}
              style={[styles.jumpCard, { backgroundColor: card }]}
              onPress={() => handlePlay(tracks.slice(index))}
              activeOpacity={0.85}
            >
              {track.coverUri ? (
                <Image source={{ uri: track.coverUri }} style={styles.jumpImage} />
              ) : (
                <View
                  style={[
                    styles.jumpImage,
                    { backgroundColor: SHORTCUT_COLORS[(index + 2) % SHORTCUT_COLORS.length] },
                  ]}
                />
              )}
              <View style={styles.jumpMeta}>
                <ThemedText style={styles.jumpTitle} numberOfLines={1}>
                  {track.album}
                </ThemedText>
                <ThemedText style={[styles.jumpArtist, { color: textSecondary }]} numberOfLines={1}>
                  {track.artist}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { marginBottom: 16 },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  demoText: { flex: 1, fontSize: 12, lineHeight: 16 },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  shortcutCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 56,
  },
  shortcutArt: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  row: {
    gap: 16,
    paddingBottom: 28,
  },
  wideCard: {
    width: 148,
  },
  wideCardImage: {
    width: 148,
    height: 148,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  wideCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  wideCardSubtitle: {
    fontSize: 12,
  },
  circleCard: {
    width: 104,
    alignItems: 'flex-start',
  },
  circleImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  circleTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
  },
  jumpCard: {
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    overflow: 'hidden',
  },
  jumpImage: {
    width: 72,
    height: 72,
  },
  jumpMeta: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  jumpTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  jumpArtist: {
    fontSize: 13,
  },
  bottomSpacer: { height: 140 },
});
