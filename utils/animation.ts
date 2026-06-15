import { Platform } from 'react-native';

/** Native driver is unsupported on web — avoids console warnings. */
export const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 84 : Platform.OS === 'web' ? 56 : 64;

export const MINI_PLAYER_HEIGHT = 58;
