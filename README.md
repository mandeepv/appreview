# Mamalearn

A Duolingo-style parenting app helping parents learn to be better through daily 5-20 minute lessons.

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS) for styling
- **React Navigation** for navigation
- **Zustand** for state management
- **Expo Apple Authentication** (App Store requirement)
- **Google Sign-In** for authentication

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Expo Go app on your iPhone (download from App Store)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with your iPhone camera or Expo Go app

## Project Structure

```
src/
├── screens/onboarding/    # All 20 onboarding screens
├── components/            # Reusable components (Button, ProgressBar, etc.)
├── navigation/            # Navigation configuration
├── store/                 # Zustand state management
└── types/                 # TypeScript types
```

## Onboarding Flow

1. **Splash Screen** - Welcome screen
2. **User Type** - Father/Mother/Other
3. **Name & Age** - User information
4. **Children Count** - Number of children
5. **Children Gender** - Gender selection for each child
6. **Children Age** - Age ranges for each child
7. **Improvement Goals** - What to improve in parenting
8. **Notifications** - Enable push notifications (optional)
9. **Partner Involvement** - Partner's involvement level
10. **Invite Partner** - Invite partner to join (optional)
11. **Goal Selection** - Daily learning time commitment
12. **Experience Level** - New vs experienced in parenting science
13. **Parenting Styles** - Familiar parenting approaches
14. **Educational** - Learn about Mamalearn's approach
15. **Emotional Challenges** - Current challenges (optional)
16. **Authentication** - Sign in with Google/Apple
17. **Loading** - Creating personalized program
18. **Program Ready** - Program creation complete
19. **Lesson Details** - View personalized lesson plan
20. **Paywall** - Choose subscription plan

## App Store Compliance

- ✅ Apple Sign In implemented (required when offering 3rd party auth)
- ✅ Privacy policy placeholders in app.json
- ✅ Proper notification permission handling
- ✅ Subscription via Apple IAP (placeholder for RevenueCat)
- ✅ No hard-coded content that violates guidelines

## Features

### Modular Architecture
- Each screen is a separate component
- Easy to modify and rearrange screens
- Shared components for consistency

### Type Safety
- Full TypeScript coverage
- Type-safe navigation
- Type-safe state management

### Production Ready
- Clean code structure
- Proper error handling
- App Store compliance built-in

## Next Steps (Backend Integration)

1. Set up backend API
2. Integrate RevenueCat for subscriptions
3. Connect Google Sign-In OAuth
4. Add actual notification scheduling
5. Implement lesson content delivery
6. Add analytics (Mixpanel/Amplitude)

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Open on Android emulator
- `npm run ios` - Open on iOS simulator
- `npm run web` - Open in web browser

## Design

The app follows a clean, modern design with:
- Primary color: Pink (#EC4899)
- Soft backgrounds and illustrations
- Card-based interactions
- Progress indicators throughout onboarding

## Notes

- Placeholder images/illustrations need to be replaced with actual assets
- Authentication flows are placeholders - implement real OAuth
- Subscription logic needs RevenueCat integration
- Add actual privacy policy and terms of service URLs
