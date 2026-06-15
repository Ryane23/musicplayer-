import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
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
import { formatDuration } from '@/utils/format';

type LibraryFilter = 'Playlists' | 'Artists' | 'Albums' | 'Songs';

type LibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  coverUri?: string;
  tracks: MusicTrack[];
};

const FILTERS: LibraryFilter[] = ['Playlists', 'Artists', 'Albums', 'Songs'];

export default function LibraryTabScreen() {
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const { tracks, isLoading, isDemo } = useLibrary();
  const { loadTracks, playTrack } = useMusicPlayer();
  const [filter, setFilter] = useState<LibraryFilter>('Playlists');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const items: LibraryItem[] = useMemo(() => {
    if (filter === 'Songs') {
      return tracks.map((track) => ({
        id: track.id,
        title: track.title,
        subtitle: track.artist,
        type: 'Song',
        coverUri: track.coverUri,
        tracks: [track],
      }));
    }

    if (filter === 'Albums') {
      const albums = new Map<string, MusicTrack[]>();
      tracks.forEach((track) => {
        const key = `${track.album}-${track.artist}`;
        if (!albums.has(key)) albums.set(key, []);
        albums.get(key)!.push(track);
      });
      return Array.from(albums.entries()).map(([key, albumTracks]) => ({
        id: key,
        title: albumTracks[0].album,
        subtitle: albumTracks[0].artist,
        type: 'Album',
        coverUri: albumTracks[0].coverUri,
        tracks: albumTracks,
      }));
    }

    if (filter === 'Artists') {
      const artists = new Map<string, MusicTrack[]>();
      tracks.forEach((track) => {
        if (!artists.has(track.artist)) artists.set(track.artist, []);
        artists.get(track.artist)!.push(track);
      });
      return Array.from(artists.entries()).map(([artist, artistTracks]) => ({
        id: artist,
        title: artist,
        subtitle: 'Artist',
        type: 'Artist',
        coverUri: artistTracks[0].coverUri,
        tracks: artistTracks,
      }));
    }

    // Playlists
    return [
      {
        id: 'liked',
        title: 'Liked Songs',
        subtitle: `${tracks.length} songs`,
        type: 'Playlist',
        coverUri: undefined,
        tracks,
      },
      {
        id: 'recent',
        title: 'Recently Played',
        subtitle: `${Math.min(20, tracks.length)} songs`,
        type: 'Playlist',
        coverUri: tracks[0]?.coverUri,
        tracks: tracks.slice(0, 20),
      },
      {
        id: 'downloads',
        title: 'On This Device',
        subtitle: isDemo ? 'Demo tracks' : `${tracks.length} local songs`,
        type: 'Playlist',
        coverUri: tracks[1]?.coverUri,
        tracks,
      },
    ];
  }, [tracks, filter, isDemo]);

  const handlePlay = async (playlistTracks: MusicTrack[]) => {
    if (playlistTracks.length === 0) return;
    await loadTracks(playlistTracks);
    await playTrack(0);
    router.push('/now-playing');
  };

  const renderListItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity style={styles.listRow} onPress={() => handlePlay(item.tracks)} activeOpacity={0.7}>
      {item.id === 'liked' ? (
        <View style={[styles.listArt, styles.likedArt, { backgroundColor: '#450AF5' }]}>
          <Ionicons name="heart" size={22} color="#fff" />
        </View>
      ) : item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.listArt} />
      ) : (
        <View style={[styles.listArt, { backgroundColor: card }]}>
          <Ionicons name="musical-notes" size={20} color={textSecondary} />
        </View>
      )}
      <View style={styles.listMeta}>
        <ThemedText style={styles.listTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.listSubtitle, { color: textSecondary }]} numberOfLines={1}>
          {filter === 'Songs' ? `${item.subtitle} · ${formatDuration(item.tracks[0]?.duration ?? 0)}` : item.subtitle}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handlePlay(item.tracks)} activeOpacity={0.85}>
      {item.id === 'liked' ? (
        <View style={[styles.gridArt, styles.likedArt, { backgroundColor: '#450AF5' }]}>
          <Ionicons name="heart" size={36} color="#fff" />
        </View>
      ) : item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.gridArt} />
      ) : (
        <View style={[styles.gridArt, { backgroundColor: card }]}>
          <Ionicons name="musical-notes" size={32} color={textSecondary} />
        </View>
      )}
      <ThemedText style={styles.gridTitle} numberOfLines={2}>
        {item.title}
      </ThemedText>
      <ThemedText style={[styles.gridSubtitle, { color: textSecondary }]} numberOfLines={1}>
        {item.subtitle}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Your Library</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconBtn}>
            <Ionicons name="search" size={24} color={Spotify.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            style={styles.iconBtn}
          >
            <Ionicons
              name={viewMode === 'list' ? 'grid' : 'list'}
              size={22}
              color={Spotify.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: tint }]}>
            <Ionicons name="add" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((label) => {
          const selected = filter === label;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => setFilter(label)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selected ? '#fff' : 'transparent',
                  borderColor: selected ? '#fff' : textSecondary,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: selected ? '#000' : Spotify.textPrimary },
                ]}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color={tint} style={styles.loader} />
      ) : viewMode === 'list' ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
        />
      )}
      <View style={styles.bottomSpacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: { padding: 4 },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loader: { marginTop: 32 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  listArt: {
    width: 56,
    height: 56,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedArt: {
    borderRadius: 4,
  },
  listMeta: { flex: 1 },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listSubtitle: { fontSize: 13 },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 140,
  },
  gridRow: {
    gap: 12,
    marginBottom: 20,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
  },
  gridArt: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  gridSubtitle: { fontSize: 12 },
  bottomSpacer: { height: 0 },
});
