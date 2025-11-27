# TrainSync Deployment Guide

This guide will walk you through deploying your TrainSync React Native app to iOS App Store and Google Play Store.

## Prerequisites

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev) if you haven't already
2. **EAS CLI**: Install Expo Application Services CLI
   ```bash
   npm install -g eas-cli
   ```
3. **Apple Developer Account** (for iOS): $99/year subscription
4. **Google Play Console Account** (for Android): $25 one-time fee
5. **Production API URL**: Your backend API must be deployed and accessible via HTTPS

## Step 1: Environment Configuration

### Create Environment File

Create a `.env` file in the root directory:

```bash
# Production API URL (must be HTTPS)
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api

# For development, you can use your local IP
# EXPO_PUBLIC_API_URL=http://10.0.0.194:8080/api
```

**Important**: 
- The API URL must use HTTPS in production
- Never commit `.env` to git (it's already in `.gitignore`)
- The app will fallback to the hardcoded local IP if no environment variable is set

## Step 2: Configure App Identifiers

### iOS Bundle Identifier
The app is configured with bundle identifier: `com.trainsync.app`

To change it, edit `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.yourcompany.trainsync"
}
```

### Android Package Name
The app is configured with package: `com.trainsync.app`

To change it, edit `app.json`:
```json
"android": {
  "package": "com.yourcompany.trainsync"
}
```

**Note**: Once you publish to stores, you cannot change these identifiers!

## Step 3: Login to Expo

```bash
eas login
```

## Step 4: Configure EAS Build

Initialize EAS Build configuration:

```bash
eas build:configure
```

This creates an `eas.json` file. You can customize build profiles for different environments (development, preview, production).

## Step 5: Update App Version

Before each deployment, update the version in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",  // Update this
    "ios": {
      "buildNumber": "2"  // Increment for each iOS build
    },
    "android": {
      "versionCode": 2  // Increment for each Android build
    }
  }
}
```

## Step 6: Build for Production

### Build for Android

```bash
npm run build:android
```

Or using EAS directly:
```bash
eas build --platform android --profile production
```

### Build for iOS

```bash
npm run build:ios
```

Or using EAS directly:
```bash
eas build --platform ios --profile production
```

### Build for Both Platforms

```bash
npm run build:all
```

## Step 7: Create Preview Builds (Optional)

For testing before production release:

```bash
# Android preview build
npm run preview:android

# iOS preview build
npm run preview:ios
```

These builds can be installed directly on devices via download links.

## Step 8: Submit to App Stores

### Submit to Google Play Store

1. Build the app (Step 6)
2. Submit:
   ```bash
   npm run submit:android
   ```
   Or:
   ```bash
   eas submit --platform android
   ```

3. Complete the listing in Google Play Console:
   - App description
   - Screenshots
   - Privacy policy
   - Content rating

### Submit to Apple App Store

1. Build the app (Step 6)
2. Submit:
   ```bash
   npm run submit:ios
   ```
   Or:
   ```bash
   eas submit --platform ios
   ```

3. Complete the listing in App Store Connect:
   - App description
   - Screenshots
   - Privacy policy
   - Age rating

## Step 9: Update App Store Listings

### Required Information

- **App Name**: TrainSync
- **Description**: Write a compelling description of your app
- **Screenshots**: 
  - iOS: Required for iPhone 6.7", 6.5", 5.5" displays
  - Android: Required for phone and tablet (various sizes)
- **Privacy Policy URL**: Required for both stores
- **App Icon**: Already configured in `app.json`
- **Category**: Health & Fitness

## Important Notes

### API Configuration
- ⚠️ **Critical**: Update `EXPO_PUBLIC_API_URL` in `.env` to your production API URL
- The API must support HTTPS
- Ensure CORS is properly configured for your app's domain
- Test API connectivity before submitting to stores

### Version Management
- Always increment version numbers before building
- iOS uses `buildNumber` (integer)
- Android uses `versionCode` (integer)
- Both use `version` (semantic version like "1.0.0")

### Testing Checklist
Before submitting:
- [ ] Test on physical devices (iOS and Android)
- [ ] Verify API connectivity with production URL
- [ ] Test all authentication flows
- [ ] Test all core features
- [ ] Verify images and assets load correctly
- [ ] Check app performance and loading times

### Common Issues

1. **Build Fails**: Check EAS build logs in Expo dashboard
2. **API Connection Errors**: Verify `EXPO_PUBLIC_API_URL` is set correctly
3. **App Rejected**: Review store guidelines and fix issues
4. **Version Conflicts**: Ensure version numbers are incremented

## Continuous Deployment

For automated deployments, consider:
- GitHub Actions with EAS
- Setting up EAS Update for OTA updates (for non-native changes)
- Using different build profiles for staging/production

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

## Support

If you encounter issues:
1. Check Expo documentation
2. Review build logs in Expo dashboard
3. Check Expo Discord community
4. Review error messages carefully

