# Home HQ — Setup Guide

## What you need to set up (one-time, ~20 minutes)

---

### 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (e.g. "home-hq")
2. Enable **Google Analytics** → skip (not needed)

#### Authentication
- Sidebar → **Authentication** → Get started → **Google** → Enable → Save
- Under **Settings → Authorized domains**, add your Vercel URL once deployed

#### Firestore Database
- Sidebar → **Firestore Database** → Create database → **Production mode** → Choose a region close to you

Paste these security rules (Firestore → Rules tab):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only signed-in users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage (for project photos)
- Sidebar → **Storage** → Get started → Production mode

Paste these storage rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Get your Firebase config
- Project Settings (gear icon) → General → **Your apps** → Add app → Web → Register
- Copy the `firebaseConfig` values

---

### 2. Set up Resend (for email reminders)

1. Go to [resend.com](https://resend.com) and create a free account
2. Verify your domain (or use Resend's free test domain)
3. Create an API key

---

### 3. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

For the Firebase Admin SDK (used by the email reminder API):
- Firebase Console → Project Settings → **Service accounts** → Generate new private key
- Download the JSON file and extract `project_id`, `client_email`, `private_key`

Add these additional variables to `.env.local`:
```
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

CRON_SECRET=choose_a_random_secret_string
```

---

### 4. Set up Google Calendar embed

1. Go to [calendar.google.com](https://calendar.google.com) on desktop
2. Create a new calendar called "Home HQ" and share it with Jenna's Google account
3. Open that calendar's **Settings** → **Integrate calendar**
4. Copy the iframe `src` URL and add it to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL=https://calendar.google.com/calendar/embed?src=...
   ```

---

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

- Follow the prompts to link your project
- Add all your `.env.local` variables in Vercel Dashboard → Settings → Environment Variables
- Update `vercel.json` with your actual `CRON_SECRET`

---

### 6. Add to your phone home screen

**iPhone (Safari):**
- Open the app URL → Share → "Add to Home Screen"

**Android (Chrome):**
- Open the app URL → Menu (⋮) → "Add to Home Screen"

---

### 7. Let Jenna in

Once deployed, share the URL with Jenna. When she opens it and signs in with Google, she'll have full access to all tabs automatically.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
