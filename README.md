# Rohan Mia — Portfolio & Dynamic Content System

A production-ready personal portfolio and administrative management platform built with Next.js App Router, React 19, TypeScript, and PostgreSQL.

---

## Overview

This project serves as both a high-performance public portfolio and an integrated content management platform. The application features server-side rendering for optimal performance and SEO, paired with a protected administrative interface for real-time site management and an integrated conversational AI copilot.

---

## Features

- **Dynamic Content Engine**: Complete management of projects, technical competencies, experience timeline, and site configuration through a unified administrative control room.
- **AI Copilot (Aru)**: Context-aware conversational assistant powered by Google Gemini, capable of answering visitor inquiries and assisting administrators.
- **Real-Time Updates**: Instant activity feeds and notifications driven by Pusher Channels.
- **Responsive Architecture**: Fluid layouts, reactive theme accents, and custom interactive micro-interactions built with Framer Motion and smooth scrolling.
- **Secure Access Control**: Protected administrative routes and secure session handling using NextAuth.js and bcrypt encryption.
- **Media Management**: Cloudinary integration for remote image storage, asset optimization, and interactive cropping.

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Neon Serverless) |
| **Styling** | Tailwind CSS v4, Vanilla CSS Design System |
| **Animation** | Framer Motion, Lenis Smooth Scroll |
| **Authentication** | NextAuth.js (v5 Beta) |
| **AI Integration** | Google Generative AI (Gemini) |
| **Real-Time** | Pusher Channels |
| **Asset Storage** | Cloudinary |

---

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- PostgreSQL database instance (local or hosted, e.g., Neon)
- npm, pnpm, or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rohan-bhau/rohanmia.git
   cd rohanmia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` or `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require

   # Authentication
   AUTH_SECRET=your_auth_secret_key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your_secure_password

   # Site Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # AI Assistant
   GEMINI_API_KEY=your_gemini_api_key

   # Cloudinary (Media Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Pusher (Real-Time Events)
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
   NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server |
| `npm run build` | Compiles and builds optimized production bundle |
| `npm run start` | Runs the compiled production build locally |
| `npm run lint` | Executes ESLint to check code quality and syntax |

---

## Project Structure

```text
rohanmia/
├── public/                 # Static assets and icons
├── src/
│   ├── actions/            # Next.js Server Actions (PostgreSQL operations)
│   ├── app/                # App Router (pages, layouts, API endpoints)
│   │   ├── (private)/      # Protected administrative control room
│   │   ├── (public)/       # Public portfolio routes
│   │   └── api/            # Route handlers & webhook endpoints
│   ├── components/         # Reusable UI, layout, theme, and admin modules
│   │   ├── admin/          # Management studio components
│   │   ├── ai/             # Conversational AI assistant interface
│   │   ├── layout/         # Navigation, footers, pinned controls
│   │   ├── shared/         # Universal UI utilities and feedback components
│   │   └── theme/          # Dynamic palette and theme providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Database pool, Cloudinary, Pusher, and utilities
│   ├── types/              # TypeScript definitions and database schemas
│   └── middleware.ts       # Route guards and authentication edge handler
├── package.json
└── tsconfig.json
```

---

## Author

**Rohan Mia**
- GitHub: [@rohan-bhau](https://github.com/rohan-bhau)

