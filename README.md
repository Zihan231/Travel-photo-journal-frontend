# Travel Photo Journal - Frontend (Next.js)

Web client for the Travel Photo Journal platform. Built with Next.js (App Router, Turbopack, TypeScript) and custom Vanilla CSS. Connects to the NestJS backend to provide travel photo management, automatic OpenRouter AI description summaries, and two-factor authentication (2FA).

---

## Features & Page Structure

Each core feature lives in its own dedicated route:

- **`/` (Landing & Overview)**: Introduction to the journal features, quick jump to sign in or registration.
- **`/register` (User Sign Up)**: Registration form. Upon submission, triggers a 6-digit confirmation code email and forwards to `/verify-email`.
- **`/verify-email` (Email Verification)**: 6-digit code entry with instant auto-submission on 6th digit, animated spinner loader on resend, and an exact server-synchronized 60-second cooldown timer.
- **`/login` (Authentication & 2FA Step Transition)**: Email and password sign-in. If the account has two-factor authentication enabled, it dynamically transitions into the 2FA code step with automatic submission upon entering the 6-digit code.
- **`/photos` (Photo Gallery Feed)**: Grid view of the user's uploaded photos with Cloudinary images, destination tags, user notes, AI summary pills, and live search filtering.
- **`/photos/new` (Photo Upload)**: Drag-and-drop or file selector with instant client-side preview. Submits multipart/form-data directly to the API, triggering Cloudinary storage and OpenRouter AI summary generation.
- **`/photos/[id]` (Photo Detail)**: High-resolution image view with full travel notes, AI summary card, and metadata. Renders a clean minimal "Memory Not Found" fallback card if the photo does not exist.
- **`/photos/[id]/edit` (Photo Editing)**: Edit name, destination, notes, or optionally swap the image file. Updating the description automatically re-generates the AI summary.
- **`/security` (2FA Management)**: View current 2FA status, generate QR codes to scan with Google Authenticator or Authy, auto-submit 6-digit verification code, view 8 one-time recovery codes, and securely disable 2FA using account password + OTP.
- **`/health` & `/api/health` (Health Check Endpoints)**: Dynamic JSON endpoints returning service status, timestamp, and uptime for cloud platform health monitoring and keep-alive (e.g., Render).
- **`not-found.tsx` (404 Page)**: Minimal dark glassmorphic page for non-existent routes with quick navigation buttons.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Vanilla CSS with custom design tokens, dark glassmorphism, responsive grid layouts
- **Icons**: `lucide-react`
- **State & Networking**: React Context (`AuthContext`, `ToastProvider`), native `fetch` client
- **Branding**: High-res vector SVG favicon (`icon.svg`) and standard 32x32 ICO (`favicon.ico`)

---

## Project Setup

### 1. Prerequisites

- **Node.js**: v20+ recommended
- **Backend API**: The NestJS backend server running on `http://localhost:3000`

### 2. Environment Variables

Create a `.env.local` file in the frontend root:

```env
# URL of the backend API
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Installation

```bash
npm install
```

### 4. Running the Development Server

```bash
npm run dev
```

By default, Next.js will run on `http://localhost:3001` (or `3000` if the backend is on another port). Open the URL in your browser to start using the app.

### 5. Production Build

```bash
npm run build
npm run start
```

---

## Directory Layout

```
src/
├── app/
│   ├── layout.tsx            # Root Layout: Theme, AuthProvider, Navbar, Toasts, Favicon metadata
│   ├── not-found.tsx         # Global 404 page
│   ├── page.tsx              # Home & landing page
│   ├── icon.svg              # Vector favicon
│   ├── favicon.ico           # Standard binary favicon
│   ├── health/route.ts       # Health check endpoint (/health)
│   ├── api/health/route.ts   # Alternative health check endpoint (/api/health)
│   ├── login/page.tsx        # Login & 2FA verification flow (with 6-digit auto-submit)
│   ├── register/page.tsx     # Sign-up page
│   ├── verify-email/page.tsx # Email verification (auto-submit & 60s synced cooldown)
│   ├── photos/
│   │   ├── page.tsx          # Photo gallery with search
│   │   ├── new/page.tsx      # Upload photo (drag & drop, preview)
│   │   ├── [id]/
│   │   │   ├── page.tsx      # Photo detail view (with Memory Not Found fallback)
│   │   │   └── edit/page.tsx # Edit photo & update AI summary
│   └── security/page.tsx     # TOTP 2FA setup, QR code, recovery codes
├── components/
│   └── Navbar.tsx            # Responsive navigation header with branding
├── context/
│   └── AuthContext.tsx       # JWT token & user session management
├── lib/
│   ├── api.ts                # Backend REST API client
│   └── toast.tsx             # Toast notification system
└── styles/
    └── globals.css           # Glassmorphic CSS styling & design tokens
```
