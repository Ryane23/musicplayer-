import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { UserPlaylist } from '@/types/playlist';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { usePlaylists } from '@/contexts/PlaylistContext';
import PlaylistFormModal from '@/components/playlist/PlaylistFormModal';
import SpotifyImportModal from '@/components/playlist/SpotifyImportModal';
import PlaylistDetailModal from '@/components/playlist/PlaylistDetailModal';
import LibraryScanningView from '@/components/LibraryScanningView';
import { Spotify } from '@/constants/theme';
import { formatDuration } from '@/utils/format';
import { TAB_BAR_HEIGHT, MINI_PLAYER_HEIGHT } from '@/utils/animation';

type LibraryFilter = 'Playlists' | 'Artists' | 'Albums' | 'Songs';

type LibraryItem = {
  id: string;
  title: string;
  subtitle: string;
  coverUri?: string;
  tracks: MusicTrack[];
  isUserPlaylist?: boolean;
  userPlaylist?: UserPlaylist;
  isLiked?: boolean;
  isSpotify?: boolean;
};

const FILTERS: LibraryFilter[] = ['Playlists', 'Artists', 'Albums', 'Songs'];
const LIST_BOTTOM = TAB_BAR_HEIGHT + MINI_PLAYER_HEIGHT + 12;

export default function LibraryTabScreen() {
  const router = useRouter();
  const {
    tracks,
    isLoading,
    scanMessage,
    isDemo,
    libraryNote,
    hasPermission,
    refresh,
  } = useLibrary();
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
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingPlaylist, setEditingPlaylist] = useState<UserPlaylist | undefined>();
  const [spotifyVisible, setSpotifyVisible] = useState(false);
  const [detailPlaylist, setDetailPlaylist] = useState<UserPlaylist | null>(null);
  const [rescanning, setRescanning] = useState(false);

  const systemPlaylists: LibraryItem[] = useMemo(
    () => [
      {
        id: 'liked',
        title: 'Liked Songs',
        subtitle: `${tracks.length} songs`,
        isLiked: true,
        tracks,
      },
      {
        id: 'recent',
        title: 'Recently Played',
        subtitle: `${Math.min(20, tracks.length)} songs`,
        coverUri: tracks[0]?.coverUri,
        tracks: tracks.slice(0, 20),
      },
      {
        id: 'device',
        title: 'On This Device',
        subtitle: isDemo ? 'Demo tracks' : `${tracks.length} songs`,
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
          subtitle: `${playlistTracks.length} songs`,
          coverUri: playlist.coverUri ?? playlistTracks[0]?.coverUri,
          tracks: playlistTracks,
          isUserPlaylist: true,
          isSpotify: playlist.source === 'spotify',
          userPlaylist: playlist,
        };
      }),
    [playlists, resolvePlaylistTracks, tracks]
  );

  const flatItems: LibraryItem[] = useMemo(() => {
    if (filter === 'Songs') {
      return tracks.map((track) => ({
        id: track.id,
        title: track.title,
        subtitle: track.artist,
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
        subtitle: `${albumTracks[0].artist} · ${albumTracks.length} songs`,
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
        coverUri: artistTracks[0].coverUri,
        tracks: artistTracks,
      }));
    }

    return [];
  }, [filter, tracks]);

  const playlistSections = useMemo(
    () => [
      { title: 'Your playlists', data: userPlaylistItems },
      { title: 'Quick access', data: systemPlaylists },
    ],
    [userPlaylistItems, systemPlaylists]
  );

  const handlePlay = async (playlistTracks: MusicTrack[]) => {
    if (playlistTracks.length === 0) return;
    await loadTracks(playlistTracks);
    await playTrack(0);
    router.push('/now-playing');
  };

  const handleRescan = async () => {
    setRescanning(true);
    try {
      const scanned = await refresh();
      if (scanned.length > 0) {
        await loadTracks(scanned);
      }
    } finally {
      setRescanning(false);
    }
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
      { text: 'Rescan library', onPress: () => void handleRescan() },
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

  const renderArtwork = (item: LibraryItem) => {
    if (item.isLiked) {
      return (
        <View style={[styles.art, styles.likedArt]}>
          <Ionicons name="heart" size={16} color="#fff" />
        </View>
      );
    }

    if (item.coverUri) {
      return <Image source={{ uri: item.coverUri }} style={styles.art} />;
    }

    return (
      <View style={[styles.art, styles.artFallback]}>
        <Ionicons
          name={item.isSpotify ? 'musical-notes' : item.isUserPlaylist ? 'list' : 'musical-notes'}
          size={16}
          color={Spotify.textSecondary}
        />
      </View>
    );
  };

  const renderRow = (item: LibraryItem) => (
    <TouchableOpacity style={styles.row} onPress={() => handleItemPress(item)} activeOpacity={0.7}>
      {renderArtwork(item)}
      <View style={styles.rowMeta}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          {item.isSpotify ? <Entypo name="spotify" size={12} color={Spotify.green} /> : null}
        </View>
        <ThemedText style={styles.rowSubtitle} numberOfLines={1}>
          {filter === 'Songs'
            ? `${item.subtitle} · ${formatDuration(item.tracks[0]?.duration ?? 0)}`
            : item.subtitle}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => void handlePlay(item.tracks)}
        hitSlop={8}
      >
        <Ionicons name="play" size={16} color={Spotify.textPrimary} />
      </TouchableOpacity>
      {item.isUserPlaylist ? (
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => item.userPlaylist && openEdit(item.userPlaylist)}
          hitSlop={8}
        >
          <Ionicons name="ellipsis-horizontal" size={16} color={Spotify.textMuted} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );

  const detailTracks = detailPlaylist ? resolvePlaylistTracks(detailPlaylist, tracks) : [];

  if (isLoading || rescanning) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LibraryScanningView
          message={rescanning ? 'Rescanning your library...' : scanMessage}
          subtitle="Please wait — your music loads before anything else"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.headerTitle}>Your Library</ThemedText>
          <ThemedText style={styles.headerMeta}>
            {tracks.length} songs · {playlists.length} playlists
            {isDemo ? ' · demo' : hasPermission ? ' · local' : ''}
          </ThemedText>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/search')} style={styles.headerIcon}>
            <Ionicons name="search" size={20} color={Spotify.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addCircle} onPress={openAddMenu}>
            <Ionicons name="add" size={20} color={Spotify.black} />
          </TouchableOpacity>
        </View>
      </View>

      {libraryNote ? (
        <TouchableOpacity style={styles.noteBanner} onPress={() => void handleRescan()}>
          <Ionicons name="information-circle-outline" size={16} color={Spotify.green} />
          <ThemedText style={styles.noteText} numberOfLines={2}>
            {libraryNote}
          </ThemedText>
          <ThemedText style={styles.noteAction}>Rescan</ThemedText>
        </TouchableOpacity>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {FILTERS.map((label) => {
          const selected = filter === label;
          return (
            <TouchableOpacity
              key={label}
              onPress={() => setFilter(label)}
              style={[styles.filterChip, selected && styles.filterChipActive]}
            >
              <ThemedText style={[styles.filterText, selected && styles.filterTextActive]}>
                {label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filter === 'Playlists' ? (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionPill} onPress={openCreate}>
            <Ionicons name="add" size={14} color={Spotify.green} />
            <ThemedText style={styles.actionPillText}>New playlist</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => setSpotifyVisible(true)}>
            <Entypo name="spotify" size={14} color={Spotify.green} />
            <ThemedText style={styles.actionPillText}>Import</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionPill} onPress={() => void handleRescan()}>
            <Ionicons name="refresh" size={14} color={Spotify.green} />
            <ThemedText style={styles.actionPillText}>Rescan</ThemedText>
          </TouchableOpacity>
        </View>
      ) : null}

      {playlistsLoading ? (
        <LibraryScanningView message="Loading playlists..." compact />
      ) : filter === 'Playlists' ? (
        <SectionList
          sections={playlistSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { title, data } }) =>
            data.length > 0 ? (
              <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
            ) : null
          }
          renderItem={({ item }) => renderRow(item)}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              No playlists yet. Create one or import from Spotify.
            </ThemedText>
          }
        />
      ) : (
        <FlatList
          data={flatItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderRow(item)}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>Nothing found in your library.</ThemedText>
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
  container: {
    flex: 1,
    backgroundColor: Spotify.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Spotify.textPrimary,
    letterSpacing: -0.4,
  },
  headerMeta: {
    fontSize: 12,
    color: Spotify.textMuted,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  headerIcon: {
    padding: 6,
    backgroundColor: Spotify.elevated,
    borderRadius: 18,
  },
  addCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Spotify.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Spotify.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(29,185,84,0.25)',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: Spotify.textSecondary,
    lineHeight: 16,
  },
  noteAction: {
    fontSize: 12,
    fontWeight: '700',
    color: Spotify.green,
  },
  filters: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Spotify.elevated,
  },
  filterChipActive: {
    backgroundColor: Spotify.textPrimary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Spotify.textPrimary,
  },
  filterTextActive: {
    color: Spotify.black,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Spotify.elevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Spotify.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: LIST_BOTTOM,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Spotify.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },
  artFallback: {
    backgroundColor: Spotify.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedArt: {
    backgroundColor: '#450AF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowMeta: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Spotify.textPrimary,
    flexShrink: 1,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Spotify.textSecondary,
    marginTop: 2,
  },
  playBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Spotify.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtn: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emptyText: {
    textAlign: 'center',
    color: Spotify.textSecondary,
    fontSize: 14,
    marginTop: 32,
    paddingHorizontal: 24,
  },
});
