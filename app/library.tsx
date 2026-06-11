import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { MusicTrack } from '../types/music';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { MusicLibraryService } from '../services/MusicLibraryService';

// State for storing the actual music library data
const MusicLibrary = () => {
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'artists' | 'playlists'>('songs');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortOption, setSortOption] = useState('alphabetical');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { loadTracks, playTrack } = useMusicPlayer();

  // Load local music when component mounts
  useEffect(() => {
    loadLocalMusic();
  }, []);

  const loadLocalMusic = async () => {
    setIsLoading(true);
    try {
      const localTracks = await MusicLibraryService.scanLocalMusic();
      setTracks(localTracks);
      
      // Generate albums from tracks
      const uniqueAlbums = Array.from(
        new Map(localTracks.map(track => [track.album + track.artist, {
          id: track.album + track.artist,
          title: track.album,
          artist: track.artist,
          coverUri: track.coverUri,
          year: new Date().getFullYear() // Placeholder
        }])).values()
      );
      setAlbums(uniqueAlbums);
      
      // Generate artists from tracks
      const uniqueArtists = Array.from(
        new Map(localTracks.map(track => [track.artist, {
          id: track.artist,
          name: track.artist,
          coverUri: track.coverUri,
          songCount: localTracks.filter(t => t.artist === track.artist).length
        }])).values()
      );
      setArtists(uniqueArtists);
      
      // Create default playlists
      setPlaylists([
        { id: '1', title: 'All Songs', description: 'All your local music', coverUri: undefined, songCount: localTracks.length },
        { id: '2', title: 'Recently Added', description: 'Recently added tracks', coverUri: undefined, songCount: Math.min(20, localTracks.length) },
      ]);
    } catch (error) {
      console.error('Error loading local music:', error);
      // Fallback to empty arrays
      setTracks([]);
      setAlbums([]);
      setArtists([]);
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
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
      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.trackArtist} type="default">{item.artist}</ThemedText>
      </View>
      <ThemedText style={styles.trackDuration} type="default">
        {Math.floor(item.duration / 60000)}:{Math.floor((item.duration % 60000) / 1000).toString().padStart(2, '0')}
      </ThemedText>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color={useThemeColor({}, 'tint')} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.albumCard}
      onPress={() => handlePlayPlaylist(tracks.filter(track => track.album === item.title))}
    >
      {item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.albumCoverImage} />
      ) : (
        <View style={styles.albumCoverPlaceholder} />
      )}
      <ThemedText style={styles.albumTitle} type="defaultSemiBold">{item.title}</ThemedText>
      <ThemedText style={styles.albumArtist} type="default">{item.artist}</ThemedText>
      <ThemedText style={styles.albumYear} type="default">{item.year}</ThemedText>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.artistItem}>
      {item.coverUri ? (
        <View style={styles.artistAvatar}>
          <Image source={{ uri: item.coverUri }} style={styles.artistAvatarImage} />
        </View>
      ) : (
        <View style={[styles.artistAvatar, styles.artistPlaceholder]}>
          <Ionicons name="person" size={24} color="#888" />
        </View>
      )}
      <View style={styles.artistInfo}>
        <ThemedText style={styles.artistName} type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText style={styles.artistSongs} type="default">{item.songCount} songs</ThemedText>
      </View>
      <TouchableOpacity style={styles.artistFollowButton}>
        <Ionicons name="add" size={20} color={useThemeColor({}, 'tint')} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.playlistCard}
      onPress={() => {
        if (item.title === 'All Songs') {
          handlePlayPlaylist(tracks);
        } else if (item.title === 'Recently Added') {
          handlePlayPlaylist(tracks.slice(0, 20)); // First 20 tracks as recently added
        }
      }}
    >
      {item.coverUri ? (
        <Image source={{ uri: item.coverUri }} style={styles.playlistCoverImage} />
      ) : (
        <View style={styles.playlistCoverPlaceholder}>
          <Ionicons name="musical-notes" size={24} color="#888" />
        </View>
      )}
      <View style={styles.playlistInfo}>
        <ThemedText style={styles.playlistTitle} type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.playlistDescription} type="default">{item.description}</ThemedText>
        <ThemedText style={styles.playlistSongCount} type="subtitle">{item.songCount} songs</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ThemedText type="default">Scanning your music library...</ThemedText>
        </View>
      );
    }

    if (activeTab === 'songs' && tracks.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="musical-notes-outline" size={48} color="#888" style={styles.emptyIcon} />
          <ThemedText type="default" style={styles.emptyText}>No music found on your device</ThemedText>
          <ThemedText type="default" style={styles.emptySubtext}>Add music files to your device to see them here</ThemedText>
        </View>
      );
    }

    switch (activeTab) {
      case 'songs':
        return (
          <FlatList
            data={tracks}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        );
      case 'albums':
        return (
          <FlatList
            data={albums}
            renderItem={viewMode === 'grid' ? renderAlbumItem : renderAlbumItem}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={viewMode === 'grid' ? styles.gridContainer : {}}
            ItemSeparatorComponent={viewMode === 'list' ? () => <View style={{ height: 8 }} /> : undefined}
          />
        );
      case 'artists':
        return (
          <FlatList
            data={artists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        );
      case 'playlists':
        return (
          <FlatList
            data={playlists}
            renderItem={renderPlaylistItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        );
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
            <Ionicons 
              name={viewMode === 'list' ? "grid" : "list"} 
              size={24} 
              color={useThemeColor({}, 'text')} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sortButton} onPress={() => {}}>
            <Ionicons name="funnel" size={24} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'songs' && styles.activeTab]}
          onPress={() => setActiveTab('songs')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'songs' && styles.activeTabText]} 
            type={activeTab === 'songs' ? "defaultSemiBold" : "default"}
          >
            Songs ({tracks.length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'albums' && styles.activeTab]}
          onPress={() => setActiveTab('albums')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'albums' && styles.activeTabText]} 
            type={activeTab === 'albums' ? "defaultSemiBold" : "default"}
          >
            Albums ({albums.length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'artists' && styles.activeTab]}
          onPress={() => setActiveTab('artists')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'artists' && styles.activeTabText]} 
            type={activeTab === 'artists' ? "defaultSemiBold" : "default"}
          >
            Artists ({artists.length})
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <ThemedText 
            style={[styles.tabText, activeTab === 'playlists' && styles.activeTabText]} 
            type={activeTab === 'playlists' ? "defaultSemiBold" : "default"}
          >
            Playlists ({playlists.length})
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  viewModeButton: {
    padding: 8,
  },
  sortButton: {
    padding: 8,
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
    borderBottomColor: useThemeColor({}, 'tint'),
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    color: useThemeColor({}, 'tint'),
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  gridContainer: {
    paddingBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  trackCoverImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
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
  trackDuration: {
    fontSize: 14,
    opacity: 0.7,
    marginHorizontal: 8,
  },
  playButton: {
    padding: 8,
  },
  albumCard: {
    flex: 1,
    margin: 8,
  },
  albumCoverImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  albumCoverPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  albumArtist: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  albumYear: {
    fontSize: 12,
    opacity: 0.5,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  artistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
  },
  artistPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistAvatarImage: {
    width: '100%',
    height: '100%',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
  },
  artistSongs: {
    fontSize: 12,
    opacity: 0.7,
  },
  artistFollowButton: {
    padding: 8,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  playlistCoverImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  playlistCoverPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  playlistDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  playlistSongCount: {
    fontSize: 12,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default MusicLibrary;