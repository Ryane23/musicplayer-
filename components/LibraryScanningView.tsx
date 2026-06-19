import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { Spotify } from '@/constants/theme';

type Props = {
  message: string;
  subtitle?: string;
  compact?: boolean;
};

export default function LibraryScanningView({ message, subtitle, compact = false }: Props) {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.iconWrap}>
        <Ionicons name="musical-notes" size={compact ? 28 : 36} color={Spotify.green} />
        <ActivityIndicator style={styles.spinner} color={Spotify.green} size="small" />
      </View>
      <ThemedText style={[styles.title, compact && styles.titleCompact]}>Scanning library</ThemedText>
      <ThemedText style={styles.message}>{message}</ThemedText>
      {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  containerCompact: {
    flex: 0,
    paddingVertical: 48,
    minHeight: 220,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Spotify.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  spinner: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Spotify.textPrimary,
    letterSpacing: -0.3,
  },
  titleCompact: {
    fontSize: 17,
  },
  message: {
    fontSize: 14,
    color: Spotify.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 12,
    color: Spotify.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});
