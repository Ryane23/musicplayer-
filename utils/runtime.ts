import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** True when running inside the Expo Go client (not a dev/production build). */
export function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

/**
 * Media library scanning is limited in Expo Go on Android.
 * Dev builds are required for full device library access.
 */
export function canScanDeviceLibrary(): boolean {
  if (isExpoGo() && Platform.OS === 'android') {
    return false;
  }
  return true;
}
