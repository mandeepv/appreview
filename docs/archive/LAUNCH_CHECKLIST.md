> **SNAPSHOT — frozen as of 2026-07-10. Do not follow as current process; see docs/README.md for the live docs.**

# Kinderwell App Launch Checklist - UPDATED

**Last Updated:** January 26, 2026
**Status:** Coding complete ✅ | Google Auth configured ✅ | Waiting for Apple Developer approval
**Timeline:** 2-4 days of work + Apple review time

---

## ✅ COMPLETED

### Infrastructure & Code
- ✅ Supabase account, project, and database schema
- ✅ Superwall account and SDK integration
- ✅ Authentication implementation (Google + Apple code ready)
- ✅ Lesson progress service (Supabase)
- ✅ Settings screen (Restore Purchases, Account Deletion)
- ✅ Production configuration (app.json, build numbers)
- ✅ Critical fixes (DevMenu hidden, fake experts removed)
- ✅ All 13 lessons implemented

### Configuration
- ✅ Google OAuth configured in Supabase
- ✅ API keys added to .env (Supabase + Superwall)
- ✅ Privacy Policy written and published
- ✅ Terms of Service written and published
- ✅ GitHub Pages set up with legal docs
- ✅ Support email created (kinderwellteam@gmail.com)
- ✅ Legal docs updated with correct email

### URLs
- ✅ Privacy Policy: https://mandeepv.github.io/kinderwell-legal/privacy.html
- ✅ Terms of Service: https://mandeepv.github.io/kinderwell-legal/terms.html

---

## 🔴 PRIORITY: DO NOW (No Apple Developer Needed)

### 1. Design Paywall in Superwall Dashboard (30 minutes)

**CRITICAL - App won't work without this!**

1. Log into https://superwall.com
2. Go to **Paywalls** → **Create Paywall**
3. Choose a template (recommend: "Feature List" or "Simple")
4. Configure:
   - **Headline**: "Unlock Your Parenting Journey"
   - **Features**:
     - 13 Evidence-Based Lessons
     - Personalized Guidance
     - Track Progress Across Devices
     - Science-Backed Strategies
   - **Products**:
     - Monthly: $12.99/month
     - Annual: $69.99/year (Save 55%!)
   - **Product IDs** (MUST MATCH):
     - `com.kinderwell.app.monthly`
     - `com.kinderwell.app.annual`
   - **Legal Text**:
     ```
     Payment charged to Apple ID at confirmation. Subscription renews automatically
     unless canceled at least 24 hours before period ends. Manage in Account Settings.
     ```
   - **Links**:
     - Privacy: https://mandeepv.github.io/kinderwell-legal/privacy.html
     - Terms: https://mandeepv.github.io/kinderwell-legal/terms.html
5. Click **"Publish"**

---

### 2. Test Google Sign-In (15 minutes)

- [ ] Open app on simulator/device (already running)
- [ ] Complete onboarding flow
- [ ] Tap **"Continue with Google"**
- [ ] Sign in with Google account
- [ ] Verify authentication works
- [ ] Check if paywall appears after loading screen
- [ ] Report any errors

**If errors occur:** Check the terminal output or let me know!

---

### 3. Test App Thoroughly (1 hour)

- [ ] All 15 onboarding screens navigate correctly
- [ ] Google Sign-In works
- [ ] Settings screen opens
- [ ] Privacy Policy link opens in browser
- [ ] Terms of Service link opens in browser
- [ ] Contact Support opens email app
- [ ] Logout works
- [ ] Navigate through all 13 lessons
- [ ] Complete a quiz
- [ ] Check if progress saves

---

### 4. Write App Store Description & Keywords (45 minutes)

**App Name:** `Kinderwell`

**Subtitle (30 chars max):** `Science-Based Parenting`

**Keywords (100 chars max):**
```
parenting,kids,children,family,education,psychology,emotional intelligence,development,baby,toddler
```

**Promotional Text (170 chars):**
```
Transform your parenting with 13 science-backed lessons. Build stronger bonds, develop emotional intelligence, and raise confident kids.
```

**Description (4000 chars max):**
```
Kinderwell: Science-Backed Parenting Made Simple

Parenting is the most important job you'll ever have—but it doesn't come with a manual. Until now.

Kinderwell transforms decades of research from child psychologists and behavioral scientists into simple, actionable lessons that fit into your busy life.

🎯 PERSONALIZED TO YOUR FAMILY
Answer a few questions about your children and parenting goals, and we'll create a personalized learning path just for you.

📚 13 COMPREHENSIVE LESSONS
• What Changed Parenting Science
• Understanding Happiness Chemicals
• The Long-Term Unhappiness Chemical
• The Long-Term Happiness Chemical
• Labeling Emotions
• Naming Our Emotions
• Sprinklers: Building Deep Bonds
• Emotional Sandbags
• Communication Mistakes to Avoid
• Helping Someone Process Emotions
• Understanding Dissociation
• Serve and Return Techniques
• Recording Deep Bond Moments

✨ WHY KINDERWELL WORKS
✓ Based on peer-reviewed research
✓ Practical strategies for real-life situations
✓ Short lessons (5-15 minutes each)
✓ Progress tracking across devices
✓ Evidence-based techniques proven to work

👨‍👩‍👧‍👦 FOR ALL PARENTS
Whether you're expecting, have a newborn, toddler, school-age child, or teenager—Kinderwell adapts to your family's unique needs.

💡 WHAT YOU'LL LEARN
• How to regulate your child's emotions effectively
• The science of bonding and secure attachment
• Communication techniques that actually work
• How to avoid common parenting mistakes
• Building emotional intelligence in your children
• Creating lasting positive change in your family
• Understanding your child's brain development

🔒 YOUR DATA, YOUR PRIVACY
We take your privacy seriously. Your data is encrypted and securely stored. You can delete your account and all data anytime in Settings.

📈 TRACK YOUR PROGRESS
See how far you've come with our progress tracking system. Complete lessons at your own pace and revisit them whenever you need a refresher.

💝 SUBSCRIPTION OPTIONS
• Monthly: $12.99/month
• Annual: $69.99/year (save 55%!)
• Cancel anytime in your Apple Account Settings
• Restore purchases on multiple devices

EVIDENCE-BASED CONTENT
Our lessons are built on decades of research in:
• Attachment theory
• Child development psychology
• Neuroscience and brain development
• Behavioral science
• Emotional intelligence research

START YOUR JOURNEY TODAY
Download Kinderwell and transform the way you parent. Join thousands of parents building stronger, healthier relationships with their children.

---
Privacy Policy: https://mandeepv.github.io/kinderwell-legal/privacy.html
Terms of Service: https://mandeepv.github.io/kinderwell-legal/terms.html
Support: kinderwellteam@gmail.com
```

**Save this description** - you'll paste it into App Store Connect later.

---

### 5. Create App Store Screenshots (2 hours)

**Required:**
- Minimum 3 screenshots per device size
- Maximum 10 screenshots per device size
- Device sizes: 6.7" (iPhone 15 Pro Max), 6.5" (older large), 5.5" (older small)

**Recommended Screenshots:**
1. **Welcome/Splash Screen** - Show your branding
2. **Onboarding Question** - Show personalization
3. **Main Lesson Screen** - Show lesson content
4. **Lesson List** - Show all 13 lessons
5. **Progress/Quiz** - Show interactive elements

**How to Create:**

**Option A: Simple (Using Simulator)**
1. Run app in simulator: `npm start`
2. Select iPhone 15 Pro Max
3. Navigate to each screen
4. Press `CMD + S` to save screenshot
5. Repeat for other device sizes

**Option B: Professional (Using Tools)**
1. Take screenshots as above
2. Use https://www.appmockup.com/ (free)
3. Upload screenshots
4. Add device frames
5. Download final images

**Option C: With Text Overlays**
1. Use Figma (free) or Canva
2. Import screenshots
3. Add text overlays explaining features
4. Export as PNG

**Save all screenshots** - you'll upload them to App Store Connect later.

---

## ⏸️ WAITING FOR APPLE DEVELOPER APPROVAL

These tasks require your Apple Developer account to be approved first:

### 6. Configure Apple Sign-In in Supabase (45 minutes)

1. **Create App Identifier**
   - Go to https://developer.apple.com/account/
   - Certificates, Identifiers & Profiles → Identifiers → **"+"**
   - App IDs → Bundle ID: `com.kinderwell.app`
   - Enable: Sign in with Apple, In-App Purchase

2. **Create Services ID**
   - Identifiers → **"+"** → Services IDs
   - Identifier: `com.kinderwell.app.auth`
   - Configure Sign in with Apple:
     - Domain: `zqwzdyjfxytvedghujsd.supabase.co`
     - Return URL: `https://zqwzdyjfxytvedghujsd.supabase.co/auth/v1/callback`

3. **Create Key**
   - Keys → **"+"** → Sign in with Apple
   - Download .p8 file (ONLY ONCE!)
   - Note Key ID and Team ID

4. **Add to Supabase**
   - Authentication → Providers → Apple
   - Paste: Services ID, Team ID, Key ID, Private Key (.p8 contents)
   - Save

---

### 7. Create App in App Store Connect (15 minutes)

1. Go to https://appstoreconnect.apple.com
2. My Apps → **"+"** → New App
3. Fill in:
   - Name: `Kinderwell`
   - Bundle ID: `com.kinderwell.app`
   - SKU: `kinderwell-app`
   - Primary Language: English
4. Create

---

### 8. Create Subscription Products (30 minutes)

1. **Create Subscription Group**
   - In-App Purchases → Subscriptions
   - Create Group: "Kinderwell Premium"

2. **Monthly Subscription**
   - Product ID: `com.kinderwell.app.monthly` (MUST MATCH SUPERWALL!)
   - Duration: 1 Month
   - Price: $12.99 USD
   - Display Name: "Monthly Plan"
   - Description: "Full access to all lessons. Renews monthly."

3. **Annual Subscription**
   - Product ID: `com.kinderwell.app.annual` (MUST MATCH SUPERWALL!)
   - Duration: 1 Year
   - Price: $69.99 USD
   - Display Name: "Annual Plan"
   - Description: "Full access to all lessons. Renews yearly. Save 55%!"

4. Submit both for review

---

### 9. Configure App Store Metadata (45 minutes)

In App Store Connect → Your App:

1. **App Information**
   - Name: Kinderwell
   - Subtitle: Science-Based Parenting
   - Category: Education
   - Secondary Category: Lifestyle

2. **Age Rating**
   - Complete questionnaire
   - Expected: 4+

3. **URLs**
   - Privacy Policy: https://mandeepv.github.io/kinderwell-legal/privacy.html
   - Support URL: mailto:kinderwellteam@gmail.com

4. **Description & Keywords**
   - Paste the description from Task 4 above
   - Paste keywords

5. **Screenshots**
   - Upload screenshots from Task 5 above

6. **App Review Information**
   - Sign-in required: Yes
   - Notes:
     ```
     Thank you for reviewing Kinderwell!

     SUBSCRIPTION INFO:
     - Paywall appears after onboarding
     - Monthly: $12.99/month | Annual: $69.99/year
     - Test in sandbox with test Apple ID

     TESTING INSTRUCTIONS:
     1. Complete 15-screen onboarding flow
     2. Sign in with Google or Apple
     3. Paywall will appear - test subscription purchase
     4. Access all 13 lessons after subscribing
     5. Test Settings > Restore Purchases
     6. Test Settings > Delete Account

     IMPORTANT NOTES:
     - All content is original and evidence-based
     - Privacy policy and terms accessible in Settings
     - Support: kinderwellteam@gmail.com
     ```

---

### 10. Build Production App (1-2 hours)

**Option A: EAS Build (Recommended)**
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
```

**Option B: Xcode**
1. Open project in Xcode
2. Product → Archive
3. Distribute App → App Store Connect

---

### 11. Test Subscriptions in Sandbox (1 hour)

1. **Create Sandbox Tester**
   - App Store Connect → Users and Access → Sandbox Testers
   - Add test email account

2. **Test on Device**
   - Settings → App Store → Sandbox Account → Sign in
   - Run your app
   - Complete onboarding
   - Test subscription purchase
   - Verify access to content
   - Test Restore Purchases in Settings

---

### 12. Test All Features End-to-End (1 hour)

- [ ] Google Sign-In works
- [ ] Apple Sign-In works
- [ ] Subscription purchase works
- [ ] Restore Purchases works
- [ ] All 13 lessons accessible
- [ ] Progress saves and syncs
- [ ] Account deletion works
- [ ] Privacy/Terms links work
- [ ] Support email opens

---

### 13. Upload Build to App Store Connect (15 minutes)

- Wait for build to process (5-60 minutes)
- Select build in App Store Connect
- Submit metadata if not done

---

### 14. Fill App Privacy Questionnaire (15 minutes)

**Data Collected:**
- ✅ Contact Info (Email Address)
  - Purpose: Account creation
  - Linked to user: Yes
- ✅ Identifiers (User ID)
  - Purpose: Authentication
  - Linked to user: Yes
- ✅ Usage Data (Product Interaction)
  - Purpose: App functionality (lesson progress)
  - Linked to user: Yes

---

### 15. Fill Export Compliance (5 minutes)

- Uses encryption: YES
- Exempt: YES (standard HTTPS)
- Select: "Uses encryption for authentication"

---

### 16. Submit for App Review! 🚀

1. Review all information
2. Click **"Submit for Review"**
3. Wait 24-72 hours for Apple review
4. Monitor email for questions
5. Respond quickly if needed

---

## 📊 CURRENT STATUS

### ✅ Done (25 items)
- All coding and infrastructure
- Google OAuth configured
- Legal documents published
- Support email created

### 🔴 To Do Now (5 items - ~4-5 hours)
1. Design Superwall paywall (30 min) - **CRITICAL**
2. Test Google Sign-In (15 min)
3. Test app thoroughly (1 hour)
4. Write App Store description (45 min)
5. Create screenshots (2 hours)

### ⏸️ Waiting for Apple (11 items - ~6-8 hours)
6. Configure Apple Sign-In
7. Create app in App Store Connect
8. Create subscription products
9. Configure app metadata
10. Build production app
11. Test subscriptions in sandbox
12. Test all features end-to-end
13. Upload build
14. Fill privacy questionnaire
15. Fill export compliance
16. Submit for review

---

## ⏱️ TIME ESTIMATES

- **Available Now:** 4-5 hours
- **After Apple Approval:** 6-8 hours
- **Apple Review:** 1-3 days
- **Total to Launch:** ~2-4 days of work + review time

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Design paywall** in Superwall (30 min) - DO THIS FIRST!
2. **Test Google Sign-In** while app is running (15 min)
3. **Write App Store description** (save for later upload)
4. **Create screenshots** (save for later upload)
5. **Wait for Apple Developer approval email**
6. **Continue with tasks 6-16** once approved

---

## 📞 SUPPORT

**Questions?** Check:
- `CODING_COMPLETE.md` - What was built
- `SETUP_GUIDE.md` - Detailed setup instructions
- Email: kinderwellteam@gmail.com

**You're almost there! Just a few configuration steps left.** 🚀
