import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { UserPlaylist } from '@/types/playlist';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlaylists } from '@/contexts/PlaylistContext';
import PlaylistFormModal from '@/components/playlist/PlaylistFormModal';
import SpotifyImportModal from '@/components/playlist/SpotifyImportModal';
import PlaylistDetailModal from '@/components/playlist/PlaylistDetailModal';
import { Spotify } from '@/constants/theme';
import { formatDuration } from '@/utils/format';
import { TAB_BAR_HEIGHT, MINI_PLAYER_HEIGHT } from '@/utils/animation';

type LibraryFilter = 'Playlists' | 'Artists' | 'Albums' | 'Songs';

type LibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  coverUri?: string;
  tracks: MusicTrack[];
  isUserPlaylist?: boolean;
  userPlaylist?: UserPlaylist;
  isLiked?: boolean;
};

const FILTERS: LibraryFilter[] = ['Playlists', 'Artists', 'Albums', 'Songs'];
const LIST_BOTTOM = TAB_BAR_HEIGHT + MINI_PLAYER_HEIGHT + 12;

export default function LibraryTabScreen() {
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const { tracks, isLoading, isDemo } = useLibrary();
  const { loadTracks, playTrack } = useMusicPlayer();
  const {
    playlists,
    isLoading: playlistsLoading,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    importFromSpotify,
    resolvePlaylistTracks,
  } = usePlaylists();

  const [filter, setFilter] = useState<LibraryFilter>('Playlists');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPlaylist, setEditingPlaylist] = useState<UserPlaylist | undefined>();
  const [spotifyVisible, setSpotifyVisible] = useState(false);
  const [detailPlaylist, setDetailPlaylist] = useState<UserPlaylist | null>(null);

  const systemPlaylists: LibraryItem[] = useMemo(
    () => [
      {
        id: 'liked',
        title: 'Liked Songs',
        subtitle: `${tracks.length} songs`,
        type: 'Playlist',
        isLiked: true,
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
    ],
    [tracks, isDemo]
  );

  const userPlaylistItems: LibraryItem[] = useMemo(
    () =>
      playlists.map((playlist) => {
        const playlistTracks = resolvePlaylistTracks(playlist, tracks);
        return {
          id: playlist.id,
          title: playlist.name,
          subtitle:
            playlist.source === 'spotify'
              ? `${playlistTracks.length} songs · Spotify`
              : `${playlistTracks.length} songs`,
          type: 'Playlist',
          coverUri: playlist.coverUri ?? playlistTracks[0]?.coverUri,
          tracks: playlistTracks,
          isUserPlaylist: true,
          userPlaylist: playlist,
        };
      }),
    [playlists, resolvePlaylistTracks, tracks]
  );

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
        subtitle: `${artistTracks.length} songs`,
        type: 'Artist',
        coverUri: artistTracks[0].coverUri,
        tracks: artistTracks,
      }));
    }

    return [...userPlaylistItems, ...systemPlaylists];
  }, [filter, tracks, systemPlaylists, userPlaylistItems]);

  const handlePlay = async (playlistTracks: MusicTrack[]) => {
    if (playlistTracks.length === 0) return;
    await loadTracks(playlistTracks);
    await playTrack(0);
    router.push('/now-playing');
  };

  const openCreate = () => {
    setFormMode('create');
    setEditingPlaylist(undefined);
    setFormVisible(true);
  };

  const openEdit = (playlist: UserPlaylist) => {
    setFormMode('edit');
    setEditingPlaylist(playlist);
    setFormVisible(true);
    setDetailPlaylist(null);
  };

  const openAddMenu = () => {
    Alert.alert('Library', 'What would you like to do?', [
      { text: 'Create playlist', onPress: openCreate },
      { text: 'Import from Spotify', onPress: () => setSpotifyVisible(true) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleItemPress = (item: LibraryItem) => {
    if (item.isUserPlaylist && item.userPlaylist) {
      setDetailPlaylist(item.userPlaylist);
      return;
    }
    void handlePlay(item.tracks);
  };

  const renderArtwork = (item: LibraryItem, size: 'list' | 'grid') => {
    const listStyle = size === 'list' ? styles.listArt : styles.gridArt;

    if (item.isLiked) {
      return (
        <View style={[listStyle, styles.likedArt]}>
          <Ionicons name="heart" size={size === 'list' ? 18 : 28} color="#fff" />
        </View>
      );
    }

    if (!item.isUserPlaylist && item.id === 'recent' && item.coverUri) {
      return <Image source={{ uri: item.coverUri }} style={listStyle} />;
    }

    if (item.coverUri) {
      return <Image source={{ uri: item.coverUri }} style={listStyle} />;
    }

    return (
      <View style={[listStyle, { backgroundColor: card }]}>
        <Ionicons
          name={item.isUserPlaylist ? 'list' : 'musical-notes'}
          size={size === 'list' ? 18 : 26}
          color={textSecondary}
        />
      </View>
    );
  };

  const renderListItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity
      style={styles.listRow}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      {renderArtwork(item, 'list')}
      <View style={styles.listMeta}>
        <ThemedText style={styles.listTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={[styles.listSubtitle, { color: textSecondary }]} numberOfLines={1}>
          {filter === 'Songs'
            ? `${item.subtitle} · ${formatDuration(item.tracks[0]?.duration ?? 0)}`
            : item.subtitle}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.rowAction}
        onPress={() => void handlePlay(item.tracks)}
        hitSlop={8}
      >
        <Ionicons name="play-circle" size={28} color={Spotify.textSecondary} />
      </TouchableOpacity>
      {item.isUserPlaylist ? (
        <TouchableOpacity
          style={styles.rowAction}
          onPress={() => item.userPlaylist && openEdit(item.userPlaylist)}
          hitSlop={8}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={Spotify.textMuted} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );

  const renderGridItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => handleItemPress(item)} activeOpacity={0.85}>
      {renderArtwork(item, 'grid')}
      <ThemedText style={styles.gridTitle} numberOfLines={2}>
        {item.title}
      </ThemedText>
      <ThemedText style={[styles.gridSubtitle, { color: textSecondary }]} numberOfLines={1}>
        {item.subtitle}
      </ThemedText>
    </TouchableOpacity>
  );

  const detailTracks = detailPlaylist ? resolvePlaylistTracks(detailPlaylist, tracks) : [];
  const loading = isLoading || playlistsLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Your Library</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/search')} style={styles.iconBtn}>
            <Ionicons name="search" size={22} color={Spotify.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            style={styles.iconBtn}
          >
            <Ionicons
              name={viewMode === 'list' ? 'grid' : 'list'}
              size={20}
              color={Spotify.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: tint }]} onPress={openAddMenu}>
            <Ionicons name="add" size={20} color="#000" />
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
                style={[styles.filterText, { color: selected ? '#000' : Spotify.textPrimary }]}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filter === 'Playlists' ? (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} onPress={openCreate}>
            <Ionicons name="add-circle-outline" size={16} color={Spotify.green} />
            <ThemedText style={styles.quickBtnText}>Create</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => setSpotifyVisible(true)}>
            <Entypo name="spotify" size={16} color={Spotify.green} />
            <ThemedText style={styles.quickBtnText}>Import Spotify</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator color={tint} style={styles.loader} />
      ) : viewMode === 'list' ? (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              {filter === 'Playlists' ? 'No playlists yet. Create one or import from Spotify.' : 'Nothing here yet.'}
            </ThemedText>
          }
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              {filter === 'Playlists' ? 'No playlists yet.' : 'Nothing here yet.'}
            </ThemedText>
          }
        />
      )}

      <PlaylistFormModal
        visible={formVisible}
        mode={formMode}
        library={tracks}
        playlist={editingPlaylist}
        onClose={() => setFormVisible(false)}
        onSave={async (input) => {
          if (formMode === 'create') {
            await createPlaylist(input);
            return;
          }
          if (editingPlaylist) {
            await updatePlaylist(editingPlaylist.id, input);
          }
        }}
      />

      <SpotifyImportModal
        visible={spotifyVisible}
        onClose={() => setSpotifyVisible(false)}
        onImport={async (url) => {
          const result = await importFromSpotify(url, tracks);
          return {
            matched: result.matched,
            total: result.total,
            missing: result.missing,
          };
        }}
      />

      <PlaylistDetailModal
        visible={Boolean(detailPlaylist)}
        playlist={detailPlaylist}
        tracks={detailTracks}
        onClose={() => setDetailPlaylist(null)}
        onPlay={(playlistTracks) => {
          void handlePlay(playlistTracks);
          setDetailPlaylist(null);
        }}
        onEdit={openEdit}
        onDelete={async (playlist) => {
          await deletePlaylist(playlist.id);
        }}
        onRemoveTrack={async (playlistId, trackId) => {
          const playlist = playlists.find((entry) => entry.id === playlistId);
          if (!playlist) return;
          const nextIds = playlist.trackIds.filter((id) => id !== trackId);
          await updatePlaylist(playlistId, { trackIds: nextIds });
          setDetailPlaylist((current) =>
            current?.id === playlistId ? { ...current, trackIds: nextIds } : current
          );
        }}
      />
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
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: { padding: 2 },
  addBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Spotify.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Spotify.textPrimary,
  },
  loader: { marginTop: 24 },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: LIST_BOTTOM,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  listArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedArt: {
    backgroundColor: '#450AF5',
  },
  listMeta: { flex: 1, minWidth: 0 },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSubtitle: { fontSize: 12 },
  rowAction: {
    padding: 2,
  },
  separator: { height: 2 },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: LIST_BOTTOM,
  },
  gridRow: {
    gap: 10,
    marginBottom: 14,
  },
  gridItem: {
    flex: 1,
    maxWidth: '48%',
  },
  gridArt: {
    width: '100%',
    height: 108,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 2,
  },
  gridSubtitle: { fontSize: 11 },
  emptyText: {
    textAlign: 'center',
    color: Spotify.textSecondary,
    fontSize: 14,
    marginTop: 32,
    paddingHorizontal: 24,
  },
});
