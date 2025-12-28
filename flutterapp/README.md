# PrimeCast Flutter App

A Flutter mobile application for streaming live TV channels from around the world.

## Features

- **User Authentication**: Sign up and sign in functionality
- **Free Trial**: 1-day free trial for new users
- **Country Selection**: Browse TV channels by country
- **Channel Browsing**: Search and browse channels with logos
- **Live Streaming**: HLS video player for live TV streams
- **Subscription Plans**: View pricing and subscribe via WhatsApp

## Getting Started

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK (3.0.0 or higher)
- Android Studio / VS Code with Flutter extensions
- An Android or iOS device/emulator

### Installation

1. Navigate to the flutterapp directory:
   ```bash
   cd flutterapp
   ```

2. Get dependencies:
   ```bash
   flutter pub get
   ```

3. Create asset directories:
   ```bash
   mkdir -p assets/images
   mkdir -p assets/fonts
   ```

4. Run the app:
   ```bash
   flutter run
   ```

### Configuration

1. **API Base URL**: Update the base URL in `lib/utils/constants.dart`:
   ```dart
   static const String baseUrl = 'http://your-server-url:3000';
   ```

2. **WhatsApp Number**: Update the WhatsApp number in `lib/screens/pricing_screen.dart`:
   ```dart
   static const String whatsappNumber = 'your_whatsapp_number';
   ```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
│   ├── user.dart
│   ├── country.dart
│   ├── channel.dart
│   ├── stream_info.dart
│   └── channel_logo.dart
├── providers/                # State management
│   └── auth_provider.dart
├── screens/                  # UI screens
│   ├── splash_screen.dart
│   ├── home_screen.dart
│   ├── login_screen.dart
│   ├── signup_screen.dart
│   ├── countries_screen.dart
│   ├── channels_screen.dart
│   ├── player_screen.dart
│   └── pricing_screen.dart
├── services/                 # API services
│   └── api_service.dart
└── utils/                    # Utilities
    ├── app_theme.dart
    └── constants.dart
```

## APIs Used

### Backend APIs (Your Next.js Server)
- `POST /api/auth/register` - User registration
- `POST /api/auth/callback/credentials` - User login

### External IPTV APIs
- Countries: `https://iptv-org.github.io/api/countries.json`
- Channels: `https://iptv-org.github.io/api/channels.json`
- Streams: `https://iptv-org.github.io/api/streams.json`
- Logos: `https://iptv-org.github.io/api/logos.json`

## App Flow

1. **Splash Screen** → Shows logo and loading animation
2. **Home Screen** → Welcome page with free trial banner and Watch Now button
3. **Sign Up** → Register with email, password, country, WhatsApp (optional)
4. **Sign In** → Login with email and password
5. **Countries Screen** → Grid of countries with flags
6. **Channels Screen** → List of available TV channels for selected country
7. **Player Screen** → Video player with stream selection
8. **Pricing Screen** → Subscription plans with WhatsApp contact

## Dependencies

- `provider` - State management
- `http` - HTTP client
- `video_player` - Video playback
- `chewie` - Video player UI controls
- `cached_network_image` - Image caching
- `shared_preferences` - Local storage
- `flutter_secure_storage` - Secure storage
- `url_launcher` - Open URLs/WhatsApp

## Building for Release

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Notes

- The app uses HLS streaming for live TV playback
- Trial period is 1 day by default (configurable by admin)
- Subscription management is handled via WhatsApp
- The app caches channel logos for better performance

## License

This project is for educational purposes.
