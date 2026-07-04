# Setup Guide: Supabase & Superwall

## Prerequisites
- Node.js installed
- Expo CLI installed
- Apple Developer Account (for production)
- Google Cloud Account (for Google Sign-In)

---

## Part 1: Supabase Setup

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Verify email

### Step 2: Create Project
1. Click **"New Project"**
2. Fill in:
   - **Name**: `kinderwell`
   - **Database Password**: Generate strong password (SAVE IT!)
   - **Region**: `us-east-1` (or closest to your users)
   - **Plan**: Free
3. Click "Create new project"
4. Wait 2-3 minutes

### Step 3: Get API Keys
1. Click **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long JWT starting with `eyJ...`
   - **service_role key**: Another JWT (keep SECRET!)

### Step 4: Add Keys to .env File
1. Open `/mamalearn/.env` file
2. Replace placeholders:
   ```
   SUPABASE_URL=https://your-actual-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 5: Enable Authentication Providers

#### Apple Sign-In (requires Apple Developer Account):
1. In Supabase: **Authentication** → **Providers** → **Apple**
2. Toggle "Enable Apple provider"
3. You'll configure these later after Apple Developer setup:
   - Services ID
   - Team ID
   - Key ID
   - Private Key (.p8 file)

#### Google Sign-In (requires Google Cloud account):
1. In Supabase: **Authentication** → **Providers** → **Google**
2. Toggle "Enable Google provider"
3. Copy the **Redirect URL**: `https://xxxxx.supabase.co/auth/v1/callback`
4. You'll add Google Client ID/Secret later

### Step 6: Create Database Schema
1. In Supabase Dashboard: **SQL Editor**
2. Click **"New Query"**
3. Paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lesson progress table
CREATE TABLE lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- User profiles (optional)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_progress
CREATE POLICY "Users can view own progress"
ON lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
ON lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
ON lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
ON lesson_progress FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);
```

4. Click **"Run"** or press Cmd/Ctrl + Enter
5. Verify tables appear in **Table Editor**

---

## Part 2: Superwall Setup

### Step 1: Create Superwall Account
1. Go to https://superwall.com
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with email or GitHub
4. Verify email

### Step 2: Create Project
1. After login, click **"Create Project"**
2. Fill in:
   - **Project Name**: `Kinderwell`
   - **Platform**: Select **iOS**
3. Click "Create"

### Step 3: Configure Integration
1. You'll see setup wizard
2. Select **"StoreKit 2"** (native iOS, no RevenueCat needed)
3. Click "Continue"

### Step 4: Get API Key
1. In Superwall Dashboard: **Settings** → **API Keys**
2. Copy your **Public API Key** (starts with `pk_...`)
3. Add to `.env` file:
   ```
   SUPERWALL_API_KEY=pk_your_actual_key_here
   ```

### Step 5: Create Subscription Products (in Superwall)
1. Go to **Products** tab in Superwall dashboard
2. Click **"Add Product"**
3. For Monthly:
   - **Product ID**: `com.kinderwell.app.monthly` (must match App Store Connect later)
   - **Type**: Auto-renewable subscription
   - **Duration**: 1 month
   - **Price**: $12.99
4. Click "Save"
5. Repeat for Annual:
   - **Product ID**: `com.kinderwell.app.annual`
   - **Duration**: 1 year
   - **Price**: $69.99

### Step 6: Design Paywall
1. Go to **Paywalls** tab
2. Click **"Create Paywall"**
3. Choose a template or start from scratch
4. Customize:
   - Add your branding
   - Show both subscription options
   - Add legal text (required by Apple):
     ```
     Payment will be charged to iTunes Account at confirmation of purchase.
     Subscription automatically renews unless auto-renew is turned off at
     least 24-hours before the end of the current period.

     Privacy Policy | Terms of Service
     ```
5. Click **"Save"**
6. Note the **Paywall Identifier** (you'll use in code)

### Step 7: Test Configuration
1. In Superwall: **Settings** → **Test Mode**
2. Enable test mode
3. Add your test device (you'll get instructions)

---

## Part 3: Google OAuth Setup (for Google Sign-In)

### Step 1: Create Google Cloud Project
1. Go to https://console.cloud.google.com
2. Click project dropdown → **"New Project"**
3. Name: `Kinderwell`
4. Click "Create"
5. Select the project

### Step 2: Enable Google+ API
1. In left menu: **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click it → **"Enable"**

### Step 3: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
3. Configure consent screen (if prompted):
   - User type: **External**
   - App name: `Kinderwell`
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue" through screens
4. Back to Create OAuth Client ID:
   - Application type: **iOS**
   - Name: `Kinderwell iOS`
   - Bundle ID: `com.kinderwell.app`
5. Click "Create"
6. Copy the **Client ID** (looks like `123456-abc.apps.googleusercontent.com`)

### Step 4: Create Web Client ID (for Supabase)
1. Still in **Credentials**, click **"Create Credentials"** → **"OAuth 2.0 Client ID"** again
2. Application type: **Web application**
3. Name: `Kinderwell Web (Supabase)`
4. **Authorized redirect URIs**: Add the Supabase redirect URL from earlier
   - Example: `https://xxxxx.supabase.co/auth/v1/callback`
5. Click "Create"
6. Copy **Client ID** and **Client Secret**

### Step 5: Add to Supabase
1. Back in Supabase: **Authentication** → **Providers** → **Google**
2. Paste:
   - **Client ID** (from web client)
   - **Client Secret** (from web client)
3. Click "Save"

### Step 6: Add iOS Client ID to Code
1. You'll add the iOS Client ID to your app config (we'll do this in implementation phase)

---

## Part 4: Apple Developer Setup (for Apple Sign-In & IAP)

### Step 1: Enroll in Apple Developer Program
1. Go to https://developer.apple.com/programs/enroll/
2. Sign in with your Apple ID
3. Click "Start Your Enrollment"
4. Choose entity type (Individual or Organization)
5. Complete enrollment ($99/year)
6. Wait for approval (24-48 hours typically)

### Step 2: Create App Identifier
1. Go to https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles** → **Identifiers**
3. Click **"+"** to create new
4. Select **"App IDs"** → Continue
5. Fill in:
   - **Description**: `Kinderwell`
   - **Bundle ID**: `com.kinderwell.app` (Explicit)
   - **Capabilities**: Check these:
     - ✅ Sign in with Apple
     - ✅ In-App Purchase
     - ✅ Push Notifications
6. Click "Continue" → "Register"

### Step 3: Create Services ID (for Apple Sign-In with Supabase)
1. **Identifiers** → **"+"** → **"Services IDs"**
2. Fill in:
   - **Description**: `Kinderwell Auth`
   - **Identifier**: `com.kinderwell.app.auth` (different from bundle ID!)
3. Click "Continue" → "Register"
4. Click on the new Services ID
5. Check **"Sign in with Apple"** → Click "Configure"
6. **Primary App ID**: Select `com.kinderwell.app`
7. **Domains and Subdomains**: Add `your-project.supabase.co` (from Supabase URL, no https://)
8. **Return URLs**: Add `https://your-project.supabase.co/auth/v1/callback`
9. Click "Save" → "Continue" → "Save"

### Step 4: Create Key for Apple Sign-In
1. **Keys** → **"+"**
2. **Key Name**: `Kinderwell Auth Key`
3. Check **"Sign in with Apple"** → Click "Configure"
4. **Primary App ID**: `com.kinderwell.app`
5. Click "Save" → "Continue" → "Register"
6. **Download the .p8 file** (YOU CAN ONLY DO THIS ONCE!)
7. Note the **Key ID** (10 characters)
8. Note your **Team ID** (in top right of Apple Developer portal)

### Step 5: Add Apple Config to Supabase
1. Back in Supabase: **Authentication** → **Providers** → **Apple**
2. Fill in:
   - **Services ID**: `com.kinderwell.app.auth`
   - **Team ID**: Your 10-char team ID
   - **Key ID**: The key ID from step 4
   - **Private Key**: Open the .p8 file in text editor, paste contents
3. Click "Save"

### Step 6: Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. **My Apps** → **"+"** → **New App**
3. Fill in:
   - **Platforms**: iOS
   - **Name**: `Kinderwell`
   - **Primary Language**: English
   - **Bundle ID**: Select `com.kinderwell.app`
   - **SKU**: `kinderwell-app` (any unique ID)
   - **User Access**: Full Access
4. Click "Create"

### Step 7: Create Subscription Products
1. In App Store Connect, click on your app
2. **In-App Purchases** → **"+"** (Manage under Subscriptions if prompted)
3. Click **"Auto-Renewable Subscriptions"**
4. Create **Subscription Group**:
   - Name: `Kinderwell Premium`
5. Click group → **"+"** to add subscription
6. **Monthly Subscription**:
   - **Reference Name**: `Monthly Subscription`
   - **Product ID**: `com.kinderwell.app.monthly` (MUST match Superwall!)
   - **Subscription Duration**: 1 Month
7. Click "Create"
8. Fill in pricing:
   - **Subscription Prices**: $12.99 USD
   - **Availability**: All territories
9. Add **Subscription Display Name**: `Monthly Plan`
10. Add **Description**: `Full access to all parenting lessons and content`
11. Upload screenshot (temporary, 640x920px)
12. Click "Save"
13. Repeat for **Annual Subscription**:
    - **Product ID**: `com.kinderwell.app.annual`
    - **Duration**: 1 Year
    - **Price**: $69.99

### Step 8: Submit Subscriptions for Review
1. Subscriptions need approval before testing
2. Click "Submit for Review" on each
3. Wait for approval (usually same-day)

---

## Part 5: Install Dependencies & Configure App

**Note (Fable review 🟡):** the prior version of this section taught
`react-native-dotenv` + the `@env` module + a Babel plugin. That
approach was abandoned when we adopted Expo's managed workflow. We now
read env vars via `expo-constants` + `app.config.js` — env vars from
`.env` (local dev) or `eas.json` per-profile `env` (EAS builds) get
baked into `Constants.expoConfig.extra` at build time. There is no
Babel plugin, no `@env` module, no `react-native-dotenv` in
`package.json`.

Additionally, the old Superwall package (`@superwall/react-native-superwall`)
is not what we use. The correct package is `expo-superwall` (the
official Expo SDK).

### Step 1: Install required packages

If you're doing a fresh setup (not just adding features to the
existing repo), install:

```bash
cd <path-to-mamalearn>

# Core deps — Supabase + auth flow helpers
npm install @supabase/supabase-js
npx expo install expo-auth-session expo-crypto expo-web-browser expo-apple-authentication
npx expo install @react-native-async-storage/async-storage

# Superwall (NOT @superwall/react-native-superwall — that's the legacy
# React Native package. expo-superwall is the current Expo SDK).
npm install expo-superwall

# Analytics + observability
npm install posthog-react-native
npm install @sentry/react-native
```

If you're working in the existing repo, all of these are already in
`package.json`. Run `npm install` after cloning.

### Step 2: Environment variables — where they come from

Env vars used at runtime (Supabase URL, Supabase anon key, Superwall
API key, PostHog project token, Sentry DSN) live in one of two places:

- **Local dev:** `.env` in the repo root (git-ignored, use
  `.env.example` as a template). `app.config.js` reads
  `process.env.*` at build time and copies the values into
  `Constants.expoConfig.extra`.
- **EAS builds (dev / preview / prod):** `eas.json`'s per-profile
  `env` block. Same code path — `app.config.js` reads
  `process.env.*` at prebuild inside the EAS container.

There is no Babel plugin, no `@env` module. Access env vars at
runtime like:

```typescript
import Constants from 'expo-constants';
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
```

For env vars specifically involved in dev/prod separation, see
`docs/DEV_PROD_ENVIRONMENTS.md` — it covers the two-project
(kinderwell-dev + kinderwell) setup and how `app.config.js` maps
env vars to bundle IDs.

### Step 3: Client setup

The Supabase client, PostHog client, Sentry init, and Superwall
provider are all wired up already:

- `src/lib/supabase.ts` — Supabase client with structural guards for
  dev/prod separation
- `src/config/posthog.ts` — PostHog client with environment super-property
- `src/config/sentry.ts` — Sentry init with release + dist tagging
- `App.tsx` — SuperwallProvider wraps the app

No further code integration needed. Focus on the credentials
(Parts 1-4 above) and env var wiring (Step 2).

---

## Summary Checklist

- [ ] Created Supabase account and project
- [ ] Got Supabase URL and keys → added to `.env`
- [ ] Created database schema in Supabase
- [ ] Enabled Apple & Google auth providers in Supabase
- [ ] Created Superwall account and project
- [ ] Got Superwall API key → added to `.env`
- [ ] Created subscription products in Superwall
- [ ] Designed paywall in Superwall
- [ ] Created Google Cloud project
- [ ] Created OAuth credentials for Google
- [ ] Added Google credentials to Supabase
- [ ] Enrolled in Apple Developer Program
- [ ] Created App ID with capabilities
- [ ] Created Services ID for Apple Sign-In
- [ ] Created and downloaded .p8 key
- [ ] Added Apple credentials to Supabase
- [ ] Created app in App Store Connect
- [ ] Created subscription products in App Store Connect
- [ ] Submitted subscriptions for review
- [ ] Installed npm dependencies
- [ ] Configured babel.config.js
- [ ] Ready for implementation!

---

## Next Steps

Once all accounts are set up, we'll:
1. Create Supabase client
2. Implement authentication flows
3. Integrate Superwall paywall
4. Migrate lesson progress to Supabase
5. Test everything end-to-end

**Estimated setup time: 2-3 hours**

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Superwall Docs**: https://docs.superwall.com
- **Apple Developer**: https://developer.apple.com/support/
- **Google Cloud Console**: https://console.cloud.google.com

---

**Questions? Need help with any step? Ask me!**
