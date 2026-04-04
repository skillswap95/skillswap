# 🚀 SkillSwap AI — Setup & Deployment Guide

**Stack:** React + Vite · Firebase Auth · Firestore · Firebase Realtime DB · Tailwind CSS
**Free deployment:** Vercel + Firebase Spark Plan (both 100% free)

---

## STEP 1 — Firebase Setup (~10 minutes)

### 1.1 Create Firebase Project
1. Go to https://console.firebase.google.com
2. "Add project" → name it `skillswap-ai` → Create
3. Enable **Authentication** → Sign-in method → Email/Password
4. Create **Firestore Database** → Start in test mode
5. Create **Realtime Database** → Start in test mode → Copy the Database URL

### 1.2 Get Config Keys
Firebase console → Gear icon → Project settings → "Your apps" → "</> Web"
Register app → copy the firebaseConfig object values

---

## STEP 2 — Local Setup

```bash
npm install
cp .env.example .env
# Paste your Firebase values into .env
npm run dev
# → runs at http://localhost:5173
```

---

## STEP 3 — Deploy on Vercel (Free)

1. Push to GitHub:
```bash
git init && git add . && git commit -m "SkillSwap AI"
git remote add origin https://github.com/YOUR_USER/skillswap-ai.git
git push -u origin main
```

2. Go to https://vercel.com → New Project → Import from GitHub
3. Add all VITE_ environment variables in Vercel project settings
4. Deploy → get your free URL like: skillswap-ai.vercel.app

---

## Environment Variables (.env)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Firestore Security Rules (after testing)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /matches/{matchId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Realtime Database Rules:
```json
{"rules": {"chats": {"$chatId": {".read": "auth != null", ".write": "auth != null"}}}}
```

---

## Features

- Multi-step signup with skill selection
- Smart matching algorithm (compatibility score)
- Browse & filter all users by skill
- Send match requests
- Real-time chat (Firebase Realtime DB)
- Learning progress tracker with roadmaps
- Full profile editing

## Commands
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview build locally
```
