import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { MusicTrack } from '@/types/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

// Mock data for demonstration
const mockTracks: MusicTrack[] = [
  {
    id: '1',
    title: 'Digital Horizon',
    artist: 'Vertex Collective',
    album: 'Electric Dreams',
    duration: 225000,
    uri: 'https://example.com/song1.mp3',
    coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=DH'
  },
  {
    id: '2',
    title: 'Midnight Cello',
    artist: 'Elena Rossi',
    album: 'Classical Nights',
    duration: 312000,
    uri: 'https://example.com/song2.mp3',
    coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=MC'
  },
  {
    id: '3',
    title: 'Fluid Dynamics',
    artist: 'The Wave',
    album: 'Science of Sound',
    duration: 198000,
    uri: 'https://example.com/song3.mp3',
    coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=FD'
  },
  {
    id: '4',
    title: 'Neon Drifters',
    artist: 'Synthwave Collective',
    album: 'Retro Future',
    duration: 267000,
    uri: 'https://example.com/song4.mp3',
    coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=ND'
  },
  {
    id: '5',
    title: 'Organic Soul',
    artist: 'The Quintet',
    album: 'Jazz Fusion',
    duration: 301000,
    uri: 'https://example.com/song5.mp3',
    coverUri: 'https://placehold.co/300x300/F5A623/FFFFFF?text=OS'
  }
];

const mockAlbums = [
  { id: '1', title: 'Electric Dreams', artist: 'Various Artists', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=ED' },
  { id: '2', title: 'Classical Nights', artist: 'Elena Rossi', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=CN' },
  { id: '3', title: 'Science of Sound', artist: 'The Wave', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=SS' },
  { id: '4', title: 'Retro Future', artist: 'Synthwave Collective', coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=RF' },
];

const mockPlaylists = [
  { id: '1', title: 'Daily Mix 1', description: 'Based on your listening habits', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=DM1' },
  { id: '2', title: 'Chill Vibes', description: 'Relaxing tunes for your day', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=CV' },
  { id: '3', title: 'Workout Hits', description: 'High energy tracks for your workout', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=WH' },
];

const HomeDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<MusicTrack[]>([]);
  const [recommendedTracks, setRecommendedTracks] = useState<MusicTrack[]>([]);
  const [mostPlayed, setMostPlayed] = useState<MusicTrack[]>([]);
  const [trendingLocal, setTrendingLocal] = useState<MusicTrack[]>([]);
  const [newAdded, setNewAdded] = useState<MusicTrack[]>([]);
  
  const { loadTracks, playTrack } = useMusicPlayer();

  useEffect(() => {
    // Initialize with mock data for demo purposes
    setRecentlyPlayed(mockTracks.slice(0, 4));
    setRecommendedTracks(mockTracks.slice(1, 5));
    setMostPlayed(mockTracks.slice(0, 3));
    setTrendingLocal(mockTracks.slice(2, 5));
    setNewAdded(mockTracks.slice(0, 5));
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handlePlayTrack = async (track: MusicTrack) => {
    await loadTracks([track]);
    await playTrack(0);
  };

  const handlePlayPlaylist = async (playlistTracks: MusicTrack[]) => {
    await loadTracks(playlistTracks);
    await playTrack(0);
  };

  const renderTrackItem = ({ item }: { item: MusicTrack }) => (
    <TouchableOpacity 
      style={styles.trackItem}
      onPress={() => handlePlayTrack(item)}
    >
      {item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.trackCoverImage} />
      ) : (
        <View style={styles.trackPlaceholder} />
      )}
      <ThemedView style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.trackArtist} type="default">{item.artist}</ThemedText>
      </ThemedView>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color={useThemeColor({}, 'tint')} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.albumCard}>
      <Image source={{ uri: item.coverUri }} style={styles.albumCoverImage} />
      <ThemedText style={styles.albumTitle} type="defaultSemiBold">{item.title}</ThemedText>
      <ThemedText style={styles.albumArtist} type="default">{item.artist}</ThemedText>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.playlistCard}
      onPress={() => handlePlayPlaylist(mockTracks)}
    >
      <Image source={{ uri: item.coverUri }} style={styles.playlistCoverImage} />
      <ThemedText style={styles.playlistTitle} type="defaultSemiBold">{item.title}</ThemedText>
      <ThemedText style={styles.playlistDescription} type="default">{item.description}</ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.greeting} type="defaultSemiBold">Good morning</ThemedText>
          <ThemedText style={styles.subGreeting} type="default">Ready for your daily session?</ThemedText>
        </ThemedView>

        {/* Recently Played */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle} type="defaultSemiBold">Recently Played</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.viewAll} type="link">View All</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recentlyPlayed}
            renderItem={renderAlbumItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          />
        </ThemedView>

        {/* Recommended For You */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="defaultSemiBold">Recommended For You</ThemedText>
          <FlatList
            horizontal
            data={mockPlaylists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
          />
        </ThemedView>

        {/* Most Played */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="defaultSemiBold">Most Played</ThemedText>
          <FlatList
            data={mostPlayed}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </ThemedView>

        {/* Trending Local */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="defaultSemiBold">Trending Local</ThemedText>
          <FlatList
            data={trendingLocal}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </ThemedView>

        {/* New Music Added */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle} type="defaultSemiBold">New Music Added</ThemedText>
          <FlatList
            data={newAdded}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  trackCover: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  trackCoverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  trackPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    opacity: 0.7,
  },
  playButton: {
    padding: 8,
  },
  albumCard: {
    width: 140,
  },
  albumCover: {
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  albumCoverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  albumArtist: {
    fontSize: 12,
    opacity: 0.7,
  },
  playlistCard: {
    width: 140,
  },
  playlistCover: {
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  playlistCoverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  playlistDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default HomeDashboard;