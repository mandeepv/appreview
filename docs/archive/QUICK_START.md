> **SNAPSHOT — frozen as of 2026-07-10. Do not follow as current process; see docs/README.md for the live docs.**

# Quick Start: Get Your API Keys

This is a simplified version - full details in `SETUP_GUIDE.md`

## ⚡ Fast Track (Do These First)

### 1. Supabase (5 minutes)
1. Go to https://supabase.com → Sign up
2. Create new project (name: `kinderwell`, free tier)
3. Wait 2-3 minutes for setup
4. Go to **Settings** → **API**
5. Copy these 2 values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGc...
   ```
6. Open `/mamalearn/.env` file
7. Replace the placeholders:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   ```

### 2. Superwall (5 minutes)
1. Go to https://superwall.com → Sign up
2. Create project (name: `Kinderwell`, platform: iOS)
3. Select **StoreKit 2** integration
4. Go to **Settings** → **API Keys**
5. Copy the **Public API Key** (starts with `pk_`)
6. Add to `.env`:
   ```
   SUPERWALL_API_KEY=pk_xxxxx
   ```

### 3. Install Dependencies (2 minutes)
```bash
cd /Users/mandeepverma/mamalearn

npm install @supabase/supabase-js
npm install @superwall/react-native-superwall
npm install react-native-dotenv
npx expo install expo-auth-session expo-crypto expo-web-browser
```

### 4. Restart Metro (1 minute)
After installing and editing `.env`:
```bash
npm start -- --clear
```

## ✅ You're Ready to Code!

The basic setup is complete. You can now:
- Use `supabase` client in your code (from `src/lib/supabase.ts`)
- Integrate Superwall
- Implement authentication

---

## 📋 Next Steps (Do Later)

These require paid accounts but aren't needed for initial development:

### Apple Developer Account ($99/year)
- Required for: Production builds, App Store submission, IAP testing
- Setup time: 2-3 days (enrollment approval)
- **When**: Before you want to test subscriptions or submit to App Store

### Google Cloud (Free)
- Required for: Google Sign-In
- Setup time: 15 minutes
- **When**: Before implementing Google auth

### Apple Sign-In Configuration (Free after Apple Developer enrollment)
- Required for: Apple Sign-In functionality
- Setup time: 30 minutes
- **When**: After Apple Developer account is approved

---

## 🗂️ Files Created/Modified

✅ `.env` - Your API keys (NEVER commit this!)
✅ `src/lib/supabase.ts` - Supabase client
✅ `src/lib/superwall.ts` - Superwall config
✅ `src/types/env.d.ts` - TypeScript types for .env
✅ `babel.config.js` - Updated to read .env

---

## 📝 Your .env File Should Look Like:

```bash
# Supabase Configuration
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTAwMDAwMDAsImV4cCI6MjAwNTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Superwall Configuration
SUPERWALL_API_KEY=pk_1234567890abcdef
```

**IMPORTANT**: Replace the example values above with your actual keys!

---

## 🚨 Common Issues

### Issue: "Cannot find module '@env'"
**Fix**:
1. Make sure you ran `npm install react-native-dotenv`
2. Restart Metro: `npm start -- --clear`
3. If still broken, restart VSCode

### Issue: "SUPABASE_URL is undefined"
**Fix**:
1. Check `.env` file has actual values (not placeholders)
2. Make sure `.env` is in the root folder (`/mamalearn/.env`)
3. Restart Metro: `npm start -- --clear`

### Issue: Babel errors after installing dotenv
**Fix**:
1. Clear cache: `npx expo start -c`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

## 🎯 What's Next?

Once you have your `.env` configured:

1. **Create Supabase database** (see `SETUP_GUIDE.md` Part 1, Step 6)
2. **Configure auth providers** (Google, Apple)
3. **Design Superwall paywall**
4. **Start implementing code** (we'll do this together!)

---

## 📚 Full Documentation

- Full setup details: `SETUP_GUIDE.md`
- Launch checklist: `LAUNCH_CHECKLIST.md`
- Supabase docs: https://supabase.com/docs
- Superwall docs: https://docs.superwall.com

---

**Got your keys? Let's start building! 🚀**
