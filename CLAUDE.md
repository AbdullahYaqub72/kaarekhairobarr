# Kaare Khair o Barr

Web app for Kaare Khair o Barr, a welfare NGO run from UET Lahore, Pakistan. The project is being rebuilt step by step. Requirements are introduced incrementally, so build only what has been asked for, and keep it consistent with the rules below.

The repo root is the Next.js app. There is no `frontend/` subfolder.

**Stack:** Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS 3, Firebase Firestore, react-hook-form, Recharts, lucide-react, react-hot-toast.

---

## Mobile-first design (non-negotiable)

Most users open this app on a phone. **Every public-facing screen is designed for mobile first.** Desktop is an enhancement, not the starting point.

- **Start at 360–430px wide.** Unprefixed Tailwind classes are the mobile styles. Add `sm:` / `md:` / `lg:` only to enhance for larger screens. Never design desktop-first and then shrink it.
- **Don't squeeze data onto the screen.** Give each section one primary idea. Show the key number or summary, and put the details behind tap-to-expand, a "View all" link or a separate page. When in doubt, show less.
- **Single column by default.** Use multi-column layouts only from `md:` up.
- **Touch, not mouse.**
  - Tap targets are at least 44×44px, with enough space between them.
  - Never hide an action or information behind hover only.
- **Thumb-friendly.**
  - Primary actions are easy to reach, and buttons are full-width on mobile.
  - No wide tables on public pages. Use stacked cards instead.
- **Readable text.**
  - Form inputs are at least 16px, which prevents iOS zoom.
  - No tiny text for important figures.
  - Keep line lengths comfortable.
- **Charts on mobile:** keep them simple, with few series and clear labels. Let them scroll horizontally rather than cramming in.
- **Keep pages light.**
  - Lazy-load heavy parts, such as charts and large lists.
  - Optimise images.
  - Avoid large client bundles on public pages.
- **Check every UI change at 375px width first,** then tablet and desktop.

### Exception: the admin dashboard
Routes under `src/app/(admin)/` (currently `/goals`) are used on **laptops and tablets**, at 768px and up. Denser layouts, tables and multi-column forms are fine there. Admin pages must still not break on a phone.

---

## Folder structure (`src/`)

The repo root also holds `public/` (static assets), `scripts/` (seed script), the Next/Tailwind/TS config, and `firebase.json` + `firestore.rules`.

```
app/                      Routes only. Keep page files thin.
  layout.tsx              Root: <html>/<body>, globals.css, Providers
  globals.css             Tailwind layers + shared component classes (.btn-*, .card, .container-custom)
  (public)/               Mobile-first public pages (layout = Header + Footer)
    page.tsx              /
    statistics/page.tsx   /statistics
  (admin)/                Tablet/laptop admin pages (own layout)
    goals/page.tsx        /goals
components/               Shared, feature-agnostic UI
  layout/                 Header, Footer
  shared/                 BrandLogo, SectionHeading
  providers/              Providers (toasts, future contexts)
  ui/                     Design-system primitives (Button, Card, Input, …)
features/<domain>/        Domain UI, grouped by feature
  components/             home, statistics, admin, goals, campaigns, events, testimonials
services/                 Data access (Firestore reads/writes). UI never talks to Firestore directly.
lib/                      Infrastructure and helpers (firebase client, admin-auth)
config/                   Static app config and constants (brand)
hooks/                    Shared React hooks
types/                    Shared TypeScript types
```

Conventions:
- **Route files stay thin.** A `page.tsx` exports `metadata` and renders a component from `features/`.
- **Where new code goes:**
  - Code used by one domain goes in `features/<domain>/`.
  - Code used by several domains goes in `components/`, `hooks/` or `lib/`.
  - A new feature gets its own `features/<domain>/` folder. Add `hooks/`, `services/` or `types/` subfolders inside it when they're only used by that feature.
- **Import with the `@/` alias,** for example `@/features/goals/components/MonthlyGoalCard`. Don't use relative `../` imports across folders.
- **Mark client components** (`'use client'`) only where interactivity is needed.

---

## Commands (run at the repo root)

```bash
npm run dev          # http://localhost:3000
npm run build
npm run type-check
npm run lint
node scripts/seed-firestore.mjs   # seed Firestore with starter data
```

Environment: `.env.local`. Git ignores it; copy `.env.example`. Firebase is disabled unless `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `NEXT_PUBLIC_FIREBASE_APP_ID` are all set.

---

## Known caveats
- **Admin auth is a placeholder.**
  - The credentials are hardcoded and checked only in the browser (`src/lib/admin-auth.ts`).
  - The way in is to tap the header logo 5 times within 5 seconds, which opens `/goals`.
  - Replace this with Firebase Auth before going live.
- **Firestore writes are unauthenticated.** They use the REST API with the public key (`src/lib/firebase.ts`), so the database rules must allow them for now.
- **`src/services/api.ts` is legacy and unused.** It's an axios client for a backend that doesn't exist. It's a candidate for removal.
- **`FRONTEND_SETUP.md` is outdated.** This file is the source of truth.
