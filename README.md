# Music Player App

A beautiful and functional music player built with React Native and Expo.

## Features

- Play/Pause functionality
- Skip to next/previous tracks
- Progress bar with seeking capability
- Volume control
- Playlist management
- Responsive UI with dark theme support

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional)

### Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

Or use the startup script:

```bash
./start.sh
```

### Running the App

To start the development server:

```bash
npx expo start
```

Then use the Expo Go app on your device to scan the QR code, or use an emulator.

## Project Structure

- `app/` - Contains the main application screens and routes
- `components/` - Reusable UI components
- `contexts/` - React Context providers for state management
- `services/` - Business logic and external service integrations
- `types/` - TypeScript type definitions
- `constants/` - Constant values used throughout the app
- `hooks/` - Custom React hooks

## Key Components

- **MusicPlayerService**: Handles audio playback using expo-av
- **MusicPlayerContext**: Provides global state management for the music player
- **MusicPlayer**: UI component for playback controls and track info
- **Playlist**: Displays the list of available tracks

## Technologies Used

- React Native
- Expo
- TypeScript
- expo-av for audio playback
- React Navigation for routing

## Contributing

Feel free to contribute to this project by submitting issues or pull requests.