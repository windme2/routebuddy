# ✈️ RouteBuddy

A comprehensive web application designed to solve the complexities of group travel.  
It reflects a modern approach to itinerary building, activity tracking, budget management, and smart expense splitting—all in one place.

---

## ⚙️ Tech Stack

- **Frontend:** Next.js (App Router), React, TailwindCSS, Framer Motion
- **Backend:** Next.js Server Actions & API Routes
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** NextAuth.js (Auth.js)
- **State Management:** Zustand
- **Other Tools:** UploadThing (Images), React Leaflet (Maps), Lucide React (Icons)

---

## ✨ Features

### 🗺️ Trip Management & Itinerary

- 📝 Create and manage upcoming and past trips with drag-and-drop sortable lists.
- 🗂️ Log daily activities categorized by Transport, Accommodation, Food, Attractions, and Shopping.
- 🗺️ Plan travel pins out using integrated interactive mapping (Leaflet).
- 🖼️ Securely upload and manage trip photos in a shared gallery (UploadThing).

### 💰 Smart Expense Sharing

- 📊 Track group expenses across multiple currencies with automatic conversion to THB.
- 🔄 Advanced bill splitting algorithms calculate exactly who owes what amount (Debt Netting).
- 🧾 Attach and verify transfer slips for easy settlement tracking.

### 🎨 UI/UX

- 🖥️ Modern, clean design with TailwindCSS
- 📱 Fully responsive layout for all devices (Mobile-first approach)
- ⚡ Smooth animations and interactive elements using Framer Motion
- 🎯 Dynamic state interactions with Radix UI primitives

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL Database URL
- UploadThing Account (for image uploads)

### Clone the repository

```bash
git clone https://github.com/windme2/routebuddy.git
cd routebuddy
```

### Install dependencies

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/routebuddy"

# NextAuth Config (Use `npx auth secret` to generate)
AUTH_SECRET="your_secure_auth_secret_here"
AUTH_URL="http://localhost:3000"

# UploadThing
UPLOADTHING_SECRET="your_uploadthing_secret"
UPLOADTHING_APP_ID="your_uploadthing_app_id"
```

### Database Initialization

```bash
# Push schema to database
npx prisma db push

# Seed initial data (Admin user + Sample trips)
npx prisma db seed
```

### Start development server

```bash
npm run dev  # Starts the application at http://localhost:3000
```

_Note: You can log in using the seed admin user (`admin` / `admin123`)._

### Build for production

```bash
npm run build
npm run start
```

---

## 🔧 Configuration

| File                   | Description                          |
| ---------------------- | ------------------------------------ |
| `next.config.ts`       | ⚡ Next.js application configuration |
| `tailwind.css`         | 🎨 TailwindCSS theme & utilities     |
| `tsconfig.json`        | 📘 TypeScript compiler options       |
| `eslint.config.mjs`    | 🔍 ESLint code quality rules         |
| `prisma/schema.prisma` | 🗄️ Database schema definitions       |

---

## 🔐 Security Features

- ✅ **Authentication:** Secure credential-based login with bcrypt hashing via Auth.js
- ✅ **Route Protection:** Complete App Router middleware protection (`proxy.ts`)
- ✅ **Type Safety:** End-to-end type safety with TypeScript and Prisma generated types
- ✅ **Data Validation:** Strict input validation and sanitization (Zod)

---

## 🌐 Core Structure

```bash
/src/app         # Next.js App Router (Pages, Layouts, APIs)
/src/components  # Reusable UI components & Dialogs
/src/lib         # Utility functions & Prisma client
/src/types       # Global TypeScript interfaces
/prisma          # DB Schema & Seed scripts
/public          # Static assets (Logos, SVGs)
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
