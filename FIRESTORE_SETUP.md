# Firestore setup

1. In the Firebase console for this project, create a **Cloud Firestore** database in production mode.
2. Deploy the rules in `firestore.rules` before testing profile creation. Do not use Firebase's test-mode rules in production.

With the Firebase CLI installed and authenticated:

```powershell
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

The app writes private profile documents to `profiles/{uid}`. Only the signed-in owner can read or write those documents.

For donor matching, it also writes a minimal `donorDirectory/{uid}` record containing only the Firebase UID, account type, and blood group. It intentionally excludes name, phone number, treating hospital, emergency contact, and all other medical details. Future donation requests should be mediated by a trusted server or Cloud Function before revealing contact information.
