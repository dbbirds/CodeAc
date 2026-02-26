# Home HQ — Setup Guide

## What you need to set up (one-time, ~15 minutes)

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

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase values:

```bash
cp .env.local.example .env.local
```

---

### 3. Set up Google Calendar embed

1. Go to [calendar.google.com](https://calendar.google.com) on desktop
2. Create a new calendar called "Home HQ" and share it with Jenna's Google account
3. Open that calendar's **Settings** → **Integrate calendar**
4. Copy the iframe `src` URL and add it to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL=https://calendar.google.com/calendar/embed?src=...
   ```

---

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

- Follow the prompts to link your project
- Add all your `.env.local` variables in Vercel Dashboard → Settings → Environment Variables

---

### 5. Add to your phone home screen

**iPhone (Safari):**
- Open the app URL → Share → "Add to Home Screen"

**Android (Chrome):**
- Open the app URL → Menu (⋮) → "Add to Home Screen"

---

### 6. Let Jenna in

Once deployed, share the URL with Jenna. When she opens it and signs in with Google, she'll have full access to all tabs automatically.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
