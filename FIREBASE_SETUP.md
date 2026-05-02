# 🔥 Firebase Setup Instructions

## Quick Setup (5 minutes)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it: `arsh-portfolio-sync`
4. Disable Google Analytics (not needed)
5. Click "Create project"

### Step 2: Enable Firestore Database
1. In your Firebase project, click "Firestore Database" in left menu
2. Click "Create database"
3. Choose "Start in **test mode**" (for now)
4. Select location: Choose closest to you (e.g., asia-south1 for India)
5. Click "Enable"

### Step 3: Get Your Firebase Config
1. Click the gear icon ⚙️ (Project Settings)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register app name: `portfolio`
5. Copy the `firebaseConfig` object

### Step 4: Update script.js
Replace the firebaseConfig in `script.js` (line 4-11) with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 5: Set Firestore Rules (Security)
1. Go to Firestore Database
2. Click "Rules" tab
3. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{document=**} {
      allow read: if true;
      allow write: if true;
    }
    match /certificates/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

4. Click "Publish"

### Step 6: Deploy
```bash
git add .
git commit -m "Add Firebase real-time sync"
git push origin main
vercel --prod --yes
```

## ✅ Done!

Now when you:
- Add project on laptop → **Instantly appears on phone**
- Add project on phone → **Instantly appears on laptop**
- Delete/edit anywhere → **Syncs everywhere**

## 🔒 Security Note
The current rules allow anyone to read/write. For production, you should add authentication.
But for a personal portfolio, this is fine since only you have the admin password.

## 💡 Free Tier Limits
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage
- More than enough for a portfolio!
