# Mafqood Mobile App

**Dubai's AI-Powered Lost & Found Platform - Mobile Version**

A React Native (Expo) mobile application for Mafqood, providing the same lost & found matching functionality as the web app with a native mobile experience.

## 🚀 Features

- **Report Lost Items**: Upload photos, specify location and time frame
- **Report Found Items**: Help reunite items with their owners
- **AI-Powered Matching**: Visual similarity matching using embeddings
- **Match Dashboard**: View all your reported items and potential matches
- **Bilingual Support**: Full English and Arabic with RTL support
- **Native Experience**: Camera integration, smooth animations, bottom tab navigation

## 📱 Screens

1. **Home** - Landing page with CTAs and how-it-works guide
2. **Report Lost** - Form to report a lost item with photo upload
3. **Report Found** - Form to report a found item
4. **Matches** - Dashboard showing all items with their AI matches
5. **Match Details** - Detailed view of an item and its matches
6. **Settings** - Language toggle, how-it-works, privacy info

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (managed workflow)
- **Language**: TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: TanStack Query (React Query)
- **Styling**: StyleSheet with theme constants
- **Icons**: Expo Vector Icons (Ionicons)
- **Image Picker**: Expo Image Picker
- **Storage**: AsyncStorage for language preference

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator, or Expo Go app on physical device

## 🏃‍♂️ Getting Started

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/emulator**:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 🔧 Configuration

### API Configuration

The API base URL is configured in `src/api/config.ts`. By default:
- Android Emulator: `http://10.0.2.2:8000`
- iOS Simulator: `http://localhost:8000`
- Production: Update `API_BASE_URL` with your deployed backend URL

### Backend Setup

The mobile app connects to the same FastAPI backend as the web app. Make sure the backend is running:

```bash
cd ../backend
uvicorn app.main:app --reload
```

## 📁 Project Structure

```
mobile/
├── App.tsx                 # Main entry point with providers
├── src/
│   ├── api/
│   │   ├── config.ts       # API configuration & endpoints
│   │   └── client.ts       # API client functions
│   ├── components/
│   │   ├── Button.tsx      # Primary button component
│   │   ├── TextInput.tsx   # Text input with label
│   │   ├── SelectField.tsx # Dropdown select
│   │   ├── ImagePickerField.tsx # Camera/gallery picker
│   │   ├── MatchCard.tsx   # Match display card
│   │   └── ItemCard.tsx    # Item with matches card
│   ├── context/
│   │   └── LanguageContext.tsx # i18n provider with RTL
│   ├── i18n/
│   │   └── translations.ts # EN/AR translation strings
│   ├── navigation/
│   │   ├── BottomTabs.tsx  # Bottom tab navigator
│   │   └── RootNavigator.tsx # Root stack navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ReportLostScreen.tsx
│   │   ├── ReportFoundScreen.tsx
│   │   ├── MatchesScreen.tsx
│   │   ├── MatchDetailsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── theme/
│   │   └── theme.ts        # Colors, spacing, typography
│   └── types/
│       └── itemTypes.ts    # TypeScript interfaces
└── package.json
```

## 🎨 Theme

The app uses the same color scheme as the web version:
- **Primary Dark**: `#0B2D3A`
- **Primary Accent**: `#28B3A3`
- **Secondary Accent**: `#36C2B2`

## 🌍 Internationalization

Switch between English and Arabic in Settings. The app:
- Persists language preference using AsyncStorage
- Supports RTL layout for Arabic
- Translates all UI text

## 📱 Building for Production

### Android APK
```bash
npx expo build:android
```

### iOS IPA
```bash
npx expo build:ios
```

### EAS Build (Recommended)
```bash
npx eas-cli build --platform all
```

## 📄 License

MIT License - See main project LICENSE file

## 🏆 Credits

Built for the Create Apps Championship 2025 - Dubai Chamber of Digital Economy
