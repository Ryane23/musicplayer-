#!/usr/bin/env node
/**
 * Pre-release verification: typecheck, lint, and core logic smoke tests.
 * Run before building APK: npm run verify
 */
import { execSync } from 'node:child_process';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  ✗ ${name}`);
    console.error(`    ${error instanceof Error ? error.message : error}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function parseSpotifyPlaylistId(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/playlist\/([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) return match[1];
  if (/^[a-zA-Z0-9]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchSpotifyTrackToLibrary(spotifyTrack, library) {
  const title = normalize(spotifyTrack.title);
  const artist = normalize(spotifyTrack.artist);
  const exact = library.find(
    (track) => normalize(track.title) === title && normalize(track.artist) === artist
  );
  if (exact) return exact;
  return (
    library.find((track) => {
      const localTitle = normalize(track.title);
      const localArtist = normalize(track.artist);
      const titleMatch =
        localTitle.includes(title) || title.includes(localTitle) || localTitle === title;
      const artistMatch =
        !artist ||
        localArtist.includes(artist) ||
        artist.includes(localArtist) ||
        localArtist === artist;
      return titleMatch && artistMatch;
    }) ?? null
  );
}

console.log('\nMelodyLocal release verification\n');

console.log('Logic tests:');
test('parses Spotify playlist URL', () => {
  assertEqual(
    parseSpotifyPlaylistId('https://open.spotify.com/playlist/37i9dQZF1DX4JUCvG5Mk9'),
    '37i9dQZF1DX4JUCvG5Mk9',
    'url'
  );
});

test('parses bare Spotify playlist ID', () => {
  assertEqual(parseSpotifyPlaylistId('37i9dQZF1DX4JUCvG5Mk9'), '37i9dQZF1DX4JUCvG5Mk9', 'id');
});

test('rejects invalid Spotify input', () => {
  assertEqual(parseSpotifyPlaylistId('not-a-playlist'), null, 'invalid');
});

test('matches local track by title and artist', () => {
  const library = [
    { id: '1', title: 'Midnight Drive', artist: 'Neon Avenue', album: 'A', duration: 1000, uri: 'x' },
  ];
  const match = matchSpotifyTrackToLibrary(
    { title: 'Midnight Drive', artist: 'Neon Avenue' },
    library
  );
  assertEqual(match?.id, '1', 'match id');
});

test('fuzzy-matches partial title', () => {
  const library = [
    { id: '2', title: 'City Lights (Remix)', artist: 'Blue Static', album: 'B', duration: 1000, uri: 'x' },
  ];
  const match = matchSpotifyTrackToLibrary({ title: 'City Lights', artist: 'Blue Static' }, library);
  assertEqual(match?.id, '2', 'fuzzy id');
});

console.log('\nTypeScript check:');
try {
  execSync('./node_modules/.bin/tsc --noEmit', { stdio: 'inherit' });
  passed += 1;
  console.log('  ✓ tsc --noEmit');
} catch {
  failed += 1;
  console.error('  ✗ tsc --noEmit');
}

console.log('\nLint:');
try {
  execSync('./node_modules/.bin/eslint .', { stdio: 'inherit' });
  passed += 1;
  console.log('  ✓ eslint');
} catch {
  failed += 1;
  console.error('  ✗ eslint');
}

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

console.log('Ready for APK build. Manual QA checklist:');
console.log('  • Splash shows scan progress + "Developed by Ryan Smoke"');
console.log('  • Library blocks until scan completes');
console.log('  • Play / pause / skip / seek / volume work');
console.log('  • Settings: shuffle, repeat, speed, sleep timer, visualizer');
console.log('  • Create / edit / delete playlist');
console.log('  • Spotify import (requires API keys in .env)');
console.log('  • Rescan library from Library tab\n');
