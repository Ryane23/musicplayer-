import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useRouter } from 'expo-router';

type PlaylistCard = {
  id: string;
  title: string;
  description: string;
  coverUri?: string;
  songCount: number;
  duration: number;
  tracks: MusicTrack[];
  pinned?: boolean;
};

const demoTracks: MusicTrack[] = [
  {
    id: 'playlist-demo-1',
    title: 'Aerial',
    artist: 'Northline',
    album: 'Skyline',
    duration: 182000,
    uri: 'https://example.com/aerial.mp3',
    coverUri: 'https://placehold.co/400x400/2563EB/F8FAFC?text=A',
  },
  {
    id: 'playlist-demo-2',
    title: 'Orbit',
    artist: 'Northline',
    album: 'Skyline',
    duration: 204000,
    uri: 'https://example.com/orbit.mp3',
    coverUri: 'https://placehold.co/400x400/7C3AED/F8FAFC?text=O',
  },
  {
    id: 'playlist-demo-3',
    title: 'Harbor',
    artist: 'Blue Room',
    album: 'After Hours',
    duration: 219000,
    uri: 'https://example.com/harbor.mp3',
    coverUri: 'https://placehold.co/400x400/DB2777/F8FAFC?text=H',
  },
  {
    id: 'playlist-demo-4',
    title: 'Drift',
    artist: 'Blue Room',
    album: 'After Hours',
    duration: 235000,
    uri: 'https://example.com/drift.mp3',
    coverUri: 'https://placehold.co/400x400/EA580C/F8FAFC?text=D',
  },
];

function formatDuration(totalMillis: number) {
  const totalMinutes = Math.floor(totalMillis / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export default function PlaylistHubScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');
  const surface = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)';
  const borderColor = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { loadTracks, playTrack, tracks: currentTracks } = useMusicPlayer();

  const libraryTracks = currentTracks.length > 0 ? currentTracks : demoTracks;

  const playlists: PlaylistCard[] = useMemo(
    () => [
      {
        id: 'create',
        title: 'Create Playlist',
        description: 'Start a new collection',
        songCount: 0,
        duration: 0,
        tracks: [],
      },
      {
        id: 'favorites',
        title: 'Liked Songs',
        description: 'Your favorite tracks',
        coverUri: libraryTracks[0]?.coverUri,
        songCount: Math.min(25, libraryTracks.length),
        duration: libraryTracks.slice(0, 4).reduce((sum, track) => sum + track.duration, 0),
        tracks: libraryTracks.slice(0, Math.min(8, libraryTracks.length)),
        pinned: true,
      },
      {
        id: 'recent',
        title: 'Recently Played',
        description: 'Picked up from your queue',
        coverUri: libraryTracks[1]?.coverUri,
        songCount: Math.min(14, libraryTracks.length),
        duration: libraryTracks.slice(0, 5).reduce((sum, track) => sum + track.duration, 0),
        tracks: libraryTracks.slice(0, Math.min(6, libraryTracks.length)),
      },
      {
        id: 'roadtrip',
        title: 'Roadtrip',
        description: 'High energy local mix',
        coverUri: libraryTracks[2]?.coverUri,
        songCount: 12,
        duration: libraryTracks.slice(0, 3).reduce((sum, track) => sum + track.duration, 0),
        tracks: libraryTracks.slice(0, Math.min(5, libraryTracks.length)),
      },
      {
        id: 'focus',
        title: 'Focus Flow',
        description: 'Deep work sessions',
        coverUri: libraryTracks[3]?.coverUri,
        songCount: 18,
        duration: libraryTracks.slice(1, 4).reduce((sum, track) => sum + track.duration, 0),
        tracks: libraryTracks.slice(1, Math.min(6, libraryTracks.length)),
      },
    ],
    [libraryTracks]
  );

  const handlePlayPlaylist = async (playlist: PlaylistCard) => {
    if (playlist.id === 'create') {
      return;
    }

    await loadTracks(playlist.tracks);
    await playTrack(0);
    router.push('/now-playing');
  };

  const renderPlaylistCard = (item: PlaylistCard) => {
    const isCreateCard = item.id === 'create';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          viewMode === 'grid' ? styles.gridCard : styles.listCard,
          { backgroundColor: surface, borderColor },
        ]}
        onPress={() => handlePlayPlaylist(item)}
      >
        <View style={viewMode === 'grid' ? styles.coverFrameGrid : styles.coverFrameList}>
        {isCreateCard ? (
          <View style={[styles.cover, styles.createCover, { backgroundColor: tint }]}>
            <Ionicons name="add" size={32} color="#fff" />
          </View>
        ) : (
          <View style={styles.cover}>
            {item.coverUri ? (
              <Image source={{ uri: item.coverUri }} style={styles.coverImage} />
            ) : (
              <View style={[styles.coverImage, { backgroundColor: tint }]} />
            )}
          </View>
        )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {item.pinned ? <Ionicons name="heart" size={14} color={tint} /> : null}
          </View>
          <ThemedText type="default" style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statPill}>
              <Ionicons name="musical-notes" size={12} color={textColor} />
              <ThemedText type="defaultSemiBold" style={styles.statText}>
                {item.songCount} songs
              </ThemedText>
            </View>
            <View style={styles.statPill}>
              <Ionicons name="time-outline" size={12} color={textColor} />
              <ThemedText type="defaultSemiBold" style={styles.statText}>
                {formatDuration(item.duration)}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.ambientBand, { backgroundColor: tint }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle" style={styles.kicker}>
              Curated Collections
            </ThemedText>
            <ThemedText type="title" style={styles.heading}>
              Playlists
            </ThemedText>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconButton, { borderColor }]}>
              <Ionicons name="add" size={18} color={textColor} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { borderColor }]} onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={18} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.heroCard, { backgroundColor: surface, borderColor }]} onPress={() => handlePlayPlaylist(playlists[1])}>
          <View style={styles.heroCopy}>
            <ThemedText type="subtitle" style={styles.heroLabel}>
              Smart Playlist
            </ThemedText>
            <ThemedText type="title" style={styles.heroTitle}>
              Daily Mix
            </ThemedText>
            <ThemedText type="default" style={styles.heroSubtitle}>
              Auto-updated from your most played local tracks
            </ThemedText>
          </View>
          <View style={[styles.heroPlay, { backgroundColor: tint }]}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Pinned</ThemedText>
          <ThemedText type="default" style={styles.sectionHint}>
            Favorite playlists
          </ThemedText>
        </View>

        <View style={viewMode === 'grid' ? styles.gridContent : styles.listContent}>
          {playlists.map((playlist) => (
            <React.Fragment key={playlist.id}>{renderPlaylistCard(playlist)}</React.Fragment>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Recently Played</ThemedText>
          <TouchableOpacity onPress={() => router.push('/now-playing')}>
            <ThemedText type="link">Open Player</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={[styles.recentCard, { backgroundColor: surface, borderColor }]}>
          {playlists.slice(1, 4).map((playlist) => (
            <TouchableOpacity key={playlist.id} style={styles.recentRow} onPress={() => handlePlayPlaylist(playlist)}>
              <View style={styles.recentThumbWrap}>
                {playlist.coverUri ? (
                  <Image source={{ uri: playlist.coverUri }} style={styles.recentThumb} />
                ) : (
                  <View style={[styles.recentThumb, { backgroundColor: tint }]} />
                )}
              </View>
              <View style={styles.recentMeta}>
                <ThemedText type="defaultSemiBold" style={styles.recentTitle} numberOfLines={1}>
                  {playlist.title}
                </ThemedText>
                <ThemedText type="default" style={styles.recentSubtitle} numberOfLines={1}>
                  {playlist.songCount} songs · {formatDuration(playlist.duration)}
                </ThemedText>
              </View>
              <Ionicons name="play-circle" size={28} color={tint} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ambientBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 190,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 14,
    opacity: 0.7,
  },
  heading: {
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    marginBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },
  heroTitle: {
    marginBottom: 8,
  },
  heroSubtitle: {
    opacity: 0.74,
  },
  heroPlay: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHint: {
    opacity: 0.65,
  },
  card: {
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 16,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  gridCard: {
    width: '47.8%',
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 0,
  },
  coverFrameGrid: {
    width: '100%',
  },
  coverFrameList: {
    width: 104,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#111827',
  },
  createCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  cardBody: {
    padding: 14,
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    opacity: 0.72,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statText: {
    fontSize: 12,
  },
  recentCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 12,
  },
  recentThumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recentThumb: {
    width: '100%',
    height: '100%',
  },
  recentMeta: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
  },
  recentSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  bottomSpacer: {
    height: 110,
  },
});
