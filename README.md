# Advanced Attendance Application

A cross-platform **Employee Attendance Management System** featuring a mobile app built with **React Native (Expo)** and a serverless API backend powered by **Cloudflare Workers** with **Cloudflare D1 (SQLite)**.

---

## 🚀 Features

- **QR Code Attendance System**: Employees scan QR codes for quick check-in and check-out.
- **Role-Based Access Control (RBAC)**:
  - **Employee View**: Track daily/monthly stats, attendance history, working hours, and submit leave applications.
  - **Admin Dashboard**: Manage employee profiles, review and approve/reject leave applications, and set holiday calendars.
- **Real-Time Analytics**: Automatic calculation of present/absent counts, late arrivals, and total working hours.
- **Cloud-Native & Serverless**: Fast API execution with Cloudflare Workers and serverless D1 SQLite database.

---

## 📁 Repository Structure

```text
.
├── apps/
│   ├── api-worker/      # Cloudflare Worker API & D1 SQLite Database Schema
│   │   ├── src/index.js # REST API routes (login, signup, checkin, checkout, stats)
│   │   ├── schema.sql   # D1 database initialization script
│   │   └── wrangler.toml # Cloudflare Wrangler configuration
│   │
│   └── mobile/          # React Native (Expo) Mobile Client
│       ├── src/
│       │   ├── screens/ # Auth (Login, Signup) & Main Screens (Home, Admin, Calendar, QR)
│       │   └── utils/   # Storage and API utilities
│       └── App.js       # Navigation & Entry point
│
├── .env.example         # Root environment variable template
├── .gitignore            # Git ignore configuration
└── package.json         # Workspace configuration
```

---

## 🛠️ Quick Start

### 1. Mobile App Setup (`apps/mobile`)

```bash
cd apps/mobile

# Install dependencies
npm install

# Start Expo dev server
npm start
```

### 2. Cloudflare Worker API Setup (`apps/api-worker`)

```bash
cd apps/api-worker

# Run locally
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
```

---

## 🔒 Environment Variables

Copy `.env.example` to `apps/mobile/.env` and update the backend URL if running your own worker instance:

```env
EXPO_PUBLIC_API_URL=https://your-worker.workers.dev
```

---

## 📄 License

This project is licensed under the MIT License.
