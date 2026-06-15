import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useLibrary } from '@/contexts/LibraryContext';
import { Spotify } from '@/constants/theme';
import { TAB_BAR_HEIGHT, MINI_PLAYER_HEIGHT } from '@/utils/animation';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];
const SLEEP_OPTIONS = [0, 15, 30, 45, 60];

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
};

function SettingRow({ icon, label, value, onPress, right }: RowProps) {
  const content = (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={Spotify.textSecondary} />
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      {right ?? (
        <ThemedText style={styles.rowValue}>{value}</ThemedText>
      )}
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color={Spotify.textMuted} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default function SettingsHubScreen() {
  const {
    volume,
    shuffle,
    repeatMode,
    playbackRate,
    showVisualizer,
    sleepTimerMinutes,
    setVolume,
    setShuffle,
    setPlaybackRate,
    setShowVisualizer,
    setSleepTimerMinutes,
    cycleRepeatMode,
  } = useMusicPlayer();

  const { tracks, isLoading, isDemo, hasPermission, libraryNote, refresh } = useLibrary();
  const [volumeRailWidth, setVolumeRailWidth] = useState(0);
  const [scanning, setScanning] = useState(false);

  const handleScan = async () => {
    setScanning(true);
    try {
      await refresh();
    } finally {
      setScanning(false);
    }
  };

  const repeatLabel =
    repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.heading}>Settings</ThemedText>

        <Section title="Playback">
          <SettingRow
            icon="shuffle"
            label="Shuffle"
            right={
              <Switch
                value={shuffle}
                onValueChange={setShuffle}
                trackColor={{ false: Spotify.card, true: Spotify.green }}
                thumbColor={Spotify.textPrimary}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            icon="repeat"
            label="Repeat"
            value={repeatLabel}
            onPress={cycleRepeatMode}
          />
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="speedometer-outline" size={20} color={Spotify.textSecondary} />
            <ThemedText style={styles.rowLabel}>Playback speed</ThemedText>
          </View>
          <View style={styles.chipRow}>
            {SPEED_OPTIONS.map((speed) => {
              const selected = playbackRate === speed;
              return (
                <TouchableOpacity
                  key={speed}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => void setPlaybackRate(speed)}
                >
                  <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {speed}x
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Ionicons name="volume-medium" size={20} color={Spotify.textSecondary} />
            <ThemedText style={styles.rowLabel}>Volume</ThemedText>
            <ThemedText style={styles.rowValue}>{Math.round(volume * 100)}%</ThemedText>
          </View>
          <Pressable
            style={styles.volumeRail}
            onLayout={(e) => setVolumeRailWidth(e.nativeEvent.layout.width)}
            onPress={(e) => {
              if (volumeRailWidth <= 0) return;
              const ratio = Math.max(0, Math.min(e.nativeEvent.locationX / volumeRailWidth, 1));
              void setVolume(ratio);
            }}
          >
            <View style={[styles.volumeFill, { width: `${volume * 100}%` }]} />
          </Pressable>
          <View style={styles.divider} />
          <SettingRow
            icon="pulse-outline"
            label="Show visualizer"
            right={
              <Switch
                value={showVisualizer}
                onValueChange={setShowVisualizer}
                trackColor={{ false: Spotify.card, true: Spotify.green }}
                thumbColor={Spotify.textPrimary}
              />
            }
          />
        </Section>

        <Section title="Library">
          <SettingRow
            icon="musical-notes"
            label="Tracks found"
            value={isLoading ? '...' : `${tracks.length}`}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-checkmark-outline"
            label="Library access"
            value={hasPermission ? 'Granted' : isDemo ? 'Demo mode' : 'Denied'}
          />
          {libraryNote ? (
            <ThemedText style={styles.note}>{libraryNote}</ThemedText>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryBtn, scanning && styles.primaryBtnDisabled]}
            onPress={() => void handleScan()}
            disabled={scanning || isLoading}
          >
            {scanning || isLoading ? (
              <ActivityIndicator color={Spotify.black} size="small" />
            ) : (
              <Ionicons name="refresh" size={18} color={Spotify.black} />
            )}
            <ThemedText style={styles.primaryBtnText}>
              {scanning ? 'Scanning...' : 'Scan music library'}
            </ThemedText>
          </TouchableOpacity>
        </Section>

        <Section title="Sleep timer">
          <View style={styles.chipRow}>
            {SLEEP_OPTIONS.map((minutes) => {
              const selected = sleepTimerMinutes === minutes;
              const label = minutes === 0 ? 'Off' : `${minutes}m`;
              return (
                <TouchableOpacity
                  key={minutes}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setSleepTimerMinutes(minutes)}
                >
                  <ThemedText style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
          {sleepTimerMinutes > 0 ? (
            <ThemedText style={styles.note}>
              Playback will stop in {sleepTimerMinutes} minutes.
            </ThemedText>
          ) : null}
        </Section>

        <Section title="About">
          <SettingRow icon="information-circle-outline" label="App" value="MelodyLocal" />
          <View style={styles.divider} />
          <SettingRow icon="code-slash-outline" label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <SettingRow
            icon="phone-portrait-outline"
            label="Platform"
            value={isDemo ? 'Demo tracks' : 'Device library'}
          />
        </Section>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Spotify.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Spotify.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Spotify.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: Spotify.elevated,
    borderRadius: 12,
    padding: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: Spotify.textPrimary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: Spotify.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Spotify.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Spotify.green,
    borderColor: Spotify.green,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Spotify.textPrimary,
  },
  chipTextSelected: {
    color: Spotify.black,
  },
  volumeRail: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Spotify.card,
    marginTop: 10,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: Spotify.green,
    borderRadius: 3,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Spotify.green,
    borderRadius: 24,
    paddingVertical: 14,
    marginTop: 14,
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: Spotify.black,
    fontWeight: '700',
    fontSize: 15,
  },
  note: {
    fontSize: 12,
    color: Spotify.textSecondary,
    lineHeight: 17,
    marginTop: 10,
  },
  bottomSpacer: {
    height: TAB_BAR_HEIGHT + MINI_PLAYER_HEIGHT + 24,
  },
});
