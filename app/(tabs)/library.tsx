import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Image } from 'react-native';
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
  },
  {
    id: '6',
    title: 'Vibrations',
    artist: 'Static Echoes',
    album: 'Electronic Waves',
    duration: 245000,
    uri: 'https://example.com/song6.mp3',
    coverUri: 'https://placehold.co/300x300/7B68EE/FFFFFF?text=V'
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

const MusicLibrary = () => {
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'artists' | 'playlists'>('songs');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortOption, setSortOption] = useState('alphabetical');
  
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
      onPress={() => handlePlayPlaylist(mockTracks)}
    >
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
        <Ionicons name="add" size={20} color={useThemeColor({}, 'tint')} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.playlistCard}
      onPress={() => handlePlayPlaylist(mockTracks)}
    >
      <Image source={{ uri: item.coverUri }} style={styles.playlistCoverImage} />
      <View style={styles.playlistInfo}>
        <ThemedText style={styles.playlistTitle} type="defaultSemiBold">{item.title}</ThemedText>
        <ThemedText style={styles.playlistDescription} type="default">{item.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'songs':
        return (
          <FlatList
            data={mockTracks}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        );
      case 'albums':
        return (
          <FlatList
            data={mockAlbums}
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
            data={mockArtists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        );
      case 'playlists':
        return (
          <FlatList
            data={mockPlaylists}
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
        <ThemedText style={styles.headerTitle} type="defaultSemiBold">Your Library</ThemedText>
        
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
            Songs
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
            Albums
          </ThemedText>
