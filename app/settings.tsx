import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [audioQuality, setAudioQuality] = useState('high');
  const [crossfade, setCrossfade] = useState(true);
  const [gaplessPlayback, setGaplessPlayback] = useState(true);
  const [sleepTimer, setSleepTimer] = useState(false);
  const [equalizerEnabled, setEqualizerEnabled] = useState(false);
  const [bassBoost, setBassBoost] = useState(0);
  const [treble, setTreble] = useState(0);
  
  const [language, setLanguage] = useState('English');
  const [storageUsed, setStorageUsed] = useState('2.4 GB of 15 GB');
  
  const themeColor = useThemeColor({}, 'tint');
  
  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', type: 'switch', value: darkMode, setValue: setDarkMode },
        { label: 'Theme Color', type: 'selector', value: 'Default', action: () => {} },
        { label: 'Font Size', type: 'selector', value: 'Medium', action: () => {} },
      ]
    },
    {
      title: 'Audio Quality',
      items: [
        { label: 'Stream Quality', type: 'selector', value: 'High', action: () => {} },
        { label: 'Download Quality', type: 'selector', value: 'High', action: () => {} },
        { label: 'Upsampling', type: 'switch', value: false, setValue: () => {} },
      ]
    },
    {
      title: 'Playback',
      items: [
        { label: 'Crossfade', type: 'switch', value: crossfade, setValue: setCrossfade },
        { label: 'Gapless Playback', type: 'switch', value: gaplessPlayback, setValue: setGaplessPlayback },
        { label: 'Repeat by Default', type: 'switch', value: false, setValue: () => {} },
        { label: 'Shuffle by Default', type: 'switch', value: false, setValue: () => {} },
      ]
    },
    {
      title: 'Audio Effects',
      items: [
        { label: 'Equalizer', type: 'switch', value: equalizerEnabled, setValue: setEqualizerEnabled },
        { label: 'Bass Boost', type: 'slider', value: bassBoost, setValue: setBassBoost },
        { label: 'Treble', type: 'slider', value: treble, setValue: setTreble },
        { label: 'Surround Sound', type: 'switch', value: false, setValue: () => {} },
      ]
    },
    {
      title: 'Timers',
      items: [
        { label: 'Sleep Timer', type: 'switch', value: sleepTimer, setValue: setSleepTimer },
        { label: 'Session Reminder', type: 'switch', value: false, setValue: () => {} },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Notifications', type: 'switch', value: notificationsEnabled, setValue: setNotificationsEnabled },
        { label: 'Language', type: 'selector', value: language, action: () => {} },
        { label: 'Auto-download', type: 'switch', value: false, setValue: () => {} },
      ]
    },
    {
      title: 'Storage',
      items: [
        { label: 'Storage Used', type: 'info', value: storageUsed },
        { label: 'Clear Cache', type: 'action', action: () => {} },
        { label: 'Manage Downloads', type: 'action', action: () => {} },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile', type: 'action', action: () => {} },
        { label: 'Privacy', type: 'action', action: () => {} },
        { label: 'Help & Support', type: 'action', action: () => {} },
        { label: 'About', type: 'action', action: () => {} },
      ]
    }
  ];

  const SettingItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.settingItem}>
        <ThemedText style={styles.settingLabel} type="default">{item.label}</ThemedText>
        
        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.setValue}
            trackColor={{ false: '#767577', true: themeColor }}
            thumbColor={item.value ? '#fff' : '#f4f3f4'}
          />
        )}
        
        {item.type === 'selector' && (
          <TouchableOpacity style={styles.selector} onPress={item.action}>
            <ThemedText style={styles.selectorText} type="default">{item.value}</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
        )}
        
        {item.type === 'info' && (
          <ThemedText style={styles.infoText} type="default">{item.value}</ThemedText>
        )}
        
        {item.type === 'action' && (
          <TouchableOpacity style={styles.actionButton} onPress={item.action}>
            <Ionicons name="chevron-forward" size={20} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
        )}
        
        {item.type === 'slider' && (
          <View style={styles.sliderContainer}>
            <TouchableOpacity 
              style={styles.sliderButton} 
              onPress={() => item.setValue(Math.max(-10, item.value - 1))}
            >
              <Ionicons name="remove" size={16} color={useThemeColor({}, 'text')} />
            </TouchableOpacity>
            <ThemedText style={styles.sliderValue} type="default">{item.value}</ThemedText>
            <TouchableOpacity 
              style={styles.sliderButton} 
              onPress={() => item.setValue(Math.min(10, item.value + 1))}
            >
              <Ionicons name="add" size={16} color={useThemeColor({}, 'text')} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle} type="defaultSemiBold">Settings</ThemedText>
      </View>
      
      <ScrollView style={styles.content}>
        {settingsSections.map((section, index) => (
          <ThemedView key={index} style={styles.section}>
            <ThemedText style={styles.sectionTitle} type="defaultSemiBold">{section.title}</ThemedText>
            {section.items.map((item, itemIndex) => (
              <SettingItem key={itemIndex} item={item} />
            ))}
          </ThemedView>
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutButton}>
          <ThemedText style={styles.signOutText} type="default">Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#888',
  },
  actionButton: {
    padding: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderButton: {
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  sliderValue: {
    fontSize: 16,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  signOutText: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: '600',
  },
});

export default SettingsScreen;