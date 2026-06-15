/**
 * Spotify-inspired design tokens
 */

import { Platform } from 'react-native';

export const Spotify = {
  green: '#1DB954',
  greenBright: '#1ED760',
  black: '#000000',
  background: '#121212',
  elevated: '#181818',
  card: '#282828',
  cardHover: '#3E3E3E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#6A6A6A',
  divider: '#2A2A2A',
};

const tintColorLight = Spotify.green;
const tintColorDark = Spotify.greenBright;

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F5F5',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    surface: '#FFFFFF',
    card: '#FFFFFF',
    textSecondary: '#6B7280',
  },
  dark: {
    text: Spotify.textPrimary,
    background: Spotify.background,
    tint: tintColorDark,
    icon: Spotify.textSecondary,
    tabIconDefault: Spotify.textSecondary,
    tabIconSelected: tintColorDark,
    surface: Spotify.elevated,
    card: Spotify.card,
    textSecondary: Spotify.textSecondary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
