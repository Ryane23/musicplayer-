import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Spotify } from '@/constants/theme';
import { USE_NATIVE_DRIVER } from '@/utils/animation';

type MusicLogoProps = {
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
};

export default function MusicLogo({ size = 120, animated = true, style }: MusicLogoProps) {
  const scale = useRef(new Animated.Value(animated ? 0.4 : 1)).current;
  const opacity = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    ).start();
  }, [animated, opacity, pulse, rotate, scale]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.55],
  });

  const ringOpacity = pulse.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.55, 0.25, 0],
  });

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowSize = size * 1.35;

  return (
    <View style={[styles.wrap, { width: glowSize, height: glowSize }, style]}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            opacity: ringOpacity,
            transform: [{ scale: ringScale }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.orbit,
          {
            width: size * 1.15,
            height: size * 1.15,
            transform: [{ rotate: spin }],
            opacity: opacity,
          },
        ]}
      >
        <View style={[styles.orbitDot, { backgroundColor: Spotify.greenBright }]} />
      </Animated.View>

      <Animated.View
        style={{
          opacity,
          transform: [{ scale }],
        }}
      >
        <View
          style={[
            styles.logoFrame,
            {
              width: size,
              height: size,
              borderRadius: size * 0.22,
            },
          ]}
        >
          <Image
            source={require('@/assets/images/music-logo.png')}
            style={{ width: size * 0.88, height: size * 0.88 }}
            contentFit="contain"
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Spotify.green,
  },
  orbit: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  orbitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  logoFrame: {
    backgroundColor: Spotify.black,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Spotify.green,
    boxShadow: '0px 0px 24px rgba(29, 185, 84, 0.35)',
  },
});
