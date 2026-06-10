import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

interface PlaylistItemProps {
  track: any;
  index: number;
  onPress: () => void;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({ 
  track, 
  index, 
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.playlistItem} onPress={onPress}>
      <View style={styles.itemRow}>
        <Text style={styles.trackNumber}>{index + 1}</Text>
        {track.coverUri ? (
          <Image source={{ uri: track.coverUri }} style={styles.albumArt} />
        ) : (
          <View style={styles.placeholderAlbumArt} />
        )}
        <View style={styles.trackInfo}>
          <Text 
            style={[styles.trackTitle, track.isPlaying && styles.playingTrack]} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1} ellipsizeMode="tail">
            {track.artist}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Playlist: React.FC = () => {
  const { tracks, currentIndex, playTrack } = useMusicPlayer();

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <PlaylistItem 
      track={{ ...item, isPlaying: index === currentIndex }} 
      index={index} 
      onPress={() => playTrack(index)} 
    />
  );

  const keyExtractor = (item: any, index: number) => item.id || index.toString();

  if (tracks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tracks available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tracks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={styles.playlist}
    />
  );
};

const styles = StyleSheet.create({
  playlist: {
    flex: 1,
  },
  playlistItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackNumber: {
    width: 30,
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 12,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  placeholderAlbumArt: {
    width: 50,
    height: 50,
    borderRadius: 6,
    backgroundColor: '#333',
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'normal',
    marginBottom: 4,
  },
  playingTrack: {
    fontWeight: 'bold',
    color: '#8A2BE2', // Purple color for currently playing track
  },
  trackArtist: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
});

export default Playlist;