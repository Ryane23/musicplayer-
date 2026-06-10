import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Playlist from '@/components/Playlist';
import MusicPlayer from '@/components/MusicPlayer';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const MusicScreen: React.FC = () => {
  const { loadTracks } = useMusicPlayer();

  // Sample tracks - in a real app, these would come from an API or local storage
  useEffect(() => {
    const sampleTracks = [
      {
        id: '1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 200000, // in milliseconds
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder URL
        coverUri: 'https://placehold.co/300x300/8A2BE2/FFFFFF?text=ALBUM+ART',
      },
      {
        id: '2',
        title: 'Save Your Tears',
        artist: 'The Weeknd',
        album: 'After Hours',
        duration: 215000,
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder URL
        coverUri: 'https://placehold.co/300x300/FF6B6B/FFFFFF?text=ALBUM+ART',
      },
      {
        id: '3',
        title: 'Levitating',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 223000,
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder URL
        coverUri: 'https://placehold.co/300x300/4ECDC4/FFFFFF?text=ALBUM+ART',
      },
      {
        id: '4',
        title: 'Don\'t Start Now',
        artist: 'Dua Lipa',
        album: 'Future Nostalgia',
        duration: 183000,
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Placeholder URL
        coverUri: 'https://placehold.co/300x300/FFD166/FFFFFF?text=ALBUM+ART',
      },
      {
        id: '5',
        title: 'Watermelon Sugar',
        artist: 'Harry Styles',
        album: 'Fine Line',
        duration: 174000,
        uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', // Placeholder URL
        coverUri: 'https://placehold.co/300x300/06D6A0/FFFFFF?text=ALBUM+ART',
      },
    ];

    loadTracks(sampleTracks);
  }, [loadTracks]);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Music Player</ThemedText>
      </ThemedView>
      
      <View style={styles.content}>
        <Playlist />
      </View>
      
      <View style={styles.playerContainer}>
        <MusicPlayer />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  content: {
    flex: 1,
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MusicScreen;