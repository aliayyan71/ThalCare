# 🩸 ThalCare

ThalCare is a mobile application built with **React Native** to improve the quality of life for thalassemia patients by simplifying healthcare management and connecting patients with blood donors. The app aims to provide an accessible digital platform where patients can securely manage their health information while enabling donors to support the thalassemia community more effectively.

> **Status:** 🚧 Active Development V2.0

## 📱 Demo

https://github.com/user-attachments/assets/7de2d1ce-487e-4157-b144-6e68886c985d

## ✨ Features

### ✅ Authentication

* Secure user registration and login
* Firebase Authentication integration
* Password reset via email

### ✅ User Profiles

* Cloud Firestore integration
* Secure profile storage
* Separate profile data for different user roles

### ✅ Role-Based Experience

Users choose their role during onboarding:

* 🩸 **Patient**
* ❤️ **Blood Donor**

Each role is provided with its own dedicated dashboard and user experience.

### ✅ Dashboards

#### Patient Dashboard

* Personalized patient interface
* Foundation for future appointment tracking, transfusion history, medication reminders, and health monitoring

#### Donor Dashboard

* Dedicated donor interface
* Designed for future blood donation requests, donation history, and patient matching

## 🛠️ Tech Stack

### Frontend

* React Native
* TypeScript
* React Navigation

### Backend & Services

* Firebase Authentication
* Cloud Firestore

## 📱 Current App Flow

```
Splash Screen
      │
      ▼
 Login / Register
      │
      ▼
 Account Type Selection
(Patient / Blood Donor)
      │
      ▼
 Create Profile
      │
      ▼
Role-Based Dashboard
```

## 🚀 Planned Features

* Blood donation request system
* Intelligent donor matching
* Blood compatibility checking
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

More healthcare-focused features are actively being developed.

---

Made with ❤️ to improve thalassemia patient care.
