# StoreKit Configuration Setup Guide

This guide will help you set up StoreKit Testing in Xcode so you can test Superwall paywalls in the iOS Simulator.

## Prerequisites

- Xcode installed on your Mac
- iOS project already built (you have the `ios/` folder)
- You'll continue using `npx expo run:ios` after this setup

## Overview

StoreKit Configuration File allows you to test in-app purchases locally without connecting to App Store Connect. Once configured, it works automatically when you run `npx expo run:ios`.

---

## Step 1: Open Your Project in Xcode

1. Navigate to your project directory:
   ```bash
   cd /Users/mandeepverma/mamalearn
   ```

2. Open the Xcode workspace (NOT the .xcodeproj file):
   ```bash
   open ios/Kinderwell.xcworkspace
   ```

3. Wait for Xcode to load the project

---

## Step 2: Create StoreKit Configuration File

1. In Xcode menu bar: **File → New → File...**

2. In the template picker:
   - Scroll down to the **Resource** section
   - Select **StoreKit Configuration File**
   - Click **Next**

3. Name the file:
   - File Name: `Products` (or `StoreKitConfiguration`)
   - Target: Make sure **Kinderwell** is checked
   - Group: Select `Kinderwell` folder
   - Click **Create**

4. The file will open in the StoreKit editor

---

## Step 3: Add Your Subscription Products

Now you'll add your subscription products. You need to know your product IDs from Superwall dashboard.

### Adding a Subscription Product

1. Click the **+** button at the bottom left of the StoreKit editor

2. Select **Add Subscription** from the dropdown

3. A subscription group will be created. Click on it and configure:
   - **Group Name**: `Premium Subscriptions` (or any name)

4. Click the **+** button again inside the subscription group

5. Select **Add Subscription**

6. Configure the first subscription (Monthly):
   - **Product ID**: `com.kinderwell.app.monthly` (or your actual monthly product ID)
   - **Reference Name**: `Monthly Subscription`
   - **Price**: `12.99` (or your actual price)
   - **Subscription Duration**: `1 Month`
   - **Locale**: `en_US` (default)

7. Click **+** again to add the second subscription (Annual):
   - **Product ID**: `com.kinderwell.app.annual` (or your actual annual product ID)
   - **Reference Name**: `Annual Subscription`
   - **Price**: `69.99` (or your actual price)
   - **Subscription Duration**: `1 Year`

8. **Save** the file (⌘S)

### Important Notes:
- The Product IDs **must match** what you configured in your Superwall dashboard
- If you don't know your product IDs, check your Superwall dashboard under Products section

---

## Step 4: Enable StoreKit in Xcode Scheme

This tells Xcode to use your StoreKit Configuration File when running the app.

1. In Xcode menu: **Product → Scheme → Edit Scheme...**
   (Or press ⌘< )

2. In the sidebar, select **Run** (should be selected by default)

3. Select the **Options** tab at the top

4. Find **StoreKit Configuration** dropdown:
   - Click the dropdown
   - Select your configuration file (e.g., `Products.storekit`)

5. Click **Close**

---

## Step 5: Test the Setup

Now you can test! The setup is complete and will be used automatically.

1. **Restart your Expo dev server** (important for env var changes):
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npx expo run:ios
   ```

2. In the app, go through onboarding

3. **Watch the console logs** - you should see:
   ```
   🚀 Initializing Superwall...
   ✅ Superwall initialized successfully
   === PAYWALL DEBUG INFO ===
   SKIP_PAYWALL env var: false
   🎯 Attempting to show Superwall paywall...
   📡 Registering "show_paywall" event with Superwall...
   ✅ Superwall event registered successfully
   📱 Paywall will present: {...}
   ✅ Paywall presented successfully: {...}
   ```

4. The paywall should appear!

---

## Step 6: Test Purchase Flow

1. When the paywall appears, select a subscription plan

2. Click the purchase button

3. A **StoreKit Testing dialog** will appear (looks like real purchase but it's fake)

4. Click **Subscribe** or **Buy**

5. The purchase completes instantly (no real money charged)

---

## Troubleshooting

### Paywall doesn't appear

**Check console logs for errors:**
- If you see `❌ ERROR showing paywall`, read the error details
- Common issue: Product IDs don't match between StoreKit config and Superwall dashboard

**Verify StoreKit is enabled:**
- Product → Scheme → Edit Scheme → Run → Options
- Make sure StoreKit Configuration is selected

**Verify SKIP_PAYWALL is false:**
- Check `.env` file: `SKIP_PAYWALL=false`
- Restart the app after changing

### "No products available" error

**Product IDs must match exactly:**
1. Open your Superwall dashboard
2. Go to Products section
3. Copy the exact Product IDs
4. Update StoreKit Configuration File with those IDs
5. Make sure there are no typos or extra spaces

### Paywall shows but purchase fails

**Check Transaction Manager:**
- In Xcode: **Debug → StoreKit → Transaction Manager**
- This shows all test transactions
- You can see what happened with each purchase

**Reset purchase history:**
- Debug → StoreKit → Delete All Transactions
- This clears all test purchases (useful for testing)

### App crashes on paywall

**Check Superwall dashboard:**
- Make sure you have at least one paywall created
- The paywall must be published (not just draft)
- Verify the paywall has products assigned

---

## Managing Test Transactions

### View Transactions
- **Debug → StoreKit → Transaction Manager**
- Shows all purchases, renewals, expirations

### Delete All Transactions
- **Debug → StoreKit → Delete All Transactions**
- Useful for starting fresh

### Test Scenarios
- **Purchase subscription**: Click purchase button
- **Cancel subscription**: Use Transaction Manager
- **Restore purchases**: Go to Settings → Restore Purchases
- **Test expiration**: Speed up time in Transaction Manager

---

## Using Transaction Manager for Advanced Testing

The Transaction Manager is super useful for testing different subscription states:

1. Open it: **Debug → StoreKit → Transaction Manager** (or Window → Transaction Manager)

2. You'll see a list of all transactions

3. Right-click on a transaction to:
   - **Refund Transaction**: Test refund handling
   - **Cancel Subscription**: Test cancellation flow
   - **Resolve Issues**: Clear problem transactions
   - **Speed Up Renewals**: Test subscription renewals quickly

---

## Important Notes

### ✅ This setup is ONE-TIME only
- Once configured, you don't need to open Xcode again
- Just keep using `npx expo run:ios` as normal
- StoreKit config is automatically used

### ✅ No Apple Developer account needed
- StoreKit Testing works completely locally
- No connection to App Store Connect
- Perfect for development

### ⚠️ Limitations of StoreKit Testing
- Doesn't test real App Store receipts
- Can't test subscription features like grace period
- Some edge cases behave differently
- Before launch, test with real TestFlight + sandbox account

### 🎯 Product IDs Must Match
- StoreKit Configuration Product IDs
- ↕️ Must match exactly
- Superwall Dashboard Product IDs

---

## Sandbox Apple ID (real-device paywall testing)

**Tester account (as of 2026-07-03):** `sandeepv98@gmail.com` — set up in App Store Connect → Users and Access → Sandbox → Testers. Country: United States, subscription renewal rate: 5 minutes (accelerated for fast testing).

### How to sign into sandbox on iPhone

**iOS 18+ (current — this is the correct path):**

**Settings → Developer → Sandbox Apple Account**

The **Developer** menu only appears in Settings after you've enabled Developer Mode. Sequence for a fresh device:

1. Install a dev/preview EAS build (this is the trigger that unlocks Developer Mode as an option)
2. Tap the app icon → "Developer Mode Required" alert
3. Settings → Privacy & Security → scroll to bottom → **Developer Mode** → toggle ON → phone restarts → confirm "Turn On Developer Mode" after reboot
4. Now Settings → **Developer** (new menu) → scroll to **Sandbox Apple Account** (may be under a "SANDBOX ENVIRONMENT" section)
5. Sign in with `sandeepv98@gmail.com` and its password

**Wrong paths that used to work but no longer do:**
- ❌ iOS 15/16: `Settings → App Store → Sandbox Account` (moved)
- ❌ iOS 17: `Settings → Apps → App Store → Sandbox Account` (moved again)
- ✅ iOS 18+: `Settings → Developer → Sandbox Apple Account`

**Alternative — live sign-in during purchase:** if the Developer menu doesn't appear or the sandbox account entry is missing, tap "Buy" on any paywall option. iOS will prompt "Sign in with your Sandbox Apple ID" inline. Enter the tester credentials there. This is a fallback and less reliable than the Settings path.

### Verify sandbox is active

After signing in, any paywall purchase will show `[Environment: Sandbox]` at the top of the App Store purchase sheet. If it doesn't say "Sandbox," you're about to be charged real money — DO NOT tap Buy.

### If you forget the sandbox password

App Store Connect → Users and Access → Sandbox → Testers → click `sandeepv98@gmail.com` → there's a password reset option in the tester detail modal. Reset, then re-sign-in on iPhone.

### Sandbox limitations

- Subscriptions renew every 5 minutes (per current config), so "1-year sub" completes in 5 minutes
- Restore purchases works
- Grace period, billing retry, and other real-App-Store edge cases don't behave identically
- **Before real launch:** always test on TestFlight with a real (non-sandbox) purchase intent + a promo code or gift card, not just sandbox

## Next Steps

After StoreKit is working:

1. **Test all flows:**
   - Purchase flow
   - Restore purchases (Settings screen)
   - Cancel subscription
   - Different plans

2. **Design your paywall:**
   - Login to Superwall dashboard
   - Customize your paywall design
   - Preview in web dashboard
   - Test in simulator

3. **Prepare for production:**
   - Create Apple Developer account
   - Set up products in App Store Connect
   - Match Product IDs everywhere
   - Test with TestFlight

---

## Quick Reference

### Commands
```bash
# Open Xcode workspace
open ios/Kinderwell.xcworkspace

# Run app (uses StoreKit automatically)
npx expo run:ios

# Enable paywall testing
# Edit .env: SKIP_PAYWALL=false

# Disable paywall (skip to app)
# Edit .env: SKIP_PAYWALL=true
```

### Product IDs Location
1. **Superwall Dashboard** → Products section
2. **StoreKit Config** → Products.storekit file
3. **App Store Connect** → In-App Purchases (for production)

All three must have **identical Product IDs**.

---

## Need Help?

**Check logs first:**
- Console shows detailed emoji-coded logs
- Look for ❌ ERROR messages
- Read the error details

**Common solutions:**
- Restart app after changing .env
- Verify Product IDs match
- Check StoreKit is enabled in scheme
- Delete all transactions and try again
- Verify Superwall dashboard has paywall published

**Still stuck?**
- Check Transaction Manager for transaction details
- Review Superwall dashboard configuration
- Verify SUPERWALL_API_KEY in .env is correct
- Make sure you have internet (Superwall needs to fetch config)

---

Good luck! 🚀
