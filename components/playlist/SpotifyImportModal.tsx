import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { MusicTrack } from '@/types/music';
import { Spotify } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onImport: (url: string) => Promise<{ matched: number; total: number; missing: string[] }>;
};

export default function SpotifyImportModal({ visible, onClose, onImport }: Props) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ matched: number; total: number; missing: string[] } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) {
      setUrl('');
      setResult(null);
      setError(null);
    }
  }, [visible]);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const importResult = await onImport(url.trim());
      setResult(importResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Entypo name="spotify" size={22} color={Spotify.green} />
            <ThemedText style={styles.title}>Import from Spotify</ThemedText>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={Spotify.textPrimary} />
          </TouchableOpacity>
        </View>

        <ThemedText style={styles.hint}>
          Paste a public Spotify playlist link. We&apos;ll match songs to your local library and play them here.
        </ThemedText>

        <TextInput
          style={styles.input}
          placeholder="https://open.spotify.com/playlist/..."
          placeholderTextColor={Spotify.textMuted}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        {result ? (
          <ScrollView style={styles.resultBox}>
            <ThemedText style={styles.resultTitle}>
              Matched {result.matched} of {result.total} songs locally
            </ThemedText>
            {result.missing.length > 0 ? (
              <>
                <ThemedText style={styles.missingLabel}>Not found on device:</ThemedText>
                {result.missing.slice(0, 8).map((line) => (
                  <ThemedText key={line} style={styles.missingItem} numberOfLines={1}>
                    {line}
                  </ThemedText>
                ))}
                {result.missing.length > 8 ? (
                  <ThemedText style={styles.missingItem}>
                    +{result.missing.length - 8} more
                  </ThemedText>
                ) : null}
              </>
            ) : null}
          </ScrollView>
        ) : null}

        <TouchableOpacity
          style={[styles.importBtn, (!url.trim() || loading) && styles.importBtnDisabled]}
          onPress={() => {
            if (result) {
              onClose();
              return;
            }
            void handleImport();
          }}
          disabled={!url.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color={Spotify.black} size="small" />
          ) : (
            <ThemedText style={styles.importBtnText}>
              {result ? 'Done' : 'Import playlist'}
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
    backgroundColor: Spotify.elevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
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
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Spotify.textPrimary,
  },
  hint: {
    fontSize: 13,
    color: Spotify.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Spotify.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: Spotify.textPrimary,
    fontSize: 14,
    marginBottom: 10,
  },
  error: {
    color: '#FF6B6B',
    fontSize: 13,
    marginBottom: 10,
  },
  resultBox: {
    maxHeight: 140,
    backgroundColor: Spotify.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Spotify.green,
    marginBottom: 8,
  },
  missingLabel: {
    fontSize: 12,
    color: Spotify.textSecondary,
    marginBottom: 4,
  },
  missingItem: {
    fontSize: 12,
    color: Spotify.textMuted,
    marginBottom: 2,
  },
  importBtn: {
    backgroundColor: Spotify.green,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  importBtnDisabled: {
    opacity: 0.5,
  },
  importBtnText: {
    color: Spotify.black,
    fontWeight: '700',
    fontSize: 15,
  },
});
