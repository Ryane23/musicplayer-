import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { UserPlaylist } from '@/types/playlist';
import { Spotify } from '@/constants/theme';

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  library: MusicTrack[];
  playlist?: UserPlaylist;
  onClose: () => void;
  onSave: (input: { name: string; description: string; trackIds: string[] }) => Promise<void>;
};

export default function PlaylistFormModal({
  visible,
  mode,
  library,
  playlist,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(playlist?.name ?? '');
  const [description, setDescription] = useState(playlist?.description ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(playlist?.trackIds ?? [])
  );
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  React.useEffect(() => {
    if (!visible) {
      return;
    }
    setName(playlist?.name ?? '');
    setDescription(playlist?.description ?? '');
    setSelectedIds(new Set(playlist?.trackIds ?? []));
    setQuery('');
  }, [visible, playlist]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return library;
    }
    return library.filter(
      (track) =>
        track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q)
    );
  }, [library, query]);

  const toggleTrack = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        trackIds: Array.from(selectedIds),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {mode === 'create' ? 'New playlist' : 'Edit playlist'}
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Spotify.textPrimary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Playlist name"
          placeholderTextColor={Spotify.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Description (optional)"
          placeholderTextColor={Spotify.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <ThemedText style={styles.sectionLabel}>
          Songs ({selectedIds.size} selected)
        </ThemedText>
        <TextInput
          style={styles.search}
          placeholder="Search library..."
          placeholderTextColor={Spotify.textMuted}
          value={query}
          onChangeText={setQuery}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const selected = selectedIds.has(item.id);
            return (
              <TouchableOpacity style={styles.trackRow} onPress={() => toggleTrack(item.id)}>
                <View style={[styles.check, selected && styles.checkSelected]}>
                  {selected ? <Ionicons name="checkmark" size={14} color={Spotify.black} /> : null}
                </View>
                <View style={styles.trackMeta}>
                  <ThemedText style={styles.trackTitle} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.trackArtist} numberOfLines={1}>
                    {item.artist}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          style={[styles.saveBtn, (!name.trim() || saving) && styles.saveBtnDisabled]}
          onPress={() => void handleSave()}
          disabled={!name.trim() || saving}
        >
          {saving ? (
            <ActivityIndicator color={Spotify.black} size="small" />
          ) : (
            <ThemedText style={styles.saveBtnText}>
              {mode === 'create' ? 'Create playlist' : 'Save changes'}
            </ThemedText>
          )}
        </TouchableOpacity>
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
    maxHeight: '82%',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Spotify.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  input: {
    backgroundColor: Spotify.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Spotify.textPrimary,
    fontSize: 15,
    marginBottom: 10,
  },
  inputMultiline: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Spotify.textSecondary,
    marginBottom: 8,
  },
  search: {
    backgroundColor: Spotify.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    color: Spotify.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  list: {
    maxHeight: 240,
    marginBottom: 12,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Spotify.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: Spotify.green,
    borderColor: Spotify.green,
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
  saveBtn: {
    backgroundColor: Spotify.green,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: Spotify.black,
    fontWeight: '700',
    fontSize: 15,
  },
});
