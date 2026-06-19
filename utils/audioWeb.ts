import { Audio } from 'expo-av';
import { Platform } from 'react-native';

type SoundWithKey = Audio.Sound & { _key?: HTMLMediaElement | null };

/** Clears native media handlers before unload — avoids expo-av web emit crashes. */
export function clearWebAudioElementHandlers(sound: Audio.Sound) {
  if (Platform.OS !== 'web') {
    return;
  }

  const media = (sound as SoundWithKey)._key;
  if (media instanceof HTMLMediaElement) {
    media.ontimeupdate = null;
    media.onerror = null;
  }
}
