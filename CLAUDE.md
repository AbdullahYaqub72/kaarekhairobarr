# Kaar e Khair o Barr (KKB)

Members app for Kaar e Khair o Barr, a welfare NGO run from UET Lahore, Pakistan. The project is being rebuilt step by step. Requirements are introduced incrementally, so build only what has been asked for, and keep it consistent with the rules below.

The repo root is the Next.js app. There is no `frontend/` subfolder.

**Roles, permissions and workflows:** see [`docs/roles-and-workflows.md`](docs/roles-and-workflows.md). It is the source of truth for any sign-in, role, approval or task feature.

**Stack:** Next.js 14 (App Router), React 18, TypeScript (strict), Tailwind CSS 3, Firebase Auth + Firestore (via the Admin SDK on the server), zod, react-hook-form, lucide-react, react-hot-toast.

**Architecture in one paragraph:**
- **Sign-in:** the browser uses Firebase Auth (Google or email/password) only for signing in.
- **Data access:** every read and write goes through our Next.js API routes (`src/app/api/**`). They verify the user's ID token, check their status and role (`src/server/auth.ts`), and use the Firebase Admin SDK.
- **Firestore rules** deny all browser access (`firestore.rules`), so permissions live in one place: the server.
- **Screens:** they call the API with `api()` (`src/lib/api/client.ts`) or `useApi()` (`src/hooks/useApi.ts`).
- **Validation:** zod schemas in `src/lib/validation.ts` are shared by forms and routes.

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
Routes under `src/app/(admin)/` (`/admin/**`) are used on **laptops and tablets**, at 768px and up. Denser layouts, tables and multi-column forms are fine there. Admin pages must still not break on a phone.

---

## Brand & theme

The visual identity comes from KKB's email campaigns: navy, gold and white, with the gold calligraphy logo. **Use it for colours, logo, typography and component style only.** Layouts still follow the mobile-first rules above.

> These tokens are defined in `tailwind.config.js`, so use the class names (`bg-navy`, `text-gold-dark`, `border-line`, `shadow-card`, `rounded-card`, …), never raw hex values. Status colours (`success`, `warning`, `danger`, each with a `-bg` tint) are also defined there.

### Light and dark mode
The app follows the device's light/dark setting automatically.
- **How it works:** every token is a CSS variable. `src/app/globals.css` holds the light values on `:root` and the dark values under `prefers-color-scheme: dark`. The table above lists the light values.
- **Use the tokens and dark mode comes for free.** Don't add `dark:` classes.
- **Surfaces:** use `bg-surface`, not `bg-white`. Keep `bg-white`/`text-white` only on navy bands, where they mean "on navy".
- **"Navy" depends on how it's used:**
  - As text, border, ring or outline (`text-navy`, `border-navy`), it is brand ink: dark navy in light mode, light blue-white in dark mode.
  - As a background (`bg-navy`), it stays the navy brand band.
  - For navy text on **gold or white** backgrounds (gold pills, the gold button, white chips on navy), use the fixed `text-navy-deep`.
- **Fixed colours** (the same in both themes): `gold`, `onnavy` and `whatsapp`. On the bright WhatsApp green, use `text-whatsapp-on`.
- **Check both themes** when you change UI.

### Identity
- **Name:** Kaar e Khair o Barr, short form **KKB**. Use this spelling in new UI.
- **Urdu tagline:** اک قدم خیر کے لیے, which means "One step for good" (`BRAND_SLOGAN` in `src/config/brand.ts`). Render it with `dir="rtl"` in gold on navy.
- **Logo:** the Arabic-script calligraphy mark.
  - `public/brand/kkb-logo-gold.png` is the primary version, for navy backgrounds. It's only 240×166, so don't display it wider than about 120px until a higher-resolution or SVG version is available.
  - `public/kaare-khair-logo.png` is the same mark in white (500×500), for photos or busy backgrounds.
  - Always give the logo clear space, and never place it on a light background without a navy band behind it.
- **Contact:** kaarekhairobarr@gmail.com · Instagram `https://www.instagram.com/kaare_khair_o_barr` · LinkedIn `https://www.linkedin.com/in/kaare-khair-o-barr-688768384/`

### Colour tokens
| Token | Hex | Use |
|---|---|---|
| `navy` | `#0f2a5e` | Primary brand colour: header bands, primary buttons, headings on light backgrounds |
| `navy-light` | `#1a3d8f` | Links, accent borders (e.g. the left border on info callouts) |
| `navy-deep` | `#0b2050` | Footer background |
| `gold` | `#c9a84c` | Accent: badges, dividers, checkmarks, eyebrow labels and the tagline **on navy** |
| `gold-dark` | `#8a6d1f` | Gold-coloured **text on light backgrounds** (`gold` fails contrast there) |
| `ink` | `#2b2b2b` | Body text |
| `ink-soft` | `#3a3a3a` | Secondary body text inside panels |
| `muted` | `#666666` | Meta and helper text. The email used `#777`, which is slightly under 4.5:1 on white |
| `page` | `#eef1f6` | Page background behind cards |
| `surface` | `#ffffff` | Cards and main content |
| `panel` | `#fafbfd` + border `#eceff4` | Subtle grouped-info boxes and detail lists |
| `callout` | `#f4f6fa` | Info callouts (with a 3px `navy-light` left border) |
| `on-navy` | `#ffffff` / `#cdd6ea` | Headings / body text on navy |
| `whatsapp` | `#25d366`, bg `#f2fbf5`, text `#0a3d20` | **Only** for WhatsApp call-to-action blocks |

Contrast rules:
- Gold text only goes on navy, where it reads at 6–7:1. On white, gold is for decoration only (dividers, icons, checkmarks); use `gold-dark` or `navy` for text.
- Don't use the email footnote grey `#9aa3b5` for text on light backgrounds (2.2:1).

### Typography
- **Font:** clean sans-serif. The email used Arial/Helvetica; on the web, use a system stack or one sans web font. No serif display fonts in new UI.
- **Body:** 16px with a line-height of about 1.6, in `ink`.
- **Headings:** bold, in `navy` on light backgrounds and white on navy. Hero titles start around 21–24px on mobile.
- **Eyebrow labels:** 11–12px, uppercase, bold, letter-spacing 0.12–0.2em. Gold on navy; `gold-dark` or `navy` on light.
- **Meta text:** 13–14px in `muted`. Nothing smaller than 13px except eyebrows.

### Shape & depth
- **Radius:** 10px for cards, 8px for buttons and panels, fully rounded for pills and badges.
- **Card shadow:** `0 6px 24px rgba(15,42,94,.10)` (a soft navy tint).
- **Gold accent divider:** 50×3px with a 2px radius, centred under hero titles.

### Component patterns (adapted for mobile)
- **Hero / header band:**
  - Navy background with the centred gold logo.
  - Optional gold pill badge, a gold eyebrow line, a white bold title, and the gold divider.
  - Keep it compact on phones so the content starts within the first screen.
- **Buttons:**
  - Primary: navy background, white bold 16px text, about 14×26px padding, 8px radius.
  - Secondary: white background, navy text, 2px navy border.
  - Full-width on mobile; inline only from `sm:` up. At least 44px tall.
- **Detail list (label/value):**
  - Uppercase eyebrow label, with the value in `ink` at 15–16px, on a `panel` box with `#eceff4` row dividers.
  - On mobile, **stack the label above the value**; the email's side-by-side table doesn't fit narrow screens.
- **Checklist:** a gold ✓ followed by 15px text, with comfortable line-height.
- **Callouts:** use a `panel` box for neutral info, a `callout` box with a `navy-light` left border for highlights, and a `whatsapp` box for the community group CTA.
- **Footer:**
  - `navy-deep` background with the white brand name and the gold Urdu tagline (RTL).
  - Email in `on-navy`, and Instagram and LinkedIn links in white bold.
  - Small "One step for good" footnote.
- **Tone:** warm and direct. Front-load the key facts (when, where, what to do), with one clear primary action per section.

---

## Folder structure (`src/`)

The repo root also holds `public/` (static assets), `scripts/` (seed script), the Next/Tailwind/TS config, and `firebase.json` + `firestore.rules`.

```
app/                        Routes only. Keep page files thin.
  layout.tsx                Root: font, viewport, Providers
  (guest)/                  / (welcome), /sign-in
  (join)/join/              Invite-code joining flow
  (onboarding)/             /nda (agreement), /status (waiting / rejected / suspended / alumni)
  (member)/                 Members' app, mobile-first: /home, /teams, /teams/[id], /profile
  (admin)/admin/            Admin area, tablet/laptop: overview, members, invites, leave-requests, teams
  api/                      API routes (server). The ONLY way the app touches Firestore.
components/
  ui/                       Design-system primitives: Button, Field, Card, Badge, Modal, Segmented, …
  shared/                   Brand pieces: BrandLogo, BrandHero (navy band), TeamPicker, ReasonDialog
  layout/                   MemberShell (bottom tabs), AdminShell (sidebar), PageHeader, Splash
  providers/                Providers (auth + toasts)
features/<domain>/          Screens and domain UI: auth, onboarding, home, teams, profile, admin
server/                     Server-only helpers: http (errors), auth (who's calling), users, teams, invites, leave, audit
lib/                        firebase (client + admin), api client, validation (zod), format
config/                     brand, nda (agreement text, versioned)
hooks/                      useApi
types/                      models.ts: shared data shapes
```

Conventions:
- **Route files stay thin.** A `page.tsx` exports `metadata` and renders one screen from `features/`.
- **Access control is layered:**
  - **Layouts:** each route group's layout wraps its pages in `<Gate mode=…>` (`features/auth/Gate.tsx`). It uses `destinationFor()` (`features/auth/routing.ts`) to send people where they belong.
  - **API routes:** every route calls `requireMember` / `requireAdmin` / `requireProfile` from `src/server/auth.ts`. The Gate is only for UX; the server check is what protects data.
- **New API route:** wrap it in `handle()` (`src/server/http.ts`), validate with zod and `parseBody()`, and throw `ApiError(status, message)` with a message a member can understand. Use a Firestore transaction for anything that changes status, teams or positions, and call `logAudit()` afterwards.
- **Where new code goes:**
  - Code used by one domain goes in `features/<domain>/`.
  - Shared UI goes in `components/`.
  - Server-only code goes in `src/server/` and starts with `import 'server-only'`.
- **Import with the `@/` alias.** Don't use relative `../` imports across folders.
- **Mark client components** (`'use client'`) only where interactivity is needed.
- **Animations are decoration only.** Content must be visible without them. Reduced motion turns them off in `globals.css`.

---

## Commands (run at the repo root)

```bash
npm run dev          # http://localhost:3000
npm run build
npm run type-check
npm run lint
node scripts/bootstrap.mjs                       # create the starting teams
node scripts/bootstrap.mjs --admin you@gmail.com  # make an account admin (sign in once first)
```

Environment: `.env.local`. Git ignores it; copy `.env.example`.
- **Browser sign-in** needs the `NEXT_PUBLIC_FIREBASE_*` values.
- **The API routes** need the server-only `FIREBASE_ADMIN_*` service-account values. Never prefix those with `NEXT_PUBLIC_`.

---

## Notes
- **Changing the member agreement:** edit both `src/config/nda.ts` (what the app shows) and `docs/nda.md`, and bump `NDA.version`. Every member is then asked to re-sign.
- **KKB is small:** member lists are loaded whole and filtered in memory (`listUsers()`). Revisit that if membership grows into the thousands.
- **Shared Firestore project:** old collections from the previous app (`siteContent`, `campaigns`, `events`, `testimonials`, `monthlyGoals`, `supportRequests`) may still exist. Nothing uses them.
