import React from 'react';
import { Stack } from 'expo-router';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import { LibraryProvider } from '../contexts/LibraryContext';
import MiniPlayer from '../components/MiniPlayer';

export default function RootLayout() {
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
          <MiniPlayer />
        </>
      </MusicPlayerProvider>
    </LibraryProvider>
  );
}