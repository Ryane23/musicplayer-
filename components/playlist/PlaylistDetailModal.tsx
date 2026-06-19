import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { UserPlaylist } from '@/types/playlist';
import { Spotify } from '@/constants/theme';
import { formatDuration } from '@/utils/format';

type Props = {
  visible: boolean;
  playlist: UserPlaylist | null;
  tracks: MusicTrack[];
  onClose: () => void;
  onPlay: (tracks: MusicTrack[]) => void;
  onEdit: (playlist: UserPlaylist) => void;
  onDelete: (playlist: UserPlaylist) => void;
  onRemoveTrack: (playlistId: string, trackId: string) => void;
};

export default function PlaylistDetailModal({
  visible,
  playlist,
  tracks,
  onClose,
  onPlay,
  onEdit,
  onDelete,
  onRemoveTrack,
}: Props) {
  if (!playlist) {
    return null;
  }

  const confirmDelete = () => {
    Alert.alert('Delete playlist', `Remove "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(playlist);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerMeta}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {playlist.name}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {tracks.length} songs
              {playlist.source === 'spotify' ? ' · Spotify import' : ''}
            </ThemedText>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={Spotify.textPrimary} />
          </TouchableOpacity>
        </View>

        {playlist.description ? (
          <ThemedText style={styles.description}>{playlist.description}</ThemedText>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.playBtn]}
            onPress={() => {
              if (tracks.length > 0) {
                onPlay(tracks);
              }
            }}
            disabled={tracks.length === 0}
          >
            <Ionicons name="play" size={18} color={Spotify.black} />
            <ThemedText style={styles.playBtnText}>Play</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(playlist)}>
            <Ionicons name="create-outline" size={18} color={Spotify.textPrimary} />
            <ThemedText style={styles.actionBtnText}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
            <ThemedText style={[styles.actionBtnText, { color: '#FF6B6B' }]}>Delete</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          style={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>No songs in this playlist yet.</ThemedText>
          }
          renderItem={({ item, index }) => (
            <View style={styles.trackRow}>
              <ThemedText style={styles.trackIndex}>{index + 1}</ThemedText>
              <View style={styles.trackMeta}>
                <ThemedText style={styles.trackTitle} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.trackArtist} numberOfLines={1}>
                  {item.artist}
                </ThemedText>
              </View>
              <ThemedText style={styles.trackDuration}>{formatDuration(item.duration)}</ThemedText>
              <TouchableOpacity
                onPress={() => onRemoveTrack(playlist.id, item.id)}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={18} color={Spotify.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: Spotify.elevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Spotify.card,
    marginTop: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  headerMeta: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Spotify.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: Spotify.textSecondary,
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: Spotify.textMuted,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Spotify.card,
  },
  playBtn: {
    backgroundColor: Spotify.green,
  },
  playBtnText: {
    color: Spotify.black,
    fontWeight: '700',
    fontSize: 13,
  },
  actionBtnText: {
    color: Spotify.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  list: {
    maxHeight: 320,
  },
  empty: {
    color: Spotify.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  trackIndex: {
    width: 20,
    fontSize: 13,
    color: Spotify.textMuted,
    textAlign: 'center',
  },
  trackMeta: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Spotify.textPrimary,
  },
  trackArtist: {
    fontSize: 12,
    color: Spotify.textSecondary,
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    color: Spotify.textMuted,
  },
});
