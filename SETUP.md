# Home HQ — Setup Guide

This guide walks you through everything from scratch. No coding experience assumed.
Budget about **45–60 minutes** with a coffee.

---

## What you'll end up with

A private website (like `home-hq-yourname.vercel.app`) that only you and Jenna
can log into, accessible from any phone or browser.

---

## Overview of steps

1. Install the tools you need on your computer
2. Download the app code
3. Create a Firebase account (the database that powers the app)
4. Create a Vercel account (the service that hosts the website)
5. Connect everything and deploy
6. Add the app to your phones

---

## Step 1 — Install tools on your computer

You need two programs: **Node.js** (runs the app) and **Git** (downloads the code).

### Install Node.js
1. Go to [nodejs.org](https://nodejs.org)
2. Click the big **"LTS"** download button (LTS = stable version)
3. Open the downloaded file and click through the installer (all defaults are fine)
4. To verify it worked: open **Terminal** (press `Cmd+Space`, type "Terminal", press Enter)
   and type `node --version` then press Enter. You should see something like `v20.x.x`

### Install Git
Git is likely already installed on your Mac. Open Terminal and type `git --version` then press Enter.
If not installed, a popup will appear offering to install it — click **Install** and follow the prompts.

---

## Step 2 — Download the app code

1. Open **Terminal** (press `Cmd+Space`, type "Terminal", press Enter)

2. Navigate to where you want to save the project. For example, your Desktop:
   ```
   cd Desktop
   ```

3. Download the code:
   ```
   git clone https://github.com/dbbirds/CodeAc.git
   ```

4. Move into the project folder:
   ```
   cd CodeAc
   ```

5. Install the app's dependencies (this downloads all the packages it needs):
   ```
   npm install
   ```
   This may take 1–2 minutes. You'll see a lot of text scroll by — that's normal.

---

## Step 3 — Create a Firebase project (your database)

Firebase is Google's free service that stores your chores, grocery lists, and
projects, and handles login. The free tier is more than enough for a 2-person app.

### Create your account and project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Sign in with a Google account (either yours or a shared one)
3. Click **"Add project"**
4. Name it `home-hq` (or anything you like)
5. When asked about Google Analytics, click **"Continue"** then **"Create project"**
6. Wait about 30 seconds, then click **"Continue"**

### Turn on Google Sign-In (so you and Jenna can log in)

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click on **"Google"** in the Sign-in providers list
4. Toggle **"Enable"** to on
5. Enter your email in the "Project support email" field
6. Click **"Save"**

### Create the database (Firestore)

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"** → click **"Next"**
4. Choose a server location close to you (e.g. `us-east1` if you're in the US) → click **"Enable"**
5. Wait about 30 seconds for it to set up

**Now set the security rules** (this controls who can access data):
1. Click the **"Rules"** tab at the top
2. Replace everything in the box with this:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Click **"Publish"**

### Turn on Storage (for project photos)

1. In the left sidebar, click **"Storage"**
2. Click **"Get started"**
3. Click **"Next"** on the rules screen, then **"Done"**
4. Click the **"Rules"** tab
5. Replace everything with this:
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
6. Click **"Publish"**

### Get your Firebase config keys

These are like a password that connects your app to your database.

1. Click the **gear icon** (⚙) near "Project Overview" in the left sidebar
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** and click the **`</>`** (Web) icon
4. Enter any name (e.g. `home-hq-web`) and click **"Register app"**
5. You'll see a block of code that looks like this:
   ```
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "home-hq-12345.firebaseapp.com",
     projectId: "home-hq-12345",
     storageBucket: "home-hq-12345.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
6. **Leave this browser tab open** — you'll copy these values in Step 5

---

## Step 4 — Create a Vercel account (your website host)

Vercel is the service that makes your app available on the internet. Free for personal use.

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** and choose **"Continue with GitHub"**

   > If you don't have a GitHub account: go to [github.com](https://github.com),
   > click "Sign up", create a free account, then come back to Vercel.

3. Authorize Vercel to access your GitHub account
4. When asked what you're building, you can skip/dismiss those questions

---

## Step 5 — Set up your environment file

This file stores your secret keys locally so the app knows how to connect to Firebase.

1. In your project folder, find the file called `.env.local.example`
2. Make a copy of it and name the copy `.env.local` — run this in Terminal:
   ```
   cp .env.local.example .env.local
   ```
3. Open `.env.local` in a text editor. The easiest free option is
   [VS Code](https://code.visualstudio.com) — download it, then from Terminal run:
   ```
   open -a "Visual Studio Code" .env.local
   ```
   Or just open it in TextEdit: `open -e .env.local`
4. Fill in your Firebase values from the tab you left open in Step 3:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=paste_your_apiKey_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=paste_your_authDomain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=paste_your_projectId_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=paste_your_storageBucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=paste_your_messagingSenderId_here
   NEXT_PUBLIC_FIREBASE_APP_ID=paste_your_appId_here
   ```

   Replace everything after the `=` with the values from Firebase (no quotes needed).

5. For the Google Calendar line, leave it blank for now — you can add it later:
   ```
   NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL=
   ```

6. Save the file.

---

## Step 6 — Deploy to Vercel and get your live URL

### Push your code to GitHub (Vercel needs this to deploy)

1. Go to [github.com](https://github.com) and click **"New"** to create a new repository
2. Name it `home-hq`, set it to **Private**, and click **"Create repository"**
3. Back in Terminal (in the CodeAc folder), run these commands
   one at a time (replace `YOUR_GITHUB_USERNAME` with your actual GitHub username):
   ```
   git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/home-hq.git
   git push -u origin main
   ```
   It may ask for your GitHub username and password. For the password, use a
   **Personal Access Token** (not your regular password):
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
   - Check the "repo" scope → Generate → Copy the token and use it as your password

### Deploy on Vercel

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Click **"Add New…"** → **"Project"**
3. Find your `home-hq` repository and click **"Import"**
4. Before clicking Deploy, click **"Environment Variables"** and add each variable
   from your `.env.local` file one by one:
   - Name: `NEXT_PUBLIC_FIREBASE_API_KEY` / Value: your actual key
   - Repeat for all 6 Firebase variables
   - Add `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL` with an empty value for now
5. Click **"Deploy"**
6. Wait about 2 minutes. You'll see a progress bar and then a success screen.

### Your live URL

After deployment, Vercel shows you a URL like:
```
https://home-hq-yourname.vercel.app
```
**That's your app!** Open it, sign in with Google, and start using it.
Share this URL with Jenna so she can sign in too.

> You can set a custom domain later in Vercel → Project → Settings → Domains
> if you want something like `homehq.com`.

---

## Step 7 — Allow Jenna's Google account

By default Firebase lets any Google account sign in. To lock it down to just
the two of you:

1. Go to Firebase Console → **Authentication** → **Users**
2. After Jenna signs in for the first time, you'll see her email appear here
3. If you ever want to remove someone's access, you can delete them from this list

---

## Step 8 — Set up Google Calendar (optional, do later)

1. Go to [calendar.google.com](https://calendar.google.com) on a desktop browser
2. On the left side, click **"+"** next to "Other calendars" → "Create new calendar"
3. Name it "Home HQ" → click **"Create calendar"**
4. Share it with Jenna: click the three dots next to the new calendar → Settings →
   "Share with specific people" → add Jenna's email
5. Click the three dots again → Settings → scroll down to **"Integrate calendar"**
6. Copy the **"Embed code"** — it looks like `<iframe src="https://calendar.google.com/...">`
7. Copy just the URL inside the quotes (starting with `https://`)
8. Go to Vercel → your project → Settings → Environment Variables
9. Edit `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL` and paste the URL
10. Go to Vercel → Deployments → click **"Redeploy"** for the change to take effect

---

## Step 9 — Add to your iPhones' home screens

This makes the app feel like a native app — tap an icon and it opens full screen.
Do this on both your phone and Jenna's.

1. Open **Safari** (must be Safari, not Chrome)
2. Go to your Vercel URL
3. Tap the **Share** button (the box with an arrow pointing up, at the bottom of the screen)
4. Scroll down and tap **"Add to Home Screen"**
5. Name it "Home HQ" → tap **"Add"**

The app icon will appear on the home screen like any other app.

---

## Troubleshooting

**"Permission denied" when signing in:**
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel URL (e.g. `home-hq-yourname.vercel.app`) and click Save

**Changes I make in the app aren't showing on Jenna's phone:**
- This is a real-time app — changes should appear within 1–2 seconds automatically.
  If not, try refreshing the page.

**The app looks broken after deploying:**
- Check that all 6 Firebase environment variables are set correctly in Vercel.
  Vercel → Project → Settings → Environment Variables

---

## Running locally (if you ever want to test changes on your computer)

```
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.
Press `Ctrl+C` in Terminal to stop it (yes, `Ctrl` not `Cmd` — this one's the exception).
