# ThalCare

ThalCare is a React Native (Expo) mobile application designed to help thalassemia patients manage their healthcare journey. The app aims to simplify patient access to essential health information, appointments, and reminders through a clean, user-friendly interface.

> This repository currently contains **Version 1**, which focuses on user authentication and project structure.

---

## Features

### Authentication

- Firebase Email & Password Authentication
- User Registration
- User Login
- Password Reset via Email
- Secure Logout

### User Interface

- Splash Screen
- Login Screen
- Registration Screen
- Forgot Password Screen
- Home Screen (Placeholder)

### Architecture

- React Native (Expo)
- Firebase Authentication
- React Navigation
- Reusable Components
- Form Validation

---

## Tech Stack

- React Native
- Expo
- Firebase Authentication
- React Navigation
- JavaScript

---

## Project Structure

```
src/
│
├── components/
│   ├── ThalCareLogo
│   ├── WaveFooter
│   ├── AuthTextInput
│   └── PrimaryButton
│
├── screens/
│   ├── Splash
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── Home
│
├── navigation/
│   ├── Auth Stack
│   └── Main Stack
│
├── services/
│   └── Firebase Authentication
│
├── utils/
│   └── Form Validation
│
└── constants/
    └── Theme
```

---

## App Flow

```
Splash Screen
      │
      ▼
Login ◄──────────── Register
  │                    │
  └──────────┬─────────┘
             ▼
      Authentication
             ▼
           Home
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ThalCare.git
```

Navigate to the project

```bash
cd ThalCare
```

Install dependencies

```bash
npm install
```

Start Expo

```bash
npx expo start
```

---

## Firebase Setup

Create a Firebase project and enable:

- Email/Password Authentication

Create a Firebase configuration file and add your project credentials.

---

## Current Version

### v1

- Splash Screen
- Login
- Registration
- Password Reset
- Firebase Authentication
- Home Placeholder

---

## Planned Features

- Patient Dashboard
- Blood Transfusion Schedule
- Appointment Tracking
- Medication Reminders
- Notifications
- Urdu Language Support
- Voice Assistance
- Hospital Locator
- Medical Records
- AI Health Assistant
- Emergency Contacts

---

## License

This project is licensed under the MIT License.
