import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const themePresets = ['Aurora', 'Midnight', 'Sand', 'Ocean'];

type SettingCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  children?: React.ReactNode;
};

function SettingCard({ icon, title, description, children }: SettingCardProps) {
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const surface = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.88)';
  const borderColor = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBadge, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={18} color="#fff" />
        </View>
        <View style={styles.cardText}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {title}
          </ThemedText>
          <ThemedText type="default" style={styles.cardDescription}>
            {description}
          </ThemedText>
        </View>
      </View>
      {children ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  );
}

export default function SettingsHubScreen() {
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');
  const surface = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const borderColor = textColor === '#ECEDEE' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';

  const [darkMode, setDarkMode] = useState(true);
  const [equalizerEnabled, setEqualizerEnabled] = useState(true);
  const [bassBoost, setBassBoost] = useState(4);
  const [sleepTimer, setSleepTimer] = useState(false);
  const [libraryScan, setLibraryScan] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('Midnight');

  const optionRow = (label: string, value: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={[styles.optionRow, { borderColor }]}>
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={18} color={textColor} />
        <ThemedText type="defaultSemiBold" style={styles.optionLabel}>
          {label}
        </ThemedText>
      </View>
      <View style={[styles.optionValue, { backgroundColor: surface }]}>
        <ThemedText type="default" style={styles.optionValueText}>
          {value}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
      <View style={[styles.ambientBand, { backgroundColor: tint }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <ThemedText type="subtitle" style={styles.kicker}>
              Personalize
            </ThemedText>
            <ThemedText type="title" style={styles.heading}>
              Settings
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: surface, borderColor }]}>
            <Ionicons name="ellipsis-horizontal" size={18} color={textColor} />
          </TouchableOpacity>
        </View>

        <SettingCard
          icon="moon"
          title="Appearance"
          description="Choose your theme and UI mood"
        >
          <View style={styles.switchRow}>
            <View>
              <ThemedText type="defaultSemiBold">Dark Mode</ThemedText>
              <ThemedText type="default" style={styles.switchDescription}>
                Keep the interface easy on the eyes
              </ThemedText>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: '#94a3b8', true: tint }} />
          </View>

          <View style={styles.themeRow}>
            {themePresets.map((theme) => {
              const selected = selectedTheme === theme;
              return (
                <TouchableOpacity
                  key={theme}
                  onPress={() => setSelectedTheme(theme)}
                  style={[
                    styles.themeChip,
                    {
                      borderColor: selected ? tint : borderColor,
                      backgroundColor: selected ? tint : surface,
                    },
                  ]}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: selected ? '#fff' : textColor }}>
                    {theme}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </SettingCard>

        <SettingCard
          icon="volume-high"
          title="Playback and Audio"
          description="Fine tune quality, equalizer, and bass"
        >
          <View style={styles.settingRow}>
            <ThemedText type="defaultSemiBold">Audio Quality</ThemedText>
            <View style={[styles.inlinePill, { backgroundColor: surface, borderColor }]}>
              <ThemedText type="defaultSemiBold">High</ThemedText>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View>
              <ThemedText type="defaultSemiBold">Equalizer</ThemedText>
              <ThemedText type="default" style={styles.switchDescription}>
                Shape the sound profile for your headphones
              </ThemedText>
            </View>
            <Switch value={equalizerEnabled} onValueChange={setEqualizerEnabled} trackColor={{ false: '#94a3b8', true: tint }} />
          </View>

          <View style={styles.sliderBlock}>
            <View style={styles.settingRow}>
              <ThemedText type="defaultSemiBold">Bass Boost</ThemedText>
              <ThemedText type="default" style={styles.sliderValue}>
                {bassBoost}
              </ThemedText>
            </View>
            <View style={[styles.sliderRail, { backgroundColor: surface, borderColor }]}>
              <View style={[styles.sliderFill, { width: `${((bassBoost + 10) / 20) * 100}%`, backgroundColor: tint }]} />
            </View>
            <View style={styles.sliderActions}>
              <TouchableOpacity style={[styles.sliderButton, { borderColor }]} onPress={() => setBassBoost(Math.max(-10, bassBoost - 1))}>
                <Ionicons name="remove" size={16} color={textColor} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sliderButton, { borderColor }]} onPress={() => setBassBoost(Math.min(10, bassBoost + 1))}>
                <Ionicons name="add" size={16} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
        </SettingCard>

        <SettingCard
          icon="library"
          title="Library"
          description="Scan folders and manage local storage"
        >
          {optionRow('Music Library Scan', libraryScan ? 'Enabled' : 'Tap to scan', 'scan')}
          {optionRow('Folder Selection', 'Choose folders', 'folder')}
          {optionRow('Storage Management', '2.4 GB used', 'cube')}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: tint }]}
            onPress={() => setLibraryScan(!libraryScan)}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <ThemedText type="defaultSemiBold" style={styles.actionText}>
              {libraryScan ? 'Rescan Library' : 'Scan Library'}
            </ThemedText>
          </TouchableOpacity>
        </SettingCard>

        <SettingCard
          icon="timer"
          title="Automation"
          description="Keep playback effortless"
        >
          <View style={styles.switchRow}>
            <View>
              <ThemedText type="defaultSemiBold">Sleep Timer</ThemedText>
              <ThemedText type="default" style={styles.switchDescription}>
                Fade out automatically before bed
              </ThemedText>
            </View>
            <Switch value={sleepTimer} onValueChange={setSleepTimer} trackColor={{ false: '#94a3b8', true: tint }} />
          </View>
          {optionRow('Language', 'English', 'globe')}
          {optionRow('About Application', 'Version 1.0', 'information-circle')}
        </SettingCard>

        <ThemedView style={[styles.footerCard, { backgroundColor: surface, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={styles.footerTitle}>
            Premium local playback
          </ThemedText>
          <ThemedText type="default" style={styles.footerText}>
            Everything stays on-device for fast, private listening.
          </ThemedText>
        </ThemedView>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  ambientBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 190,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  kicker: {
    fontSize: 14,
    opacity: 0.7,
  },
  heading: {
    marginTop: 2,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
  },
  cardDescription: {
    fontSize: 13,
    opacity: 0.72,
    marginTop: 4,
    lineHeight: 18,
  },
  cardBody: {
    gap: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  switchDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  themeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inlinePill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sliderBlock: {
    gap: 10,
  },
  sliderValue: {
    opacity: 0.7,
  },
  sliderRail: {
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 999,
  },
  sliderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  sliderButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 14,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
  },
  optionValue: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionValueText: {
    fontSize: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 14,
    marginTop: 4,
  },
  actionText: {
    color: '#fff',
  },
  footerCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
  },
  footerTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 13,
    opacity: 0.72,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 110,
  },
});
