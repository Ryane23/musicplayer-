import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';

type SeekBarProps = {
  progress: number;
  onSeek: (ratio: number) => void;
  trackColor?: string;
  fillColor?: string;
  height?: number;
  style?: ViewStyle;
};

/**
 * Tap-to-seek bar using TouchableOpacity (avoids RN Web Pressable touch warnings).
 */
export default function SeekBar({
  progress,
  onSeek,
  trackColor = '#282828',
  fillColor = '#FFFFFF',
  height = 4,
  style,
}: SeekBarProps) {
  const [width, setWidth] = useState(0);

  const handlePress = (event: GestureResponderEvent) => {
    if (width <= 0) {
      return;
    }

    const ratio = Math.max(0, Math.min(event.nativeEvent.locationX / width, 1));
    onSeek(ratio);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.rail, { height, backgroundColor: trackColor, borderRadius: height / 2 }, style]}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onPress={handlePress}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
