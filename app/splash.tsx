import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import MusicLogo from '@/components/MusicLogo';
import EqualizerBars from '@/components/EqualizerBars';
import { useLibrary } from '@/contexts/LibraryContext';
import { Spotify } from '@/constants/theme';
import { USE_NATIVE_DRIVER } from '@/utils/animation';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashRoute() {
  const router = useRouter();
  const { isLoading, scanMessage } = useLibrary();
  const [animDone, setAnimDone] = useState(false);

  const screenOpacity = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const scanOpacity = useRef(new Animated.Value(0)).current;
  const signatureOpacity = useRef(new Animated.Value(0)).current;
  const barsOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      await SplashScreen.hideAsync().catch(() => {});

      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.spring(titleY, {
            toValue: 0,
            friction: 8,
            tension: 70,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(barsOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.parallel([
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(scanOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.timing(progress, {
          toValue: 0.85,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished && mounted) {
          setAnimDone(true);
        }
      });

      Animated.timing(signatureOpacity, {
        toValue: 1,
        duration: 600,
        delay: 900,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [barsOpacity, progress, scanOpacity, signatureOpacity, taglineOpacity, titleOpacity, titleY]);

  useEffect(() => {
    if (!animDone || isLoading) {
      return;
    }

    Animated.timing(progress, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished) {
          router.replace('/(tabs)');
        }
      });
    }, 350);

    return () => clearTimeout(timeout);
  }, [animDone, isLoading, progress, router, screenOpacity]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.content}>
        <MusicLogo size={120} animated />

        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleY }],
          }}
        >
          <Animated.Text style={styles.appName}>MelodyLocal</Animated.Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Your music. Your library.
        </Animated.Text>

        <Animated.Text style={[styles.scanText, { opacity: scanOpacity }]} numberOfLines={2}>
          {isLoading ? scanMessage : 'Library ready'}
        </Animated.Text>

        <Animated.View style={[styles.barsWrap, { opacity: barsOpacity }]}>
          <EqualizerBars />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Animated.Text style={[styles.signature, { opacity: signatureOpacity }]}>
          Developed by Ryan Smoke
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Spotify.black,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: '20%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Spotify.green,
    opacity: 0.12,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -120,
    right: -40,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Spotify.greenBright,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    marginTop: 24,
    fontSize: 32,
    fontWeight: '800',
    color: Spotify.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    color: Spotify.textSecondary,
    textAlign: 'center',
  },
  scanText: {
    marginTop: 14,
    fontSize: 13,
    color: Spotify.green,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 16,
  },
  barsWrap: {
    marginTop: 28,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    gap: 14,
  },
  progressTrack: {
    height: 3,
    borderRadius: 999,
    backgroundColor: Spotify.card,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Spotify.green,
  },
  signature: {
    fontSize: 12,
    color: Spotify.textMuted,
    textAlign: 'center',
    letterSpacing: 0.6,
    fontWeight: '500',
  },
});
