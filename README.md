# 🚀 Portfolio

A high-fidelity, cyber-futuristic portfolio ecosystem built with **Next.js 15**, **MongoDB**, and **Framer Motion**. This project features a sophisticated administrative dashboard (CMS), real-time data synchronization, and a cinematic UI design.

## ✨ Key Features

- **🛡️ Secure Admin Control Center**: A full-featured CMS to manage projects, technical stacks, and site content without touching the code.
- **⚡ Real-time Synchronization**: Instant updates across the public portfolio when changes are made in the admin dashboard.
- **🎨 Cinematic UI/UX**: Ultra-modern design with glassmorphism, holographic glows, and fluid animations.
- **📊 Technical Matrix**: Dynamic tech stack showcase with official brand colors and proficiency tracking.
- **📱 Fully Responsive**: Optimized for all devices, from ultra-wide monitors to mobile screens.
- **🤖 AI Integration Ready**: Built-in architecture for AI-assisted interactions.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Next.js Server Actions, MongoDB with Mongoose ODM.
- **Authentication**: NextAuth.js / BetterAuth.
- **Styling**: Vanilla CSS with Tailwind utilities, Glassmorphism design system.
- **Deployment**: Optimized for Vercel.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- MongoDB Database (Local or Atlas)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rohan-bhau/rohanmia.git
   cd portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add your credentials:
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_SECRET=your_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # Reusable UI Components (Admin & Home)
├── actions/        # Server Actions (Database logic)
├── models/         # Mongoose Models (Schemas)
├── lib/            # Utility functions & Shared configurations
└── styles/         # Global styles & Design tokens
```

## 👨‍💻 Author

**Rohan Mia**
- **GitHub**: [@rohan-bhau](https://github.com/rohan-bhau)
- **LinkedIn**: [Rohan Mia](https://linkedin.com/in/rohan-mia)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Engineered with precision and passion.*
