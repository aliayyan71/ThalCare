# Firestore setup

1. In the Firebase console for this project, create a **Cloud Firestore** database in production mode.
2. Enable **Email/Password** under **Authentication → Sign-in method**.
3. Open **Firestore Database → Rules**, replace the rules with the complete contents of `firestore.rules`, then click **Publish**.

For the donor request query, create a composite index in **Firestore Database → Indexes** with collection ID `donationRequests`, fields `visibleToDonorGroups` (**Arrays contains**) and `status` (**Ascending**). If you use the Firebase CLI, `firebase deploy --only firestore` deploys both the included rules and index configuration.

The new publish is required for donor availability and donation requests; the old profile-only rules cannot authorize them.

## Collections and privacy boundaries

- `profiles/{uid}` holds the signed-in person's full onboarding profile. Only its owner can read or write it.
- `donorDirectory/{uid}` is the searchable donor index. It contains only a donor ID, blood group, availability state, and timestamp—never names, phone numbers, hospitals, emergency contacts, or email addresses.
- `donationRequests/{requestId}` holds a patient's active request and its required blood group. It is visible only to the patient and currently available donors whose blood type is compatible.
- `donationRequests/{requestId}/responses/{donorId}` holds an individual donor's accept/decline response. It is visible only to that donor and the requesting patient.

## Testing the flow

1. Create a donor account, complete onboarding, then turn **Available to donate** on from its dashboard.
2. In a separate patient account, tap **Need blood?**, select the requested blood group, and send the request.
3. Return to the available donor dashboard. A compatible request appears, with **Accept** and **Decline** actions.
4. Return to the patient dashboard to see the request and the number of accepted donor responses.

Donor identities and phone numbers are never displayed while matching. Once a donor explicitly accepts a request, the app creates a private, patient-specific contact grant and reveals only that donor's phone number to the requesting patient.
