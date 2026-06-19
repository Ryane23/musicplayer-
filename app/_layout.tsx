import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import MiniPlayer from '../components/MiniPlayer';
import LibraryPlayerSync from '../components/LibraryPlayerSync';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LibraryProvider>
      <MusicPlayerProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="now-playing" />
            <Stack.Screen name="favorites" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="library" />
          </Stack>
          <LibraryPlayerSync />
          <MiniPlayer />
        </>
      </MusicPlayerProvider>
    </LibraryProvider>
  );
}
