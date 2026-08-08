# 🩸 ThalCare

ThalCare is a mobile application built with **React Native** to improve the quality of life for thalassemia patients by simplifying healthcare management and connecting patients with blood donors. The app aims to provide an accessible digital platform where patients can securely manage their health information while enabling donors to support the thalassemia community more effectively.

> **Status:** 🚧 Active Development V3.0

## 📱 Demo

https://github.com/user-attachments/assets/1c44be61-b641-4b5f-840b-6f25436c5b69

## 🚀 Current Features

### 🔐 Authentication
- Patient and donor registration
- Firebase Authentication
- Login and account management
- Form validation

### 👤 Patient Profiles
- Patient-specific profiles stored in Firestore
- Blood group information
- Patient dashboard
- Personalized account information

### 🩸 Donor Profiles
- Donor-specific profiles
- Blood group information
- Donor dashboard
- Toggle availability to donate

### 📢 Blood Donation Requests

Patients can request blood directly through the application.

The current flow is:

1. Patient selects **Send a Request**
2. ThalCare identifies available donors with the required blood group
3. The request is sent to all eligible available donors
4. The patient can cancel the request before it is accepted
5. When a donor accepts the request, their phone number becomes visible to the patient
6. The patient can contact the donor directly

This creates a simple patient → donor connection without requiring patients to manually search for donors.

## 🛠️ Tech Stack

### Frontend

* React Native
* TypeScript
* React Navigation

### Backend & Services

* Firebase Authentication
* Cloud Firestore

## 📱 Current App Flow

```text
Splash Screen
      ↓
    Login
   ↙     ↘
Register   Account
     ↓
 Onboarding
   ↙     ↘
Patient   Donor
   ↓        ↓
Patient   Donor
Dashboard Dashboard
   ↓        ↓
Request   Toggle
Blood     Availability
   ↓
Available Eligible
Donors
   ↓
Send Request
   ↓
Donor Accepts
   ↓
Contact Donor
```

## 🚀 Planned Features

* Appointment scheduling
* Blood transfusion history
* Medication reminders
* Push notifications
* Emergency blood request alerts
* Hospital integration
* Urdu language support
* Voice-assisted interface
* Health tips and educational resources
* Dark mode
* Profile editing
* Admin dashboard

## 📂 Project Structure
```
src/
├── components/
├── config/
├── constants/
├── context/
├── navigation/
├── screens/
├── services/
├── types/
└── assets/
```

## 🎯 Vision

ThalCare aims to make thalassemia management more accessible by providing patients and donors with a unified digital platform. By combining secure authentication, personalized dashboards, and cloud-based data management, the application lays the foundation for future features that will improve patient care and encourage blood donation within the community.

## ⚙️ Getting Started

### Clone the repository

```bash
git clone https://github.com/aliayyan71/ThalCare.git
cd ThalCare
```

### Install dependencies

```bash
npm install
```

### Start Metro

```bash
npx react-native start
```

### Run Android

```bash
npx react-native run-android
```

### Run iOS

```bash
npx react-native run-ios
```

## 📌 Development Status

Current version includes:

* ✅ Firebase Authentication
* ✅ Account type onboarding
* ✅ Firestore profile storage
* ✅ Patient dashboard
* ✅ Donor dashboard
* ✅ Blood Donation Requests

More healthcare-focused features are actively being developed.

---

Made with ❤️ to improve thalassemia patient care.
