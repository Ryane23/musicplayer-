import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  const bars = useRef(Array.from({ length: 20 }, (_, i) => i)).current;
  const animatedValues = useRef(bars.map(() => new Animated.Value(10))).current;
  const color = useThemeColor({}, 'tint');

  useEffect(() => {
    if (isPlaying) {
      const animations = bars.map((_, i) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValues[i], {
              toValue: Math.random() * 60 + 10,
              duration: Math.random() * 500 + 300,
              useNativeDriver: false,
            }),
            Animated.timing(animatedValues[i], {
              toValue: 10,
              duration: Math.random() * 500 + 300,
              useNativeDriver: false,
            }),
          ])
        );
      });

      Animated.stagger(50, animations).start();
    } else {
      // Reset bars to minimum height when not playing
      Animated.parallel(
        animatedValues.map(value => 
          Animated.timing(value, {
            toValue: 10,
            duration: 300,
            useNativeDriver: false,
          })
        )
      ).start();
    }
  }, [animatedValues, bars, isPlaying]);

  return (
    <View style={styles.container}>
      <View style={styles.visualizerBars}>
        {bars.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.visualizerBar,
              {
                height: animatedValues[index],
                backgroundColor: color,
              }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  visualizerBars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: 80,
    gap: 4,
  },
  visualizerBar: {
    width: 4,
    borderRadius: 2,
  },
});

export default AudioVisualizer;
