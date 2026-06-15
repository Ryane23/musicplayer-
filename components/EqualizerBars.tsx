import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Spotify } from '@/constants/theme';
import { USE_NATIVE_DRIVER } from '@/utils/animation';

const BAR_COUNT = 5;
const BAR_WIDTH = 6;
const BAR_GAP = 7;
const MAX_HEIGHT = 44;

type EqualizerBarsProps = {
  color?: string;
  active?: boolean;
};

export default function EqualizerBars({
  color = Spotify.green,
  active = true,
}: EqualizerBarsProps) {
  const animations = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.35))
  ).current;

  useEffect(() => {
    if (!active) return;

    const loops = animations.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.25 + ((index % 3) + 1) * 0.22,
            duration: 320 + index * 60,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: 0.3 + (index % 2) * 0.08,
            duration: 280 + index * 50,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [active, animations]);

  return (
    <View style={styles.row}>
      {animations.map((anim, index) => (
        <View key={index} style={styles.barSlot}>
          <Animated.View
            style={[
              styles.bar,
              {
                width: BAR_WIDTH,
                backgroundColor: color,
                marginHorizontal: BAR_GAP / 2,
                transform: [
                  { translateY: MAX_HEIGHT / 2 },
                  {
                    scaleY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.35, 1],
                    }),
                  },
                  { translateY: -MAX_HEIGHT / 2 },
                ],
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: MAX_HEIGHT,
  },
  barSlot: {
    height: MAX_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    height: MAX_HEIGHT,
    borderRadius: 3,
  },
});
