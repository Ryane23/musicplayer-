import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SplashScreen = () => {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate the splash screen elements
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          friction: 5,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000), // Hold for 2 seconds
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate to the main app after animation completes
      router.replace('/(tabs)');
    });
  }, [fadeAnim, router, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="musical-notes" size={80} color={tint} />
          <ThemedText style={styles.appName} type="defaultSemiBold">MelodyLocal</ThemedText>
          <ThemedText style={styles.tagline} type="default">Premium music experience</ThemedText>
        </View>
        
        <View style={styles.waveContainer}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.wave,
                {
                  height: 10 + i * 5,
                  width: 20 + i * 10,
                  marginLeft: i * 15,
                  backgroundColor: tint,
                  opacity: 0.7 - i * 0.1,
                }
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  wave: {
    borderRadius: 5,
    marginHorizontal: 2,
  },
});

export default SplashScreen;
