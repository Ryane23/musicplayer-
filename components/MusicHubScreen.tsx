import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MusicTrack } from '@/types/music';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { MusicLibraryService } from '@/services/MusicLibraryService';

type SectionCard = {
  id: string;
  title: string;
  subtitle: string;
  coverUri?: string;
  tracks: MusicTrack[];
  accent: string;
};

const demoTracks: MusicTrack[] = [
  {
    id: 'demo-1',
    title: 'Midnight Drive',
    artist: 'Neon Avenue',
    album: 'Night Pulse',
    duration: 221000,
    uri: 'https://example.com/demo-1.mp3',
    coverUri: 'https://placehold.co/400x400/1F2937/F8FAFC?text=MD',
  },
  {
    id: 'demo-2',
    title: 'City Lights',
    artist: 'Blue Static',
    album: 'Night Pulse',
    duration: 194000,
    uri: 'https://example.com/demo-2.mp3',
    coverUri: 'https://placehold.co/400x400/0F766E/F8FAFC?text=CL',
  },
  {
    id: 'demo-3',
    title: 'Soft Echo',
    artist: 'Tidewave',
    album: 'Open Space',
    duration: 205000,
    uri: 'https://example.com/demo-3.mp3',
    coverUri: 'https://placehold.co/400x400/7C3AED/F8FAFC?text=SE',
  },
  {
    id: 'demo-4',
    title: 'Glass Roads',
    artist: 'Tidewave',
    album: 'Open Space',
    duration: 248000,
    uri: 'https://example.com/demo-4.mp3',
    coverUri: 'https://placehold.co/400x400/EA580C/F8FAFC?text=GR',
  },
  {
    id: 'demo-5',
    title: 'Static Bloom',
    artist: 'Afterglow',
    album: 'Warm Signals',
    duration: 232000,
    uri: 'https://example.com/demo-5.mp3',
    coverUri: 'https://placehold.co/400x400/DB2777/F8FAFC?text=SB',
  },
];

const filterLabels = ['All', 'Songs', 'Albums', 'Artists', 'Downloaded'];

function formatTime(duration: number) {
  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function MusicHubScreen() {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'background');
  const borderColor = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const surfaceColor = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.86)';

  const [libraryTracks, setLibraryTracks] = useState<MusicTrack[]>(demoTracks);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const { loadTracks, playTrack, currentTrack } = useMusicPlayer();

  useEffect(() => {
    let mounted = true;

    const loadLibrary = async () => {
      try {
        const localTracks = await MusicLibraryService.scanLocalMusic();
        if (mounted && localTracks.length > 0) {
          setLibraryTracks(localTracks);
        }
      } catch (error) {
        console.error('Failed to scan music library:', error);
      }
    };

    void loadLibrary();

    return () => {
      mounted = false;
    };
  }, []);

  const tracks = libraryTracks.length > 0 ? libraryTracks : demoTracks;
  const featuredTrack = currentTrack ?? tracks[0];

  const albums = Array.from(
    new Map(
      tracks.map((track) => [
        `${track.album}-${track.artist}`,
        {
          id: `${track.album}-${track.artist}`,
          title: track.album,
          subtitle: track.artist,
          coverUri: track.coverUri,
          tracks: tracks.filter((candidate) => candidate.album === track.album),
          accent: tint,
        },
      ])
    ).values()
  );

  const artists = Array.from(
    new Map(
      tracks.map((track) => [
        track.artist,
        {
          id: track.artist,
          title: track.artist,
          subtitle: `${tracks.filter((candidate) => candidate.artist === track.artist).length} songs`,
          coverUri: track.coverUri,
          tracks: tracks.filter((candidate) => candidate.artist === track.artist),
          accent: tint,
        },
      ])
    ).values()
  );

  const sections: SectionCard[] = [
    {
      id: 'recent',
      title: 'Recently Played',
      subtitle: 'Resume where you left off',
      coverUri: tracks[0]?.coverUri,
      tracks: tracks.slice(0, 6),
      accent: tint,
    },
    {
      id: 'favorites',
      title: 'Favorite Songs',
      subtitle: 'Pinned to your heart',
      coverUri: tracks[1]?.coverUri,
      tracks: tracks.slice(1, 5),
      accent: '#db2777',
    },
    {
      id: 'added',
      title: 'Recently Added',
      subtitle: 'Fresh local finds',
      coverUri: tracks[2]?.coverUri,
      tracks: tracks.slice(0, 4),
      accent: '#0f766e',
    },
  ];

  const handlePlayTracks = async (playlistTracks: MusicTrack[]) => {
    await loadTracks(playlistTracks);
    await playTrack(0);
    router.push('/now-playing');
  };

  const visibleTracks = tracks.filter((track) => {
    if (selectedFilter === 'All' || selectedFilter === 'Downloaded') {
      return true;
    }
    if (selectedFilter === 'Songs') {
      return true;
    }
    if (selectedFilter === 'Albums') {
      return false;
    }
    if (selectedFilter === 'Artists') {
      return false;
    }
    return true;
  });

  const renderTrack = ({ item }: { item: MusicTrack }) => (
    <TouchableOpacity style={[styles.trackRow, { borderColor, backgroundColor: surfaceColor }]} onPress={() => handlePlayTracks([item])}>
      {item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.trackArtwork} />
      ) : (
        <View style={[styles.trackArtwork, styles.trackArtworkFallback, { backgroundColor: tint }]} />
      )}
      <View style={styles.trackMeta}>
        <ThemedText type="defaultSemiBold" style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText type="default" style={styles.trackSubtitle} numberOfLines={1}>
          {item.artist}
        </ThemedText>
      </View>
      <View style={styles.trackRight}>
        <ThemedText type="default" style={styles.trackDuration}>
          {formatTime(item.duration)}
        </ThemedText>
        <Ionicons name="ellipsis-horizontal" size={18} color={textColor} />
      </View>
    </TouchableOpacity>
  );

  const renderCollectionCard = (item: SectionCard | (typeof albums)[number] | (typeof artists)[number]) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.collectionCard, { backgroundColor: surfaceColor, borderColor }]}
      onPress={() => handlePlayTracks(item.tracks)}
    >
      <View style={[styles.collectionCover, { backgroundColor: item.accent }]}>
        {item.coverUri ? (
          <Image source={{ uri: item.coverUri }} style={styles.collectionImage} />
        ) : null}
      </View>
      <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.collectionTitle}>
        {item.title}
      </ThemedText>
      <ThemedText type="default" numberOfLines={1} style={styles.collectionSubtitle}>
        {item.subtitle}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: cardColor }]}>
      <View style={[styles.ambientBand, { backgroundColor: tint }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle" style={styles.kicker}>Local Library</ThemedText>
            <ThemedText type="title" style={styles.heading}>Music</ThemedText>
          </View>
          <TouchableOpacity style={[styles.avatarButton, { borderColor }]}>
            <Ionicons name="person" size={18} color={textColor} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: surfaceColor, borderColor }]}>
          <Ionicons name="search" size={18} color={textColor} />
          <TextInput
            placeholder="Search local songs, albums, artists"
            placeholderTextColor={textColor === '#ECEDEE' ? 'rgba(236,237,238,0.65)' : 'rgba(15,23,42,0.45)'}
            style={[styles.searchInput, { color: textColor }]}
          />
          <TouchableOpacity>
            <Ionicons name="options-outline" size={18} color={textColor} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filterLabels.map((label) => {
            const selected = selectedFilter === label;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setSelectedFilter(label)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? tint : surfaceColor,
                    borderColor: selected ? tint : borderColor,
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: selected ? '#fff' : textColor }}>
                  {label}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {featuredTrack ? (
          <TouchableOpacity style={[styles.featuredCard, { backgroundColor: surfaceColor, borderColor }]} onPress={() => handlePlayTracks([featuredTrack])}>
            <View style={styles.featuredCopy}>
              <ThemedText type="subtitle" style={styles.featuredLabel}>
                Featured Track
              </ThemedText>
              <ThemedText type="title" style={styles.featuredTitle} numberOfLines={1}>
                {featuredTrack.title}
              </ThemedText>
              <ThemedText type="default" style={styles.featuredArtist} numberOfLines={1}>
                {featuredTrack.artist} · {featuredTrack.album}
              </ThemedText>
              <View style={styles.featuredActions}>
                <TouchableOpacity style={[styles.featuredPlay, { backgroundColor: tint }]}>
                  <Ionicons name="play" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={[styles.featuredMetaPill, { borderColor }]}>
                  <Ionicons name="pulse" size={14} color={textColor} />
                  <ThemedText type="defaultSemiBold" style={styles.featuredMetaText}>
                    {formatTime(featuredTrack.duration)}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.featuredArtworkWrap}>
              {featuredTrack.coverUri ? (
                <Image source={{ uri: featuredTrack.coverUri }} style={styles.featuredArtwork} />
              ) : (
                <View style={[styles.featuredArtwork, { backgroundColor: tint }]} />
              )}
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Quick Collections</ThemedText>
          <TouchableOpacity onPress={() => router.push('/now-playing')}>
            <ThemedText type="link">Open Now Playing</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          data={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCollectionCard(item)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        />

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Albums</ThemedText>
          <ThemedText type="default" style={styles.sectionHint}>
            {albums.length} albums
          </ThemedText>
        </View>

        <FlatList
          horizontal
          data={albums}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCollectionCard(item)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        />

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Artists</ThemedText>
          <ThemedText type="default" style={styles.sectionHint}>
            {artists.length} artists
          </ThemedText>
        </View>

        <FlatList
          horizontal
          data={artists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderCollectionCard(item)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalRow}
          ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        />

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Song Library</ThemedText>
          <ThemedText type="default" style={styles.sectionHint}>
            {visibleTracks.length} tracks
          </ThemedText>
        </View>

        <FlatList
          data={visibleTracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />

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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 14,
    opacity: 0.7,
  },
  heading: {
    marginTop: 2,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterRow: {
    paddingBottom: 16,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  featuredCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 22,
  },
  featuredCopy: {
    flex: 1,
  },
  featuredLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },
  featuredTitle: {
    marginBottom: 8,
  },
  featuredArtist: {
    opacity: 0.75,
  },
  featuredActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  featuredPlay: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  featuredMetaText: {
    fontSize: 13,
  },
  featuredArtworkWrap: {
    width: 132,
    justifyContent: 'center',
  },
  featuredArtwork: {
    width: 132,
    height: 132,
    borderRadius: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHint: {
    opacity: 0.65,
  },
  horizontalRow: {
    paddingBottom: 16,
  },
  collectionCard: {
    width: 164,
    borderRadius: 24,
    borderWidth: 1,
    padding: 12,
  },
  collectionCover: {
    borderRadius: 20,
    height: 140,
    marginBottom: 12,
    overflow: 'hidden',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
  },
  collectionTitle: {
    fontSize: 16,
  },
  collectionSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 3,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
  },
  trackArtwork: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  trackArtworkFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackMeta: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
  },
  trackSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  trackRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  trackDuration: {
    fontSize: 12,
    opacity: 0.7,
  },
  bottomSpacer: {
    height: 110,
  },
});
