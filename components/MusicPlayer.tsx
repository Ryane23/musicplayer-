import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';

const MusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolume,
  } = useMusicPlayer();
  
  const [formattedPosition, setFormattedPosition] = useState('0:00');
  const [formattedDuration, setFormattedDuration] = useState('0:00');
  const progressBarRef = useRef<View>(null);
  const volumeBarRef = useRef<View>(null);

  // Format time from milliseconds to MM:SS
  useEffect(() => {
    const formatTime = (milliseconds: number) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    setFormattedPosition(formatTime(position));
    setFormattedDuration(formatTime(duration));
  }, [position, duration]);

  const handleSeek = (event: any) => {
    if (!currentTrack || duration <= 0) return;
    
    const touchX = event.nativeEvent.locationX;
    const parentWidth = event.target.offsetWidth || Dimensions.get('window').width * 0.8; // More reliable way to get width
    const percentage = touchX / parentWidth;
    const newPosition = Math.min(Math.max(percentage * duration, 0), duration);
    seekTo(newPosition);
  };

  const handleVolumeChange = (event: any) => {
    const touchX = event.nativeEvent.locationX;
    const parentWidth = event.target.offsetWidth || 150; // More reliable way to get width
    const percentage = Math.min(Math.max(touchX / parentWidth, 0), 1); // Clamp between 0 and 1
    setVolume(percentage);
  };

  if (!currentTrack) {
    return null; // Don't render if no track is loaded
  }

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;
  const volumePercentage = volume * 100;

  return (
    <View style={styles.container}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        {currentTrack.coverUri ? (
          <Image source={{ uri: currentTrack.coverUri }} style={styles.albumArt} />
        ) : (
          <View style={styles.placeholderAlbumArt} />
        )}
        <View style={styles.trackDetails}>
          <Text style={styles.trackTitle} numberOfLines={1} ellipsizeMode="tail">
            {currentTrack.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1} ellipsizeMode="tail">
            {currentTrack.artist}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formattedPosition}</Text>
        <TouchableOpacity style={styles.progressBarBackground} onPress={handleSeek} ref={progressBarRef}>
          <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          <View style={[styles.progressThumb, { left: `${progressPercentage}%` }]} />
        </TouchableOpacity>
        <Text style={styles.timeText}>{formattedDuration}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
          <Ionicons 
            name={isPlaying ? "pause-circle" : "play-circle"} 
            size={60} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Volume Control */}
      <View style={styles.volumeContainer}>
        <Ionicons name="volume-low" size={20} color="#FFFFFF" />
        <TouchableOpacity style={styles.volumeBarBackground} onPress={handleVolumeChange} ref={volumeBarRef}>
          <View style={[styles.volumeBar, { width: `${volumePercentage}%` }]} />
          <View style={[styles.volumeThumb, { left: `${volumePercentage}%` }]} />
        </TouchableOpacity>
        <Ionicons name="volume-high" size={20} color="#FFFFFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderAlbumArt: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    marginRight: 12,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#D3D3D3',
    borderRadius: 3,
    marginHorizontal: 8,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8A2BE2', // Purple color
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8A2BE2',
    transform: [{ translateX: -6 }],
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    minWidth: 30,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    padding: 8,
    marginHorizontal: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#D3D3D3',
    borderRadius: 2,
    marginHorizontal: 8,
    position: 'relative',
  },
  volumeBar: {
    height: '100%',
    backgroundColor: '#8A2BE2', // Purple color
    borderRadius: 2,
  },
  volumeThumb: {
    position: 'absolute',
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8A2BE2',
    transform: [{ translateX: -5 }],
  },
});

export default MusicPlayer;
