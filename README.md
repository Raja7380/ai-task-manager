# 🧠 AI Task Manager

A tiny, full-stack SaaS app — **built to teach you real, industry-grade web development.**

Stack (what companies actually ship with in 2026):

- **Next.js 16** (App Router) + **TypeScript** — the most-used React framework.
- **Tailwind CSS** — fast, utility-first styling.
- **Prisma** + **PostgreSQL** (via [Neon](https://neon.tech) — free, zero-setup) — type-safe database access.
- **NextAuth v5** — email/password + Google OAuth, with JWT sessions and hashed passwords.
- **OpenAI** — optional AI-generated summaries of your tasks.
- **Zod** — runtime validation for all user input.
- **Vercel** — one-click deployment with automatic CI/CD.

> **This project is a learning resource.** Every file has comments explaining *why* the code is the way it is, not just *what* it does.

---

## 🗺️ What you'll learn by reading this code

| Concept | Where to look |
|---|---|
| Next.js App Router (layouts, pages, Server Components) | `src/app/**` |
| Server Actions (form mutations without API routes) | `src/app/dashboard/actions.ts`, `src/app/(auth)/*/actions.ts` |
| Route handlers (traditional API endpoints) | `src/app/api/ai/summarize/route.ts` |
| Edge proxy / middleware (route guarding) | `src/proxy.ts`, `src/auth.config.ts` |
| Prisma schema & migrations | `prisma/schema.prisma`, `prisma/migrations/` |
| Prisma Client singleton (avoiding connection leaks) | `src/lib/prisma.ts` |
| Authentication (Credentials + OAuth, JWT sessions) | `src/auth.ts`, `src/auth.config.ts` |
| Password hashing with bcrypt | `src/auth.ts`, `src/app/(auth)/register/actions.ts` |
| Zod validation on the server | every `actions.ts` file |
| Optimistic UI with `useTransition` | `src/components/task-list.tsx` |
| Calling OpenAI safely from the server | `src/app/api/ai/summarize/route.ts` |
| Responsive Tailwind + dark mode | all components |

---

## 🚀 Quick start (10 minutes, including Neon signup)

```bash
# 1. Clone
git clone https://github.com/Raja7380/ai-task-manager.git
cd ai-task-manager

# 2. Install dependencies
npm install
```

**3. Get a free Postgres database from Neon:**

1. Go to <https://neon.tech> and sign in with GitHub (free, no credit card).
2. Click **Create a project** → accept defaults → **Create project**.
3. On the dashboard, click **Connection Details**. Neon shows two URLs:
   - The **Pooled connection** (URL contains `-pooler`) → this is your `DATABASE_URL`.
   - The **Direct connection** (no `-pooler`) → this is your `DIRECT_URL`.

**4. Create your `.env`:**

```bash
cp .env.example .env
# Open .env and paste the two Neon URLs into DATABASE_URL and DIRECT_URL.
# Then set AUTH_SECRET:
echo "AUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env
```

**5. Create the tables in your Neon database:**

```bash
npm run db:push       # syncs schema.prisma → Neon (no migration files needed for MVP)
```

**6. Start the dev server:**

```bash
npm run dev
```

Open <http://localhost:3000>. Register a new account. You're in!

> 💡 The AI summary button works **without** an OpenAI key (it falls back to a local heuristic). Add an `OPENAI_API_KEY` to your `.env` to enable real GPT-powered summaries.

---

## 📁 Project structure (annotated)

```
ai-task-manager/
├─ prisma/
│  └─ schema.prisma          ← database schema (User, Task, Account…)
├─ src/
│  ├─ app/                   ← Next.js App Router
│  │  ├─ layout.tsx          ← root HTML, fonts, theme
│  │  ├─ page.tsx            ← landing page ("/")
│  │  ├─ globals.css         ← Tailwind + CSS variables
│  │  ├─ (auth)/             ← route group, not in the URL
│  │  │  ├─ login/           ← /login
│  │  │  └─ register/        ← /register
│  │  ├─ dashboard/          ← /dashboard (auth-protected)
│  │  │  ├─ layout.tsx       ← nav bar shown only in-app
│  │  │  ├─ page.tsx         ← task list
│  │  │  └─ actions.ts       ← create/update/delete tasks (Server Actions)
│  │  └─ api/
│  │     ├─ auth/            ← NextAuth request handler
│  │     └─ ai/summarize/    ← POST endpoint calling OpenAI
│  ├─ components/            ← reusable UI pieces (client components)
│  ├─ lib/
│  │  ├─ prisma.ts           ← PrismaClient singleton
│  │  └─ utils.ts            ← cn() classname helper
│  ├─ auth.config.ts         ← edge-safe auth config (used in proxy)
│  ├─ auth.ts                ← full auth config (Prisma + bcrypt)
│  └─ proxy.ts               ← Next 16 edge proxy (was "middleware")
├─ .env.example              ← template for your local .env
└─ package.json
```

---

## 🧠 Concepts, one by one

### 1. Server Components vs Client Components

- By default, every file in `src/app/**` is a **Server Component** — it runs on the server, has direct access to the database, and sends plain HTML to the browser.
- If a component needs state, effects, or event handlers, add `"use client"` at the top. See `src/components/new-task-form.tsx`.

### 2. Server Actions

Instead of building REST endpoints for every form, we write an `async` function with `"use server"` and pass it directly to `<form action={...}>`. Next.js wires up the network call for us.

Example: <src/app/dashboard/actions.ts> defines `createTask(formData)`. The form in `<NewTaskForm />` posts to it and we revalidate the page with `revalidatePath("/dashboard")`.

### 3. Authentication flow

1. User submits `/register` → `registerAction` hashes the password with bcrypt, inserts a `User`, then signs them in.
2. `signIn("credentials", …)` creates a JWT and sets it as a secure cookie.
3. Every request passes through `src/proxy.ts`, which uses the **edge-safe** `auth.config.ts` to check the cookie.
4. Server Components can call `await auth()` from `src/auth.ts` to get the full session (with DB lookup if needed).

Why two configs? `proxy.ts` runs on the Edge runtime, where Node APIs (Prisma, bcrypt) are unavailable. So we split the config: an edge-safe skeleton (`auth.config.ts`) and a full-featured Node version (`auth.ts`). This is a common NextAuth v5 pattern.

### 4. Prisma

- `schema.prisma` describes the shape of the database.
- `npm run db:push` (= `prisma db push`) syncs the schema to your Neon database. Great for MVPs because there's no migration file to track.
- For production-grade change tracking, graduate to `prisma migrate dev` / `prisma migrate deploy` (creates SQL files committed to git).
- `npx prisma studio` opens a visual database browser at `localhost:5555`.
- The Prisma Client gives us a type-safe query builder: `prisma.task.findMany({ where: { userId } })` is fully autocompleted.

### 5. Validation with Zod

Never trust client input. Every server-side entry point (Server Action, API route) parses input with a Zod schema before using it.

### 6. AI integration (safely)

We call OpenAI **from the server only** (`src/app/api/ai/summarize/route.ts`). The API key never touches the browser. If the key is missing, we fall back to a hard-coded heuristic summary — so contributors without an OpenAI account can still use the feature.

---

## 🧪 Common commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build        # production build (runs prisma generate + next build)
npm run start        # run the production build
npm run lint         # ESLint
npm run db:push      # sync schema.prisma → your Neon database
npx prisma studio    # visual DB browser at http://localhost:5555
```

---

## 🌍 Deploying to Vercel (step-by-step)

Follow these steps in order. Total time: ~5 minutes.

### Step 1 — Make sure your Neon database is ready

You did this in Quick Start. Have both URLs (`DATABASE_URL` and `DIRECT_URL`) handy.

### Step 2 — Sign up for Vercel

1. Go to <https://vercel.com/signup> and click **Continue with GitHub**.
2. Authorize Vercel to read your public repos.

### Step 3 — Import this repo into Vercel

1. Click **Add New… → Project** on the Vercel dashboard.
2. Find `ai-task-manager` in the list and click **Import**.
3. Vercel auto-detects Next.js. Don't change the framework preset.

### Step 4 — Add environment variables

On the import screen, expand **Environment Variables** and add these 3 required + up to 3 optional:

| Key | Value | Where from |
|---|---|---|
| `DATABASE_URL` | *pooled* Neon URL (contains `-pooler`) | Neon dashboard |
| `DIRECT_URL` | *direct* Neon URL (no `-pooler`) | Neon dashboard |
| `AUTH_SECRET` | run `openssl rand -base64 32` on your machine, paste the output | generate once |
| `OPENAI_API_KEY` *(optional)* | sk-… | <https://platform.openai.com/api-keys> |
| `AUTH_GOOGLE_ID` *(optional)* | Google OAuth client ID | Google Cloud Console |
| `AUTH_GOOGLE_SECRET` *(optional)* | Google OAuth client secret | Google Cloud Console |

> ⚠️ After your first deploy, add one more: `NEXTAUTH_URL=https://<your-vercel-url>.vercel.app` so OAuth callbacks and emails use the correct hostname.

### Step 5 — Click **Deploy**

Vercel builds your app (~60 seconds). Then it gives you a URL like `ai-task-manager-xyz.vercel.app`.

### Step 6 — Every future push = automatic deploy

From now on, every time you `git push` to `main`, Vercel rebuilds and deploys automatically. Pull requests get their own preview URL too (a huge superpower for code review).

### Step 7 — Updating the DB schema later

If you change `prisma/schema.prisma` later (e.g. add a `tag` column), run `npm run db:push` **locally** with your production Neon URL in `.env`. That applies the change to production safely. Later, if you want stricter change-tracking, switch to `prisma migrate dev` + `prisma migrate deploy`.

### Troubleshooting

- **Build fails with "Can't reach database"** — double-check `DIRECT_URL` doesn't have `-pooler` in the hostname. Migrations need the direct URL.
- **Login works locally but not in production** — you forgot to set `NEXTAUTH_URL` in Vercel env vars.
- **"PrismaClientInitializationError"** — `DATABASE_URL` is missing or misspelled in Vercel env vars.

---

## 🗺️ Roadmap — things to add next (great learning exercises)

- [ ] **Tags / projects** — many-to-many relations in Prisma.
- [ ] **Search + filtering** — URL-state-driven queries.
- [ ] **Real-time sync** — WebSockets via Pusher/Ably or Server-Sent Events.
- [ ] **Stripe subscriptions** — Pro tier with unlimited tasks & GPT-4.
- [ ] **E2E tests** — Playwright, mocked auth, CI on GitHub Actions.
- [ ] **Dockerfile + docker-compose** — Postgres + the web app for offline dev.

---

## 📚 Learning resources (if you want to go deeper)

- [Next.js official tutorial](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [NextAuth v5 docs](https://authjs.dev/)
- [Tailwind CSS docs](https://tailwindcss.com/docs)
- [Fullstack Open](https://fullstackopen.com/en/) — free, rigorous course

---

## License

MIT — do whatever you want with this code.
