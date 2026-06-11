import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
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
  },
];

const mockAlbums = [
  { id: '1', title: 'Electric Dreams', artist: 'Various Artists', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=ED' },
  { id: '2', title: 'Classical Nights', artist: 'Elena Rossi', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=CN' },
  { id: '3', title: 'Science of Sound', artist: 'The Wave', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=SS' },
  { id: '4', title: 'Retro Future', artist: 'Synthwave Collective', coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=RF' },
];

const mockArtists = [
  { id: '1', name: 'Vertex Collective', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=VC' },
  { id: '2', name: 'Elena Rossi', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=ER' },
  { id: '3', name: 'The Wave', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=TW' },
  { id: '4', name: 'Synthwave Collective', coverUri: 'https://placehold.co/300x300/D0011B/FFFFFF?text=SC' },
];

const mockPlaylists = [
  { id: '1', title: 'Daily Mix 1', description: 'Based on your listening habits', coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=DM1' },
  { id: '2', title: 'Chill Vibes', description: 'Relaxing tunes for your day', coverUri: 'https://placehold.co/300x300/4A90E2/FFFFFF?text=CV' },
  { id: '3', title: 'Workout Hits', description: 'High energy tracks for your workout', coverUri: 'https://placehold.co/300x300/50E3C2/FFFFFF?text=WH' },
];

const recentSearches = [
  'Digital Horizon',
  'Elena Rossi',
  'Jazz Fusion',
  'Chill Vibes',
  'Synthwave',
];

const SearchScreen = () => {
  const tint = useThemeColor({}, 'tint');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'artists' | 'playlists'>('all');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  
  const { loadTracks, playTrack } = useMusicPlayer();

  // Simulate search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setShowRecentSearches(true);
      return;
    }
    
    setShowRecentSearches(false);
    
    // Filter results based on search query
    const filteredTracks = mockTracks.filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredAlbums = mockAlbums.filter(album => 
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredArtists = mockArtists.filter(artist => 
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredPlaylists = mockPlaylists.filter(playlist => 
      playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Combine results based on active tab
    let combinedResults: any[] = [];
    
    switch (activeTab) {
      case 'songs':
        combinedResults = filteredTracks;
        break;
      case 'albums':
        combinedResults = filteredAlbums;
        break;
      case 'artists':
        combinedResults = filteredArtists;
        break;
      case 'playlists':
        combinedResults = filteredPlaylists;
        break;
      case 'all':
      default:
        combinedResults = [
          ...filteredTracks.map(track => ({ ...track, type: 'song' })),
          ...filteredAlbums.map(album => ({ ...album, type: 'album' })),
          ...filteredArtists.map(artist => ({ ...artist, type: 'artist' })),
          ...filteredPlaylists.map(playlist => ({ ...playlist, type: 'playlist' })),
        ];
        break;
    }
    
    setSearchResults(combinedResults);
  }, [searchQuery, activeTab]);

  const handlePlayTrack = async (track: MusicTrack) => {
    await loadTracks([track]);
    await playTrack(0);
  };

  const handleSelectSearch = (term: string) => {
    setSearchQuery(term);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowRecentSearches(true);
  };

  const renderResultItem = ({ item }: { item: any }) => {
    if (item.type === 'song' || item.hasOwnProperty('uri')) {
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => handlePlayTrack(item)}
        >
          {item.coverUri ? (
            <Image source={{ uri: item.coverUri }} style={styles.resultCoverImage} />
          ) : (
            <View style={styles.resultPlaceholder} />
          )}
          <View style={styles.resultInfo}>
            <ThemedText style={styles.resultTitle} type="defaultSemiBold">{item.title}</ThemedText>
            <ThemedText style={styles.resultSubtitle} type="default">{item.artist || item.album}</ThemedText>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={20} color={tint} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else if (item.type === 'album') {
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => handleSelectSearch(item.title)}
        >
          <Image source={{ uri: item.coverUri }} style={styles.resultCoverImage} />
          <View style={styles.resultInfo}>
            <ThemedText style={styles.resultTitle} type="defaultSemiBold">{item.title}</ThemedText>
            <ThemedText style={styles.resultSubtitle} type="default">{item.artist}</ThemedText>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={20} color={tint} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else if (item.type === 'artist') {
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => handleSelectSearch(item.name)}
        >
          <View style={styles.artistAvatar}>
            <Image source={{ uri: item.coverUri }} style={styles.artistAvatarImage} />
          </View>
          <View style={styles.resultInfo}>
            <ThemedText style={styles.resultTitle} type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText style={styles.resultSubtitle} type="default">Artist</ThemedText>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Ionicons name="add" size={20} color={tint} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    } else if (item.type === 'playlist') {
      return (
        <TouchableOpacity 
          style={styles.resultItem}
          onPress={() => handleSelectSearch(item.title)}
        >
          <Image source={{ uri: item.coverUri }} style={styles.resultCoverImage} />
          <View style={styles.resultInfo}>
            <ThemedText style={styles.resultTitle} type="defaultSemiBold">{item.title}</ThemedText>
            <ThemedText style={styles.resultSubtitle} type="default">{item.description}</ThemedText>
          </View>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={20} color={tint} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, albums, artists..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['all', 'songs', 'albums', 'artists', 'playlists'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: tint, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab as any)}
          >
            <ThemedText 
              style={[styles.tabText, activeTab === tab && { color: tint }]} 
              type={activeTab === tab ? "defaultSemiBold" : "default"}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content}>
        {showRecentSearches ? (
          <View style={styles.recentSearchesSection}>
            <ThemedText style={styles.sectionTitle} type="defaultSemiBold">Recent Searches</ThemedText>
            {recentSearches.map((search, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.recentSearchItem}
                onPress={() => handleSelectSearch(search)}
              >
                <Ionicons name="time" size={16} color="#888" style={styles.recentSearchIcon} />
                <ThemedText style={styles.recentSearchText} type="default">{search}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="musical-notes" size={60} color="#ccc" />
            <ThemedText style={styles.noResultsText} type="default">No results found</ThemedText>
            <ThemedText style={styles.noResultsSubtext} type="default">Try searching for something else</ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentSearchesSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentSearchIcon: {
    marginRight: 12,
  },
  recentSearchText: {
    fontSize: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  resultCoverImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  resultPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginRight: 12,
  },
  artistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
  },
  artistAvatarImage: {
    width: '100%',
    height: '100%',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  playButton: {
    padding: 8,
  },
  followButton: {
    padding: 8,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
});

export default SearchScreen;
