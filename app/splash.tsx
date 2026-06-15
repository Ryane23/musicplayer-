import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import MusicLogo from '@/components/MusicLogo';
import EqualizerBars from '@/components/EqualizerBars';
import { Spotify } from '@/constants/theme';
import { USE_NATIVE_DRIVER } from '@/utils/animation';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function SplashRoute() {
  const router = useRouter();
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const barsOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      await SplashScreen.hideAsync().catch(() => {});

      Animated.sequence([
        Animated.delay(400),
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
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(progress, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.delay(300),
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 450,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(({ finished }) => {
        if (finished && mounted) {
          router.replace('/(tabs)');
        }
      });
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [barsOpacity, progress, router, screenOpacity, taglineOpacity, titleOpacity, titleY]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.content}>
        <MusicLogo size={132} animated />

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

        <Animated.View style={[styles.barsWrap, { opacity: barsOpacity }]}>
          <EqualizerBars />
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
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
    marginTop: 28,
    fontSize: 34,
    fontWeight: '800',
    color: Spotify.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 10,
    fontSize: 15,
    color: Spotify.textSecondary,
    textAlign: 'center',
  },
  barsWrap: {
    marginTop: 36,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 48,
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
});
