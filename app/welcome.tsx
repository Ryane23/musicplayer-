import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="musical-notes" size={100} color={tint} />
          <ThemedText style={styles.title} type="defaultSemiBold">Welcome to MelodyLocal</ThemedText>
          <ThemedText style={styles.subtitle} type="default">
            Your premium music experience starts here
          </ThemedText>
        </View>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="musical-note" size={24} color={tint} />
            <ThemedText style={styles.featureText} type="default">High quality audio</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="color-palette" size={24} color={tint} />
            <ThemedText style={styles.featureText} type="default">Beautiful themes</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="pulse" size={24} color={tint} />
            <ThemedText style={styles.featureText} type="default">Immersive visualizer</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color={tint} />
            <ThemedText style={styles.featureText} type="default">Smart recommendations</ThemedText>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: tint }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <ThemedText style={styles.primaryButtonText} type="default">Get Started</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/settings')}
          >
            <ThemedText style={styles.secondaryButtonText} type="default">Sign In</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
  },
  features: {
    marginTop: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 16,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
