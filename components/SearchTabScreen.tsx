import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { MusicLibraryService } from '@/services/MusicLibraryService';
import { Spotify } from '@/constants/theme';
import { formatDuration } from '@/utils/format';

const BROWSE_CATEGORIES = [
  { id: '1', title: 'Hip-Hop', color: '#E91429' },
  { id: '2', title: 'Pop', color: '#509BF5' },
  { id: '3', title: 'Rock', color: '#E8115B' },
  { id: '4', title: 'Jazz', color: '#1DB954' },
  { id: '5', title: 'Classical', color: '#8D67AB' },
  { id: '6', title: 'Electronic', color: '#F59B23' },
  { id: '7', title: 'R&B', color: '#BA5D07' },
  { id: '8', title: 'Indie', color: '#477D95' },
  { id: '9', title: 'Latin', color: '#148A08' },
  { id: '10', title: 'Chill', color: '#477D95' },
  { id: '11', title: 'Workout', color: '#AF2896' },
  { id: '12', title: 'Focus', color: '#27856A' },
];

export default function SearchTabScreen() {
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const card = useThemeColor({}, 'card');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const { tracks, isLoading } = useLibrary();
  const { loadTracks, playTrack } = useMusicPlayer();

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return MusicLibraryService.searchTracks(tracks, query);
  }, [tracks, query]);

  const handlePlay = async (playlistTracks: MusicTrack[], index = 0) => {
    if (playlistTracks.length === 0) return;
    await loadTracks(playlistTracks);
    await playTrack(index);
    router.push('/now-playing');
  };

  const handleCategoryPress = (title: string) => {
    setQuery(title);
    setFocused(true);
  };

  const isSearching = focused || query.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.searchBar, { backgroundColor: isSearching ? '#fff' : card }]}>
          <Ionicons
            name="search"
            size={22}
            color={isSearching ? '#000' : textSecondary}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              if (!query) setFocused(false);
            }}
            placeholder="What do you want to listen to?"
            placeholderTextColor={isSearching ? '#6B7280' : textSecondary}
            style={[styles.searchInput, { color: isSearching ? '#000' : Spotify.textPrimary }]}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(''); setFocused(false); }}>
              <Ionicons name="close-circle" size={20} color={isSearching ? '#6B7280' : textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={tint} style={styles.loader} />
      ) : null}

      {isSearching ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
                {query ? `No results for "${query}"` : 'Search your library'}
              </ThemedText>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.resultRow}
              onPress={() => handlePlay(results, index)}
            >
              {item.coverUri ? (
                <Image source={{ uri: item.coverUri }} style={styles.resultArt} />
              ) : (
                <View style={[styles.resultArt, { backgroundColor: card }]}>
                  <Ionicons name="musical-note" size={20} color={textSecondary} />
                </View>
              )}
              <View style={styles.resultMeta}>
                <ThemedText style={styles.resultTitle} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[styles.resultSubtitle, { color: textSecondary }]} numberOfLines={1}>
                  Song · {item.artist}
                </ThemedText>
              </View>
              <ThemedText style={[styles.resultDuration, { color: textSecondary }]}>
                {formatDuration(item.duration)}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.browseContent} showsVerticalScrollIndicator={false}>
          <ThemedText style={styles.browseTitle}>Browse all</ThemedText>
          <View style={styles.categoryGrid}>
            {BROWSE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryTile, { backgroundColor: category.color }]}
                onPress={() => handleCategoryPress(category.title)}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.categoryLabel}>{category.title}</ThemedText>
                <View style={styles.categoryDecor} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  loader: { marginTop: 24 },
  browseContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  browseTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryTile: {
    width: '47%',
    height: 96,
    borderRadius: 8,
    padding: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  categoryLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  categoryDecor: {
    position: 'absolute',
    right: -8,
    bottom: -16,
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    transform: [{ rotate: '25deg' }],
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 140,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  resultArt: {
    width: 48,
    height: 48,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultMeta: { flex: 1 },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultSubtitle: { fontSize: 13 },
  resultDuration: { fontSize: 12 },
  empty: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15 },
  bottomSpacer: { height: 140 },
});
