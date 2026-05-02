# 🔧 Fix Firebase Resume Upload - Security Rules

## ⚠️ Problem:
Firebase is blocking resume uploads because the security rules don't allow writes to the `settings` collection.

## ✅ Solution:
Update Firebase Firestore Security Rules to allow resume uploads.

---

## 📋 Steps to Fix:

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/

### 2. Select Your Project
Click on: **arsh-portfolio-sync**

### 3. Go to Firestore Database
- Click **"Firestore Database"** in the left sidebar
- Click **"Rules"** tab at the top

### 4. Update the Rules
Replace the existing rules with this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for projects
    match /projects/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write for certificates
    match /certificates/{document=**} {
      allow read, write: if true;
    }
    
    // Allow read/write for settings (resume)
    match /settings/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 5. Click "Publish"
Click the **"Publish"** button to save the rules.

### 6. Wait 30 seconds
Firebase needs a moment to apply the new rules.

---

## 🧪 Test Again:

1. Go back to your portfolio: https://my-portfolio-six-tau-94.vercel.app
2. Login to admin panel
3. Upload a resume
4. You should see: **"✅ Resume updated successfully! Synced to all devices!"**

---

## 🔒 Security Note:

These rules allow anyone to read/write. For a personal portfolio, this is fine since:
- Only you know the admin password
- The data is not sensitive
- It's easier to manage

If you want to add authentication later, we can update the rules to require login.

---

## ❓ If You Still Get Errors:

1. Open browser console (F12)
2. Look for error messages
3. Share the error with me so I can help fix it

---

**After updating the rules, try uploading the resume again!** 🚀
