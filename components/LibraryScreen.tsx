import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { MusicTrack } from '@/types/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const mockTracks: MusicTrack[] = [
  {
    id: '1',
    title: 'Digital Horizon',
    artist: 'Vertex Collective',
    album: 'Electric Dreams',
    duration: 225000,
    uri: 'https://example.com/song1.mp3',
    coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=DH',
  },
  {
    id: '2',
    title: 'Midnight Cello',
    artist: 'Elena Rossi',
    album: 'Classical Nights',
    duration: 312000,
    uri: 'https://example.com/song2.mp3',
    coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=MC',
  },
  {
    id: '3',
    title: 'Fluid Dynamics',
    artist: 'The Wave',
    album: 'Science of Sound',
    duration: 198000,
    uri: 'https://example.com/song3.mp3',
    coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=FD',
  },
  {
    id: '4',
    title: 'Neon Drifters',
    artist: 'Synthwave Collective',
    album: 'Retro Future',
    duration: 267000,
    uri: 'https://example.com/song4.mp3',
    coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=ND',
  },
  {
    id: '5',
    title: 'Organic Soul',
    artist: 'The Quintet',
    album: 'Jazz Fusion',
    duration: 301000,
    uri: 'https://example.com/song5.mp3',
    coverUri: 'https://placehold.co/300x300/F5A623/FFFFFF?text=OS',
  },
  {
    id: '6',
    title: 'Vibrations',
    artist: 'Static Echoes',
    album: 'Electronic Waves',
    duration: 245000,
    uri: 'https://example.com/song6.mp3',
    coverUri: 'https://placehold.co/300x300/7B68EE/FFFFFF?text=V',
  },
];

const mockAlbums = [
  { id: '1', title: 'Electric Dreams', artist: 'Various Artists', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=ED', year: 2023 },
  { id: '2', title: 'Classical Nights', artist: 'Elena Rossi', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=CN', year: 2022 },
  { id: '3', title: 'Science of Sound', artist: 'The Wave', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=SS', year: 2023 },
  { id: '4', title: 'Retro Future', artist: 'Synthwave Collective', coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=RF', year: 2021 },
  { id: '5', title: 'Jazz Fusion', artist: 'The Quintet', coverUri: 'https://placehold.co/300x300/F5A623/FFFFFF?text=JF', year: 2020 },
];

const mockArtists = [
  { id: '1', name: 'Vertex Collective', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=VC', songCount: 12 },
  { id: '2', name: 'Elena Rossi', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=ER', songCount: 8 },
  { id: '3', name: 'The Wave', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=TW', songCount: 15 },
  { id: '4', name: 'Synthwave Collective', coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=SC', songCount: 10 },
  { id: '5', name: 'The Quintet', coverUri: 'https://placehold.co/300x300/F5A623/FFFFFF?text=TQ', songCount: 7 },
];

const mockPlaylists = [
  { id: '1', title: 'Daily Mix 1', description: 'Based on your listening habits', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=DM1', songCount: 25 },
  { id: '2', title: 'Chill Vibes', description: 'Relaxing tunes for your day', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=CV', songCount: 30 },
  { id: '3', title: 'Workout Hits', description: 'High energy tracks for your workout', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=WH', songCount: 20 },
  { id: '4', title: 'Focus Flow', description: 'Concentration enhancing music', coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=FF', songCount: 18 },
];

export default function LibraryScreen() {
  const tint = useThemeColor({}, 'tint');
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'artists' | 'playlists'>('songs');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { loadTracks, playTrack } = useMusicPlayer();

  const handlePlayTrack = async (track: MusicTrack) => {
    await loadTracks([track]);
    await playTrack(0);
  };

  const handlePlayPlaylist = async (playlistTracks: MusicTrack[]) => {
    await loadTracks(playlistTracks);
    await playTrack(0);
  };

  const renderTrackItem = ({ item }: { item: MusicTrack }) => (
    <TouchableOpacity style={styles.trackItem} onPress={() => handlePlayTrack(item)}>
      {item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.trackCoverImage} />
      ) : (
        <View style={styles.trackPlaceholder} />
      )}
      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.trackArtist} type="default">{item.artist}</ThemedText>
      </View>
      <ThemedText style={styles.trackDuration} type="default">
        {Math.floor(item.duration / 60000)}:{Math.floor((item.duration % 60000) / 1000).toString().padStart(2, '0')}
      </ThemedText>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color={tint} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.albumCard} onPress={() => handlePlayPlaylist(mockTracks.filter((track) => track.album === item.title))}>
      <Image source={{ uri: item.coverUri }} style={styles.albumCoverImage} />
      <ThemedText style={styles.albumTitle} type="defaultSemiBold">{item.title}</ThemedText>
      <ThemedText style={styles.albumArtist} type="default">{item.artist}</ThemedText>
      <ThemedText style={styles.albumYear} type="default">{item.year}</ThemedText>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.artistItem}>
      <View style={styles.artistAvatar}>
        <Image source={{ uri: item.coverUri }} style={styles.artistAvatarImage} />
      </View>
      <View style={styles.artistInfo}>
        <ThemedText style={styles.artistName} type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.artistSongs} type="default">{item.songCount} songs</ThemedText>
      </View>
      <TouchableOpacity style={styles.artistFollowButton}>
        <Ionicons name="add" size={20} color={tint} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.playlistCard} onPress={() => handlePlayPlaylist(mockTracks)}>
      <Image source={{ uri: item.coverUri }} style={styles.playlistCoverImage} />
      <View style={styles.playlistInfo}>
        <ThemedText style={styles.playlistTitle} type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.playlistDescription} type="default">{item.description}</ThemedText>
        <ThemedText style={styles.playlistSongCount} type="subtitle">{item.songCount} songs</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'songs':
        return <FlatList data={mockTracks} renderItem={renderTrackItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} ItemSeparatorComponent={() => <View style={{ height: 8 }} />} />;
      case 'albums':
        return <FlatList data={mockAlbums} renderItem={renderAlbumItem} keyExtractor={(item) => item.id} numColumns={viewMode === 'grid' ? 2 : 1} showsVerticalScrollIndicator={false} contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : undefined} ItemSeparatorComponent={viewMode === 'list' ? () => <View style={{ height: 8 }} /> : undefined} />;
      case 'artists':
        return <FlatList data={mockArtists} renderItem={renderArtistItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} ItemSeparatorComponent={() => <View style={{ height: 8 }} />} />;
      case 'playlists':
        return <FlatList data={mockPlaylists} renderItem={renderPlaylistItem} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} ItemSeparatorComponent={() => <View style={{ height: 8 }} />} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle} type="title">Your Library</ThemedText>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.viewModeButton} onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
            <Ionicons name={viewMode === 'list' ? 'grid' : 'list'} size={24} color={tint} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortButton} onPress={() => {}}>
            <Ionicons name="funnel" size={24} color={tint} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {(['songs', 'albums', 'artists', 'playlists'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: tint, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText style={[styles.tabText, activeTab === tab && { color: tint }]} type={activeTab === tab ? 'defaultSemiBold' : 'default'}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  controlsRow: { flexDirection: 'row', gap: 16 },
  viewModeButton: { padding: 8 },
  sortButton: { padding: 8 },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: { paddingVertical: 12, paddingHorizontal: 8, marginRight: 16 },
  tabText: { fontSize: 16 },
  content: { flex: 1, paddingHorizontal: 16 },
  gridContainer: { paddingBottom: 16 },
  trackItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8 },
  trackCoverImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  trackPlaceholder: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#ccc', marginRight: 12 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 16, fontWeight: '600' },
  trackArtist: { fontSize: 14, opacity: 0.7 },
  trackDuration: { fontSize: 14, opacity: 0.7, marginHorizontal: 8 },
  playButton: { padding: 8 },
  albumCard: { flex: 1, margin: 8 },
  albumCoverImage: { width: '100%', aspectRatio: 1, borderRadius: 8, marginBottom: 8 },
  albumTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  albumArtist: { fontSize: 12, opacity: 0.7, marginBottom: 2 },
  albumYear: { fontSize: 12, opacity: 0.5 },
  artistItem: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  artistAvatar: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', marginRight: 12 },
  artistAvatarImage: { width: '100%', height: '100%' },
  artistInfo: { flex: 1 },
  artistName: { fontSize: 16, fontWeight: '600' },
  artistSongs: { fontSize: 12, opacity: 0.7 },
  artistFollowButton: { padding: 8 },
  playlistCard: { flexDirection: 'row', alignItems: 'center', padding: 8, marginBottom: 8 },
  playlistCoverImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  playlistInfo: { flex: 1 },
  playlistTitle: { fontSize: 16, fontWeight: '600' },
  playlistDescription: { fontSize: 14, opacity: 0.7, marginBottom: 2 },
  playlistSongCount: { fontSize: 12, opacity: 0.5 },
});
